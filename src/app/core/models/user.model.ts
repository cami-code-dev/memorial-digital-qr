export type UserRole = 'ADMIN' | 'CUSTODIO' | 'PUBLICO';

export interface UserBase {
  uid: string;
  email: string;
  role: UserRole;
}
