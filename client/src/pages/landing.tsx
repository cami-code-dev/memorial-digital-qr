import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Shield, QrCode, Eye, Heart } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-muted-foreground" />
            <span className="font-serif text-lg font-semibold tracking-tight" data-testid="text-logo">
              Memorial
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a href="/api/login">
              <Button data-testid="button-login">Iniciar Sesi&oacute;n</Button>
            </a>
          </div>
        </div>
      </header>

      <main className="pt-20">
        <section className="relative overflow-hidden py-24 lg:py-36">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/30 to-transparent" />
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
              Un espacio de respeto y memoria
            </p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Honra la memoria de quienes ya no est&aacute;n
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Crea memoriales digitales privados y seguros. Comparte el recuerdo
              de tus seres queridos a trav&eacute;s de un c&oacute;digo QR &uacute;nico, sin
              registros invasivos ni rastreo.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/api/login">
                <Button size="lg" data-testid="button-cta-start">
                  Crear un Memorial
                </Button>
              </a>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Gratuito &middot; Sin publicidad &middot; Privado por defecto
            </p>
          </div>
        </section>

        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-center mb-4">
              Dise&ntilde;ado con respeto
            </h2>
            <p className="text-center text-muted-foreground mb-14 max-w-xl mx-auto">
              Cada detalle ha sido pensado para honrar la dignidad y la privacidad
              de las familias.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hover-elevate">
                <CardContent className="pt-6 pb-6 px-6">
                  <div className="w-10 h-10 rounded-md bg-accent flex items-center justify-center mb-4">
                    <Shield className="w-5 h-5 text-foreground" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold mb-2">Privacidad Total</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Los memoriales son privados por defecto. Solo el custodio
                    decide cu&aacute;ndo y c&oacute;mo compartir el contenido.
                  </p>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardContent className="pt-6 pb-6 px-6">
                  <div className="w-10 h-10 rounded-md bg-accent flex items-center justify-center mb-4">
                    <QrCode className="w-5 h-5 text-foreground" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold mb-2">Acceso por QR</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Comparte un c&oacute;digo QR f&iacute;sico que da acceso directo
                    al memorial, sin registros ni cuentas.
                  </p>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardContent className="pt-6 pb-6 px-6">
                  <div className="w-10 h-10 rounded-md bg-accent flex items-center justify-center mb-4">
                    <Eye className="w-5 h-5 text-foreground" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold mb-2">Sin Rastreo</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Cero cookies de seguimiento, cero publicidad, cero
                    scripts invasivos. Respeto ante todo.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 border-t">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold mb-4">
              Un lugar digno para el recuerdo
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Sin likes, sin comentarios, sin elementos superficiales.
              Solo memoria, respeto y amor.
            </p>
            <a href="/api/login">
              <Button size="lg" data-testid="button-cta-bottom">
                Comenzar Ahora
              </Button>
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Heart className="w-4 h-4" />
            <span>Memorial &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Un proyecto dedicado al recuerdo respetuoso.
          </p>
        </div>
      </footer>
    </div>
  );
}
