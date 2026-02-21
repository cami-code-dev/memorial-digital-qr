import { Injectable } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { getFirebaseAuth, getFirebaseDb } from '../firebase.config';
import { AppUser, UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser$ = new BehaviorSubject<AppUser | null>(null);
  private authReady$ = new BehaviorSubject<boolean>(false);

  user$: Observable<AppUser | null> = this.currentUser$.asObservable();
  isReady$: Observable<boolean> = this.authReady$.asObservable();

  constructor() {
    const auth = getFirebaseAuth();
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const appUser = await this.loadUserProfile(firebaseUser);
        this.currentUser$.next(appUser);
      } else {
        this.currentUser$.next(null);
      }
      this.authReady$.next(true);
    });
  }

  private async loadUserProfile(firebaseUser: User): Promise<AppUser> {
    const db = getFirebaseDb();
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return userDoc.data() as AppUser;
    }

    const newUser: AppUser = {
      uid: firebaseUser.uid,
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
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(credential.user, { displayName });

    const db = getFirebaseDb();
    const newUser: AppUser = {
      uid: credential.user.uid,
      email: credential.user.email || email,
      role: 'CUSTODIO',
      displayName,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', credential.user.uid), newUser);
    this.currentUser$.next(newUser);
    return newUser;
  }

  async login(email: string, password: string): Promise<AppUser> {
    const auth = getFirebaseAuth();
    const credential = await signInWithEmailAndPassword(auth, email, password);
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

  hasRole(requiredRole: UserRole): boolean {
    const user = this.currentUser$.value;
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return user.role === requiredRole;
  }

  isAuthenticated(): boolean {
    return this.currentUser$.value !== null;
  }
}
