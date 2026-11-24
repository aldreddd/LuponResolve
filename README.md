# LuponResolve

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-46B37B?style=flat)](https://luponresolve.onrender.com/)
[![Database](https://img.shields.io/badge/Database-Neon%20PostgreSQL-00E699?style=flat)](https://neon.tech/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?style=flat)](https://nodejs.org/)
[![Frontend](https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JavaScript-E34F26?style=flat)](https://developer.mozilla.org/)
[![Evidence Storage](https://img.shields.io/badge/Evidence%20Storage-Supabase-3ECF8E?style=flat)](https://supabase.com/)
[![Email Notifications](https://img.shields.io/badge/Email-Gmail%20API%20%7C%20OAuth-EA4335?style=flat)](https://developers.google.com/gmail/api)
[![Deployment](https://img.shields.io/badge/Deployment-Render-46E3B7?style=flat)](https://render.com/)
[![Version Control](https://img.shields.io/badge/Version%20Control-GitHub-181717?style=flat)](https://github.com/aldreddd/LuponResolve)

### Barangay Dispute Resolution and Case Management System

LuponResolve is a web-based Barangay Dispute Resolution and Case Management System designed to support the digital handling of community complaints and dispute-resolution proceedings.

The system provides a centralized platform for public complaint submission, preliminary jurisdiction screening, case tracking, staff administration, case assignment, proceeding documentation, evidence management, and hearing notifications.

It is designed to support the administrative workflow of the Barangay Justice System (Katarungang Pambarangay), while keeping authorized barangay personnel responsible for reviewing complaints and making official decisions.

**Live Application:** https://luponresolve.onrender.com/

**Repository:** https://github.com/aldreddd/LuponResolve

---

## Table of Contents

- [Project Overview](#project-overview)
- [Objectives](#objectives)
- [Key Features](#key-features)
- [System Portals](#system-portals)
- [Case Management Workflow](#case-management-workflow)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Database and File Storage](#database-and-file-storage)
- [Security and Access Control](#security-and-access-control)
- [Project Structure](#project-structure)
- [Installation and Setup](#installation-and-setup)
- [Environment Configuration](#environment-configuration)
- [Deployment](#deployment)
- [Current Limitations](#current-limitations)
- [Future Improvements](#future-improvements)
- [Legal Disclaimer](#legal-disclaimer)

---

## Project Overview

Traditional barangay dispute-resolution processes involve receiving complaints, reviewing submitted information, coordinating with involved parties, scheduling proceedings, and documenting case outcomes.

LuponResolve aims to organize these activities through a centralized digital platform.

The system supports three primary staff roles:

- **Administrator** – manages staff accounts and oversees system-wide case information.
- **Barangay Secretary** – reviews complaints, evaluates preliminary screening results, manages administrative case statuses, and assigns cases to Lupon members.
- **Lupon Member** – handles assigned cases, records proceedings, and documents dispute-resolution outcomes.

Residents can submit complaints without creating an account and subsequently track their complaint using a case number and private tracking code.

## Objectives

1. Digitize the complaint submission process.
2. Provide preliminary screening based on relevant provisions of the Local Government Code of 1991 (Republic Act No. 7160).
3. Provide secure public case tracking.
4. Centralize complaint records and supporting evidence.
5. Organize case assignments and dispute-resolution proceedings.
6. Support hearing scheduling and email notifications.
7. Provide administrative oversight and staff account management.
8. Improve the organization and accessibility of barangay case records.

---

## Key Features

### 1. Public Complaint Submission

Residents can submit complaints through a public online form without registering or logging in.

The complaint form collects:

- Complainant information.
- Respondent information.
- Dispute classification.
- Incident details.
- Preliminary screening answers.
- Optional supporting evidence.

After successful submission, the system generates:

- A unique case number (e.g., `LR-00001`).
- A private tracking code.

The tracking code is displayed to the resident upon successful submission. The system stores its SHA-256 hash rather than the original plaintext code.

### 2. Preliminary Complaint Screening

The system performs automated preliminary screening based on selected jurisdiction-related questions.

Screening considerations include:

- Whether the parties reside in the same city or municipality.
- Government parties.
- Public officials acting in their official capacity.
- Criminal offenses and applicable penalty thresholds.
- Private offended parties.
- Real-property disputes involving different cities or municipalities.
- Adjoining barangays or municipalities.
- Agreement between parties where applicable.
- Other statutory exceptions.

Possible screening results:

- Potentially Eligible for KP Review.
- Requires Barangay Staff Review.
- Potentially Outside KP Jurisdiction.

The screening result provides administrative guidance and does not constitute an official legal determination.

### 3. Public Case Tracking

Residents can monitor complaint progress through the public tracking page.

Tracking requires:

- Case number.
- Private tracking code.

The system verifies the supplied tracking code against its stored hash before returning limited case-progress information.

Sensitive information, including incident details and private party information, is not exposed through the public tracking response.

### 4. Evidence Uploads and Management

Residents can attach supporting documents and images when submitting complaints.

Evidence upload specifications:

| Specification | Limit |
|---|---|
| Maximum attachments | 5 files per complaint |
| Maximum file size | 5 MB per file |
| Accepted formats | JPG, JPEG, PNG, PDF |
| File storage | Supabase Storage |
| Metadata storage | Neon PostgreSQL |
| Bucket visibility | Private |

Implemented evidence functionality includes:

- File selection and frontend validation.
- Backend upload validation.
- File signature verification.
- Randomized storage object names.
- Private file storage.
- Evidence metadata linked to complaint records.
- Signed URLs for authorized evidence viewing.
- Cleanup of uploaded objects when complaint submission fails.

Authorized Secretaries and Administrators can view case evidence. Lupon members can access evidence only for cases assigned to them.

Guest residents cannot access private evidence using only their tracking credentials.

### 5. Secretary Portal

The Secretary Portal provides tools for administrative complaint management.

Features include:

- Dashboard statistics.
- Complaint listing.
- Complaint search and filtering.
- Detailed complaint information.
- Preliminary screening results and answers.
- Administrative review.
- Secretary review notes.
- Case assignment to registered Lupon members.
- Supporting evidence viewing.
- Case workflow access.

Available administrative statuses:

- Pending Review.
- Under Review.
- Awaiting Clarification.
- Ready for Lupon Assessment.

### 6. Lupon Member Portal

The Lupon Portal provides Lupon members with access to their assigned complaints.

Features include:

- Assigned case listing.
- Case search.
- Case details.
- Supporting evidence viewing.
- Proceeding documentation.
- Proceeding history.
- Case-stage information.
- Completion status indicators.

Lupon members can record proceedings with information such as:

- Proceeding type.
- Meeting date.
- Attendees.
- Proceeding outcome.
- Discussion summary.
- Next action.

The system also checks whether arbitration is applicable before allowing an arbitration proceeding to be recorded.

### 7. Case Workflow Management

LuponResolve supports the administrative progression of complaints through different case stages.

The workflow includes:

- Secretary Review.
- For Lupon Assessment.
- Mediation.
- Conciliation.
- Arbitration.
- Resolved.
- Certificate to File Action.
- Closed.

Dedicated resolution and closure operations are used rather than allowing the ordinary workflow form to directly set final statuses.

### 8. Hearing Scheduling and Email Notifications

The system includes hearing scheduling and rescheduling functionality.

Implemented capabilities include:

- Hearing scheduling.
- Hearing rescheduling.
- Hearing-related backend routes.
- Email notification integration.
- Gmail OAuth authentication.

The email integration supports sending hearing-related notifications to involved parties.

### 9. Administrator Portal

The Administrator Portal provides centralized staff and case oversight.

**Dashboard and statistics**

- Total cases.
- Pending cases.
- Active proceedings.
- Resolved and closed cases.
- Secretary account count.
- Lupon member account count.
- Recent complaint activity.

**Staff management**

- Create Secretary accounts.
- Create Lupon accounts.
- Edit staff account information.
- Reset staff passwords.
- View registered staff accounts.

**Case oversight**

- View case records across the system.
- Search by case number and party names.
- Filter by administrative status.
- Filter by case stage.
- Paginate case records.

Case oversight supports a maximum of 50 records per page.

---

## System Portals

| Portal | Access | Primary Responsibility |
|---|---|---|
| Public Complaint Portal | Public | Submit complaints and evidence |
| Public Tracking Portal | Public | Track complaint progress |
| Secretary Portal | Secretary / Admin | Review and manage complaints |
| Lupon Portal | Assigned Lupon / Admin | Handle assigned proceedings |
| Administrator Portal | Admin | Manage staff and oversee cases |

Resident registration and resident login are disabled. Public complaint submission and private case tracking do not require resident accounts.

---

## Case Management Workflow

The general process follows this sequence:

```text
Resident
   |
   v
Submit Online Complaint
   |
   v
Preliminary Complaint Screening
   |
   v
Generate Case Number and Tracking Code
   |
   v
Save Complaint in PostgreSQL
   |
   v
Upload Supporting Evidence (Optional)
   |
   v
Secretary Review
   |
   v
Administrative Assessment
   |
   v
Assign to Lupon Member
   |
   v
Mediation / Conciliation
   |
   v
Arbitration (When Applicable)
   |
   v
Resolution or Certificate to File Action
   |
   v
Case Closure
```

Residents can monitor available case-progress information through the public tracking portal.

---

## Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| HTML5 | Page structure |
| CSS3 | Styling and responsive layouts |
| JavaScript | Client-side functionality and API communication |

The frontend uses vanilla JavaScript without requiring a frontend framework.

### Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend server and REST API |
| PostgreSQL | Relational database |
| bcrypt | Password hashing |
| express-session | Session-based authentication |
| Multer | Multipart file uploads |
| file-type | File signature verification |
| express-rate-limit | Request rate limiting |
| Supabase JavaScript SDK | Cloud file storage integration |

### Database and Cloud Services

| Service | Purpose |
|---|---|
| Neon PostgreSQL | Database hosting |
| Supabase Storage | Private evidence storage |
| Render | Web application hosting |
| Gmail API | Hearing email notifications |
| GitHub | Source code management |

---

## System Architecture

LuponResolve follows a client-server architecture.

```text
                   USERS
                     |
          +----------+----------+
          |                     |
          v                     v
    Public Portals         Staff Portals
          |                     |
          +----------+----------+
                     |
                     v
             HTML / CSS / JS
                     |
                     v
              Express.js API
                     |
          +----------+----------+
          |                     |
          v                     v
    Neon PostgreSQL       Supabase Storage
          |                     |
          |                     |
          v                     v
    Case and User         Evidence Files
    Records               (Private Bucket)
                     |
                     v
              Gmail API
          Hearing Notifications
```

The frontend communicates with the backend through HTTP requests.

The Express server handles authentication, authorization, validation, case operations, database transactions, file uploads, and signed URL generation.

---

## Database and File Storage

### Neon PostgreSQL

Neon PostgreSQL stores the application's structured information.

The database includes tables for:

- `users` – staff accounts and authentication information.
- `cases` – complaint records and case information.
- `case_assignments` – Lupon member assignments.
- `case_evidence` – evidence metadata and storage references.
- `audit_logs` – audit-related records.

The application also maintains case workflow, proceeding, hearing, resolution, and closure information through its database schema and related operations.

### Supabase Storage

Supabase Storage is used for supporting evidence files.

The application uses a private storage bucket. Evidence metadata is maintained separately in PostgreSQL.

Files are referenced through randomized storage keys, and authorized users receive temporary signed URLs when requesting evidence.

The application does not store uploaded file binaries directly in PostgreSQL.

---

## Security and Access Control

Security measures implemented in the application include:

- Session-based staff authentication.
- Role-based authorization.
- Password hashing using bcrypt.
- Private case evidence storage.
- Temporary signed URLs for evidence access.
- Tracking code hashing.
- Rate limiting for public complaint submission and tracking.
- Server-side input validation.
- File size and file count restrictions.
- File signature verification.
- Parameterized PostgreSQL queries.
- Case assignment checks for Lupon evidence access.
- Database transactions for complaint submission and evidence metadata operations.

### Access Control

| Operation | Public | Secretary | Lupon | Admin |
|---|---:|---:|---:|---:|
| Submit complaint | Yes | Yes, if permitted | Yes, if permitted | Yes |
| Track complaint | With tracking credentials | Yes | Yes | Yes |
| View all cases | No | Yes | No | Yes |
| View assigned cases | No | No | Yes | Yes |
| Assign Lupon members | No | Yes | No | Yes |
| View case evidence | No | Yes | Assigned cases only | Yes |
| Manage staff accounts | No | No | No | Yes |
| Administrative case oversight | No | Yes, within role permissions | No | Yes |

Public tracking exposes only limited progress information. Private staff operations require authenticated sessions and appropriate permissions.

---

## Project Structure

```text
LuponResolve/
│
├── index.html
├── guest-complaint.html
├── track-case.html
├── login.html
│
├── resident.html
├── secretary.html
├── lupon.html
├── workflow.html
├── admin.html
│
├── css/
│   ├── style.css
│   ├── secretary.css
│   ├── lupon.css
│   └── admin.css
│
├── js/
│   ├── config.js
│   ├── auth.js
│   ├── auth-guard.js
│   ├── guest-complaint.js
│   ├── track-case.js
│   ├── secretary.js
│   ├── lupon.js
│   └── admin.js
│
├── backend/
│   ├── config/
│   │   ├── postgres.js
│   │   ├── postgresSchema.js
│   │   └── supabase.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── evidenceUpload.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── caseRoutes.js
│   │   ├── roleRoutes.js
│   │   └── adminRoutes.js
│   │
│   ├── utils/
│   │   └── complaintScreening.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── .gitignore
└── README.md
```

*Note: This is a representative structure of the main project files. Additional route, configuration, stylesheet, and utility files may exist in the repository.*

---

## Installation and Setup

### Prerequisites

Install the following before running the project locally:

- Node.js and npm.
- Git.
- Visual Studio Code or another code editor.
- A Neon PostgreSQL database.
- A Supabase project with a private Storage bucket.
- A Gmail OAuth configuration if testing hearing email notifications.

### 1. Clone the Repository

```bash
git clone https://github.com/aldreddd/LuponResolve.git
```

Navigate to the project:

```bash
cd LuponResolve
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` directory.

Configure the database connection, session configuration, Supabase credentials, and any other integration credentials required by the backend.

See [Environment Configuration](#environment-configuration).

### 4. Start the Backend Server

From the `backend` directory:

```bash
npm run dev
```

The local backend server runs at:

```text
http://localhost:3000
```

### 5. Start the Frontend

Open the project folder in Visual Studio Code.

Use the Live Server extension to serve the frontend.

Make sure the frontend development origin matches the backend CORS configuration.

For example:

```text
http://127.0.0.1:5501
```

### 6. Open the Application

Visit the local frontend URL provided by Live Server.

The frontend communicates with the local Express backend through the API configuration in:

```text
js/config.js
```

---

## Environment Configuration

The backend requires environment variables for database connectivity, session management, and external integrations.

### Supabase Configuration

The following variables are required for evidence uploads and retrieval:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-supabase-secret-key
SUPABASE_BUCKET=your-private-bucket-name
```

### Other Backend Configuration

Configure the database connection, session secret, and any Gmail OAuth credentials according to the variable names used in the backend configuration files.

**Important:**

- Never commit `.env` files.
- Never expose Supabase secret keys in frontend JavaScript.
- Never publish database credentials or OAuth secrets.
- Configure production environment variables separately in Render.
- Use the same private bucket name in the backend configuration and Supabase project.

---

## Deployment

LuponResolve uses Render for backend hosting.

The application is connected to the GitHub repository:

https://github.com/aldreddd/LuponResolve

### Deployment Configuration

| Setting | Value |
|---|---|
| Hosting platform | Render |
| Repository | GitHub |
| Production branch | `main` |
| Build command | `cd backend && npm install` |
| Start command | `cd backend && npm start` |

### Production Environment

Render must have the required production environment variables configured separately from the local `.env` file.

This includes:

- Database connection settings.
- Session configuration.
- Supabase URL.
- Supabase secret key.
- Supabase private bucket name.
- Other integration credentials required by the application.

### Updating the Live Application

After making and testing changes locally:

```bash
git add .
git commit -m "Describe your changes"
git push origin main
```

Render can then deploy the latest commit from the configured production branch.

Always verify the deployment logs and test the production application after deployment.

---

## Current Limitations

LuponResolve is a functional academic prototype and is still undergoing development.

Known areas requiring additional work include:

- Comprehensive automated testing.
- Formal security and privacy assessment.
- CSRF protection and additional security-header hardening.
- More comprehensive audit logging and audit interfaces.
- Documented database backup and recovery procedures.
- Email delivery monitoring and confirmation.
- Accessibility testing and improvements.
- Production monitoring and error reporting.
- Formal operational procedures for barangay personnel.
- Legal and administrative validation before real-world adoption.

The availability of a feature in the application does not automatically establish that it has undergone comprehensive production security or operational testing.

---

## Future Improvements

Potential future enhancements include:

- Comprehensive automated unit and integration tests.
- Stronger audit trail and administrative activity reporting.
- Database backup and disaster recovery procedures.
- Improved accessibility and responsive design.
- More detailed hearing notification management.
- Email delivery status monitoring.
- Advanced case analytics and reporting.
- Improved document preview and evidence management.
- Additional security hardening.
- Formal deployment and maintenance documentation.

---

## Legal Disclaimer

LuponResolve is an academic and development prototype intended to support the organization and administration of barangay dispute-resolution activities.

Automated complaint screening is preliminary guidance only. It does not replace the legal judgment of authorized barangay officials or establish that a dispute is legally eligible for Katarungang Pambarangay proceedings.

All official decisions, legal determinations, and procedural actions must be reviewed and performed by authorized personnel in accordance with applicable Philippine laws, rules, and regulations, including Republic Act No. 7160.

---

## License

No open-source license has currently been specified for this project. All rights are reserved by the project owner unless a license is added.

---

**LuponResolve — Bringing Barangay Dispute Resolution into a More Organized Digital Workspace.**
