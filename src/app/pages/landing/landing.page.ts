import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heartOutline, shieldCheckmarkOutline, qrCodeOutline, lockClosedOutline } from 'ionicons/icons';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
  ],
  template: `
    <ion-content class="ion-padding">
      <div class="landing-container">
        <div class="hero-section">
          <h1 data-testid="text-landing-title">Memorial</h1>
          <p class="subtitle" data-testid="text-landing-subtitle">
            Un espacio digital privado y respetuoso para honrar la memoria de quienes amamos.
          </p>
          <div class="hero-actions">
            <ion-button
              data-testid="button-start"
              expand="block"
              color="primary"
              (click)="goToRegister()">
              Comenzar
            </ion-button>
            <ion-button
              data-testid="button-login"
              expand="block"
              fill="outline"
              color="primary"
              (click)="goToLogin()">
              Iniciar Sesión
            </ion-button>
          </div>
        </div>

        <ion-grid class="features-grid">
          <ion-row>
            <ion-col size="12" size-md="6">
              <ion-card>
                <ion-card-header>
                  <ion-icon name="lock-closed-outline" class="feature-icon"></ion-icon>
                  <ion-card-title>Privacidad Total</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  Los memoriales son privados por defecto. Solo tú decides quién puede verlos.
                </ion-card-content>
              </ion-card>
            </ion-col>
            <ion-col size="12" size-md="6">
              <ion-card>
                <ion-card-header>
                  <ion-icon name="qr-code-outline" class="feature-icon"></ion-icon>
                  <ion-card-title>Compartir con QR</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  Genera códigos QR únicos para compartir memoriales con familiares y amigos.
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col size="12" size-md="6">
              <ion-card>
                <ion-card-header>
                  <ion-icon name="heart-outline" class="feature-icon"></ion-icon>
                  <ion-card-title>Homenaje Digno</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  Diseñado con respeto y sobriedad. Sin likes, comentarios ni elementos invasivos.
                </ion-card-content>
              </ion-card>
            </ion-col>
            <ion-col size="12" size-md="6">
              <ion-card>
                <ion-card-header>
                  <ion-icon name="shield-checkmark-outline" class="feature-icon"></ion-icon>
                  <ion-card-title>Consentimiento</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  Cada acción requiere confirmación explícita del custodio del memorial.
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
    </ion-content>
  `,
  styles: [`
    .landing-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 24px 16px;
    }
    .hero-section {
      text-align: center;
      padding: 60px 0 40px;
    }
    h1 {
      font-family: 'Playfair Display', serif;
      font-size: 3rem;
      font-weight: 700;
      color: var(--ion-color-primary);
      margin-bottom: 16px;
    }
    .subtitle {
      font-size: 1.15rem;
      color: var(--ion-color-medium);
      max-width: 500px;
      margin: 0 auto 32px;
      line-height: 1.6;
    }
    .hero-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
      max-width: 360px;
      margin: 0 auto;
    }
    .hero-actions ion-button {
      flex: 1;
      min-width: 150px;
    }
    .feature-icon {
      font-size: 2rem;
      color: var(--ion-color-primary);
      margin-bottom: 8px;
    }
    ion-card {
      margin: 8px;
    }
    ion-card-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.1rem;
    }
    ion-card-content {
      font-size: 0.95rem;
      line-height: 1.5;
    }
  `],
})
export class LandingPage {
  constructor(private router: Router) {
    addIcons({ heartOutline, shieldCheckmarkOutline, qrCodeOutline, lockClosedOutline });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
