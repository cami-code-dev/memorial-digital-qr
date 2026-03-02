# Memorial - Blog de Acceso Restringido

## Overview
A restricted-access memorial blog where users (custodians) can create private digital memorials for deceased loved ones. Memorials are private by default and can be shared publicly via unique QR codes and access tokens.

## Architecture
- **Frontend**: Ionic 7.8 + Angular 17.3 + TypeScript 5.4
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Auth**: Firebase Auth (email/password)
- **Database**: Cloud Firestore
- **File Storage**: Firebase Storage (50MB limit)
- **Dev Server**: Angular CLI dev server spawned by server/index.ts on port 5000

## Key Features
- Private-by-default memorials with public toggle
- QR code generation for sharing read-only public access (qrcode library)
- Media upload (images: JPG/PNG/WebB, audio: MP3) with 50MB limit
- Consent confirmation required for all writes (consentimientoConfirmado validation)
- Role-based access: ADMIN, CUSTODIO (owner/editor), and PÚBLICO (read-only via QR)
- Audit logging of all changes to Firestore 'Logs' collection
- Zero-tracking Firebase configuration (no analytics, no persistent cache)
- Lazy loading for all pages and media assets
- No likes, comments, or invasive tracking

## Project Structure
```
src/
  main.ts                  - Angular bootstrap
  index.html               - Root HTML with serif font imports
  global.scss              - Global styles (warm sober palette)
  environments/
    environment.ts         - Firebase config (generated at runtime from Replit secrets)
  app/
    app.component.ts       - Root component with ion-router-outlet
    app.routes.ts          - Lazy-loaded route definitions with guards
    firebase.config.ts     - Firebase/Firestore initialization
    core/
      models/
        memorial.model.ts  - Memorial interface + Visibility type (PRIVADO/RESTRINGIDO/PUBLICO/INACTIVO)
        user.model.ts      - UserBase interface + UserRole type (ADMIN/CUSTODIO/PUBLICO)
      auth/
        auth.service.ts    - Firebase Auth + Firestore user profiles + UID sanitization + strict typing
        role.guard.ts      - Role-based guard (CUSTODIO/ADMIN required, PUBLICO redirected to /login)
    services/
      memorial.service.ts  - Firestore CRUD with consent validation + audit logging
      media.service.ts     - Firebase Storage uploads with 50MB validation + lazy loading
      audit.service.ts     - Audit log service (writes to 'Logs' collection)
    guards/
      auth.guard.ts        - Authentication guard (redirects to /login)
    pages/
      landing/             - Public landing page
      login/               - Email/password login form
      register/            - User registration form
      dashboard/           - Memorial list with QR generation
      memorial-form/       - Create/edit memorial with media upload
      public-memorial/     - Read-only public view (accessed via /m/:token)
server/
  index.ts                 - Generates environment.ts from secrets, spawns ng serve on port 5000
```

## Routes
- `/` - Landing page (public)
- `/login` - Login page (public)
- `/register` - Registration page (public)
- `/dashboard` - Memorial list (requires auth via authGuard)
- `/memorial/new` - Create memorial (requires CUSTODIO role via roleGuard)
- `/memorial/:id` - Edit memorial (requires CUSTODIO role via roleGuard)
- `/m/:token` - Public memorial view (public, read-only)

## Firestore Collections
- `users` - User profiles (uid, email, nombre, rol, fechaRegistro)
- `memorials` - Memorial data (nombre, fechaNacimiento, fechaFallecimiento, biografia, isPublic, accessToken, userId, consentimientoConfirmado)
- `memorials/{id}/media` - Media subcollection (url, type, filename, size, createdAt)
- `Logs` - Audit logs (userId, action, targetId, details, timestamp)

## Design
- Warm, sober color palette (browns #8B7355, beiges #F5F0EB, warm grays)
- Serif typography (Lora for body, Playfair Display for headings)
- Respectful, dignified aesthetic - no flashy elements
- Ionic components with custom CSS variables for theming

## User Preferences
- Language: Spanish (all UI text in Spanish)
- Ethical constraints: No likes, comments, avatars/voices imitating deceased
- File size limit: 50MB per upload
- Zero-tracking: No analytics, no persistent cache

## Environment Variables (Secrets)
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_APP_ID` - Firebase app ID
- `SESSION_SECRET` - Session secret (legacy, not currently used)

## Running the Project
- The workflow 'Start application' runs `npm run dev` which executes `tsx server/index.ts`
- server/index.ts generates `src/environments/environment.ts` from Replit secrets, then spawns `ng serve` on port 5000
- Angular CLI handles HMR and live reloading in development mode
