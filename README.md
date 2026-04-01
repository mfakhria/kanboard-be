# Kanzon

Kanzon adalah aplikasi project management berbasis kanban untuk membantu tim mengelola workspace, project, task, anggota, review workflow, notifikasi, dan analytics dalam satu platform.

## Overview

Kanzon dibangun sebagai aplikasi full-stack dengan frontend modern berbasis Nuxt dan backend modular berbasis NestJS. Repository ini cocok untuk:

- demo portfolio full-stack
- starter project untuk sistem task management
- referensi implementasi workspace-project-task hierarchy
- studi kasus dashboard operasional tim berbasis kanban

## Highlights

- autentikasi user dengan JWT
- workspace dan team management
- project management dengan visibility dan PIC
- board kanban per project dengan drag and drop
- task management lintas project
- approval or review workflow formal pada task
- attachment file pada task
- notification center terhubung ke backend
- audit log di analytics UI
- analytics dan overview performa workspace
- invitation flow untuk workspace dan project
- dukungan switch bahasa `EN / ID`

## Tech Stack

### Frontend

- Nuxt 3
- Vue 3
- TypeScript
- Pinia
- Tailwind CSS
- Axios
- Lucide Icons
- Chart.js dan `vue-chartjs`
- `vuedraggable`

### Backend

- NestJS 11
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- class-validator

### Infra and Tooling

- Docker
- Vercel-ready deployment path
- Vitest untuk frontend
- Jest untuk backend

## Core Modules

### Frontend

- Auth
- Workspace
- Project
- Kanban
- Task List
- Calendar
- Analytics
- Help Center
- Notifications

### Backend

- Auth
- Users
- Workspace
- Project
- Board
- Column
- Task
- Notification
- Analytics

## Key Business Flow

1. User register atau login ke aplikasi.
2. User membuat atau bergabung ke workspace.
3. Workspace memiliki satu atau lebih project.
4. Setiap project memiliki board utama dan kolom kerja.
5. User membuat task, memberi assignee, due date, priority, label, dan attachment.
6. Task dapat dipindahkan antar kolom, diajukan review, disetujui, atau diminta revisi.
7. Aktivitas penting terekam ke audit log dan data ringkasan ditampilkan di analytics.

## Repository Structure

```text
kanboard/
|-- frontend/   # Nuxt application
|-- backend/    # NestJS API + Prisma
|-- docs/       # technical docs, business flow, diagrams
|-- README.md
|-- KANZON_DOCUMENTATION.md
```

## Documentation

- [Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md)
- [Business Flow](docs/BUSINESS_FLOW.md)
- [Presentation Flow Diagrams](docs/PRESENTATION_FLOW_DIAGRAMS.md)
- [Full Documentation](KANZON_DOCUMENTATION.md)

## Local Setup

### 1. Clone repository

```bash
git clone <your-repo-url>
cd kanboard
```

### 2. Setup backend

```bash
cd backend
npm install
```

Buat file `.env` di folder `backend/` dan isi minimal:

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

Lalu generate Prisma client dan jalankan migration:

```bash
npx prisma generate
npx prisma migrate deploy
```

Jalankan backend:

```bash
npm run start:dev
```

### 3. Setup frontend

```bash
cd ../frontend
npm install
```

Buat file `.env` atau sesuaikan runtime config agar frontend mengarah ke backend:

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

Jalankan frontend:

```bash
npm run dev
```

## Useful Commands

### Frontend

```bash
npm run dev
npm run build
npm run test
```

### Backend

```bash
npm run start:dev
npm run build
npm test
npx prisma migrate deploy
```

## Database Notes

- Database utama menggunakan PostgreSQL.
- Prisma schema berada di [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma).
- Untuk environment remote seperti Supabase, gunakan `npx prisma migrate deploy`.
- Attachment saat ini mendukung penyimpanan lokal atau temporary serverless path; untuk production sebaiknya gunakan object storage seperti Supabase Storage atau S3.

## Current Product Scope

Fitur yang sudah cukup matang untuk demo atau presentasi:

- workspace, project, board, column, task
- notification preferences dan notification center
- audit log di analytics
- project-level label catalog
- task attachments
- approval workflow formal
- basic localization `English / Bahasa Indonesia`

## Screens to Explore

Kalau ingin cepat memahami aplikasi ini di GitHub atau saat demo, fokus ke area berikut:

- `Projects`
- `Kanban Board`
- `Tasks`
- `Analytics`
- `Settings`
- `Help Center`

## Notes

- Frontend memakai custom UI system berbasis Tailwind, bukan framework UI besar yang rigid.
- Repository ini masih aktif berkembang, jadi beberapa fitur enterprise lanjutan masih berada di roadmap.
- Dokumentasi detail proses bisnis, arsitektur, dan diagram flow sudah dipisahkan ke folder `docs/`.

## License

Repository ini menggunakan lisensi yang mengikuti konfigurasi proyek saat ini. Backend package menandai lisensi sebagai `MIT`.
