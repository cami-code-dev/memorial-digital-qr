import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonFab,
  IonFabButton,
  IonSpinner,
  IonText,
  IonButtons,
  IonChip,
  IonBadge,
  IonList,
  IonItem,
  IonLabel,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  createOutline,
  trashOutline,
  qrCodeOutline,
  eyeOutline,
  eyeOffOutline,
  logOutOutline,
  heartOutline,
} from 'ionicons/icons';
import { AuthService } from '../../core/auth/auth.service';
import { MemorialService } from '../../services/memorial.service';
import { Memorial } from '../../models/memorial.model';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonFab,
    IonFabButton,
    IonSpinner,
    IonText,
    IonButtons,
    IonChip,
    IonBadge,
    IonList,
    IonItem,
    IonLabel,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title data-testid="text-dashboard-title">Mis Memoriales</ion-title>
        <ion-buttons slot="end">
          <ion-button data-testid="button-logout" (click)="onLogout()" color="medium">
            <ion-icon name="log-out-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="dashboard-container">
        <div class="welcome-section">
          <p class="welcome-text" data-testid="text-welcome">
            Hola, {{ userName }}
          </p>
          <p class="role-badge" data-testid="text-role">
            Rol: {{ userRole }}
          </p>
        </div>

        <div *ngIf="isLoading" class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Cargando memoriales...</p>
        </div>

        <div *ngIf="!isLoading && memorials.length === 0" class="empty-state">
          <ion-icon name="heart-outline" class="empty-icon"></ion-icon>
          <h3>No tienes memoriales aún</h3>
          <p>Crea tu primer memorial para honrar la memoria de un ser querido.</p>
          <ion-button data-testid="button-create-first" (click)="createMemorial()" color="primary">
            Crear mi primer memorial
          </ion-button>
        </div>

        <div *ngIf="!isLoading && memorials.length > 0" class="memorials-list">
          <ion-card *ngFor="let memorial of memorials" [attr.data-testid]="'card-memorial-' + memorial.id">
            <ion-card-header>
              <ion-card-title [attr.data-testid]="'text-memorial-name-' + memorial.id">
                {{ memorial.nombreDifunto }}
              </ion-card-title>
              <ion-card-subtitle>
                {{ memorial.fechaDefuncion | date:'longDate':'':'es' }}
              </ion-card-subtitle>
              <ion-chip [color]="memorial.isPublic ? 'success' : 'medium'">
                <ion-icon [name]="memorial.isPublic ? 'eye-outline' : 'eye-off-outline'"></ion-icon>
                <ion-label>{{ memorial.isPublic ? 'Público' : 'Privado' }}</ion-label>
              </ion-chip>
            </ion-card-header>
            <ion-card-content>
              <p class="bio-preview">{{ memorial.biografia | slice:0:150 }}{{ memorial.biografia.length > 150 ? '...' : '' }}</p>
              <div class="card-actions">
                <ion-button
                  [attr.data-testid]="'button-edit-' + memorial.id"
                  fill="outline"
                  size="small"
                  (click)="editMemorial(memorial.id!)">
                  <ion-icon name="create-outline" slot="start"></ion-icon>
                  Editar
                </ion-button>
                <ion-button
                  [attr.data-testid]="'button-qr-' + memorial.id"
                  fill="outline"
                  size="small"
                  color="secondary"
                  (click)="showQR(memorial)">
                  <ion-icon name="qr-code-outline" slot="start"></ion-icon>
                  QR
                </ion-button>
                <ion-button
                  [attr.data-testid]="'button-delete-' + memorial.id"
                  fill="outline"
                  size="small"
                  color="danger"
                  (click)="confirmDelete(memorial)">
                  <ion-icon name="trash-outline" slot="start"></ion-icon>
                  Eliminar
                </ion-button>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed" *ngIf="memorials.length > 0">
        <ion-fab-button data-testid="button-create-memorial" (click)="createMemorial()" color="primary">
          <ion-icon name="add-outline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [`
    .dashboard-container {
      max-width: 800px;
      margin: 0 auto;
    }
    .welcome-section {
      padding: 16px 0;
      border-bottom: 1px solid var(--ion-color-light-shade);
      margin-bottom: 16px;
    }
    .welcome-text {
      font-family: 'Playfair Display', serif;
      font-size: 1.3rem;
      margin: 0 0 4px;
    }
    .role-badge {
      font-size: 0.85rem;
      color: var(--ion-color-medium);
      margin: 0;
    }
    .loading-container {
      text-align: center;
      padding: 60px 0;
    }
    .empty-state {
      text-align: center;
      padding: 60px 16px;
    }
    .empty-icon {
      font-size: 4rem;
      color: var(--ion-color-medium);
      margin-bottom: 16px;
    }
    .empty-state h3 {
      font-family: 'Playfair Display', serif;
      font-size: 1.3rem;
      margin-bottom: 8px;
    }
    .empty-state p {
      color: var(--ion-color-medium);
      margin-bottom: 24px;
    }
    .bio-preview {
      font-size: 0.9rem;
      line-height: 1.5;
      color: var(--ion-color-medium);
      margin-bottom: 12px;
    }
    .card-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    ion-card {
      margin-bottom: 16px;
    }
    ion-card-title {
      font-family: 'Playfair Display', serif;
    }
    ion-chip {
      margin-top: 8px;
    }
  `],
})
export class DashboardPage implements OnInit {
  memorials: Memorial[] = [];
  isLoading = true;
  userName = '';
  userRole = '';

  constructor(
    private authService: AuthService,
    private memorialService: MemorialService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      addOutline,
      createOutline,
      trashOutline,
      qrCodeOutline,
      eyeOutline,
      eyeOffOutline,
      logOutOutline,
      heartOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.displayName || user.email;
      this.userRole = user.role;
    }
    await this.loadMemorials();
  }

  async loadMemorials(): Promise<void> {
    this.isLoading = true;
    try {
      this.memorials = await this.memorialService.getMemorialsByOwner();
    } catch (error) {
      console.error('Error loading memorials:', error);
      await this.showToast('Error al cargar los memoriales', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  createMemorial(): void {
    this.router.navigate(['/memorial/new']);
  }

  editMemorial(id: string): void {
    this.router.navigate(['/memorial', id, 'edit']);
  }

  async showQR(memorial: Memorial): Promise<void> {
    if (!memorial.isPublic) {
      await this.showToast('El memorial debe ser público para generar un código QR.', 'warning');
      return;
    }

    try {
      const publicUrl = `${window.location.origin}/m/${memorial.accessToken}`;
      const qrDataUrl = await QRCode.toDataURL(publicUrl, {
        width: 300,
        margin: 2,
        color: { dark: '#2d2520', light: '#f7f5f2' },
      });

      const alert = await this.alertController.create({
        header: 'Código QR',
        subHeader: memorial.nombreDifunto,
        message: `<div style="text-align:center"><img src="${qrDataUrl}" alt="QR Code" style="max-width:100%"/><p style="font-size:0.8rem;margin-top:8px;word-break:break-all">${publicUrl}</p></div>`,
        buttons: ['Cerrar'],
      });
      await alert.present();
    } catch (error) {
      await this.showToast('Error al generar el código QR', 'danger');
    }
  }

  async confirmDelete(memorial: Memorial): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar el memorial de "${memorial.nombreDifunto}"? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.memorialService.deleteMemorial(memorial.id!);
              this.memorials = this.memorials.filter((m) => m.id !== memorial.id);
              await this.showToast('Memorial eliminado correctamente', 'success');
            } catch (error) {
              await this.showToast('Error al eliminar el memorial', 'danger');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async onLogout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/']);
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }
}
