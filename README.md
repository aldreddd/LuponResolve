# LuponResolve

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-46B37B?style=flat)](https://luponresolve.onrender.com/)
[![Database](https://img.shields.io/badge/Database-Neon%20PostgreSQL-00E699?style=flat)](https://neon.tech/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?style=flat)](https://nodejs.org/)
[![Frontend](https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JavaScript-E34F26?style=flat)](https://developer.mozilla.org/)
[![Evidence Storage](https://img.shields.io/badge/Evidence%20Storage-Supabase-3ECF8E?style=flat)](https://supabase.com/)
[![Email Notifications](https://img.shields.io/badge/Email-Gmail%20API%20%7C%20OAuth-EA4335?style=flat)](https://developers.google.com/gmail/api)
[![Deployment](https://img.shields.io/badge/Deployment-Render-46E3B7?style=flat)](https://render.com/)
[![Version Control](https://img.shields.io/badge/Version%20Control-GitHub-181717?style=flat)](https://github.com/aldreddd/LuponResolve)

## 1. Overview

LuponResolve is a web-based Barangay dispute resolution and case management system designed to assist barangay personnel in handling complaints and managing the Katarungang Pambarangay process. It provides a digital platform for complaint submission, preliminary jurisdiction screening based on Section 408 of the Local Government Code of 1991 (Republic Act No. 7160), case review, case assignment, proceedings management, and case resolution tracking. The system includes a public/resident complaint interface and dedicated portals for the Secretary, Lupon Members, and administrators to improve case organization, workflow monitoring, and accessibility of barangay dispute resolution services.

## 2. Features (Implemented)

### REQ-01 — Complaint Submission
- Allows residents to submit complaints through the complaint submission interface.
- Collects complainant and respondent information and complaint details.
- Supports optional respondent contact information, including address and email.
- Generates a unique case number in the format `LR-#####`.

### REQ-02 — Preliminary Jurisdiction Screening
- Implements preliminary complaint screening based on Section 408 of Republic Act No. 7160.
- Collects screening answers related to barangay jurisdiction and applicable exceptions.
- Identifies potential jurisdiction concerns, warnings, and screening reasons.
- Provides preliminary screening results for barangay personnel review.
- Screening results are not a final legal determination.

### REQ-03 — Case Tracking
- Provides case tracking using the generated case number and a private tracking code.
- Allows complainants to monitor case information through the public/resident interface.

### REQ-04 — Secretary Case Management
- Provides a Secretary portal for reviewing submitted complaints.
- Displays case records and case statuses.
- Supports case review and status updates.
- Allows cases to be prepared for Lupon assessment.

### REQ-05 — Case Assignment
- Supports assigning cases to Lupon Members.
- Records case assignments in the database.
- Restricts assigned case access according to user roles and assignments.

### REQ-06 — Proceedings Management
- Supports the management of mediation, conciliation, and arbitration proceedings.
- Records proceedings information and case history.
- Supports case workflow transitions.

### REQ-07 — Case Workflow Management
- Implements workflow transitions between applicable case stages.
- Supports progression from Secretary Review to For Lupon Assessment and applicable proceedings stages.
- Includes workflow validation to prevent invalid case transitions.

### REQ-08 — Case Resolution and Closure
- Provides dedicated resolution and closure functionality.
- Supports marking cases as Resolved or Certificate to File Action when applicable.
- Supports case closure through the validated workflow.

### REQ-09 — Authentication and Role-Based Access Control
- Provides secure login for authorized staff.
- Supports Secretary, Lupon Member, and Administrator access.
- Uses password hashing and session-based authentication.
- Restricts portal access and case operations according to roles and permissions.

### REQ-10 — Administrator Dashboard
- Provides an Administrator portal for system oversight.
- Includes dashboard navigation and administrative sections.
- Supports administrative access to the system.

### REQ-11 — Email Notifications
- Integrates email notification infrastructure for applicable case-related communications.
- Supports email notification functionality associated with complaint and hearing-related processes.

## 3. Technologies and Versions

| Technology | Purpose |
|---|---|
| HTML5 | Frontend structure |
| CSS3 | Styling and responsive interface |
| JavaScript | Frontend functionality and interaction |
| Node.js | Backend runtime |
| Express.js | Backend API and server framework |
| PostgreSQL | Relational database |
| Neon | Hosted PostgreSQL database |
| Express Session | Session-based authentication |
| bcrypt | Password hashing |
| Render | Backend hosting and deployment |
| Git | Version control |
| GitHub | Repository hosting and collaboration |
| Supabase Storage | File storage infrastructure |

Exact installed software versions should be verified from the project's `package.json`, lockfile, and deployment configuration.

## 4. Installation and Setup

### 4.1 Requirements

- Node.js and npm
- Git
- Visual Studio Code or another code editor
- Live Server extension or another local frontend server
- Internet connection for hosted database access and deployed services

### 4.2 Clone the Repository

```bash
git clone https://github.com/aldreddd/LuponResolve.git
```

Navigate to the project directory:

```bash
cd LuponResolve
```

### 4.3 Install Backend Dependencies

Navigate to the backend folder:

```bash
cd backend
npm install
```

### 4.4 Configuration

Create a `.env` file inside the `backend` folder.

Configure the necessary environment variables using your project's configuration and deployment settings.

Example configuration template:

```env
PORT=3000

CLIENT_URL=http://127.0.0.1:5502

SESSION_SECRET=replace_with_a_secure_random_secret

DATABASE_URL=replace_with_database_connection_string

DATABASE_URL_POOLED=replace_with_pooled_database_connection_string

RESEND_API_KEY=replace_with_email_service_api_key

RESEND_FROM_EMAIL=replace_with_verified_sender_email

EMAIL_TEST_MODE=true
```

- Never commit `.env` files or actual credentials to GitHub.
- Use the appropriate frontend URL for `CLIENT_URL`.
- Use the appropriate database connection string for your PostgreSQL configuration.
- Configure email variables only when email functionality is being tested or used.
- Refer to the backend configuration for required or optional variables.

### 4.5 Start the Backend

From the `backend` directory:

```bash
npm run dev
```

The backend should run at:

```text
http://localhost:3000
```

### 4.6 Start the Frontend

1. Open the LuponResolve project folder in Visual Studio Code.
2. Open the appropriate frontend HTML page.
3. Run the page using Live Server.
4. Confirm that the frontend URL matches the configured backend `CLIENT_URL`.

### 4.7 Deployment

The backend is deployed using Render, with PostgreSQL hosted through Neon.

Production deployment:

- Backend: https://luponresolve.onrender.com
- Repository: https://github.com/aldreddd/LuponResolve

Production configuration uses environment variables. Do not expose production secrets in source code or documentation.

## 5. Sample Accounts / Test Data

The system supports role-based access for authorized system personnel.

| Role | Access |
|---|---|
| Administrator | Administrative dashboard and system oversight |
| Secretary | Complaint review, case management, and administrative case workflow |
| Lupon Member | Assigned cases and proceedings management |
| Resident / Complainant | Public complaint submission and case tracking |

Sample credentials for demonstration must be provided separately and must not contain real user credentials.

| Role | Username / Email | Password |
|---|---|---|
| Administrator | To be provided | Demo credential only |
| Secretary | To be provided | Demo credential only |
| Lupon Member | To be provided | Demo credential only |

Residents can use the public complaint submission and tracking interfaces without requiring staff portal credentials.

## 6. Running the Tests

### 6.1 Syntax Checks

JavaScript files can be checked using Node.js syntax validation.

Example:

```bash
node --check js/resident.js
```

Backend route syntax can be checked similarly:

```bash
node --check backend/routes/caseRoutes.js
```

Adjust paths according to the actual file location.

### 6.2 Manual Functional Testing

The following functionality should be tested before final release:

- Complaint submission and case number generation
- Preliminary jurisdiction screening
- Case tracking
- Secretary case review
- Case assignment
- Lupon case access
- Proceedings recording
- Workflow transition validation
- Case resolution and closure
- Authentication and logout
- Role-based access restrictions
- Email notification behavior
- Frontend/backend connectivity

### 6.3 Test Results

Document test execution, expected results, actual results, and defects in a separate testing document or project test report.

Formal automated test coverage and a complete final test report have not been confirmed in this README.

## 7. Project Structure

```text
LuponResolve/
│
├── index.html
├── resident.html
├── secretary.html
├── lupon.html
├── admin.html
├── workflow.html
│
├── css/
│   ├── style.css
│   ├── admin.css
│   ├── secretary.css
│   ├── lupon.css
│   └── workflow.css
│
├── js/
│   ├── app.js
│   ├── resident.js
│   ├── admin.js
│   ├── secretary.js
│   ├── lupon.js
│   └── workflow.js
│
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── config/
│   └── package.json
│
├── .gitignore
└── README.md
```

The structure above is a simplified overview. Actual files and subdirectories may vary depending on the current repository version.

- `index.html` — Main landing page.
- `resident.html` — Complaint submission and public/resident case interface.
- `secretary.html` — Secretary case management portal.
- `lupon.html` — Lupon Member portal.
- `admin.html` — Administrative dashboard.
- `workflow.html` — Case workflow management interface.
- `css/` — Portal styling and design system.
- `js/` — Frontend logic and interaction.
- `backend/` — Express server, API routes, middleware, services, and database integration.

## 8. Team

| Member | Role |
|---|---|
| Aldred Tampos | Project development, backend/frontend integration, database integration, GitHub coordination |
| Jerimie Bual | Frontend/UI contributions through GitHub branches and Pull Requests |
| Nathaniel Mandin | Frontend/Backend contributions through Pull Requests and Github branches |

Roles listed above should be adjusted to reflect the team's official project assignments.

## 9. Known Limitations

- Preliminary jurisdiction screening is informational and does not replace barangay personnel's legal assessment.
- Email delivery and hearing-related notification behavior should be verified under production configuration.
- Comprehensive automated testing and a full security assessment have not been confirmed.
- Sample demonstration credentials and formal test results need to be documented separately.
- Some interface or administrative features may still require further testing and refinement.
- Production readiness should be evaluated separately from prototype functionality.

## 10. Final Version

| Item | Details |
|---|---|
| Project | LuponResolve |
| Repository | https://github.com/aldreddd/LuponResolve |
| Final commit ID | `e0e61b8` (latest verified merge commit at the time of documentation preparation) |
| Commit date | November 26, 2026 (merge date; verify the exact commit timestamp in GitHub) |
| Deployment | Render |
| Database | Neon PostgreSQL |

The final commit ID and date should be re-verified against the repository's latest `main` branch before submission. Additional changes merged after this commit may supersede it.

No open-source license has currently been specified for this project. All rights are reserved by the project owner unless a license is added.

---

**LuponResolve — Bringing Barangay Dispute Resolution into a More Organized Digital Workspace.**
