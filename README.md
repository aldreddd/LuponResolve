# LuponResolve
### Barangay Dispute Resolution and Case Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-46B37B)](https://luponresolve.onrender.com/)
[![Database](https://img.shields.io/badge/Database-Neon%20PostgreSQL-00E699)](https://neon.tech/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933)](https://nodejs.org/)
[![Email](https://img.shields.io/badge/Email-Gmail%20API%20%7C%20OAuth-red)](https://developers.google.com/gmail/api)

**LuponResolve** is a web-based Barangay Dispute Resolution and Case Management System designed to support the Katarungang Pambarangay process.

The system aims to improve complaint intake, preliminary jurisdiction screening, case monitoring, hearing scheduling, and the administrative management of barangay dispute-resolution proceedings.

It provides separate portals for residents, barangay secretaries, and Lupon members, with role-based access to relevant case information and workflows.

The application uses a client-server architecture with a Node.js and Express backend, PostgreSQL database hosted on Neon, and Gmail integration for hearing-related email notifications.

**Live Application:** https://luponresolve.onrender.com/

---

## Table of Contents

- [Project Overview](#project-overview)
- [Current Project Status](#current-project-status)
- [Implemented Features](#implemented-features)
- [User Roles](#user-roles)
- [Case Management Workflow](#case-management-workflow)
- [Hearing Management and Notifications](#hearing-management-and-notifications)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Local Installation](#local-installation)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Gmail Integration](#gmail-integration)
- [Deployment](#deployment)
- [Git Workflow](#git-workflow)
- [Security and Data Considerations](#security-and-data-considerations)
- [Testing and Verification](#testing-and-verification)
- [Future Improvements](#future-improvements)
- [Project Team](#project-team)
- [Academic Context](#academic-context)
- [License](#license)

---

## Project Overview

Traditional barangay dispute-resolution processes often depend on physical records, manual complaint screening, and in-person inquiries regarding case progress.

LuponResolve aims to provide a centralized digital platform where residents can submit complaints and authorized barangay personnel can review, organize, monitor, and manage case records.

The system focuses on:

- Digitizing complaint submission and case records.
- Providing preliminary jurisdiction screening.
- Improving administrative case organization.
- Managing case assignments to Lupon members.
- Supporting structured dispute-resolution proceedings.
- Managing hearings and schedule changes.
- Sending email notifications regarding hearing schedules.
- Providing role-based access to relevant case information.
- Maintaining persistent records through a cloud-hosted database.

The project is developed as an academic software engineering project and is currently deployed as a working web application prototype.

---

## Current Project Status

**Status: Deployed and Functional Working Prototype**

LuponResolve is publicly accessible and deployed through Render. The backend is connected to a Neon PostgreSQL database, and the application includes authentication, role-based portals, case management, workflow enforcement, hearing management, and Gmail integration.

| Component | Status |
|---|---|
| Frontend | Implemented |
| Express backend | Implemented |
| REST API | Implemented |
| User authentication | Implemented |
| Password hashing | Implemented |
| Session-based authentication | Implemented |
| Role-based access control | Implemented |
| Resident portal | Implemented |
| Secretary portal | Implemented |
| Lupon portal | Implemented |
| Admin role support | Implemented |
| Complaint submission | Implemented |
| Preliminary jurisdiction screening | Implemented |
| Case management | Implemented |
| Case assignment | Implemented |
| Proceedings management | Implemented |
| Workflow validation | Implemented |
| Resolution management | Implemented |
| Case closure management | Implemented |
| Hearing scheduling | Implemented |
| Hearing rescheduling | Implemented |
| Hearing history | Implemented |
| Hearing email notifications | Implemented |
| Gmail OAuth integration | Implemented |
| Gmail connection status | Implemented |
| Test email functionality | Implemented |
| SQLite development database | Used during early development |
| PostgreSQL migration | Completed |
| Neon PostgreSQL production database | Implemented |
| PostgreSQL session persistence | Implemented |
| GitHub repository | Connected |
| Render deployment | Live |
| Production email sending test | Successfully tested |

The project is currently undergoing continued testing, refinement, and security improvement.

---

## Implemented Features

### 1. User Authentication and Authorization

LuponResolve implements authentication and access control to ensure that users can access the appropriate parts of the system.

Implemented capabilities:

- User registration.
- User login and logout.
- Password hashing using bcrypt.
- Session-based authentication using Express Session.
- Server-side session persistence.
- Authentication status verification.
- Role-based access control.
- Protected API routes.
- Access restrictions for unauthorized roles.

Authentication and authorization are enforced through backend middleware and role-specific access checks.

---

### 2. Resident Portal

The Resident Portal provides residents with an interface for submitting complaints and monitoring their submitted cases.

Implemented capabilities:

- Resident account registration and login.
- Resident dashboard.
- Complaint submission form.
- Preliminary complaint screening.
- View submitted cases.
- Monitor case statuses.
- View relevant case information.
- Access resident-specific case records.

Residents retain account-based access to their submitted cases.

---

### 3. Preliminary Jurisdiction Screening

The complaint intake process includes preliminary screening based on jurisdictional considerations under Section 408 of the Local Government Code of 1991 (Republic Act No. 7160).

The screening considers information such as:

- Whether the parties reside in the same city or municipality.
- Whether a government party is involved.
- Whether a public officer is involved in relation to official functions.
- Criminal offense classification and applicable penalty.
- Presence of a private offended party.
- Real property location.
- Applicable jurisdictional exceptions.
- Whether parties may agree to certain jurisdictional conditions.

The screening generates preliminary indicators to assist barangay personnel during complaint review.

Possible screening classifications include:

- Potentially Eligible for KP Review.
- Requires Barangay Staff Review.
- Potentially Outside KP Jurisdiction.

The screening is intended as an administrative aid and does not replace the legal assessment or decision of authorized barangay officials.

---

### 4. Secretary Portal

The Secretary Portal provides barangay secretaries with tools for administrative complaint review and case management.

Implemented capabilities:

- View submitted complaints.
- Access case information.
- Review complainant and respondent details.
- Examine preliminary screening results.
- Update case review statuses.
- Manage case progression.
- Assign cases to Lupon members.
- Record proceedings.
- Manage resolution information.
- Manage case closure.
- Access case workflow tools.
- Manage hearing schedules.

The secretary serves as the primary administrative role for processing and organizing cases within the system.

---

### 5. Lupon Portal

The Lupon Portal provides Lupon members with access to cases assigned to them.

Implemented capabilities:

- View assigned cases.
- Access relevant case details.
- Review case workflow information.
- Monitor assigned case progress.
- Record relevant proceedings.
- Manage proceeding information.
- Monitor case progression and completion.

Case visibility is restricted based on assignments and role authorization.

---

### 6. Case Management

The case management system provides structured storage and processing of barangay complaints.

Implemented capabilities:

- Create and store complaint records.
- Generate case numbers.
- Retrieve case records through API endpoints.
- Display case information based on user role.
- Manage case statuses.
- Assign cases to Lupon members.
- Track case progression.
- Store proceeding records.
- Manage case resolution.
- Manage closure information.

Case numbers follow the system's designated format:

`LR-00001`

Each case contains relevant complainant, respondent, dispute, incident, screening, workflow, assignment, and resolution information.

---

### 7. Case Workflow Enforcement

The backend enforces defined case-stage transitions to prevent invalid workflow updates.

Supported case stages include:

- Secretary Review
- For Lupon Assessment
- Mediation
- Conciliation
- Arbitration
- Resolved
- Certificate to File Action
- Closed

The system validates permitted transitions between stages instead of allowing unrestricted status changes.

Resolution and closure are handled through dedicated operations rather than unrestricted workflow updates.

This helps maintain consistency in case progression and reduces invalid administrative actions.

---

### 8. Case Assignment

The system includes case assignment functionality for distributing cases to Lupon members.

Implemented capabilities:

- Assign cases to authorized Lupon members.
- Store case assignments.
- Retrieve assigned cases.
- Restrict Lupon case visibility based on assignment.
- Support case assignment during administrative processing.

Assignments are stored in the database and used by the backend to determine case access.

---

### 9. Proceedings Management

LuponResolve supports the recording and management of proceedings throughout the dispute-resolution process.

Implemented capabilities:

- Record case proceedings.
- Associate proceedings with case records.
- Track proceedings by case stage.
- Manage proceeding information.
- Support mediation, conciliation, and arbitration stages.
- Monitor proceeding completion.

Proceeding records are associated with their respective cases for administrative reference and case tracking.

---

### 10. Resolution and Closure Management

The system provides dedicated functionality for managing case resolutions and closures.

Implemented capabilities:

- Record resolution details.
- Manage resolution status.
- Record Certificate to File Action outcomes.
- Manage case closure.
- Store resolution and closure information.
- Prevent unrestricted resolution and closure through ordinary workflow updates.

Cases can progress toward outcomes such as:

- Resolved
- Certificate to File Action
- Closed

The system separates workflow progression from resolution and closure operations to improve consistency and validation.

---

## Hearing Management and Notifications

### 11. Hearing Management

LuponResolve includes hearing management functionality for organizing dispute-resolution sessions.

Implemented capabilities:

- Schedule hearings for specific cases.
- Specify hearing date and time.
- Specify hearing venue.
- Add hearing notes.
- View scheduled hearings.
- Reschedule hearings.
- Maintain hearing-related history.
- Associate hearings with their respective case records.

The hearing management functionality supports coordination between administrative case processing and dispute-resolution proceedings.

### 12. Hearing Email Notifications

The system integrates email notifications into hearing management to communicate hearing-related information to concerned parties.

Implemented capabilities:

- Send email notifications for scheduled hearings.
- Send email notifications when hearings are rescheduled.
- Communicate hearing schedule changes.
- Notify involved parties through email.
- Integrate email notification functionality with hearing operations.

Email notifications are intended to help keep complainants and respondents informed of hearing-related changes.

### 13. Hearing History and Tracking

Hearing-related records are maintained to support scheduling and administrative tracking.

Implemented capabilities include:

- Store hearing schedule information.
- Record hearing-related changes.
- Maintain hearing history.
- Associate hearing history with case records.
- Track scheduled hearing information.

This allows authorized users to review hearing information and related scheduling history.

---

## User Roles

LuponResolve supports role-based access to system functions.

| Role | Main Responsibilities |
|---|---|
| Resident | Submit complaints and monitor submitted cases |
| Secretary | Review complaints, manage case records, assign Lupon members, manage hearings, and oversee case administration |
| Lupon Member | Access assigned cases and manage proceedings |
| Admin | Administrative access to authorized system functions and system integrations |

Access to protected resources is controlled through backend authentication and authorization checks.

---

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

The actual case progression depends on applicable procedures, case circumstances, and the system's permitted workflow transitions.

---

## Hearing Notification Flow

The hearing management and email integration process generally follows this flow:

```text
Authorized user schedules or updates a hearing
                  |
                  v
        Hearing record is processed
                  |
                  v
       Hearing information is stored
                  |
                  v
      Email notification is triggered
                  |
                  v
       Gmail API sends notification
                  |
                  v
 Complainant / Respondent receives email
```

For rescheduled hearings, the system processes the updated schedule and sends the corresponding notification.

Email delivery depends on valid recipient email addresses, Gmail authorization, and successful API processing.

---

## Technology Stack

### Frontend

- HTML5
- CSS3
- JavaScript (Vanilla JavaScript)
- Responsive interface design
- Role-specific portals
- Light and dark theme support for portal interfaces

### Backend

- Node.js
- Express.js
- REST API architecture
- Express Session
- bcryptjs
- Middleware-based authentication and authorization

### Database

- PostgreSQL
- Neon PostgreSQL
- node-postgres (`pg`)
- `connect-pg-simple`
- PostgreSQL-backed session persistence

### Email Integration

- Gmail API
- Google OAuth 2.0
- `googleapis`
- OAuth authorization and refresh token handling
- AES-256-GCM token encryption
- Automated hearing email notifications

### Development Tools

- Visual Studio Code
- Git
- GitHub
- PowerShell
- Node.js
- npm
- Browser Developer Tools

### Hosting and Deployment

- GitHub — Source code repository
- Render — Application hosting and deployment
- Neon — Managed PostgreSQL database
- Google Cloud — OAuth application configuration

---

## System Architecture

LuponResolve follows a client-server architecture with a frontend, Express backend, and PostgreSQL database.

### Application Architecture

```text
                  USERS
                    |
                    v
          WEB APPLICATION FRONTEND
           HTML / CSS / JavaScript
                    |
                    v
           NODE.JS / EXPRESS SERVER
                    |
        +-----------+------------+
        |           |            |
        v           v            v
 Authentication  Case Mgmt   Hearing Mgmt
 & Authorization & Workflow   & Notifications
        |           |            |
        +-----------+------------+
                    |
          +---------+----------+
          |                    |
          v                    v
    NEON POSTGRESQL        GMAIL API
    Persistent Data       Email Delivery
          |                    |
          v                    v
  Users, Cases, Sessions   Hearing Emails
  Assignments, Hearings
  History, Proceedings
```

### Production Architecture

| Service | Responsibility |
|---|---|
| GitHub | Stores and versions application source code |
| Render | Hosts the frontend and Express backend |
| Neon | Managed PostgreSQL database |
| Google OAuth | Authorizes Gmail access |
| Gmail API | Sends hearing-related email notifications |

The Express application serves the frontend pages and static assets from the same deployed service.

---

## Project Structure

The following represents the primary application structure. Additional configuration, database, utility, and migration scripts may also exist.

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
│   ├── auth.css
│   ├── resident.css
│   ├── secretary.css
│   ├── lupon.css
│   └── workflow.css
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
│   │   ├── caseRoutes.js
│   │   └── ...
│   │
│   ├── services/
│   │   └── gmailService.js
│   │
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env
│
├── .gitignore
└── README.md
```

*Note: The actual project structure may contain additional files, folders, migration scripts, diagnostic utilities, middleware, and services not shown above.*

---

## Local Installation

### Prerequisites

Install the following tools:

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

The development backend should run at:

```text
http://localhost:3000
```

### 6. Open the Application

Visit:

```text
http://localhost:3000/
```

The Express server serves the frontend pages and static assets.

If using Live Server during frontend development, the frontend may also be accessed through:

```text
http://127.0.0.1:5500
```

The backend CORS configuration must allow the selected frontend origin.

---

## Environment Variables

LuponResolve uses environment variables for database connectivity, session security, deployment configuration, and Gmail integration.

### Core Configuration

Example:

```env
DATABASE_URL_POOLED=your_neon_pooled_connection_string
SESSION_SECRET=your_generated_session_secret
NODE_ENV=development
```

### Gmail Integration Configuration

```env
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GMAIL_REDIRECT_URI=http://127.0.0.1:3000/api/gmail/callback
GMAIL_TOKEN_ENCRYPTION_KEY=your_64_character_hex_key
```

### Email Testing Configuration

```env
EMAIL_TEST_MODE=false
EMAIL_TEST_RECIPIENT=your_test_email_address
```

The email testing variables are used to control email testing behavior during development and testing.

### Production Configuration

Production environment variables are configured privately through Render's environment settings.

The production Gmail redirect URI is:

```text
https://luponresolve.onrender.com/api/gmail/callback
```

**Security requirements:**

- Never commit `.env` files.
- Never expose OAuth client secrets, database credentials, session secrets, or token encryption keys.
- Keep development and production environment configurations separate.
- Store production credentials within the hosting provider's secure environment configuration.
- Use the appropriate redirect URI for the environment being used.

---

## Database

LuponResolve uses **Neon PostgreSQL** as its production database.

### Database Information

| Property | Value |
|---|---|
| Database Engine | PostgreSQL |
| Provider | Neon |
| Database Access | Node.js through `pg` |
| Connection | Environment-configured PostgreSQL connection string |
| Session Storage | PostgreSQL-backed sessions |
| Deployment Environment | Cloud-hosted |

### Stored Data

The database stores application information including:

- User accounts.
- Authentication information.
- Complaint and case records.
- Case assignments.
- Case workflow information.
- Proceedings.
- Resolution and closure information.
- Hearing schedules.
- Hearing history.
- Hearing confirmations.
- Hearing notification records.
- Gmail integration records.
- Application sessions.

### Database Migration

The application was initially developed using SQLite during early development and was subsequently migrated to PostgreSQL for production deployment.

The migration involved adapting database connectivity, query handling, schema initialization, and session storage to support PostgreSQL.

### Database Management

- PostgreSQL database hosted through Neon.
- Database connectivity using `pg`.
- Connection pooling through the configured PostgreSQL connection string.
- Environment-based database configuration.
- PostgreSQL-backed session persistence.
- Database schema initialization.
- Persistent cloud database storage.

Database resets, migrations, and schema changes should be performed carefully to avoid accidental loss of production data.

---

## Gmail Integration

LuponResolve integrates the Gmail API to send hearing-related email notifications.

### Authentication

The Gmail integration uses Google OAuth 2.0 to authorize an administrator's Gmail account.

The administrator authorizes the application to send email using the connected Gmail account.

### Implemented Capabilities

- Gmail account connection through OAuth.
- OAuth authorization redirect.
- OAuth callback handling.
- Gmail connection status checking.
- Administrator-authorized email sending.
- Test email sending.
- Gmail disconnection.
- Token storage.
- OAuth token encryption.
- Hearing-related email notifications.

### OAuth Security

The system uses environment-based OAuth credentials and encrypted token storage.

OAuth tokens are encrypted using AES-256-GCM before being stored in the database.

The Gmail integration requires the appropriate Google OAuth configuration, credentials, redirect URIs, and authorized scopes.

### Email Sending

The application uses the Gmail API to send emails related to hearing scheduling and changes.

Email sending requires:

- A connected Gmail account.
- Valid OAuth authorization.
- Correct recipient email addresses.
- Properly configured environment variables.
- Successful Gmail API requests.

The integration has been connected and tested successfully in the deployed environment.

---

## Deployment

LuponResolve is deployed through Render and connected to the GitHub repository.

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
| Frontend | Served by Express |
| Backend | Node.js and Express |

### Production Environment Variables

Configure the following in the Render service environment:

```text
DATABASE_URL_POOLED
SESSION_SECRET
NODE_ENV=production
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GMAIL_REDIRECT_URI
GMAIL_TOKEN_ENCRYPTION_KEY
EMAIL_TEST_MODE
EMAIL_TEST_RECIPIENT
```

Render provides the production port through the `PORT` environment variable.

### Automatic Deployment

The Render service is connected to the GitHub repository.

When changes are committed and pushed to the configured branch, Render can automatically build and deploy the latest version of the application when automatic deployment is enabled.

### Production Services

| Service | Purpose |
|---|---|
| GitHub | Source code management and version history |
| Render | Application hosting |
| Neon | PostgreSQL database hosting |
| Google OAuth | Gmail authorization |
| Gmail API | Email delivery |

---

## Git Workflow

The project uses Git and GitHub for version control and collaboration.

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

### Pull Latest Changes

```bash
git pull origin main
```

### View Commit History

```bash
git log --oneline
```

After pushing, Render automatically deploys the latest committed version when automatic deployment is enabled.

---

## Security and Data Considerations

LuponResolve handles information related to complaints, users, and dispute-resolution proceedings.

Security considerations include:

- Password hashing using bcrypt.
- Session-based authentication.
- Role-based authorization.
- Protected backend routes.
- Parameterized PostgreSQL queries.
- Environment-based secret management.
- Secure handling of OAuth credentials.
- Encrypted Gmail token storage.
- Restricted access to protected API endpoints.
- Role-based case visibility.
- Session persistence through PostgreSQL.

### Data Privacy

The system may process sensitive personal information, including complainant and respondent details, allegations, and proceeding information.

The publicly accessible application should be used with synthetic or test records during demonstrations.

The system is an academic prototype and should not be treated as a fully certified production government information system.

Before real-world use, additional requirements should be addressed, including:

- Comprehensive security testing.
- Privacy assessment.
- Data protection compliance review.
- Access-control review.
- Database backup and recovery.
- Audit logging.
- Incident response procedures.
- Secure handling of actual complaint records.
- Operational safeguards for authorized barangay personnel.

---

## Testing and Verification

LuponResolve has undergone development testing and functional verification during implementation.

### Tested Areas

- User registration.
- User authentication.
- Session-based access.
- Role-based access restrictions.
- Complaint submission.
- Case retrieval.
- Preliminary screening.
- Case review.
- Case assignment.
- Workflow stage validation.
- Proceedings management.
- Resolution handling.
- Case closure.
- Database connectivity.
- PostgreSQL persistence.
- Production deployment.
- Gmail OAuth authorization.
- Gmail connection status.
- Test email sending.
- Hearing scheduling.
- Hearing-related email notification functionality.

### Development Testing

Testing has been performed through local development, browser inspection, API requests, and deployed application verification.

The application is still subject to further testing to identify bugs, improve edge-case handling, and strengthen security and reliability.

---

## Future Improvements

Although LuponResolve currently provides a functional case-management workflow and hearing notification system, further development is planned to improve reliability, security, usability, and maintainability.

Potential future improvements include:

- Comprehensive end-to-end system testing.
- Automated unit and integration testing.
- Stronger input validation and edge-case handling.
- Security testing and vulnerability assessment.
- Improved audit logging and activity tracking.
- Enhanced case history and administrative monitoring.
- Evidence and document attachment management.
- Accessibility improvements.
- Further responsive design refinement.
- Improved administrative dashboard and system monitoring.
- Production OAuth configuration and verification.
- Database backup and recovery procedures.
- Improved error handling and user feedback.
- API documentation.
- Improved hearing confirmation and notification tracking.
- More comprehensive testing of email rescheduling and cancellation scenarios.

These improvements are intended to strengthen the application before considering any real-world operational use.

---

## Project Team

**LuponResolve Development Team**

- Jerimie Bual
- Nathaniel Mandin
- Aldred Tampos

---

## Academic Context

**Course:** CSC 106 – Software Engineering 1

LuponResolve is developed as an academic software engineering project focused on applying software development principles to a real-world administrative process.

The project demonstrates:

- Web application development.
- Client-server architecture.
- REST API implementation.
- Database design and integration.
- Authentication and authorization.
- Workflow validation.
- Cloud deployment.
- Third-party API integration.
- Version control.
- Iterative software development and testing.

---

## License

This project is developed for academic and educational purposes.

License and distribution terms have not yet been formally specified.
