# Society Maintenance Tracker

A production-minded society maintenance and complaint tracking platform built with **Next.js, TypeScript, Prisma, and PostgreSQL**.

Residents can raise and track maintenance complaints, while administrators can manage complaints, priorities, statuses, overdue issues, notices, photos, and email notifications from a centralized dashboard.

## Features

* 🔐 **Authentication & Authorization**

  * Resident and Admin roles
  * bcrypt password hashing
  * JWT-based authentication
  * HTTP-only session cookies
  * Role-based API authorization

* 📝 **Complaint Management**

  * Residents can create complaints
  * Categories: Electrical, Plumbing, Cleaning, Maintenance, Lift, Water, Other
  * Low / Medium / High priority
  * Complaint descriptions and optional photo evidence
  * Residents can view their own complaints and history

* 👨‍💼 **Admin Dashboard**

  * View all complaints
  * Filter complaints by category, priority, and status
  * Dashboard statistics
  * Category-wise complaint counts
  * High-priority and overdue complaint visibility
  * Update complaint priority and status

* 🔄 **Complaint Lifecycle**

  * `OPEN → IN_PROGRESS → RESOLVED`
  * Every status change creates a history entry
  * Resolution timestamp is recorded
  * Complete status timeline for each complaint

* ⏰ **Overdue Detection**

  * Configurable using `OVERDUE_THRESHOLD_DAYS`
  * Unresolved complaints older than the configured threshold are automatically considered overdue

* 📢 **Notice Management**

  * Admins can create notices
  * Important notices can be marked separately
  * Residents can view notices
  * Admins can delete notices
  * Important notices trigger email notifications

* 📧 **Email Notifications**

  * SendCoreX API is used for transactional email delivery
  * Residents receive notifications when administrators update complaint status
  * Important notices can be emailed to residents

* 🖼️ **Image Upload**

  * Optional complaint photo evidence
  * Image type and 5 MB size validation
  * Cloudinary is used for production image storage

* ✅ **Validation & Error Handling**

  * Zod request validation
  * Consistent API error responses
  * Authentication and authorization checks

## Technology Stack

| Layer            | Technology                    |
| ---------------- | ----------------------------- |
| Frontend         | Next.js 15, React, TypeScript |
| Backend          | Next.js Route Handlers        |
| Database         | PostgreSQL                    |
| ORM              | Prisma                        |
| Validation       | Zod                           |
| Authentication   | JWT + HTTP-only cookies       |
| Password Hashing | bcrypt                        |
| Image Storage    | Cloudinary                    |
| Email            | SendCoreX API                 |
| Deployment       | Vercel                        |

## Architecture

```text
                    ┌──────────────────────┐
                    │      Next.js UI      │
                    │ Resident / Admin     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   API Route Handlers │
                    │ Authentication       │
                    │ Complaints            │
                    │ Notices               │
                    │ Uploads               │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │ Validation / Services│
                    │       Zod / TS       │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │        Prisma        │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │      PostgreSQL      │
                    └──────────────────────┘

       ┌─────────────────┐          ┌─────────────────┐
       │    Cloudinary   │          │    SendCoreX    │
       │ Complaint Photos│          │ Email Delivery  │
       └─────────────────┘          └─────────────────┘
```

## Database Design

The application uses four primary models:

* `User`
* `Complaint`
* `ComplaintHistory`
* `Notice`

A resident can create multiple complaints.

Each complaint can contain multiple immutable history entries, allowing the complete lifecycle of a complaint to be displayed.

## Complaint Lifecycle

A newly created complaint starts as:

```text
OPEN
  ↓
IN_PROGRESS
  ↓
RESOLVED
```

When a complaint is created, an `OPEN` history entry is recorded.

When an administrator changes the status, the complaint and corresponding history entry are updated together.

When the complaint becomes `RESOLVED`, the resolution timestamp is recorded.

## Overdue Logic

The overdue threshold is configurable through:

```env
OVERDUE_THRESHOLD_DAYS=3
```

A complaint is considered overdue when:

```text
Current Time - Complaint Creation Time
        >
OVERDUE_THRESHOLD_DAYS
```

and the complaint has not been resolved.

Resolved complaints are never marked overdue.

## Email Workflow

