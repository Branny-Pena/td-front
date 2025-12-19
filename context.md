# CONTEXT.md (td-frontend) - Codex Handoff / Continuation Guide

This is the single source of truth for continuing development of the Angular frontend in `test-drive-app-2/td-frontend` from any other Codex instance.

It consolidates:
- Non-negotiable requirements (Spanish UI, SAP Fundamental look, brand theming, UX rules)
- Repo structure + key components/services (with paths)
- API usage and DTO constraints (backend rejects extra fields)
- Wizard + drafts + surveys workflows

Conflict resolution order:
1) Backend DTO validation/contracts win (unknown fields are rejected).
2) Current codebase conventions win over older notes.
3) This document is newer than `CODEX_CONTEXT.md` (keep both; follow this one).

---

## 0) Repo snapshot

Workspace root: `C:\Users\Delfos\Desktop\test-drive-app-2`

- Frontend: `td-frontend/` (Angular standalone + Tailwind + Fundamental styles)
- Backend: `td-backend/` (NestJS)

Frontend important folders:
- `td-frontend/src/app/core/` -> models/services/state/theme/interceptor
- `td-frontend/src/app/shared/` -> reusable UI components + layout
- `td-frontend/src/app/features/` -> wizard steps, drafts flow, surveys flow, login/start screens
- `td-frontend/public/logos/` -> brand logos + favicon assets

---

## 1) Tech stack / versions

Frontend:
- Angular: `^20.3.x` (standalone components, signals)
- RxJS: `~7.8`
- Tailwind: `^3.4.x`
- SAP Fundamental NGX: `^0.57.5` (global styles; most UI is custom Tailwind to match Fundamental visuals)
- ZXing scanner: `@zxing/ngx-scanner@^20.0.0` (Angular 20 compatible)

Backend base URL configuration:
- `td-frontend/src/environments/environment.ts` -> `apiBaseUrl: 'http://localhost:3001'`
- Requests use relative URLs like `'/test-drive-forms'` and are prefixed by:
  - `td-frontend/src/app/core/interceptors/api-base-url.interceptor.ts`

Run:
- Frontend dev: `npm start` (in `td-frontend/`)
- Build: `npm run build`

---

## 2) Non-negotiables (product / UX)

1) Spanish UI everywhere (labels, buttons, messages, toasts, errors).
2) Brand theming is mandatory across the app after "login" brand selection:
   - Mercedes Benz
   - Andes Motor
   - Stellantis
3) Data visibility must be brand-scoped:
   - If the user selected Mercedes, they must only see Mercedes surveys and Mercedes test drive forms.
4) SAP Fundamental look-and-feel (Morning Horizon references) is required, but implemented via:
   - Fundamental global styles (imported)
   - Tailwind + small component CSS to match visuals precisely
5) No duplicate submissions:
   - If a form is already sent (submitted/pending), do not allow resubmitting as a new form by navigating back.
6) Draft/pending/submitted rules:
   - Backend statuses: `draft | pending | submitted`
   - `submitted` only when vehicle info is confirmed/auto-filled (details below).

---

## 3) Branding / theme system (dynamic palette)

### 3.1 ThemeService (source of truth)
File: `td-frontend/src/app/core/services/theme.service.ts`

- Theme IDs: `sap | mercedes | andes | stellantis`
- Stored in `localStorage` key: `td-theme`
- `getSurveyBrand()` maps the UI theme to the backend enum string:
  - `mercedes`/`sap` -> `MERCEDES-BENZ`
  - `andes` -> `ANDES MOTOR`
  - `stellantis` -> `STELLANTIS`

### 3.2 CSS variables + theme classes
File: `td-frontend/src/styles.css`

Root CSS variables drive:
- primary color (`--td-primary`) and hover/active
- app background/card colors
- header + bottom bar colors (`--td-bar-*`)
- stepper colors (`--td-step-fill`, `--td-step-todo-*`, `--td-step-track-bg`)
- typography baseline (`--td-font-family`)

Theme classes are set on `<html>`:
- `td-theme-sap`
- `td-theme-mercedes`
- `td-theme-andes`
- `td-theme-stellantis`

Current palette rules:
- Mercedes: black header/bottom + primary blue `#0078d6`
- Andes: white header/bottom; step fill uses `#0096d6`
- Stellantis: light header/bottom `#f0f0f0`, primary `#243882`, step "todo" text is white

### 3.3 Logos
File: `td-frontend/src/app/shared/components/header/header.component.ts`

