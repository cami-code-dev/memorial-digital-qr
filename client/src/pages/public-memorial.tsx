import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Calendar, Music } from "lucide-react";
import type { Memorial, MemorialMedia } from "@shared/schema";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function formatDate(date: string | Date | null | undefined) {
  if (!date) return null;
  return format(new Date(date), "d 'de' MMMM, yyyy", { locale: es });
}

export default function PublicMemorial() {
  const params = useParams<{ token: string }>();

  const { data, isLoading, error } = useQuery<
    Memorial & { media?: MemorialMedia[] }
  >({
    queryKey: ["/api/public/memorial", params.token],
    queryFn: async () => {
      const res = await fetch(`/api/public/memorial/${params.token}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("not_found");
        if (res.status === 403) throw new Error("not_public");
        throw new Error("error");
      }
      return res.json();
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-2xl w-full space-y-6">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-6 w-40 mx-auto" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    const msg = (error as Error).message;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Heart className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          {msg === "not_found" ? (
            <>
              <h1 className="font-serif text-2xl font-semibold mb-2">
                Memorial no encontrado
              </h1>
              <p className="text-sm text-muted-foreground">
                El memorial que buscas no existe o ha sido eliminado.
              </p>
            </>
          ) : msg === "not_public" ? (
            <>
              <h1 className="font-serif text-2xl font-semibold mb-2">
                Memorial privado
              </h1>
              <p className="text-sm text-muted-foreground">
                Este memorial es privado y no se puede acceder p&uacute;blicamente.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-serif text-2xl font-semibold mb-2">Error</h1>
              <p className="text-sm text-muted-foreground">
                Ha ocurrido un error al cargar el memorial.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const images = data.media?.filter((m) => m.type === "image") || [];
  const audios = data.media?.filter((m) => m.type === "audio") || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <Heart className="w-6 h-6 text-muted-foreground mx-auto mb-4" />
          <h1
            className="font-serif text-3xl md:text-4xl font-bold mb-3"
            data-testid="text-memorial-name"
          >
            {data.nombreDifunto}
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <Calendar className="w-4 h-4" />
            <span>
              {data.fechaNacimiento && formatDate(data.fechaNacimiento)}
              {data.fechaNacimiento && data.fechaDefuncion && " — "}
              {formatDate(data.fechaDefuncion)}
            </span>
          </div>
        </div>

        {images.length > 0 && (
          <div className="mb-8">
            {images.length === 1 ? (
              <div className="rounded-md overflow-hidden border">
                <img
                  src={images[0].url}
                  alt={data.nombreDifunto}
                  className="w-full max-h-[500px] object-cover"
                  loading="lazy"
                  data-testid="img-memorial-main"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="rounded-md overflow-hidden border aspect-square"
                    data-testid={`img-memorial-${img.id}`}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Card className="mb-8">
          <CardContent className="p-6 md:p-8">
            <p
              className="text-base leading-relaxed whitespace-pre-wrap"
              data-testid="text-memorial-bio"
            >
              {data.biografia}
            </p>
          </CardContent>
        </Card>

        {audios.length > 0 && (
          <div className="mb-8 space-y-3">
            {audios.map((audio) => (
              <div
                key={audio.id}
                className="flex items-center gap-3 p-4 rounded-md border"
                data-testid={`audio-memorial-${audio.id}`}
              >
                <Music className="w-5 h-5 text-muted-foreground shrink-0" />
                <span className="text-sm truncate flex-1">{audio.filename}</span>
                <audio controls className="h-8 max-w-[240px]">
                  <source src={audio.url} type="audio/mpeg" />
                </audio>
              </div>
            ))}
          </div>
        )}

        <footer className="text-center pt-8 pb-12 border-t">
          <Heart className="w-4 h-4 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            Memorial digital &middot; Un espacio de respeto y recuerdo
          </p>
        </footer>
      </div>
    </div>
  );
}
