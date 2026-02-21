import { Injectable } from '@angular/core';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from '../firebase.config';
import { Memorial } from '../models/memorial.model';
import { AuthService } from './auth.service';
import { AuditService } from './audit.service';

@Injectable({ providedIn: 'root' })
export class MemorialService {
  private collectionName = 'memorials';

  constructor(
    private authService: AuthService,
    private auditService: AuditService
  ) {}

  private generateAccessToken(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 24; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  private validateConsent(consentimientoConfirmado: boolean): void {
    if (!consentimientoConfirmado) {
      throw new Error('El consentimiento es obligatorio para cualquier operación de escritura.');
    }
  }

  async getMemorialsByOwner(): Promise<Memorial[]> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('No autenticado');

    const db = getFirebaseDb();
    const q = query(
      collection(db, this.collectionName),
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Memorial));
  }

  async getMemorial(id: string): Promise<Memorial | null> {
    const db = getFirebaseDb();
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as Memorial;
  }

  async getMemorialByToken(token: string): Promise<Memorial | null> {
    const db = getFirebaseDb();
    const q = query(
      collection(db, this.collectionName),
      where('accessToken', '==', token),
      where('isPublic', '==', true)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const d = snapshot.docs[0];
    return { id: d.id, ...d.data() } as Memorial;
  }

  async createMemorial(data: {
    nombreDifunto: string;
    biografia: string;
    fechaNacimiento: string | null;
    fechaDefuncion: string;
    isPublic: boolean;
    consentimientoConfirmado: boolean;
  }): Promise<Memorial> {
    this.validateConsent(data.consentimientoConfirmado);

    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('No autenticado');

    const db = getFirebaseDb();
    const memorial: Omit<Memorial, 'id'> = {
      ownerId: user.uid,
      nombreDifunto: data.nombreDifunto,
      biografia: data.biografia,
      fechaNacimiento: data.fechaNacimiento,
      fechaDefuncion: data.fechaDefuncion,
      isPublic: data.isPublic,
      accessToken: this.generateAccessToken(),
      consentimientoConfirmado: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      media: [],
    };

    const docRef = await addDoc(collection(db, this.collectionName), memorial);

    await this.auditService.log('CREATE', docRef.id, 'memorial', `Memorial creado: ${data.nombreDifunto}`);

    return { id: docRef.id, ...memorial };
  }

  async updateMemorial(
    id: string,
    data: Partial<{
      nombreDifunto: string;
      biografia: string;
      fechaNacimiento: string | null;
      fechaDefuncion: string;
      isPublic: boolean;
      consentimientoConfirmado: boolean;
    }>
  ): Promise<Memorial> {
    if (data.consentimientoConfirmado !== undefined) {
      this.validateConsent(data.consentimientoConfirmado);
    } else {
      this.validateConsent(false);
    }

    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('No autenticado');

    const db = getFirebaseDb();
    const docRef = doc(db, this.collectionName, id);
    const existing = await getDoc(docRef);

    if (!existing.exists()) throw new Error('Memorial no encontrado');
    if (existing.data()['ownerId'] !== user.uid) throw new Error('No autorizado');

    const updateData = { ...data, updatedAt: new Date().toISOString() };
    delete (updateData as any).consentimientoConfirmado;

    await updateDoc(docRef, updateData);

    await this.auditService.log('UPDATE', id, 'memorial', `Memorial actualizado: ${data.nombreDifunto || ''}`);

    const updated = await getDoc(docRef);
    return { id: updated.id, ...updated.data() } as Memorial;
  }

  async deleteMemorial(id: string): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('No autenticado');

    const db = getFirebaseDb();
    const docRef = doc(db, this.collectionName, id);
    const existing = await getDoc(docRef);

    if (!existing.exists()) throw new Error('Memorial no encontrado');
    if (existing.data()['ownerId'] !== user.uid) throw new Error('No autorizado');

    await deleteDoc(docRef);

    await this.auditService.log('DELETE', id, 'memorial', `Memorial eliminado`);
  }
}
