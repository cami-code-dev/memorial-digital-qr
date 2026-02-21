import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, map, take } from 'rxjs/operators';
import { UserRole } from '../models/user.model';

export function roleGuard(requiredRole: UserRole): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.isReady$.pipe(
      filter((ready) => ready),
      take(1),
      map(() => {
        if (authService.hasRole(requiredRole)) {
          return true;
        }
        router.navigate(['/dashboard']);
        return false;
      })
    );
  };
}
