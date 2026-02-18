import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation, useParams, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/auth-utils";
import {
  ArrowLeft, Save, Trash2, QrCode, Globe, Lock, Upload, X,
  Image as ImageIcon, Music, Heart, AlertTriangle, Copy, Download,
} from "lucide-react";
import type { Memorial, MemorialMedia } from "@shared/schema";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/mp3"];

const formSchema = z.object({
  nombreDifunto: z.string().min(1, "El nombre es obligatorio"),
  biografia: z.string().min(1, "La biograf\u00eda es obligatoria"),
  fechaNacimiento: z.string().optional(),
  fechaDefuncion: z.string().min(1, "La fecha de defunci\u00f3n es obligatoria"),
  isPublic: z.boolean().default(false),
  consentimientoConfirmado: z.boolean().refine(
    (val) => val === true,
    "Debes confirmar el consentimiento para continuar"
  ),
});

type FormValues = z.infer<typeof formSchema>;

function QrDialog({
  open,
  onOpenChange,
  memorial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memorial: Memorial | null;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (memorial && open) {
      fetch(`/api/memorials/${memorial.id}/qr`)
        .then((r) => r.json())
        .then((data) => setQrDataUrl(data.qrDataUrl))
        .catch(() => {});
    }
  }, [memorial, open]);

  const publicUrl = memorial
    ? `${window.location.origin}/m/${memorial.accessToken}`
    : "";

  const copyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    toast({ title: "Enlace copiado", description: "El enlace ha sido copiado al portapapeles." });
  };

  const downloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = `memorial-qr-${memorial?.nombreDifunto || "code"}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">C&oacute;digo QR del Memorial</DialogTitle>
          <DialogDescription>
            Comparte este c&oacute;digo QR para dar acceso directo al memorial.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="C&oacute;digo QR"
              className="w-56 h-56 rounded-md border"
              data-testid="img-qr-code"
            />
          ) : (
            <Skeleton className="w-56 h-56 rounded-md" />
          )}
          <div className="flex items-center gap-2 w-full">
            <Input
              value={publicUrl}
              readOnly
              className="text-xs"
              data-testid="input-public-url"
            />
            <Button size="icon" variant="outline" onClick={copyUrl} data-testid="button-copy-url">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <DialogFooter className="flex flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button onClick={downloadQr} disabled={!qrDataUrl} data-testid="button-download-qr">
            <Download className="w-4 h-4 mr-2" />
            Descargar QR
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function MemorialForm() {
  const { user, isLoading: authLoading } = useAuth();
  const params = useParams<{ id: string }>();
  const isEditing = params.id && params.id !== "new";
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: memorial, isLoading: memorialLoading } = useQuery<Memorial & { media?: MemorialMedia[] }>({
    queryKey: ["/api/memorials", params.id],
    enabled: !!isEditing,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreDifunto: "",
      biografia: "",
      fechaNacimiento: "",
      fechaDefuncion: "",
      isPublic: false,
      consentimientoConfirmado: false,
    },
  });

  useEffect(() => {
    if (memorial) {
      form.reset({
        nombreDifunto: memorial.nombreDifunto,
        biografia: memorial.biografia,
        fechaNacimiento: memorial.fechaNacimiento
          ? new Date(memorial.fechaNacimiento).toISOString().split("T")[0]
          : "",
        fechaDefuncion: memorial.fechaDefuncion
          ? new Date(memorial.fechaDefuncion).toISOString().split("T")[0]
          : "",
        isPublic: memorial.isPublic,
        consentimientoConfirmado: memorial.consentimientoConfirmado,
      });
    }
  }, [memorial, form]);

  useEffect(() => {
    if (!authLoading && !user) {
      toast({ title: "Sesi\u00f3n expirada", description: "Iniciando sesi\u00f3n...", variant: "destructive" });
      setTimeout(() => { window.location.href = "/api/login"; }, 500);
    }
  }, [authLoading, user, toast]);

  const saveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const body = {
        ...values,
        fechaNacimiento: values.fechaNacimiento ? new Date(values.fechaNacimiento).toISOString() : null,
        fechaDefuncion: new Date(values.fechaDefuncion).toISOString(),
      };
      if (isEditing) {
        return apiRequest("PATCH", `/api/memorials/${params.id}`, body);
      } else {
        return apiRequest("POST", "/api/memorials", body);
      }
    },
    onSuccess: async (res) => {
      const data = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/memorials"] });
      toast({ title: isEditing ? "Memorial actualizado" : "Memorial creado" });
      if (!isEditing) {
        navigate(`/memorial/${data.id}/edit`);
      }
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "No autorizado", description: "Iniciando sesi\u00f3n...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/memorials/${params.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/memorials"] });
      toast({ title: "Memorial eliminado" });
      navigate("/");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "No autorizado", description: "Iniciando sesi\u00f3n...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/memorials/${params.id}/media`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al subir archivo");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/memorials", params.id] });
      toast({ title: "Archivo subido correctamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error al subir", description: error.message, variant: "destructive" });
    },
  });

  const deleteMediaMutation = useMutation({
    mutationFn: (mediaId: string) =>
      apiRequest("DELETE", `/api/memorials/${params.id}/media/${mediaId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/memorials", params.id] });
      toast({ title: "Archivo eliminado" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "audio") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = type === "image" ? ALLOWED_IMAGE_TYPES : ALLOWED_AUDIO_TYPES;
    if (!allowed.includes(file.type)) {
      toast({
        title: "Tipo de archivo no permitido",
        description: type === "image" ? "Solo se permiten JPG, PNG y WebP." : "Solo se permiten archivos MP3.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Archivo demasiado grande",
        description: "El archivo no puede superar los 5 MB.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
    e.target.value = "";
  };

  const onSubmit = (values: FormValues) => {
    saveMutation.mutate(values);
  };

  if (memorialLoading && isEditing) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const media = (memorial as any)?.media as MemorialMedia[] | undefined;
  const images = media?.filter((m) => m.type === "image") || [];
  const audios = media?.filter((m) => m.type === "audio") || [];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 px-6 py-3">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            {isEditing && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQrOpen(true)}
                  data-testid="button-show-qr"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">C&oacute;digo QR</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteOpen(true)}
                  data-testid="button-delete-memorial"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold mb-2" data-testid="text-form-title">
          {isEditing ? "Editar Memorial" : "Nuevo Memorial"}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          {isEditing
            ? "Actualiza la informaci\u00f3n del memorial."
            : "Completa los datos para crear un memorial."}
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Heart className="w-4 h-4 text-muted-foreground" />
                <span className="font-serif font-semibold">Informaci&oacute;n del Difunto</span>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="nombreDifunto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del difunto" {...field} data-testid="input-nombre" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fechaNacimiento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Nacimiento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-fecha-nacimiento" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fechaDefuncion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Defunci&oacute;n</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-fecha-defuncion" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="biografia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biograf&iacute;a</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Escribe una biograf&iacute;a respetuosa..."
                          className="min-h-[160px] resize-y"
                          {...field}
                          data-testid="input-biografia"
                        />
                      </FormControl>
                      <FormDescription>
                        Un texto que honre la vida y la memoria del difunto.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {isEditing && (
              <Card>
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="font-serif font-semibold">Multimedia</span>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-sm font-medium mb-3">Fotograf&iacute;as</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                      {images.map((img) => (
                        <div
                          key={img.id}
                          className="relative aspect-square rounded-md overflow-hidden border group"
                          data-testid={`media-image-${img.id}`}
                        >
                          <img
                            src={img.url}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <button
                            type="button"
                            onClick={() => deleteMediaMutation.mutate(img.id)}
                            className="absolute top-1 right-1 w-6 h-6 bg-background/80 backdrop-blur rounded-md flex items-center justify-center invisible group-hover:visible"
                            data-testid={`button-delete-media-${img.id}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e, "image")}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadMutation.isPending}
                      data-testid="button-upload-image"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadMutation.isPending ? "Subiendo..." : "Subir Imagen"}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG o WebP. M&aacute;ximo 5 MB.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-3">Audio</p>
                    {audios.map((audio) => (
                      <div
                        key={audio.id}
                        className="flex items-center gap-3 p-3 rounded-md border mb-2"
                        data-testid={`media-audio-${audio.id}`}
                      >
                        <Music className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm truncate flex-1">{audio.filename}</span>
                        <audio controls className="h-8 max-w-[200px]">
                          <source src={audio.url} type="audio/mpeg" />
                        </audio>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMediaMutation.mutate(audio.id)}
                          data-testid={`button-delete-audio-${audio.id}`}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept=".mp3"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e, "audio")}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => audioInputRef.current?.click()}
                      disabled={uploadMutation.isPending}
                      data-testid="button-upload-audio"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadMutation.isPending ? "Subiendo..." : "Subir Audio"}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Solo archivos MP3. M&aacute;ximo 5 MB.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="font-serif font-semibold">Privacidad y Consentimiento</span>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between gap-4 rounded-md border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2">
                          {field.value ? (
                            <><Globe className="w-4 h-4" /> Memorial P&uacute;blico</>
                          ) : (
                            <><Lock className="w-4 h-4" /> Memorial Privado</>
                          )}
                        </FormLabel>
                        <FormDescription>
                          {field.value
                            ? "Accesible mediante el c\u00f3digo QR o enlace directo."
                            : "Solo t\u00fa puedes ver este memorial."}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-is-public"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="consentimientoConfirmado"
                  render={({ field }) => (
                    <FormItem className="flex items-start gap-3 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-0.5"
                          data-testid="checkbox-consent"
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel>Confirmo mi consentimiento</FormLabel>
                        <FormDescription>
                          Confirmo que tengo autorizaci&oacute;n para publicar esta
                          informaci&oacute;n y que los datos proporcionados son veraces.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-3 pb-8">
              <Link href="/">
                <Button type="button" variant="outline" data-testid="button-cancel">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                data-testid="button-save"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveMutation.isPending ? "Guardando..." : isEditing ? "Actualizar" : "Crear Memorial"}
              </Button>
            </div>
          </form>
        </Form>
      </main>

      {isEditing && memorial && (
        <QrDialog open={qrOpen} onOpenChange={setQrOpen} memorial={memorial} />
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Eliminar Memorial
            </DialogTitle>
            <DialogDescription>
              Esta acci&oacute;n no se puede deshacer. Se eliminar&aacute; permanentemente
              el memorial y todo su contenido multimedia.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
