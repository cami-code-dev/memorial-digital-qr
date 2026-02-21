import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonItem,
  IonInput,
  IonTextarea,
  IonToggle,
  IonCheckbox,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonSpinner,
  IonText,
  IonButtons,
  IonBackButton,
  IonLabel,
  IonProgressBar,
  IonImg,
  IonChip,
  ToastController,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cloudUploadOutline,
  trashOutline,
  saveOutline,
  imageOutline,
  musicalNotesOutline,
  closeCircleOutline,
} from 'ionicons/icons';
import { MemorialService } from '../../services/memorial.service';
import { MediaService, UploadProgress } from '../../services/media.service';
import { Memorial, MediaItem } from '../../models/memorial.model';

@Component({
  selector: 'app-memorial-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonIcon,
    IonItem,
    IonInput,
    IonTextarea,
    IonToggle,
    IonCheckbox,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonSpinner,
    IonText,
    IonButtons,
    IonBackButton,
    IonLabel,
    IonProgressBar,
    IonImg,
    IonChip,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/dashboard" text="Volver"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ isEditing ? 'Editar Memorial' : 'Nuevo Memorial' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="form-container" *ngIf="!isLoadingMemorial">
        <ion-card>
          <ion-card-header>
            <ion-card-title data-testid="text-form-title">
              {{ isEditing ? 'Editar Memorial' : 'Crear Nuevo Memorial' }}
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <form (ngSubmit)="onSubmit()">
              <ion-item>
                <ion-input
                  data-testid="input-nombre"
                  type="text"
                  label="Nombre del difunto"
                  labelPlacement="floating"
                  [(ngModel)]="form.nombreDifunto"
                  name="nombreDifunto"
                  required>
                </ion-input>
              </ion-item>

              <ion-item>
                <ion-textarea
                  data-testid="input-biografia"
                  label="Biografía"
                  labelPlacement="floating"
                  [(ngModel)]="form.biografia"
                  name="biografia"
                  rows="6"
                  required>
                </ion-textarea>
              </ion-item>

              <ion-item>
                <ion-input
                  data-testid="input-fecha-nacimiento"
                  type="date"
                  label="Fecha de nacimiento"
                  labelPlacement="floating"
                  [(ngModel)]="form.fechaNacimiento"
                  name="fechaNacimiento">
                </ion-input>
              </ion-item>

              <ion-item>
                <ion-input
                  data-testid="input-fecha-defuncion"
                  type="date"
                  label="Fecha de defunción"
                  labelPlacement="floating"
                  [(ngModel)]="form.fechaDefuncion"
                  name="fechaDefuncion"
                  required>
                </ion-input>
              </ion-item>

              <ion-item>
                <ion-toggle
                  data-testid="toggle-public"
                  [(ngModel)]="form.isPublic"
                  name="isPublic">
                  Memorial público
                </ion-toggle>
              </ion-item>

              <ion-item lines="none" class="consent-item">
                <ion-checkbox
                  data-testid="checkbox-consent"
                  [(ngModel)]="form.consentimientoConfirmado"
                  name="consentimientoConfirmado">
                </ion-checkbox>
                <ion-label class="consent-label">
                  Confirmo que tengo autorización para crear este memorial y que la información proporcionada es verídica.
                </ion-label>
              </ion-item>

              <ion-text color="danger" *ngIf="errorMessage">
                <p class="error-text" data-testid="text-form-error">{{ errorMessage }}</p>
              </ion-text>

              <ion-button
                data-testid="button-submit"
                expand="block"
                type="submit"
                color="primary"
                [disabled]="isSaving"
                class="submit-btn">
                <ion-spinner *ngIf="isSaving" name="crescent"></ion-spinner>
                <ion-icon *ngIf="!isSaving" name="save-outline" slot="start"></ion-icon>
                <span *ngIf="!isSaving">{{ isEditing ? 'Guardar Cambios' : 'Crear Memorial' }}</span>
              </ion-button>
            </form>
          </ion-card-content>
        </ion-card>

        <ion-card *ngIf="isEditing && memorial">
          <ion-card-header>
            <ion-card-title>Archivos Multimedia</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="upload-section">
              <input
                #fileInput
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.mp3"
                (change)="onFileSelected($event)"
                style="display: none">
              <ion-button
                data-testid="button-upload"
                expand="block"
                fill="outline"
                (click)="fileInput.click()"
                [disabled]="isUploading">
                <ion-icon name="cloud-upload-outline" slot="start"></ion-icon>
                Subir archivo (máx. 50MB)
              </ion-button>

              <ion-progress-bar
                *ngIf="uploadProgress"
                [value]="uploadProgress.progress / 100"
                [color]="uploadProgress.state === 'error' ? 'danger' : 'primary'"
                class="upload-progress">
              </ion-progress-bar>
              <ion-text *ngIf="uploadProgress?.state === 'error'" color="danger">
                <p class="error-text">{{ uploadProgress?.error }}</p>
              </ion-text>
            </div>

            <div class="media-list" *ngIf="memorial.media && memorial.media.length > 0">
              <div *ngFor="let media of memorial.media" class="media-item" [attr.data-testid]="'media-item-' + media.id">
                <div class="media-preview">
                  <ion-img
                    *ngIf="media.type === 'image'"
                    [src]="media.url"
                    class="media-thumbnail"
                    loading="lazy">
                  </ion-img>
                  <div *ngIf="media.type === 'audio'" class="audio-preview">
                    <ion-icon name="musical-notes-outline"></ion-icon>
                  </div>
                </div>
                <div class="media-info">
                  <p class="media-name">{{ media.filename }}</p>
                  <p class="media-size">{{ (media.sizeBytes / 1024).toFixed(0) }} KB</p>
                </div>
                <ion-button
                  [attr.data-testid]="'button-delete-media-' + media.id"
                  fill="clear"
                  color="danger"
                  (click)="deleteMedia(media)">
                  <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
                </ion-button>
              </div>
            </div>

            <p *ngIf="!memorial.media || memorial.media.length === 0" class="no-media">
              No hay archivos multimedia. Sube imágenes (JPG, PNG, WebP) o audio (MP3).
            </p>
          </ion-card-content>
        </ion-card>
      </div>

      <div *ngIf="isLoadingMemorial" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Cargando memorial...</p>
      </div>
    </ion-content>
  `,
  styles: [`
    .form-container {
      max-width: 700px;
      margin: 0 auto;
    }
    ion-card-title {
      font-family: 'Playfair Display', serif;
    }
    ion-item {
      --padding-start: 0;
      margin-bottom: 8px;
    }
    .consent-item {
      margin-top: 16px;
      --padding-start: 0;
    }
    .consent-label {
      font-size: 0.85rem;
      margin-left: 12px;
      white-space: normal;
    }
    .error-text {
      font-size: 0.85rem;
      padding: 8px 0;
    }
    .submit-btn {
      margin-top: 20px;
    }
    .upload-section {
      margin-bottom: 16px;
    }
    .upload-progress {
      margin-top: 8px;
    }
    .media-list {
      margin-top: 16px;
    }
    .media-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      border-bottom: 1px solid var(--ion-color-light-shade);
    }
    .media-preview {
      width: 60px;
      height: 60px;
      flex-shrink: 0;
    }
    .media-thumbnail {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 8px;
    }
    .audio-preview {
      width: 60px;
      height: 60px;
      background: var(--ion-color-light);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: var(--ion-color-primary);
    }
    .media-info {
      flex: 1;
    }
    .media-name {
      font-size: 0.9rem;
      margin: 0;
    }
    .media-size {
      font-size: 0.8rem;
      color: var(--ion-color-medium);
      margin: 4px 0 0;
    }
    .no-media {
      text-align: center;
      color: var(--ion-color-medium);
      padding: 20px;
    }
    .loading-container {
      text-align: center;
      padding: 60px 0;
    }
  `],
})
export class MemorialFormPage implements OnInit {
  isEditing = false;
  isLoadingMemorial = false;
  isSaving = false;
  isUploading = false;
  errorMessage = '';
  memorialId = '';
  memorial: Memorial | null = null;
  uploadProgress: UploadProgress | null = null;

  form = {
    nombreDifunto: '',
    biografia: '',
    fechaNacimiento: '',
    fechaDefuncion: '',
    isPublic: false,
    consentimientoConfirmado: false,
  };

  constructor(
    private memorialService: MemorialService,
    private mediaService: MediaService,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({
      cloudUploadOutline,
      trashOutline,
      saveOutline,
      imageOutline,
      musicalNotesOutline,
      closeCircleOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    this.memorialId = this.route.snapshot.paramMap.get('id') || '';
    this.isEditing = !!this.memorialId;

    if (this.isEditing) {
      await this.loadMemorial();
    }

    this.mediaService.progress$.subscribe((progress) => {
      this.uploadProgress = progress;
      this.isUploading = progress?.state === 'running' || progress?.state === 'paused';
    });
  }

  private async loadMemorial(): Promise<void> {
    this.isLoadingMemorial = true;
    try {
      this.memorial = await this.memorialService.getMemorial(this.memorialId);
      if (this.memorial) {
        this.form = {
          nombreDifunto: this.memorial.nombreDifunto,
          biografia: this.memorial.biografia,
          fechaNacimiento: this.memorial.fechaNacimiento || '',
          fechaDefuncion: this.memorial.fechaDefuncion,
          isPublic: this.memorial.isPublic,
          consentimientoConfirmado: false,
        };
      }
    } catch (error) {
      await this.showToast('Error al cargar el memorial', 'danger');
      this.router.navigate(['/dashboard']);
    } finally {
      this.isLoadingMemorial = false;
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.form.nombreDifunto || !this.form.biografia || !this.form.fechaDefuncion) {
      this.errorMessage = 'Por favor, completa los campos obligatorios.';
      return;
    }

    if (!this.form.consentimientoConfirmado) {
      this.errorMessage = 'Debes confirmar el consentimiento para continuar.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    try {
      if (this.isEditing) {
        await this.memorialService.updateMemorial(this.memorialId, this.form);
        await this.showToast('Memorial actualizado correctamente', 'success');
      } else {
        const newMemorial = await this.memorialService.createMemorial({
          ...this.form,
          fechaNacimiento: this.form.fechaNacimiento || null,
        });
        await this.showToast('Memorial creado correctamente', 'success');
        this.router.navigate(['/memorial', newMemorial.id, 'edit']);
        return;
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al guardar el memorial.';
    } finally {
      this.isSaving = false;
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const validationError = this.mediaService.validateFile(file);
    if (validationError) {
      await this.showToast(validationError, 'danger');
      input.value = '';
      return;
    }

    this.isUploading = true;
    try {
      await this.mediaService.uploadMedia(this.memorialId, file);
      await this.loadMemorial();
      await this.showToast('Archivo subido correctamente', 'success');
    } catch (error: any) {
      await this.showToast(error.message || 'Error al subir el archivo', 'danger');
    } finally {
      this.isUploading = false;
      this.mediaService.clearProgress();
      input.value = '';
    }
  }

  async deleteMedia(mediaItem: MediaItem): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Eliminar archivo',
      message: `¿Eliminar "${mediaItem.filename}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.mediaService.deleteMedia(this.memorialId, mediaItem);
              await this.loadMemorial();
              await this.showToast('Archivo eliminado', 'success');
            } catch (error) {
              await this.showToast('Error al eliminar el archivo', 'danger');
            }
          },
        },
      ],
    });
    await alert.present();
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
