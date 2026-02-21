# Memorial Digital QR

## Overview
A digital memorial application where families can create tribute pages for loved ones. Access is restricted via unique QR codes, preserving digital memories in a private, shareable space.

## Tech Stack
- **Runtime**: Node.js 20
- **Framework**: Express.js 5
- **Template Engine**: EJS (server-side rendering)
- **Database**: PostgreSQL (Replit built-in, via `pg`)
- **QR Generation**: `qrcode` npm package
- **File Uploads**: `multer` (images stored in `public/uploads/`)
- **Security**: `helmet`

## Project Structure
```
src/
  server.js          - Express app entry point (port 5000)
  db/
    schema.js        - Database initialization and pool
    queries.js       - All database query functions
  routes/
    home.js          - Home page and memorial creation
    memorial.js      - Public memorial view and entry submission
    admin.js         - Admin panel (edit memorial, manage entries, QR code)
views/
  home.ejs           - Landing page with create form
  memorial.ejs       - Public memorial view
  admin.ejs          - Admin dashboard
  error.ejs          - Error page
public/
  css/style.css      - Global styles
  uploads/           - User-uploaded images
```

## Key Features
- Create digital memorials with name, dates, biography, and cover image
- Unique access token generates a QR code for sharing
- Separate admin token for managing the memorial
- Visitors can add memories (text + optional photo)
- Admin can edit memorial details, delete entries, or delete the memorial
- All UI in Spanish

## Database Tables
- `memorials`: id, name, birth_date, death_date, description, cover_image, access_token, admin_token, created_at
- `entries`: id, memorial_id, author, body, image_url, created_at

## Routes
- `GET /` - Home page (create memorial form)
- `POST /create` - Create a new memorial
- `GET /m/:token` - View memorial (public access via QR)
- `POST /m/:token/entry` - Submit a memory entry
- `GET /admin/:adminToken` - Admin panel
- `POST /admin/:adminToken/update` - Update memorial
- `POST /admin/:adminToken/delete-entry/:entryId` - Delete an entry
- `POST /admin/:adminToken/delete` - Delete entire memorial

## Running
The app runs on port 5000 via `node src/server.js`. Database is auto-initialized on startup.