- Andes: `/logos/andes-motor-logo.svg`
- Stellantis: `/logos/stellantis-logo.svg`
- SAP/login header: `/logos/divemotor-logo.png`
- Mercedes uses an inline SVG icon (can be replaced later with official logo).

Favicon:
- `td-frontend/src/index.html` uses `logos/divemotor-logo.png`

---

## 4) Global layout pattern (WizardLayout)

File: `td-frontend/src/app/shared/layouts/wizard-layout/wizard-layout.component.*`

Standard page structure:
- `<app-header />` (brand bar, "Salir" link) - optional via inputs
- `<app-step-indicator />` - optional via inputs
- `main` content area with bottom padding to avoid overlap with fixed bottom nav
- `<app-bottom-nav />` fixed bottom navigation - optional via inputs
- `<app-message-toast-container />` always present

Key WizardLayout inputs:
- `showHeader`, `showStepper`, `showBottomNav`, `showStartButton`
- `chromeVariant: 'default' | 'plain'` (`plain` makes the header match page background)

Bottom nav is fixed with safe-area handling:
- `td-frontend/src/app/shared/components/bottom-nav/bottom-nav.component.html`

Important: main padding uses `pb-[calc(6rem+env(safe-area-inset-bottom))]` so bottom buttons are always visible on mobile.

---

## 5) Core state: TestDriveStateService (wizard persistence)

File: `td-frontend/src/app/core/services/test-drive-state.service.ts`

Signals persisted to sessionStorage (`tdWizardState:v1`):
- `customer`, `vehicle`, `location`
- `vehicleAutofilled` (IMPORTANT for submitted vs pending)
- `signatureData`
- `evaluation` (`purchaseProbability`, `estimatedPurchaseDate`, `observations`)
- `returnState` (`finalMileage`, `fuelLevelPercentage`, `imageUrls`)
- `testDriveForm`
- `draftFormId`
- `currentStep`, `previousStep` (drives stepper animation)

Reset behavior:
- `reset()` clears in-memory state and sessionStorage.
- This MUST be called when starting a new form so old values do not leak into new sessions.

---

## 6) Shared UI components (patterns to follow)

### 6.1 Buttons (Fundamental-like)
File: `td-frontend/src/styles.css` (`@layer components`)

Use these classes (do not invent new ad-hoc button styles):
- Base: `td-btn` (radius is 10px non-negotiable)
- Standard (outline, blue text): `td-btn td-btn--standard`
- Emphasized (solid primary): `td-btn td-btn--emphasized`

### 6.2 Toasts (Fundamental message toast look)
- Service: `td-frontend/src/app/shared/services/message-toast.service.ts`
- Container: `td-frontend/src/app/shared/components/message-toast-container/message-toast-container.component.*`

Behavior:
- Toasts appear in the upper-right with an enter animation.

### 6.3 Modal dialog (Fundamental-like)
File: `td-frontend/src/app/shared/components/modal-dialog/modal-dialog.component.*`

Functional requirements implemented:
- Focus trap
- ESC close
- Overlay click close (configurable)
- `role="dialog"` + `aria-modal`

Used for confirmations (publish survey, confirm vehicle info, etc.).

### 6.4 Step indicator animation
File: `td-frontend/src/app/shared/components/step-indicator/step-indicator.component.ts`

Non-negotiables:
- Slower progressive fill left-to-right when advancing steps.
- Avoid "spark / everything filled" on initial render by using `previousStep` and a `ready` gate.

### 6.5 Combobox (searchable)
File: `td-frontend/src/app/shared/components/combo-box/combo-box.component.*`

This is a real accessible combobox:
- Input + dropdown listbox
- Filter as you type
- Keyboard navigation
- ARIA roles (`combobox`, `listbox`, `option`)

If you need a dropdown that looks like the combobox but is not searchable, copy the styling pattern but keep native/select-like behavior.

### 6.6 Barcode scanner dialog
File: `td-frontend/src/app/shared/components/barcode-scanner-dialog/barcode-scanner-dialog.component.ts`

Uses `@zxing/ngx-scanner` and emits scanned string via `(scanned)`.
Used for:
- DNI scanning (customer step)
- VIN scanning (vehicle step) - should populate VIN and trigger vehicle lookup

Note: Some Spanish strings inside this component currently have encoding corruption; if touched, rewrite them in proper UTF-8 Spanish.

---

## 7) Main routing map

File: `td-frontend/src/app/app.routes.ts`

Login / start:
- `/` -> login (brand selector)
- `/inicio` -> start screen (two buttons + dev "Encuestas" entry)

