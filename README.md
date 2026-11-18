# LuponResolve
### Barangay Dispute Resolution and Case Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-46B37B)](https://luponresolve.onrender.com/)
[![Database](https://img.shields.io/badge/Database-Neon%20PostgreSQL-00E699)](https://neon.tech/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933)](https://nodejs.org/)
[![Email](https://img.shields.io/badge/Email-Gmail%20API%20%7C%20OAuth-red)](https://developers.google.com/gmail/api)

**LuponResolve** is a web-based Barangay Dispute Resolution and Case Management System designed to support the Katarungang Pambarangay process.

The system provides a digital platform for complaint submission, preliminary jurisdiction screening, case tracking, case administration, Lupon assignment, dispute-resolution proceedings, hearing scheduling, and email notifications.

Residents can file complaints without creating an account and track their submitted cases using a case number and private tracking code. Authorized barangay personnel, including Secretaries and Lupon members, use secured staff portals to manage cases and proceedings.

The application follows a client-server architecture using HTML, CSS, JavaScript, Node.js, Express, Neon PostgreSQL, and Gmail API integration.

**Live Application:** https://luponresolve.onrender.com/

---

## Table of Contents

- [Project Overview](#project-overview)
- [Current Project Status](#current-project-status)
- [Implemented Features](#implemented-features)
- [User Roles](#user-roles)
- [Case Management Workflow](#case-management-workflow)
- [Public Complaint Submission](#public-complaint-submission)
- [Public Case Tracking](#public-case-tracking)
- [Preliminary Jurisdiction Screening](#preliminary-jurisdiction-screening)
- [Staff Portals](#staff-portals)
- [Case Management and Proceedings](#case-management-and-proceedings)
- [Hearing Management and Email Notifications](#hearing-management-and-email-notifications)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Local Installation](#local-installation)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Gmail Integration](#gmail-integration)
- [Deployment](#deployment)
- [Git Workflow](#git-workflow)
- [Security and Data Privacy](#security-and-data-privacy)
- [Testing and Verification](#testing-and-verification)
- [Future Improvements](#future-improvements)
- [Project Team](#project-team)
- [Academic Context](#academic-context)
- [License](#license)

---

## Project Overview

Traditional barangay dispute-resolution processes often involve paper-based records, manual complaint intake, in-person inquiries, and administrative coordination.

LuponResolve aims to support this process through a centralized web application that allows residents to submit complaints online and authorized barangay personnel to review, organize, monitor, and manage cases.

The system is designed to:

- Digitize barangay complaint submission.
- Allow residents to file complaints without resident accounts.
- Provide preliminary jurisdiction screening.
- Generate unique case numbers.
- Generate private tracking credentials for complainants.
- Provide limited public case-status tracking.
- Organize case records for barangay personnel.
- Assign cases to authorized Lupon members.
- Support mediation, conciliation, and arbitration workflows.
- Manage resolutions and case closures.
- Schedule and reschedule hearings.
- Send hearing-related email notifications.
- Maintain records using a cloud-hosted PostgreSQL database.
- Restrict staff access through authentication and role-based authorization.

LuponResolve is developed as an academic software engineering project and is currently deployed as a working web application prototype.

---

## Current Project Status

**Status: Deployed Working Prototype — Under Continued Development**

The application is deployed through Render and uses Neon PostgreSQL for persistent database storage.

| Component | Status |
|---|---|
| Frontend web interface | Implemented |
| Express backend | Implemented |
| REST API | Implemented |
| Guest complaint submission | Implemented |
| Resident account requirement removed from complaint intake | Implemented |
| Case number generation | Implemented |
| Private tracking code generation | Implemented |
| Secure tracking-code hash storage | Implemented |
| Public case tracking | Implemented |
| Preliminary jurisdiction screening | Implemented |
| Secretary authentication | Implemented |
| Lupon authentication | Implemented |
| Session-based authentication | Implemented |
| Password hashing | Implemented |
| Role-based access control | Implemented |
| Secretary portal | Implemented |
| Lupon portal | Implemented |
| Case assignment | Implemented |
| Proceedings management | Implemented |
| Case workflow validation | Implemented |
| Resolution management | Implemented |
| Case closure management | Implemented |
| Hearing scheduling | Implemented |
| Hearing rescheduling | Implemented |
| Hearing history | Implemented |
| Gmail API integration | Implemented |
| Hearing email notifications | Implemented |
| PostgreSQL migration | Completed |
| Neon PostgreSQL production database | Implemented |
| PostgreSQL session persistence | Implemented |
| Database migration utilities | Added |
| Screening diagnostic scripts | Added |
| GitHub repository | Connected |
| Render deployment | Active |

The project continues to undergo testing, refinement, and security improvement.

---

## Implemented Features

### 1. Guest Complaint Submission

Residents can file complaints through the public complaint form without creating an account or logging in.

Implemented capabilities:

- Public complaint submission form.
- Complainant information collection.
- Respondent information collection.
- Dispute classification.
- Incident details submission.
- Barangay and municipality information.
- Preliminary screening questionnaire.
- Server-side validation.
- Unique case number generation.
- Private tracking code generation.
- Submission confirmation.
- Preliminary screening result display.
- Input sanitization and safe rendering of dynamic content.
- Honeypot field for basic automated-spam detection.

Complaint submission is handled through the backend API, which processes the complaint and stores the case record in PostgreSQL.

Residents receive their case number and private tracking code after a successful submission. The tracking code is displayed at submission and should be saved securely by the complainant.

---

### 2. Public Case Tracking

LuponResolve includes a public tracking page that allows complainants to check limited information about their submitted complaints.

Tracking requires two credentials:

- **Case Number** — the assigned case reference.
- **Private Tracking Code** — the secret credential generated during submission.

Implemented capabilities:

- Public tracking interface.
- Case number input.
- Private tracking code input.
- Server-side credential verification.
- SHA-256 tracking-code hashing.
- Timing-safe hash comparison.
- Rate limiting for tracking attempts.
- Limited public case information.
- Current status display.
- Current case stage display.
- Submission date display.
- Last-updated date display.
- Error handling for invalid credentials.
- Responsive tracking interface.

The tracking system does not require residents to create accounts.

Public tracking is intentionally limited and does not expose complainant or respondent personal information, incident narratives, screening answers, secretary notes, case proceedings, or internal case history.

---

### 3. Preliminary Jurisdiction Screening

The complaint intake process includes preliminary screening based on jurisdictional considerations under Section 408 of the Local Government Code of 1991 (Republic Act No. 7160).

The screening considers information such as:

- Whether the parties reside within the same city or municipality.
- Whether government involvement is present.
- Whether a public officer is involved in relation to official functions.
- Criminal offense classification and applicable penalty.
- Presence of a private offended party.
- Real property dispute conditions.
- Property location and jurisdiction.
- Barangay relationship and adjacency considerations.
- Applicable jurisdictional exceptions.
- Whether parties may agree to certain jurisdictional conditions.

Possible screening classifications include:

- **Potentially Eligible for KP Review**
- **Requires Barangay Staff Review**
- **Potentially Outside KP Jurisdiction**

The screening system generates preliminary indicators to assist barangay personnel during complaint review.

Screening is an administrative aid only. It does not replace the legal assessment, determination, or decision of authorized barangay officials.

---

### 4. Secretary Portal

The Secretary Portal provides authorized barangay secretaries with tools for complaint review and administrative case management.

Implemented capabilities:

- Secure staff login.
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
- Access workflow tools.
- Manage hearing schedules.
- View relevant case information for administrative processing.

The Secretary serves as the primary administrative role for complaint intake review, case organization, assignment, and coordination.

---

### 5. Lupon Portal

The Lupon Portal provides authorized Lupon members access to cases assigned to them.

Implemented capabilities:

- Secure staff login.
- View assigned cases.
- Access relevant case details.
- Review case workflow information.
- Monitor assigned case progress.
- Record proceedings.
- Manage proceeding information.
- Monitor case progression.
- View case completion status.

Case visibility is restricted through backend authorization and assignment-based access controls.

---

### 6. Case Management

The case-management system provides structured storage and processing of barangay complaints.

Implemented capabilities:

- Create and store complaint records.
- Generate unique case numbers.
- Retrieve case records through API endpoints.
- Display case information according to user role.
- Manage case statuses.
- Assign cases to Lupon members.
- Track case progression.
- Store proceeding records.
- Manage case resolution.
- Manage case closure.

Case numbers follow the system's designated format:

`LR-00001`

Case records contain relevant complaint information, screening results, workflow details, assignments, proceedings, and resolution or closure information.

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

The system validates permitted transitions instead of allowing unrestricted case-stage changes.

Resolution and closure are handled through dedicated operations rather than unrestricted workflow updates.

This helps maintain consistency in case progression and reduces invalid administrative actions.

---

### 8. Case Assignment

The system supports assigning cases to authorized Lupon members.

Implemented capabilities:

- Assign cases to Lupon members.
- Store case assignments.
- Retrieve assigned cases.
- Restrict Lupon case visibility based on assignment.
- Support case assignment during administrative processing.

Assignments are stored in PostgreSQL and used by backend authorization logic to determine access to assigned cases.

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

## Public Complaint Submission

The guest complaint submission process is designed to reduce barriers for residents.

### Submission Flow

1. Resident opens the public complaint form.
2. Resident provides the required complaint and party information.
3. Resident completes the preliminary screening questionnaire.
4. The frontend sends the complaint to the backend API.
5. The backend validates and processes the submitted information.
6. The preliminary screening utility evaluates jurisdictional indicators.
7. The backend generates a case number and private tracking code.
8. The case information is stored in Neon PostgreSQL.
9. The tracking code is hashed before being stored.
10. The frontend displays the submission confirmation, case number, tracking code, and screening result.

Residents should keep their tracking credentials private and save them after submission.

---

## Public Case Tracking

The public tracking page allows residents to retrieve limited information about an existing complaint.

### Tracking Flow

1. Resident opens the Track Your Case page.
2. Resident enters the case number.
3. Resident enters the private tracking code.
4. The frontend sends the credentials to the backend tracking endpoint.
5. The backend hashes the submitted tracking code.
6. The stored hash is verified securely.
7. If valid, limited tracking information is returned.
8. The frontend displays the case's current tracking details.

### Publicly Available Tracking Information

The public tracking response is intentionally restricted to fields such as:

- Case number.
- Current status.
- Current case stage.
- Date submitted.
- Last updated date.

### Protected Case Information

Public tracking does not return:

- Complainant or respondent names.
- Addresses.
- Phone numbers.
- Email addresses.
- Incident narratives.
- Screening answers.
- Screening reasons or internal warnings.
- Secretary notes.
- Case history.
- Proceedings details.
- Internal staff information.

The tracking code serves as a private access credential and should not be shared publicly.

---

## Hearing Management and Email Notifications

### 11. Hearing Management

LuponResolve includes hearing-management functionality for organizing dispute-resolution sessions.

Implemented capabilities:

- Schedule hearings for specific cases.
- Specify hearing date and time.
- Specify hearing venue.
- Add hearing notes.
- View scheduled hearings.
- Reschedule hearings.
- Maintain hearing-related history.
- Associate hearings with case records.

The hearing-management functionality supports coordination between administrative case processing and dispute-resolution proceedings.

### 12. Hearing Email Notifications

The system integrates email notifications into hearing management to communicate hearing-related information.

Implemented capabilities:

- Send email notifications for scheduled hearings.
- Send notifications when hearings are rescheduled.
- Communicate hearing schedule changes.
- Notify involved parties through email.
- Integrate email notification functionality with hearing operations.

Email notifications are intended to help keep complainants and respondents informed of hearing-related changes.

### 13. Hearing History

Hearing-related records are maintained to support scheduling and administrative tracking.

Implemented capabilities include:

- Store hearing schedule information.
- Record hearing-related changes.
- Maintain hearing history.
- Associate hearing history with case records.
- Track scheduled hearing information.

Authorized users can review hearing information and scheduling history.

### Hearing Notification Flow

1. Authorized staff schedules or updates a hearing.
2. The backend processes the hearing operation.
3. Hearing information is stored in PostgreSQL.
4. The notification process is triggered.
5. Gmail API sends the notification.
6. The concerned party receives the email, provided delivery succeeds.

For rescheduled hearings, the system processes the updated schedule and sends the corresponding notification.

Email delivery depends on valid recipient email addresses, Gmail authorization, and successful API processing.

---

## User Roles

LuponResolve currently uses the following roles:

| Role | Main Responsibilities |
|---|---|
| Resident / Guest | Submit complaints without an account and track submitted cases using private credentials |
| Secretary | Review complaints, manage case records, assign Lupon members, manage hearings, and oversee case administration |
| Lupon Member | Access assigned cases and manage proceedings |
| Admin | Administrative access to authorized system functions and integrations |

Residents do not need to authenticate to submit complaints or use the public tracking feature.

Staff-only functions are protected through backend authentication and authorization checks.

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

## Technology Stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Responsive web design
- Public complaint submission interface
- Public case-tracking interface
- Staff portals
- Role-specific interfaces

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
- Hearing-related email notifications

### Security and Utilities

- SHA-256 tracking-code hashing
- Timing-safe tracking credential verification
- API rate limiting
- Input validation
- Role-based access control
- Honeypot spam-detection field
- Environment-based secret management

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

LuponResolve follows a client-server architecture with a frontend, Express backend, PostgreSQL database, and external Gmail service.

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
| Render | Hosts the Express application and frontend |
| Neon | Managed PostgreSQL database |
| Google OAuth | Authorizes Gmail access |
| Gmail API | Sends hearing-related email notifications |

The Express application serves the frontend HTML pages, CSS, JavaScript assets, and API endpoints through the deployed service.

---

## Project Structure

The following represents the primary application structure. Additional configuration, database, utility, middleware, migration, and diagnostic scripts may exist.

```text
LuponResolve/
│
├── index.html
├── auth.html
├── guest-complaint.html
├── track-case.html
├── resident.html             # Legacy / inactive resident interface
├── secretary.html
├── lupon.html
├── workflow.html
│
├── css/
│   ├── style.css
│   ├── auth.css
│   ├── guest-complaint.css
│   ├── track-case.css
│   ├── resident.css
│   ├── secretary.css
│   ├── lupon.css
│   └── workflow.css
│
├── js/
│   ├── config.js
│   ├── app.js
│   ├── auth.js
│   ├── auth-guard.js
│   ├── guest-complaint.js
│   ├── track-case.js
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
│   ├── middleware/
│   │   └── ...
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── roleRoutes.js
│   │   ├── caseRoutes.js
│   │   ├── hearingRoutes.js
│   │   └── gmailRoutes.js
│   │
│   ├── services/
│   │   └── gmailService.js
│   │
│   ├── utils/
│   │   └── complaintScreening.js
│   │
│   ├── scripts/
│   │   ├── database/
│   │   │   └── migrate-guest-complaints.js
│   │   └── diagnostics/
│   │       ├── inspect-case-schema.js
│   │       ├── check-case-number-duplicates.js
│   │       ├── check-case-sequence.js
│   │       ├── test-screening.js
│   │       └── test-screening-robustness.js
│   │
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env
│
├── .gitignore
└── README.md
```

*Note: Some legacy resident-related files remain in the repository from earlier development stages. The current public complaint submission and tracking flow does not require resident login.*

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

The public pages include:

| Page | Local URL |
|---|---|
| Homepage | `http://localhost:3000/` |
| Homepage (explicit) | `http://localhost:3000/index.html` |
| Guest complaint form | `http://localhost:3000/guest-complaint.html` |
| Public case tracking | `http://localhost:3000/track-case.html` |
| Staff authentication | `http://localhost:3000/auth.html` |

If using VS Code Live Server during frontend development, the frontend may also be accessed through:

```text
http://127.0.0.1:5500/
```

When using Live Server, the backend CORS configuration must allow the selected frontend origin during local development.

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

The email testing variables control email testing behavior during development and testing.

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

- Staff user accounts.
- Authentication information.
- Complaint and case records.
- Tracking-code hashes.
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
- Database schema initialization and migration utilities.
- Persistent cloud database storage.

Database resets, migrations, and schema changes should be performed carefully to avoid accidental loss of production data.

---

## Gmail Integration

LuponResolve integrates the Gmail API to send hearing-related email notifications.

### Authentication

The Gmail integration uses Google OAuth 2.0 to authorize an administrator's Gmail account.

The administrator authorizes the application to send emails using the connected Gmail account.

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

The integration has been connected and tested during development.

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

If local and remote branches diverge, inspect the commit history before integrating changes. Avoid force-pushing unless there is a deliberate, verified reason.

After pushing, Render automatically deploys the latest committed version when automatic deployment is enabled.

---

## Security and Data Privacy

LuponResolve handles complaint information, personal details, authentication data, and dispute-resolution records.

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
- Assignment-based case visibility.
- PostgreSQL session persistence.
- Hashed private tracking credentials.
- Timing-safe tracking-code verification.
- Rate limiting for public tracking requests.
- Limited public tracking responses.
- Safe rendering of dynamic frontend content.

### Tracking Credential Security

Public tracking credentials are sensitive.

The system is designed to:

- Generate cryptographically random tracking codes.
- Store tracking-code hashes instead of plaintext tracking codes.
- Verify credentials server-side.
- Avoid exposing private complaint information through public tracking.
- Limit repeated tracking attempts.

Tracking codes should not be stored in public URLs, logs, source code, or GitHub.

### Data Privacy

The system may process sensitive personal information, including complainant and respondent details, allegations, and proceeding information.

The publicly accessible application should use synthetic or test records during demonstrations.

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

- Staff authentication.
- Session-based access.
- Role-based access restrictions.
- Guest complaint submission.
- Case number generation.
- Tracking code generation.
- Tracking-code hash storage.
- Public case tracking.
- Invalid tracking credential handling.
- Preliminary screening.
- Screening edge cases and robustness.
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
- Hearing-related email notifications.
- Public tracking information restrictions.

### Development Testing

Testing has been performed through:

- Local development.
- Browser inspection.
- API requests.
- Backend diagnostic scripts.
- Database inspection.
- Deployed application verification.

The application remains subject to further testing to identify bugs, improve edge-case handling, and strengthen security and reliability.

---

## Future Improvements

Although LuponResolve currently provides a functional complaint submission, case-management workflow, public tracking, and hearing notification system, further development is planned to improve reliability, security, usability, and maintainability.

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
