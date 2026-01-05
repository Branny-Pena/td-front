# 02 Architecture

## High-level architecture
- Client: Angular SPA (wizard form, surveys, drafts, QR generator)
- Server: REST API (test drive, vehicles, surveys, pdf, email)
- External services: SMTP for email, PDF generation service (internal backend), optional storage for images

## Logical view
- Presentation layer: Angular components, routing, theme service
- Application layer: services for API calls, state management, toasts
- Domain layer: test drive forms, vehicles, surveys
- Infrastructure layer: HTTP, interceptors, SMTP

## Deployment view
- Frontend served as static assets (Angular build)
- Backend API hosted separately (Node/Nest style)
- Environment variables control API base URL, SMTP, and survey defaults

## Data flow
1. User selects brand -> ThemeService sets CSS variables.
2. Form steps store state in session storage and service signals.
3. Vehicle lookup calls /vehicles/find-or-create or /vehicles? filters.
4. Save draft or submit calls /test-drive-forms.
5. Submit triggers backend to send survey email.
6. Survey page uses /surveys and /survey-versions to render questions and submit answers.
7. QR generator posts /vehicles/qr-code and shows returned data URL.

## Integration points
- /test-drive-forms/:id/pdf for PDF download
- /test-drive-forms/:id/email for email sending
- /survey-responses for survey flow
