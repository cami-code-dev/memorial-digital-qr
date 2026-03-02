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
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-register',
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
        <ion-title>Registro</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="auth-container">
        <ion-card>
          <ion-card-header>
            <ion-card-title data-testid="text-register-title">Crear cuenta de Custodio</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <form (ngSubmit)="onRegister()">
              <ion-item>
                <ion-input
                  data-testid="input-name"
                  type="text"
                  label="Nombre completo"
                  labelPlacement="floating"
                  [(ngModel)]="displayName"
                  name="displayName"
                  required>
                </ion-input>
              </ion-item>

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
                  label="Contraseña (mínimo 6 caracteres)"
                  labelPlacement="floating"
                  [(ngModel)]="password"
                  name="password"
                  required>
                </ion-input>
              </ion-item>

              <ion-item>
                <ion-input
                  data-testid="input-confirm-password"
                  type="password"
                  label="Confirmar contraseña"
                  labelPlacement="floating"
                  [(ngModel)]="confirmPassword"
                  name="confirmPassword"
                  required>
                </ion-input>
              </ion-item>

              <ion-text color="danger" *ngIf="errorMessage">
                <p class="error-text" data-testid="text-register-error">{{ errorMessage }}</p>
              </ion-text>

              <ion-button
                data-testid="button-register-submit"
                expand="block"
                type="submit"
                color="primary"
                [disabled]="isLoading"
                class="submit-btn">
                <ion-spinner *ngIf="isLoading" name="crescent"></ion-spinner>
                <span *ngIf="!isLoading">Crear Cuenta</span>
              </ion-button>
            </form>

            <p class="login-link">
              ¿Ya tienes cuenta?
              <a data-testid="link-login" (click)="goToLogin()">Inicia sesión</a>
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
    .login-link {
      text-align: center;
      margin-top: 16px;
      font-size: 0.9rem;
    }
    .login-link a {
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
export class RegisterPage {
  displayName = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onRegister(): Promise<void> {
    if (!this.displayName || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Por favor, completa todos los campos.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.register(this.email, this.password, this.displayName);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        this.errorMessage = 'Ya existe una cuenta con este correo.';
      } else if (error.code === 'auth/weak-password') {
        this.errorMessage = 'La contraseña es muy débil. Usa al menos 6 caracteres.';
      } else if (error.code === 'auth/invalid-email') {
        this.errorMessage = 'El correo electrónico no es válido.';
      } else {
        this.errorMessage = 'Error al crear la cuenta. Intenta de nuevo.';
      }
    } finally {
      this.isLoading = false;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
