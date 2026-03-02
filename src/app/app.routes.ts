import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.page').then((m) => m.LandingPage),
    canActivate: [guestGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then((m) => m.RegisterPage),
    canActivate: [guestGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
    canActivate: [authGuard],
  },
  {
    path: 'memorial/new',
    loadComponent: () => import('./pages/memorial-form/memorial-form.page').then((m) => m.MemorialFormPage),
    canActivate: [authGuard, roleGuard('CUSTODIO')],
  },
  {
    path: 'memorial/:id/edit',
    loadComponent: () => import('./pages/memorial-form/memorial-form.page').then((m) => m.MemorialFormPage),
    canActivate: [authGuard, roleGuard('CUSTODIO')],
  },
  {
    path: 'm/:token',
    loadComponent: () => import('./pages/public-memorial/public-memorial.page').then((m) => m.PublicMemorialPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
