import { Injectable } from '@angular/core';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTask,
} from 'firebase/storage';
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from 'firebase/firestore';
import { getFirebaseStorage, getFirebaseDb } from '../firebase.config';
import { MediaItem } from '../models/memorial.model';
import { AuthService } from './auth.service';
import { AuditService } from './audit.service';
import { BehaviorSubject, Observable } from 'rxjs';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'audio/mpeg': '.mp3',
  'audio/mp3': '.mp3',
};

export interface UploadProgress {
  progress: number;
  state: 'running' | 'paused' | 'success' | 'error';
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class MediaService {
  private uploadProgress$ = new BehaviorSubject<UploadProgress | null>(null);
  progress$: Observable<UploadProgress | null> = this.uploadProgress$.asObservable();

  constructor(
    private authService: AuthService,
    private auditService: AuditService
  ) {}

  validateFile(file: File): string | null {
    if (!ALLOWED_TYPES[file.type]) {
      return `Tipo de archivo no permitido. Solo se aceptan: JPG, PNG, WebP, MP3.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `El archivo excede el límite de 50MB. Tamaño actual: ${(file.size / (1024 * 1024)).toFixed(1)}MB.`;
    }
    return null;
  }

  async uploadMedia(memorialId: string, file: File): Promise<MediaItem> {
    const validationError = this.validateFile(file);
    if (validationError) throw new Error(validationError);

    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('No autenticado');

    const storage = getFirebaseStorage();
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2)}${ALLOWED_TYPES[file.type]}`;
    const storagePath = `memorials/${memorialId}/${uniqueName}`;
    const storageRef = ref(storage, storagePath);

    return new Promise<MediaItem>((resolve, reject) => {
      const uploadTask: UploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          this.uploadProgress$.next({
            progress,
            state: snapshot.state as 'running' | 'paused',
          });
        },
        (error) => {
          this.uploadProgress$.next({ progress: 0, state: 'error', error: error.message });
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            const mediaItem: MediaItem = {
              id: uniqueName,
              memorialId,
              type: file.type.startsWith('image/') ? 'image' : 'audio',
              url: downloadURL,
              filename: file.name,
              sizeBytes: file.size,
              createdAt: new Date().toISOString(),
            };

            const db = getFirebaseDb();
            const memorialRef = doc(db, 'memorials', memorialId);
            await updateDoc(memorialRef, {
              media: arrayUnion(mediaItem),
            });

            this.uploadProgress$.next({ progress: 100, state: 'success' });

            await this.auditService.log(
              'UPLOAD_MEDIA',
              memorialId,
              'media',
              `Archivo subido: ${file.name} (${(file.size / 1024).toFixed(0)}KB)`
            );

            resolve(mediaItem);
          } catch (error: any) {
            this.uploadProgress$.next({ progress: 0, state: 'error', error: error.message });
            reject(error);
          }
        }
      );
    });
  }

  async deleteMedia(memorialId: string, mediaItem: MediaItem): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('No autenticado');

    try {
      const storage = getFirebaseStorage();
      const storagePath = `memorials/${memorialId}/${mediaItem.id}`;
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch (e) {
      console.warn('Error deleting storage file, continuing with DB cleanup:', e);
    }

    const db = getFirebaseDb();
    const memorialRef = doc(db, 'memorials', memorialId);
    await updateDoc(memorialRef, {
      media: arrayRemove(mediaItem),
    });

    await this.auditService.log(
      'DELETE_MEDIA',
      memorialId,
      'media',
      `Archivo eliminado: ${mediaItem.filename}`
    );
  }

  clearProgress(): void {
    this.uploadProgress$.next(null);
  }
}
