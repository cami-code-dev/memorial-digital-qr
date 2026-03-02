import { Injectable } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  DocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { getFirebaseAuth, getFirebaseDb } from '../../firebase.config';
import { UserBase } from '../models/user.model';

export interface AppUser extends UserBase {
  displayName?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser$ = new BehaviorSubject<AppUser | null>(null);
  private authReady$ = new BehaviorSubject<boolean>(false);

  user$: Observable<AppUser | null> = this.currentUser$.asObservable();
  isReady$: Observable<boolean> = this.authReady$.asObservable();

  constructor() {
    const auth = getFirebaseAuth();
    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const appUser = await this.loadUserProfile(firebaseUser);
        this.currentUser$.next(appUser);
      } else {
        this.currentUser$.next(null);
      }
      this.authReady$.next(true);
    });
  }

  static sanitizeUid(uid: string): string {
    return uid.replace(/[^a-zA-Z0-9_-]/g, '');
  }

  private async loadUserProfile(firebaseUser: FirebaseUser): Promise<AppUser> {
    const db = getFirebaseDb();
    const sanitizedUid = AuthService.sanitizeUid(firebaseUser.uid);
    const userDocRef = doc(db, 'users', sanitizedUid);
    const userDoc: DocumentSnapshot<DocumentData> = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data() as Record<string, unknown>;
      return {
        uid: data['uid'] as string,
        email: data['email'] as string,
        role: data['role'] as AppUser['role'],
        displayName: (data['displayName'] as string) || '',
        createdAt: data['createdAt'] as string,
      };
    }

    const newUser: AppUser = {
      uid: sanitizedUid,
      email: firebaseUser.email || '',
      role: 'CUSTODIO',
      displayName: firebaseUser.displayName || '',
      createdAt: new Date().toISOString(),
    };

    await setDoc(userDocRef, newUser);
    return newUser;
  }

  async register(email: string, password: string, displayName: string): Promise<AppUser> {
    const auth = getFirebaseAuth();
    const credential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(credential.user, { displayName });

    const db = getFirebaseDb();
    const sanitizedUid = AuthService.sanitizeUid(credential.user.uid);
    const newUser: AppUser = {
      uid: sanitizedUid,
      email: credential.user.email || email,
      role: 'CUSTODIO',
      displayName,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', sanitizedUid), newUser);
    this.currentUser$.next(newUser);
    return newUser;
  }

  async login(email: string, password: string): Promise<AppUser> {
    const auth = getFirebaseAuth();
    const credential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    const appUser = await this.loadUserProfile(credential.user);
    this.currentUser$.next(appUser);
    return appUser;
  }

  async logout(): Promise<void> {
    const auth = getFirebaseAuth();
    await signOut(auth);
    this.currentUser$.next(null);
  }

  getCurrentUser(): AppUser | null {
    return this.currentUser$.value;
  }

  hasRole(requiredRole: UserBase['role']): boolean {
    const user = this.currentUser$.value;
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return user.role === requiredRole;
  }

  isAuthenticated(): boolean {
    return this.currentUser$.value !== null;
  }
}