Wizard (6 steps):
- `/customer`
- `/vehicle`
- `/signature`
- `/evaluation`
- `/return`
- `/confirmation`

Drafts flow:
- `/borradores` (list, filters)
- `/borradores/:id/cliente` (view only)
- `/borradores/:id/vehiculo` (editable, confirm vehicle register status)
- `/borradores/:id/firma` (view only)
- `/borradores/:id/evaluacion` (editable)
- `/borradores/:id/devolucion` (editable)
- `/borradores/:id/confirmacion` (final submit/update)
- `/borradores/:id/ver` (submitted view only)

Surveys:
- `/encuestas` (admin landing)
- `/encuestas/:surveyId` (survey detail + versions)
- `/encuestas/version/:versionId` (tabs: Respuestas/Contenido)
- `/encuestas/version/:versionId/revision` (publish confirmation)
- `/encuestas/respuestas/:id` (response detail; back goes to version via query param)

Public survey answering page:
- `/survey/:id` (id can be surveyVersionId or surveyId; has fallback logic)

---

## 8) API usage (frontend services)

### 8.1 Hard rules
- Backend uses strict validation (`whitelist` + `forbidNonWhitelisted`): never send extra fields.
- Prefer `getRawValue()` for disabled form controls when building DTOs.

### 8.2 Test drive forms
Service: `td-frontend/src/app/core/services/test-drive-form.service.ts`

Endpoints used:
- `GET /test-drive-forms` with filters:
  - `status=draft|pending|submitted`
  - `brand=MERCEDES-BENZ|ANDES MOTOR|STELLANTIS` (frontend always sends current brand by default)
  - `vehicleLicensePlate`, `vehicleVinNumber` (partial match)
  - `customerId`, `vehicleId`, `locationId`
- `GET /test-drive-forms/:id`
- `POST /test-drive-forms` (create draft or create full, depending on DTO)
- `PATCH /test-drive-forms/:id` (update)
- `GET /test-drive-forms/:id/pdf` -> returns `application/pdf` as `Blob` (download)
- `POST /test-drive-forms/:id/email` -> sends email (no body for now)

Status rules:
- New form submission:
  - If vehicle was auto-filled from lookup -> `submitted`
  - If vehicle was entered manually -> `pending`
  - Source of truth: `TestDriveStateService.vehicleAutofilled()`
  - File: `td-frontend/src/app/features/confirmation/confirmation.component.ts`
- Draft completion submission:
  - If `vehicle.registerStatus === 'confirmed'` -> `submitted`
  - Else -> `pending`
  - File: `td-frontend/src/app/features/drafts/draft-confirmation.component.ts`

### 8.3 Customer / Vehicle / Location
Services:
- `td-frontend/src/app/core/services/customer.service.ts`
- `td-frontend/src/app/core/services/vehicle.service.ts`
- `td-frontend/src/app/core/services/location.service.ts`

Key behavior:
- Customer: lookup by DNI (auto-fill; toast found/not found)
- Vehicle: lookup by license plate OR VIN:
  - `VehicleService.getByLicensePlateOrVin(licensePlate?, vinNumber?)`
  - Auto-fill make/model if found and disable editing
  - If not found, clear and let user fill manually

### 8.4 Surveys (versioned)
Services:
- `td-frontend/src/app/core/services/survey.service.ts`
- `td-frontend/src/app/core/services/survey-version.service.ts`
- `td-frontend/src/app/core/services/survey-response.service.ts`

Backend constraints (do not break):
- Versions become immutable after responses exist
- Responses can be submitted once
- Required questions must be answered

Endpoints used:
- `POST /surveys` (admin create; created in `draft` status)
- `PATCH /surveys/:id` (publish by setting status `ready`)
- `GET /surveys` (admin list; frontend filters by brand client-side)
- `GET /surveys/active?brand=...` (discover active)
- `POST /surveys/:surveyId/versions`
- `GET /surveys/:surveyId/versions/current`
- `GET /survey-versions/:versionId` (full structure w/ questions + options)
- `POST /survey-versions/:versionId/questions`
- `POST /survey-responses` (start/resume idempotent)
- `GET /survey-responses/:id` (debug/admin detail; includes sanitized customer fields)
- `POST /survey-responses/:responseId/answers`

Brand scoping:
- Admin survey pages and response views enforce brand === `ThemeService.getSurveyBrand()`.

---

## 9) Wizard step requirements (functional)

### Step 1 - Cliente
- DNI input can be scanned (barcode dialog).
- If lookup finds client: auto-complete and toast "Cliente encontrado".
- If not: toast requesting manual completion.

