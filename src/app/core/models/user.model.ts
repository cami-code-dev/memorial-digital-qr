export interface UserBase {
  uid: string;
  email: string;
  role: 'ADMIN' | 'CUSTODIO' | 'PUBLICO';
}
