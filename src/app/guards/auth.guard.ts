import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { filter, map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isReady$.pipe(
    filter((ready) => ready),
    take(1),
    map(() => {
      if (authService.isAuthenticated()) {
        return true;
      }
      router.navigate(['/login']);
      return false;
    })
  );
};

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isReady$.pipe(
    filter((ready) => ready),
    take(1),
    map(() => {
      if (!authService.isAuthenticated()) {
        return true;
      }
      router.navigate(['/dashboard']);
      return false;
    })
  );
};