### Complaint Status Update

```text
Admin changes complaint status
          ↓
API validates request
          ↓
Database updates complaint
          ↓
History entry created
          ↓
SendCoreX sends notification
          ↓
Resident receives email
```

### Important Notice

```text
Admin creates important notice
          ↓
Notice saved to database
          ↓
All residents retrieved
          ↓
SendCoreX sends notification
          ↓
Residents receive email
```

## Image Upload Workflow

```text
Resident selects image
          ↓
Client sends multipart/form-data
          ↓
Upload API validates:
  - authenticated resident
  - image MIME type
  - maximum 5 MB
          ↓
Cloudinary upload
          ↓
Secure image URL returned
          ↓
Complaint stores photo URL
```

## API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Resident Complaints

```text
GET  /api/complaints
POST /api/complaints
GET  /api/complaints/:id
```

### Admin Complaints

```text
GET   /api/admin/complaints
PATCH /api/admin/complaints/:id/status
PATCH /api/admin/complaints/:id/priority
GET   /api/admin/dashboard
```

### Notices

```text
GET    /api/notices
POST   /api/admin/notices
DELETE /api/admin/notices/:id
```

### Upload

```text
POST /api/upload
```

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/Abijeethashok/society-maintenance-tracker.git
cd society-maintenance-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy:

```text
.env.example
```

to:

```text
.env
```

Configure the required environment variables:

```env
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-strong-secret"

OVERDUE_THRESHOLD_DAYS=3

CLOUDINARY_URL="your-cloudinary-url"

SENDCOREX_API_KEY="your-sendcorex-api-key"

EMAIL_FROM="your-verified-sender@example.com"
```

**Never commit `.env` or real credentials to GitHub.**

### 4. Run Prisma migrations

```bash
npx prisma migrate dev
```

### 5. Seed demo data

```bash
npm run prisma:seed
```

### 6. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Demo Credentials

The seeded demo credentials are:

```text
Admin
Email: admin@demo.com
Password: DemoPass123!

Resident
Email: resident@demo.com
Password: DemoPass123!
```

For production deployment, use new credentials and never expose real production passwords in documentation.

## Production Deployment

The application can be deployed using **Vercel** with a managed PostgreSQL database.

Production environment variables must be configured in the hosting provider:

```text
DATABASE_URL
JWT_SECRET
OVERDUE_THRESHOLD_DAYS
CLOUDINARY_URL
SENDCOREX_API_KEY
EMAIL_FROM
```

The production deployment should use:

* Managed PostgreSQL for persistent database storage
* Cloudinary for image storage
* SendCoreX for transactional email
* Vercel for Next.js hosting

## Testing

The project includes automated tests for the overdue calculation logic.

Run:

```bash
npm test
```

The application was also manually tested through the following workflows:

1. Resident registration
2. Login and logout
3. Complaint creation without photo
4. Complaint creation with photo
5. Admin complaint status update
6. Complaint status email notification
7. Important notice creation
8. Important notice email notification
9. Complaint filtering
10. Notice deletion

## Security Considerations

* Passwords are hashed using bcrypt.
* Authentication uses HTTP-only cookies.
* API routes enforce role-based authorization.
* Request bodies are validated using Zod.
* Uploaded images are restricted to image MIME types and 5 MB.
* Secrets are stored in environment variables.
* `.env` is excluded from Git using `.gitignore`.

## Design Decisions

### Prisma

Prisma provides type-safe database access and simplifies relational queries between users, complaints, histories, and notices.

### Complaint History

Complaint status changes are stored as separate history records instead of overwriting the previous state. This provides an auditable timeline.

### Cloudinary

Images are stored externally instead of on the application server, making the application suitable for serverless deployment.

### SendCoreX

Email delivery is handled by an external transactional email provider rather than directly from the application server.

### Configurable Overdue Threshold

The overdue threshold is controlled through an environment variable so administrators can change the business rule without modifying application code.

## Future Improvements

* Push notifications
* Pagination for large complaint lists
* Advanced analytics and charts
* Search functionality
* Resident profile management
* Email templates
* Automated complaint assignment
* SLA-based priority escalation
* Apartment/block-level access control
* Production monitoring and logging

## License

This project was developed as a placement assignment.
