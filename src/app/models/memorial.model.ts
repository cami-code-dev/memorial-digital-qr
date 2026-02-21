export interface Memorial {
  id?: string;
  ownerId: string;
  nombreDifunto: string;
  biografia: string;
  fechaNacimiento: string | null;
  fechaDefuncion: string;
  isPublic: boolean;
  accessToken: string;
  consentimientoConfirmado: boolean;
  createdAt: string;
  updatedAt: string;
  media?: MediaItem[];
}

export interface MediaItem {
  id?: string;
  memorialId: string;
  type: 'image' | 'audio';
  url: string;
  filename: string;
  sizeBytes: number;
  createdAt: string;
}

export interface AuditLog {
  id?: string;
  userId: string;
  userEmail: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'UPLOAD_MEDIA' | 'DELETE_MEDIA';
  targetId: string;
  targetType: 'memorial' | 'media';
  details: string;
  timestamp: string;
}
