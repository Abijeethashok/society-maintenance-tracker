# System Design — Society Maintenance Tracker

## 1. Overview

Society Maintenance Tracker is a full-stack web application designed to digitize apartment maintenance complaint management. Residents can register, submit complaints with optional photo evidence, and track complaint progress. Administrators can manage complaints, priorities, statuses, overdue issues, and society notices.

The application is built using Next.js, TypeScript, Prisma, PostgreSQL, Cloudinary, and SendCoreX.

The system follows a layered architecture:

`Next.js UI → API Route Handlers → Validation/Services → Prisma ORM → PostgreSQL`

Cloudinary is used for image storage and SendCoreX is used for transactional email delivery.

## 2. Complaint History Model

Each complaint contains its current status, priority, category, description, resident, creation timestamp, and optional resolution timestamp.

The supported complaint lifecycle is:

`OPEN → IN_PROGRESS → RESOLVED`

Instead of overwriting previous status information, the system maintains a separate `ComplaintHistory` record for every lifecycle event. Each history record stores the complaint reference, status information, timestamp, administrator/actor, and optional note.

When a resident creates a complaint, an initial `OPEN` history entry is created. Whenever an administrator changes the complaint status, the complaint and its corresponding history entry are updated together in a database transaction.

This provides a complete and auditable timeline of the complaint. Residents can view the progress of their complaints, while administrators have a reliable record of actions performed on each complaint.

When a complaint reaches `RESOLVED`, a resolution timestamp is recorded and the complaint is considered closed.

## 3. Overdue Detection

Overdue detection is controlled using the configurable environment variable:

`OVERDUE_THRESHOLD_DAYS=3`

A complaint is considered overdue when it has not been resolved and the elapsed time since its creation exceeds the configured threshold.

The logic is conceptually:

`Current Time - Created Time > OVERDUE_THRESHOLD_DAYS`

Resolved complaints are never considered overdue.

The overdue state is calculated dynamically instead of being permanently stored as a database field. This prevents stale overdue values and allows administrators to change the threshold through configuration without modifying the application code.

Overdue complaints are surfaced prominently in the administrator dashboard so that unresolved issues requiring attention can be identified quickly.

## 4. Photo Handling

Residents can optionally attach photo evidence when creating a complaint.

The upload API validates that the requester is authenticated and that the uploaded file is an allowed image type with a maximum size of 5 MB.

Images are stored using Cloudinary rather than directly inside PostgreSQL or on the application server. After a successful upload, Cloudinary returns a secure image URL. The complaint stores this URL instead of storing the image binary data.

The workflow is:

`Resident selects image → Upload API → Authentication and validation → Cloudinary → Secure image URL → Complaint stores URL`

This keeps the database lightweight and makes the application suitable for serverless deployment, where relying on a local filesystem for persistent uploads is not appropriate.

## 5. Notification Flow

The application provides email notifications using the SendCoreX API.

### Complaint Status Notification

When an administrator changes a complaint's status, the API validates the request and updates the complaint and its history. After the database operation succeeds, an email notification is sent to the resident associated with the complaint.

The flow is:

`Admin changes status → API validation → Database transaction → Complaint and history updated → SendCoreX API → Resident receives email`

The email contains the complaint title, its new status, and any optional administrator note.

### Important Notice Notification

Administrators can mark notices as important. When an important notice is created, the system retrieves resident email addresses and sends the notice content through SendCoreX.

The flow is:

`Admin creates important notice → Notice stored in PostgreSQL → Resident emails retrieved → SendCoreX API → Residents receive notification`

Normal notices remain available on the notice board without triggering email notifications.

## 6. Security and Reliability

Authentication uses bcrypt-hashed passwords and HTTP-only JWT session cookies. API endpoints enforce role-based authorization for residents and administrators, while request payloads are validated using Zod.

Sensitive configuration such as database credentials, JWT secrets, Cloudinary credentials, SendCoreX API keys, and sender addresses are stored as environment variables and excluded from Git.

Overall, the architecture separates application logic, database persistence, image storage, and notification delivery. This makes the system maintainable, auditable, and suitable for deployment using Vercel with managed PostgreSQL.
