# 04 System Components

## Logical decomposition

```
[Angular SPA]
  |-- Auth + Brand Selection
  |-- Test Drive Wizard
  |-- Drafts + Read-Only Views
  |-- Survey Admin
  |-- Survey Public
  |-- QR Generator
  |-- Shared UI (Header, Stepper, Toasts, Modals)

[NestJS API]
  |-- Auth Module
  |-- Customers Module
  |-- Vehicles Module
  |-- Test Drive Forms Module
  |-- Digital Signatures Module
  |-- Return State Module
  |-- Images Module
  |-- Surveys Module (Survey, Version, Question, Response)
  |-- Reports Module
  |-- Email Module
```

## Frontend modules and responsibilities
- Login/Brand Selection: choose brand, apply theme, route to app start.
- Start/Drafts: list forms by status, filter by brand/status, open draft or read-only view.
- Wizard Steps:
  - Customer: capture or lookup customer.
  - Vehicle: capture vehicle, auto-lookup by VIN/plate, QR scan.
  - Signature: capture signature data URL.
  - Evaluation: capture probability and estimated purchase date.
  - Return: capture mileage, fuel, and photos.
  - Confirmation: submit and trigger PDF/email.
- QR Generator: manual vehicle input -> QR generation and download.
- Survey Admin: create surveys, versions, questions, set status ready.
- Survey Public: render version, capture responses, submit once.
- Shared Services: API clients, toast notifications, state persistence.

## Backend modules and responsibilities
- Auth: JWT issuance and verification, role/permission checks.
- Customers: CRUD for customer data.
- Vehicles: CRUD, lookup by VIN/plate, QR payload generation.
- Test Drive Forms: create/update forms, handle status transitions.
- Digital Signatures: signature storage, retrieval.
- Return State + Images: image metadata and association.
- Surveys: versioned surveys, immutable versions on response.
- Reports: Excel summary generation and email.
- Email: send PDF summaries and survey invitations.

## Key services
- ThemeService (frontend): applies brand colors and logo.
- TestDriveStateService (frontend): session storage state for wizard.
- TestDriveFormService (frontend): CRUD, PDF, email.
- VehicleService (frontend): lookup, create, QR.
- SurveyService (frontend): admin + public survey flows.

## Integration map
```
[SPA] --JWT--> [NestJS API] --SQL--> [PostgreSQL]
  |                             |
  |                             +--> [S3] (optional assets)
  |
  +--> [SMTP] via backend email module
```