### Step 2 - Vehiculo + Ubicacion
File: `td-frontend/src/app/features/vehicle/vehicle.component.ts`

Rules:
- When user fills licensePlate OR vinNumber, call `getByLicensePlateOrVin`.
- Vehicle found:
  - Auto-fill make/model
  - Disable make/model
  - Set `TestDriveStateService.vehicleAutofilled(true)`
  - Toast "Vehiculo encontrado"
- Not found:
  - Ask via toast to complete manually
  - Ensure make/model are cleared if previously auto-filled and now no longer found
- VIN scan:
  - Scan must populate VIN and trigger lookup even if VIN is not 17 chars (VIN validity is not used as a blocker).

### Step 3 - Firma
- Signature is stored as base64 image string:
  - Backend may send full data URL: `data:image/png;base64,...`
  - Or raw base64; frontend normalizes when displaying
- Summary cards must show persisted customer/vehicle data and not be empty when navigating back and forth (state stored in `TestDriveStateService`).

After signature, the flow includes a "save progress" modal in the wizard (draft creation/update). Keep this behavior.

### Step 4 - Evaluacion
- `observations` is optional; no min length, max length 255
- `estimatedPurchaseDate` is a string dropdown with values:
  - `1 mes`
  - `1 a 3 meses`
  - `Mas de 3 meses`
- Number questions use the custom slider look (same as purchase probability).

### Step 5 - Devolucion (ReturnState)
File: `td-frontend/src/app/features/vehicle-return/vehicle-return.component.ts`

Photos requirements:
- Min 1 photo
- Max 3 photos
- Max total size = 2MB combined (not per photo)
- Stored as data URLs in `returnState.imageUrls`
- UI uses a custom "Fundamental-like" file upload (two-part control) with Spanish labels.

### Step 6 - Confirmacion
File: `td-frontend/src/app/features/confirmation/confirmation.component.ts`

Rules:
- Once submitted/pending, do not allow going back to resubmit as a new form.
- PDF download calls `/test-drive-forms/:id/pdf` and triggers browser download.
- Email button calls `/test-drive-forms/:id/email` (no body) and shows toast.

---

## 10) Drafts flow (edit vs view)

List page:
- `td-frontend/src/app/features/drafts/drafts-list.component.ts`
- Filter statuses on the frontend: `all | draft | pending | submitted`
- Clicking:
  - `submitted` -> view mode (`/borradores/:id/ver`)
  - `draft/pending` -> resume flow starting at `/borradores/:id/cliente`

Draft context loader:
- `td-frontend/src/app/features/drafts/draft-form-context.service.ts`
- Loads full form into wizard state, including signature + evaluation + return images.

Last step submission:
- `td-frontend/src/app/features/drafts/draft-confirmation.component.ts`
- "Enviar formulario" is always enabled, but must show missing items text if incomplete.
- If vehicle not confirmed, submission updates to `pending`, otherwise `submitted`.

Signature rendering on drafts:
- Signature data lives under `form.signature.signatureData`
- It is a base64 image string (often already a full data URL)

---

## 11) Known issues / maintenance notes

1) Encoding (mojibake):
   - Several templates show corrupted Spanish characters (e.g., "sesi...", "Veh...").
   - When touching those files, rewrite the strings in proper UTF-8 Spanish.
2) Angular template warnings like NG8107 (optional chaining on non-null types):
   - Fix by adjusting types or removing unnecessary `?.` in templates.
3) Survey admin uses client-side brand filtering for `GET /surveys` (backend does not filter there).
   - Acceptable for now; backend brand filtering would be a future optimization.

---

## 12) Where to start when continuing work

If you need to work on...
- Brand palette / UI chrome: `td-frontend/src/styles.css`, `td-frontend/src/app/core/services/theme.service.ts`, `td-frontend/src/app/shared/components/header/header.component.*`
- Wizard flow / persistence: `td-frontend/src/app/core/services/test-drive-state.service.ts`, `td-frontend/src/app/shared/layouts/wizard-layout/wizard-layout.component.*`
- Vehicle lookup + scanner: `td-frontend/src/app/features/vehicle/vehicle.component.ts`, `td-frontend/src/app/shared/components/barcode-scanner-dialog/*`
- Draft submission: `td-frontend/src/app/features/drafts/draft-confirmation.component.ts`
- Surveys admin: `td-frontend/src/app/features/surveys/*`
- Survey public answering: `td-frontend/src/app/features/survey-public/*`

