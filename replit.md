# Memorial - Blog de Acceso Restringido

## Overview
A restricted-access memorial blog where users (custodians) can create private digital memorials for deceased loved ones. Memorials are private by default and can be shared publicly via unique QR codes and access tokens.

## Architecture
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Replit Auth (OpenID Connect)
- **Routing**: wouter (frontend), Express (backend)

## Key Features
- Private-by-default memorials with public toggle
- QR code generation for sharing read-only public access
- Media upload (images: JPG/PNG/WebP, audio: MP3) with 5MB limit
- Consent confirmation required for all writes
- Role-based access: Custodio (owner/editor) and Público (read-only via QR)
- No likes, comments, or invasive tracking

## Project Structure
```
client/src/
  App.tsx              - Main router with auth-gated routes
  pages/
    landing.tsx        - Public landing page
    dashboard.tsx      - Authenticated user's memorial list
    memorial-form.tsx  - Create/edit memorial with media upload
    public-memorial.tsx - Read-only public view (accessed via /m/:token)
  components/
    theme-provider.tsx - Light/dark theme management
    theme-toggle.tsx   - Theme toggle button
  hooks/
    use-auth.ts        - Authentication state hook
server/
  routes.ts            - All API endpoints
  storage.ts           - Database storage layer
  db.ts                - Drizzle database connection
  replit_integrations/auth/ - Replit Auth integration
shared/
  schema.ts            - Drizzle schemas (memorials, media)
  models/auth.ts       - Auth schemas (users, sessions)
```

## API Routes
- `GET /api/memorials` - List user's memorials (authenticated)
- `GET /api/memorials/:id` - Get memorial details (authenticated, owner only)
- `POST /api/memorials` - Create memorial (authenticated)
- `PATCH /api/memorials/:id` - Update memorial (authenticated, owner only)
- `DELETE /api/memorials/:id` - Delete memorial (authenticated, owner only)
- `POST /api/memorials/:id/media` - Upload media file (authenticated, owner only)
- `DELETE /api/memorials/:id/media/:mediaId` - Delete media (authenticated, owner only)
- `GET /api/memorials/:id/qr` - Generate QR code (authenticated, owner only)
- `GET /api/public/memorial/:token` - Public read-only memorial access

## Design
- Warm, sober color palette (warm grays with brown undertones)
- Serif typography (Lora for body, Playfair Display for headings)
- Dark mode support
- Respectful, dignified aesthetic - no flashy elements

## User Preferences
- Language: Spanish (UI text in Spanish)
- Ethical constraints: No likes, comments, avatars/voices imitating deceased
