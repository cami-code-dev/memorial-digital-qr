import { Injectable } from '@angular/core';
import { collection, addDoc } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase.config';
import { AuditLog } from '../models/memorial.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuditService {
  constructor(private authService: AuthService) {}

  async log(
    action: AuditLog['action'],
    targetId: string,
    targetType: AuditLog['targetType'],
    details: string
  ): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    const db = getFirebaseDb();
    const logEntry: Omit<AuditLog, 'id'> = {
      userId: user.uid,
      userEmail: user.email,
      action,
      targetId,
      targetType,
      details,
      timestamp: new Date().toISOString(),
    };

    await addDoc(collection(db, 'Logs'), logEntry);
  }
}
