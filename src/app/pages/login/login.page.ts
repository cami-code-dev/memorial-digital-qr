import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonText,
  IonSpinner,
  IonBackButton,
  IonButtons,
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonText,
    IonSpinner,
    IonBackButton,
    IonButtons,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/" text="Volver"></ion-back-button>
        </ion-buttons>
        <ion-title>Iniciar Sesión</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="auth-container">
        <ion-card>
          <ion-card-header>
            <ion-card-title data-testid="text-login-title">Bienvenido de vuelta</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <form (ngSubmit)="onLogin()">
              <ion-item>
                <ion-input
                  data-testid="input-email"
                  type="email"
                  label="Correo electrónico"
                  labelPlacement="floating"
                  [(ngModel)]="email"
                  name="email"
                  required>
                </ion-input>
              </ion-item>

              <ion-item>
                <ion-input
                  data-testid="input-password"
                  type="password"
                  label="Contraseña"
                  labelPlacement="floating"
                  [(ngModel)]="password"
                  name="password"
                  required>
                </ion-input>
              </ion-item>

              <ion-text color="danger" *ngIf="errorMessage">
                <p class="error-text" data-testid="text-login-error">{{ errorMessage }}</p>
              </ion-text>

              <ion-button
                data-testid="button-login-submit"
                expand="block"
                type="submit"
                color="primary"
                [disabled]="isLoading"
                class="submit-btn">
                <ion-spinner *ngIf="isLoading" name="crescent"></ion-spinner>
                <span *ngIf="!isLoading">Iniciar Sesión</span>
              </ion-button>
            </form>

            <p class="register-link">
              ¿No tienes cuenta?
              <a data-testid="link-register" (click)="goToRegister()">Regístrate aquí</a>
            </p>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .auth-container {
      max-width: 450px;
      margin: 40px auto 0;
    }
    ion-card-title {
      font-family: 'Playfair Display', serif;
      text-align: center;
    }
    .error-text {
      font-size: 0.85rem;
      padding: 8px 16px;
    }
    .submit-btn {
      margin-top: 20px;
    }
    .register-link {
      text-align: center;
      margin-top: 16px;
      font-size: 0.9rem;
    }
    .register-link a {
      color: var(--ion-color-primary);
      cursor: pointer;
      text-decoration: underline;
    }
    ion-item {
      --padding-start: 0;
      margin-bottom: 8px;
    }
  `],
})
export class LoginPage {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onLogin(): Promise<void> {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, completa todos los campos.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        this.errorMessage = 'Correo o contraseña incorrectos.';
      } else if (error.code === 'auth/user-not-found') {
        this.errorMessage = 'No se encontró una cuenta con este correo.';
      } else if (error.code === 'auth/too-many-requests') {
        this.errorMessage = 'Demasiados intentos. Intenta más tarde.';
      } else {
        this.errorMessage = 'Error al iniciar sesión. Intenta de nuevo.';
      }
    } finally {
      this.isLoading = false;
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
