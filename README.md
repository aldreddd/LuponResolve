# LuponResolve

### Barangay Dispute Resolution and Case Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-46B37B)](https://luponresolve.onrender.com/)
[![Database](https://img.shields.io/badge/Database-Neon%20PostgreSQL-00E699)](https://neon.tech/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933)](https://nodejs.org/)

**LuponResolve** is a web-based Barangay Dispute Resolution and Case Management System designed to support the Katarungang Pambarangay process.

The system aims to improve complaint intake, preliminary jurisdiction screening, case monitoring, and the administrative management of barangay dispute-resolution proceedings.

It provides separate portals for residents, barangay secretaries, and Lupon members, with role-based access to relevant case information and workflows.

**Live Application:** https://luponresolve.onrender.com/

---

## Table of Contents

- [Project Overview](#project-overview)
- [Current Project Status](#current-project-status)
- [Implemented Features](#implemented-features)
- [User Roles](#user-roles)
- [Case Management Workflow](#case-management-workflow)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Local Installation](#local-installation)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Deployment](#deployment)
- [Git Workflow](#git-workflow)
- [Security and Data Considerations](#security-and-data-considerations)
- [Future Improvements](#future-improvements)
- [Project Team](#project-team)

---

## Project Overview

Traditional barangay dispute-resolution processes often depend on physical records, manual complaint screening, and in-person inquiries regarding case progress.

LuponResolve aims to provide a centralized digital platform where residents can submit complaints and authorized barangay personnel can review, organize, and manage case records.

The project focuses on improving administrative organization, accessibility, and visibility throughout the dispute-resolution process.

The system is developed as an academic software engineering project and is currently deployed as a working prototype.

## Current Project Status

**Status: Deployed Working Prototype**

The application is publicly accessible and uses a hosted Express backend connected to a Neon PostgreSQL database.

| Component | Current Status |
|---|---|
| Frontend | Implemented |
| Express backend | Running |
| User authentication | Implemented |
| Role-based access | Implemented |
| Resident portal | Implemented |
| Secretary portal | Implemented |
| Lupon portal | Implemented |
| Complaint submission | Implemented |
| Preliminary jurisdiction screening | Implemented |
| Case management | Implemented |
| Case assignment | Implemented |
| Proceedings and resolution management | Implemented |
| PostgreSQL integration | Implemented |
| GitHub repository | Connected |
| Render deployment | Live |

## Implemented Features

### 1. User Authentication

- User registration and login.
- Password hashing using bcrypt.
- Session-based authentication.
- Logout functionality.
- Role-based access restrictions.

### 2. Resident Portal

- Resident account access.
- Complaint submission.
- Preliminary complaint screening.
- View submitted cases.
- Monitor case statuses.

### 3. Preliminary Jurisdiction Screening

The complaint intake process includes preliminary screening based on relevant jurisdictional considerations under Section 408 of the Local Government Code of 1991 (Republic Act No. 7160).

The screening considers information such as:

- Whether the parties reside in the same city or municipality.
- Whether a government party is involved.
- Whether a public officer is involved in relation to official functions.
- Criminal offense classification and applicable penalty.
- Real property location.
- Applicable exceptions and party agreements.

The screening provides preliminary indicators to assist barangay personnel. It does not replace the legal assessment or decision of authorized officials.

### 4. Secretary Portal

- View submitted complaints.
- Review case information.
- Update case review statuses.
- Manage case progression.
- Assign cases to Lupon members.
- Record proceedings.
- Manage case resolution and closure information.

### 5. Lupon Portal

- View assigned cases.
- Access case workflow information.
- Review case proceedings.
- Record relevant proceedings.
- Monitor case progression and completion.

### 6. Case Management Workflow

The backend enforces defined case-stage transitions to prevent invalid workflow updates.

The system supports the following general stages:

- Secretary Review
- For Lupon Assessment
- Mediation
- Conciliation
- Arbitration
- Resolved
- Certificate to File Action
- Closed

Resolution and closure are handled through dedicated operations rather than unrestricted workflow status changes.

---

## User Roles

| Role | Main Responsibilities |
|---|---|
| Resident | Submit complaints and monitor submitted cases |
| Secretary | Review complaints, manage case records, assign Lupon members, and oversee case administration |
| Lupon Member | Access assigned cases and manage proceedings |
| Admin | Administrative access to authorized system functions |

Access to protected resources is controlled by backend authentication and authorization checks.

## Case Management Workflow

The application supports a structured case-management process.

```text
Resident submits complaint
          |
          v
Preliminary jurisdiction screening
          |
          v
Secretary reviews complaint
          |
          v
For Lupon Assessment
          |
          v
Case assigned to Lupon member
          |
          v
Mediation / Conciliation
          |
          v
Arbitration (when applicable)
          |
          v
Resolved / Certificate to File Action
          |
          v
Closed
```

The actual case progression depends on applicable procedures and the system's permitted workflow transitions.

---

## Technology Stack

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express.js
- REST API architecture
- Express Session
- bcryptjs

### Database

- PostgreSQL
- Neon PostgreSQL
- node-postgres (`pg`)
- connect-pg-simple for PostgreSQL-backed sessions

### Development Tools

- Visual Studio Code
- Git
- GitHub
- PowerShell
- Node.js and npm

### Hosting and Deployment

- GitHub – Source code repository
- Render – Web application hosting
- Neon – Managed PostgreSQL database

---

## System Architecture

LuponResolve uses a client-server architecture.

```text
             USER
              |
              v
       HTML / CSS / JS
              |
              v
       EXPRESS BACKEND
              |
       +------+------+
       |             |
       v             v
 Authentication   Case Management
       |             |
       +------+------+
              |
              v
       NEON POSTGRESQL
              |
              v
       Persistent Storage
```

### Production Architecture

| Service | Responsibility |
|---|---|
| GitHub | Stores and versions application source code |
| Render | Hosts the frontend and Express backend |
| Neon | Stores users, cases, assignments, and sessions |

The Express application serves the frontend pages and API endpoints from the same deployed service.

---

## Project Structure

```text
LuponResolve/
│
├── index.html
├── auth.html
├── resident.html
├── secretary.html
├── lupon.html
├── workflow.html
│
├── css/
│   ├── style.css
│   └── ...
│
├── js/
│   ├── config.js
│   ├── auth.js
│   ├── auth-guard.js
│   ├── resident.js
│   ├── secretary.js
│   ├── lupon.js
│   └── workflow.js
│
├── backend/
│   ├── config/
│   │   ├── postgres.js
│   │   └── postgresSchema.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── roleRoutes.js
│   │   └── caseRoutes.js
│   │
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env
│
├── .gitignore
└── README.md
```

*Note: Some local migration and diagnostic scripts may also exist in the backend directory.*

---

## Local Installation

### Prerequisites

Install the following:

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [Visual Studio Code](https://code.visualstudio.com/)
- A configured PostgreSQL database, such as [Neon](https://neon.tech/)

### 1. Clone the Repository

```bash
git clone https://github.com/aldreddd/LuponResolve.git
```

### 2. Navigate to the Project

```bash
cd LuponResolve
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the `backend/` directory.

Add the required environment variables. See the [Environment Variables](#environment-variables) section.

### 5. Start the Development Server

```bash
npm run dev
```

The backend should run at:

```text
http://localhost:3000
```

### 6. Open the Application

Visit:

```text
http://localhost:3000/
```

The Express server serves the frontend pages and static assets.

---

## Environment Variables

The backend requires environment variables for database connectivity and session security.

Example configuration:

```env
DATABASE_URL_POOLED=your_neon_pooled_connection_string
SESSION_SECRET=your_generated_session_secret
NODE_ENV=development
```

For local development, the backend defaults to the Live Server origin `http://127.0.0.1:5500` if `CLIENT_URL` is not configured.

**Important:**

- Never commit `.env` files.
- Never publish database passwords or session secrets.
- Use separate environment configurations for development and production.
- Configure production environment variables privately through Render.

---

## Database

LuponResolve currently uses **Neon PostgreSQL** as its production database.

The database stores:

- User accounts and authentication information.
- Complaint and case records.
- Case assignments.
- Case workflow information.
- Resolution and closure information.
- Application sessions.

### Database Migration

The application was initially developed using SQLite and later migrated to PostgreSQL to support hosted deployment.

The migration preserved existing user and case records.

SQLite backup files are retained separately from the production database.

**Important:** The original SQLite migration script is intended for the migration process. It should not be rerun against an already populated production database.

---

## Deployment

LuponResolve is deployed through Render and connected to GitHub.

### Live Application

https://luponresolve.onrender.com/

### Deployment Configuration

| Setting | Value |
|---|---|
| Hosting | Render Web Service |
| Repository | `aldreddd/LuponResolve` |
| Branch | `main` |
| Root Directory | Repository root |
| Build Command | `cd backend && npm install` |
| Start Command | `cd backend && npm start` |
| Database | Neon PostgreSQL |

### Production Environment Variables

Configure these in the Render service environment:

```text
DATABASE_URL_POOLED
SESSION_SECRET
NODE_ENV=production
```

Render automatically provides the production port through the `PORT` environment variable.

### Automatic Deployment

When changes are pushed to the connected GitHub branch, Render can automatically build and deploy the latest committed version.

---

## Git Workflow

The project uses Git and GitHub for source control.

### Check Current Changes

```bash
git status
```

### Stage Changes

```bash
git add .
```

### Commit Changes

```bash
git commit -m "Describe your changes"
```

### Push to GitHub

```bash
git push origin main
```

After pushing, Render automatically deploys the latest changes when automatic deployment is enabled.

### View Commit History

```bash
git log --oneline
```

---

## Security and Data Considerations

LuponResolve handles information related to complaints, users, and dispute-resolution proceedings.

Security considerations include:

- Password hashing.
- Session-based authentication.
- Role-based authorization.
- Parameterized PostgreSQL queries.
- Environment-based secret management.
- Restricted access to protected API routes.

The application is an academic prototype and should not be treated as a fully certified production government information system.

Before use with actual residents, additional security testing, privacy assessment, access controls, backups, and operational safeguards are necessary.

Use synthetic records when demonstrating the publicly accessible prototype.

---

## Future Improvements

Potential improvements include:

- Homepage redesign and content refinement.
- Email notifications for hearing schedules and case updates.
- Hearing scheduling and deadline monitoring.
- Evidence and document management.
- Improved case history and audit logging.
- More comprehensive automated testing.
- Additional security and privacy controls.
- Improved accessibility and responsive design.

These items should be considered planned enhancements unless explicitly implemented in a later version.

---

## Project Team

**LuponResolve Development Team**

- Jerimie Bual
- Nathaniel Mandin
- Aldred Tampos

**Academic Context:** CSC 106 – Software Engineering 1

---

## License

This project is developed for academic and educational purposes.

License and distribution terms have not yet been formally specified.
