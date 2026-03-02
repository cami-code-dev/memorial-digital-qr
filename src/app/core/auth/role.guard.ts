import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { UserBase } from '../models/user.model';
import { filter, map, take } from 'rxjs/operators';

export function roleGuard(requiredRole: UserBase['role']): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.isReady$.pipe(
      filter((ready: boolean) => ready),
      take(1),
      map(() => {
        const user = authService.getCurrentUser();

        if (!user) {
          router.navigate(['/login']);
          return false;
        }

        if (user.role === 'PUBLICO') {
          router.navigate(['/login']);
          return false;
        }

        if (authService.hasRole(requiredRole)) {
          return true;
        }

        router.navigate(['/login']);
        return false;
      })
    );
  };
}
