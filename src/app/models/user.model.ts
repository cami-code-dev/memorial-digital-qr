export type UserRole = 'ADMIN' | 'CUSTODIO' | 'PUBLICO';

export interface AppUser {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  createdAt: string;
}
