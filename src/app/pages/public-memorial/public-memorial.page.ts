import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonSpinner,
  IonText,
  IonImg,
  IonIcon,
  IonChip,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { musicalNotesOutline, calendarOutline, flowerOutline } from 'ionicons/icons';
import { MemorialService } from '../../services/memorial.service';
import { Memorial, MediaItem } from '../../models/memorial.model';

@Component({
  selector: 'app-public-memorial',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonSpinner,
    IonText,
    IonImg,
    IonIcon,
    IonChip,
    IonLabel,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Memorial</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div *ngIf="isLoading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Cargando memorial...</p>
      </div>

      <div *ngIf="!isLoading && !memorial" class="error-container">
        <ion-icon name="flower-outline" class="error-icon"></ion-icon>
        <h2 data-testid="text-not-found">Memorial no encontrado</h2>
        <p>El memorial que buscas no existe o no está disponible públicamente.</p>
      </div>

      <div *ngIf="!isLoading && memorial" class="memorial-container" data-testid="memorial-public-view">
        <div class="memorial-header">
          <h1 class="memorial-name" data-testid="text-memorial-name">{{ memorial.nombreDifunto }}</h1>
          <div class="dates">
            <ion-chip color="medium" *ngIf="memorial.fechaNacimiento">
              <ion-icon name="calendar-outline"></ion-icon>
              <ion-label>{{ memorial.fechaNacimiento }}</ion-label>
            </ion-chip>
            <span class="date-separator" *ngIf="memorial.fechaNacimiento"> — </span>
            <ion-chip color="medium">
              <ion-icon name="calendar-outline"></ion-icon>
              <ion-label>{{ memorial.fechaDefuncion }}</ion-label>
            </ion-chip>
          </div>
        </div>

        <ion-card class="bio-card">
          <ion-card-content>
            <p class="biografia" data-testid="text-biografia">{{ memorial.biografia }}</p>
          </ion-card-content>
        </ion-card>

        <div *ngIf="images.length > 0" class="media-section">
          <h2 class="section-title">Galería</h2>
          <div class="image-gallery">
            <div *ngFor="let img of images; let i = index" class="gallery-item">
              <ion-img
                [src]="visibleImages[i] ? img.url : ''"
                [alt]="img.filename"
                class="gallery-image"
                loading="lazy"
                [attr.data-testid]="'img-gallery-' + i"
                (ionImgWillLoad)="onImageVisible(i)">
              </ion-img>
            </div>
          </div>
        </div>

        <div *ngIf="audioFiles.length > 0" class="media-section">
          <h2 class="section-title">Audio</h2>
          <div *ngFor="let audio of audioFiles; let i = index" class="audio-item">
            <ion-icon name="musical-notes-outline" class="audio-icon"></ion-icon>
            <div class="audio-info">
              <p class="audio-name">{{ audio.filename }}</p>
              <audio
                controls
                [src]="visibleAudio[i] ? audio.url : ''"
                preload="none"
                [attr.data-testid]="'audio-player-' + i"
                (loadstart)="onAudioVisible(i)">
              </audio>
            </div>
          </div>
        </div>

        <div class="memorial-footer">
          <p class="footer-text">Memorial creado con amor y respeto.</p>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .loading-container, .error-container {
      text-align: center;
      padding: 60px 16px;
    }
    .error-icon {
      font-size: 4rem;
      color: var(--ion-color-medium);
      margin-bottom: 16px;
    }
    .error-container h2 {
      font-family: 'Playfair Display', serif;
      margin-bottom: 8px;
    }
    .memorial-container {
      max-width: 800px;
      margin: 0 auto;
    }
    .memorial-header {
      text-align: center;
      padding: 40px 0 24px;
    }
    .memorial-name {
      font-family: 'Playfair Display', serif;
      font-size: 2.2rem;
      font-weight: 700;
      color: var(--ion-color-primary);
      margin-bottom: 12px;
    }
    .dates {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      flex-wrap: wrap;
    }
    .date-separator {
      color: var(--ion-color-medium);
    }
    .bio-card {
      margin: 16px 0;
    }
    .biografia {
      font-size: 1.05rem;
      line-height: 1.8;
      white-space: pre-wrap;
    }
    .media-section {
      margin: 24px 0;
    }
    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.4rem;
      margin-bottom: 16px;
      color: var(--ion-color-primary);
    }
    .image-gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }
    .gallery-item {
      border-radius: 12px;
      overflow: hidden;
    }
    .gallery-image {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
    }
    .audio-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: var(--ion-color-light);
      border-radius: 12px;
      margin-bottom: 8px;
    }
    .audio-icon {
      font-size: 2rem;
      color: var(--ion-color-primary);
      flex-shrink: 0;
    }
    .audio-info {
      flex: 1;
    }
    .audio-name {
      font-size: 0.9rem;
      margin: 0 0 8px;
    }
    audio {
      width: 100%;
    }
    .memorial-footer {
      text-align: center;
      padding: 32px 0;
      border-top: 1px solid var(--ion-color-light-shade);
      margin-top: 32px;
    }
    .footer-text {
      font-style: italic;
      color: var(--ion-color-medium);
    }
  `],
})
export class PublicMemorialPage implements OnInit {
  memorial: Memorial | null = null;
  isLoading = true;
  images: MediaItem[] = [];
  audioFiles: MediaItem[] = [];
  visibleImages: boolean[] = [];
  visibleAudio: boolean[] = [];

  constructor(
    private route: ActivatedRoute,
    private memorialService: MemorialService
  ) {
    addIcons({ musicalNotesOutline, calendarOutline, flowerOutline });
  }

  async ngOnInit(): Promise<void> {
    const token = this.route.snapshot.paramMap.get('token') || '';
    try {
      this.memorial = await this.memorialService.getMemorialByToken(token);
      if (this.memorial?.media) {
        this.images = this.memorial.media.filter((m) => m.type === 'image');
        this.audioFiles = this.memorial.media.filter((m) => m.type === 'audio');
        this.visibleImages = this.images.map(() => false);
        this.visibleAudio = this.audioFiles.map(() => false);

        setTimeout(() => {
          this.visibleImages = this.images.map(() => true);
          this.visibleAudio = this.audioFiles.map(() => true);
        }, 100);
      }
    } catch (error) {
      console.error('Error loading public memorial:', error);
      this.memorial = null;
    } finally {
      this.isLoading = false;
    }
  }

  onImageVisible(index: number): void {
    this.visibleImages[index] = true;
  }

  onAudioVisible(index: number): void {
    this.visibleAudio[index] = true;
  }
}
