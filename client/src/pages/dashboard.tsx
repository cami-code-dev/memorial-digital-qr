import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Heart, Lock, Globe, Calendar } from "lucide-react";
import type { Memorial } from "@shared/schema";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function getInitials(firstName?: string | null, lastName?: string | null) {
  const f = firstName?.charAt(0) || "";
  const l = lastName?.charAt(0) || "";
  return (f + l).toUpperCase() || "U";
}

function MemorialCard({ memorial }: { memorial: Memorial }) {
  const fechaDef = memorial.fechaDefuncion
    ? format(new Date(memorial.fechaDefuncion), "d 'de' MMMM, yyyy", { locale: es })
    : "";

  return (
    <Link href={`/memorial/${memorial.id}/edit`}>
      <Card className="hover-elevate cursor-pointer group" data-testid={`card-memorial-${memorial.id}`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <h3 className="font-serif text-lg font-semibold truncate" data-testid={`text-memorial-name-${memorial.id}`}>
                {memorial.nombreDifunto}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{fechaDef}</span>
                </div>
              </div>
            </div>
            <Badge variant={memorial.isPublic ? "default" : "secondary"} data-testid={`badge-status-${memorial.id}`}>
              {memorial.isPublic ? (
                <><Globe className="w-3 h-3 mr-1" /> P&uacute;blico</>
              ) : (
                <><Lock className="w-3 h-3 mr-1" /> Privado</>
              )}
            </Badge>
          </div>
          {memorial.biografia && (
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2 leading-relaxed">
              {memorial.biografia}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function MemorialSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-full mt-3" />
        <Skeleton className="h-4 w-3/4 mt-1" />
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { data: memorials, isLoading } = useQuery<Memorial[]>({
    queryKey: ["/api/memorials"],
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-muted-foreground" />
            <span className="font-serif text-lg font-semibold tracking-tight">Memorial</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(user?.firstName, user?.lastName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm hidden sm:inline" data-testid="text-user-name">
                {user?.firstName || "Usuario"}
              </span>
            </div>
            <a href="/api/logout">
              <Button variant="ghost" size="sm" data-testid="button-logout">
                Salir
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-semibold" data-testid="text-dashboard-title">
              Mis Memoriales
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona los memoriales que has creado.
            </p>
          </div>
          <Link href="/memorial/new">
            <Button data-testid="button-create-memorial">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Memorial
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            <MemorialSkeleton />
            <MemorialSkeleton />
            <MemorialSkeleton />
          </div>
        ) : memorials && memorials.length > 0 ? (
          <div className="grid gap-4">
            {memorials.map((m) => (
              <MemorialCard key={m.id} memorial={m} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="font-serif text-xl font-semibold mb-2">
              A&uacute;n no has creado memoriales
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Crea tu primer memorial para honrar la memoria de un ser querido.
            </p>
            <Link href="/memorial/new">
              <Button data-testid="button-create-first">
                <Plus className="w-4 h-4 mr-2" />
                Crear mi primer memorial
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
