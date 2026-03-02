export type Visibility = 'PRIVADO' | 'RESTRINGIDO' | 'PUBLICO' | 'INACTIVO';

export interface Memorial {
  id: string;
  nombreCompleto: string;
  fechaNacimiento: Date;
  fechaDefuncion: Date;
  biografia: string;
  estado: Visibility;
  visibilityUpdatedBy: string;
  visibilityUpdatedAt: Date;
}
