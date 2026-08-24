# Society Maintenance Tracker

Production-minded maintenance workflow platform built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Features

- Secure bcrypt password authentication using signed, HTTP-only JWT cookies and role-based API authorization.
- Resident complaint submission, optional validated local image upload, personal complaint access, and full history timeline.
- Admin operational dashboard, all-complaint view, priority changes, lifecycle controls, and overdue visibility.
- Notice board with important notices pinned first.
- Configurable `OVERDUE_THRESHOLD_DAYS`; unresolved records past that age are overdue.
- SMTP email adapter architecture with a safe console fallback when SMTP is not configured.

## Architecture

`app UI → REST route handlers → Zod validation/services → Prisma → PostgreSQL`.

The database contains `User`, `Complaint`, `ComplaintHistory`, and `Notice`. A User creates complaints and notices; each Complaint has many immutable history entries. Indexed status/priority/category and resident queries support dashboard and list views.

## Complaint lifecycle

Creation writes an `OPEN` history event. The only permitted transitions are `OPEN → IN_PROGRESS → RESOLVED`; the status route runs in a transaction and writes the history entry alongside the complaint update. A resolved timestamp is recorded at resolution.

## Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and a strong `JWT_SECRET`.
2. Create the PostgreSQL database.
3. Run `npm install`, `npx prisma migrate dev --name init`, `npm run prisma:seed`, and `npm run dev`.
4. Visit `http://localhost:3000`.

## Demo credentials

- Admin: `admin@demo.com` / `DemoPass123!`
- Resident: `resident@demo.com` / `DemoPass123!`

## API

Auth: `POST /api/auth/register`, `/login`, `/logout`; `GET /api/auth/me`.
Complaints: `GET, POST /api/complaints`; `GET /api/complaints/:id`.
Admin: `GET /api/admin/dashboard`, `/api/admin/complaints`; `PATCH /api/admin/complaints/:id/status` and `/priority`.
Notices: `GET /api/notices`, admin `POST /api/admin/notices`, `PATCH, DELETE /api/admin/notices/:id`.

Validation errors use `{ error: { message, details? } }` with 4xx status codes.

## Deployment

Deploy to Vercel or any Node host with a managed PostgreSQL database. Configure `DATABASE_URL`, `JWT_SECRET`, `OVERDUE_THRESHOLD_DAYS`, plus optional SMTP variables. Images use `public/uploads` locally; for serverless production, replace the upload provider with Cloudinary/S3 using environment credentials.

## Design decisions and limitations

The local disk upload fallback keeps development fully functional and avoids image blobs in PostgreSQL. SMTP is optional and logs safe fallback messages if disabled. Dashboard uses accessible summary/category reporting; a chart library can be layered on without changing the API. Admin notice management endpoints are implemented; the initial UI focuses on dashboard/read notice workflows.
