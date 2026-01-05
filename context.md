# context.md (td-front) — Codex Handoff / Continuation Guide

Single source of truth to continue development of this Angular frontend repo:
- Repo root: `/Users/branny/Desktop/TD/td-front`
- Backend API contract: `/Users/branny/Desktop/TD/td-backend/API.md` (authoritative; backend rejects unknown fields)

If something here conflicts with the backend API or explicit user instructions (“exact same design/brand”), follow those instead.

---

## 1) Stack / Run

- Angular standalone + signals, RxJS, Tailwind, Fundamental NGX global styles.
- Dev: `npm start`
- Build: `npm run build`
- API base URL: `src/environments/environment.ts` + `src/app/core/interceptors/api-base-url.interceptor.ts`

---

## 2) Non‑negotiables (product + UI)

- Spanish UI everywhere.
- Keep the existing design system and brand styling; do not introduce a new visual language.
- Strict brand theming after login (brand selection): Mercedes-Benz / Andes Motor / Stellantis.
- Brand scoping: list/forms/surveys must be filtered by selected brand (`ThemeService.getSurveyBrand()`).
- Backend strict DTO validation (`whitelist` + `forbidNonWhitelisted`): never send extra fields.

Brand rule docs (non‑negotiable):
- Andes: `andes-motor-branding.md`
- Mercedes: `mercedes-benz-branding.md`

---

## 3) Branding / Theme tokens (implemented)

Source of truth:
- `src/app/core/services/theme.service.ts` (persists `td-theme` in localStorage, applies `td-theme-*` class on `<html>`)
- `src/styles.css` (CSS variables)

Theme IDs: `sap | mercedes | andes | stellantis`
Backend brand mapping (`ThemeService.getSurveyBrand()`):
- `andes` -> `ANDES MOTOR`
- `stellantis` -> `STELLANTIS`
- `mercedes` and `sap` -> `MERCEDES-BENZ`

Important tokens:
- `--td-primary`, `--td-primary-hover`, `--td-primary-active`
- `--td-bar-*` (header bar)
- Stepper:
  - `--td-step-fill` (current step)
  - `--td-step-done-fill` (completed steps)
  - `--td-step-todo-*` (not started)
- Typography:
  - `--td-font-family` (body/UI)
  - `--td-font-family-heading` (h1..h6)

Brand‑specific changes already applied:
- Mercedes: `--td-font-family` uses `"MBCorpoS"` and headings use `"MBCorpoA"` (fallbacks only; font files not bundled yet).
- Andes (official colors):
  - `--td-primary = #002D74`, accent/focus `#0096D6`
  - Stepper current = `#0096D6`
  - Stepper completed stays the same filled color as current (requested): `--td-step-done-fill = #0096D6`
- Global completed-step green (requested): `--td-step-done-fill = #00B52E` for non‑Andes themes.

---

## 4) Backend model + API constraints (from `td-backend/API.md`)

`TestDriveForm` (frontend model: `src/app/core/models/test-drive-form.model.ts`):
- `status`: `draft | submitted` (UI labels: draft=“En Progreso”, submitted=“Finalizado”)
- `brand`: `MERCEDES-BENZ | ANDES MOTOR | STELLANTIS`
- `currentStep`: `CUSTOMER_DATA | VEHICLE_DATA | SIGNATURE_DATA | VALUATION_DATA | VEHICLE_RETURN_DATA | FINAL_CONFIRMATION`
- Rule: if `status=submitted` backend forces `currentStep=FINAL_CONFIRMATION` (and vice-versa).

Endpoints used (service: `src/app/core/services/test-drive-form.service.ts`):
- `GET /test-drive-forms` (frontend always sends `brand` by default)
- `GET /test-drive-forms/:id`
- `POST /test-drive-forms` (create draft immediately)
- `PATCH /test-drive-forms/:id` (autosave)
- `GET /test-drive-forms/:id/pdf` (Blob)
- `POST /test-drive-forms/:id/email` (no body)

Legacy backend `"pending"` status is normalized to `"draft"` in `TestDriveFormService.enrichForm()` for safety.

Mock fields (frontend-only; do not send back to backend):
- `customerValoration` and `salesExpert` are mocked in `TestDriveFormService.enrichForm()` if missing.

---

## 5) Routing (start page removed)

Routes: `src/app/app.routes.ts`

- `/` -> login (brand selector)
- `/inicio` -> redirect to `/test-drive-forms` (start page deleted)

Test drive forms list/detail:
- `/test-drive-forms` -> list + create
- `/test-drive-forms/:id/*` -> detail/resume routes
- Legacy `/borradores/*` redirects to `/test-drive-forms/*`

Wizard steps:
- `/customer` -> step 1
- `/vehicle` -> step 2
- `/signature` -> step 3
- `/evaluation` -> step 4
- `/return` -> step 5
- `/confirmation` -> step 6

Surveys:
- `/encuestas/*` admin
- `/survey/:id` public answering

---

## 6) Current UX/Flow behavior (already implemented)

### 6.1 Login page
- Benefits removed; only “Pasos” shown.
- Footer copy (terms/permission/etc.) removed.
- Files: `src/app/features/login/login.component.html`, `src/app/features/login/login.component.ts`

### 6.2 Create + autosave (no “save progress” popup anymore)
- “Nuevo test-drive” on `/test-drive-forms` creates a backend draft immediately (`POST /test-drive-forms`).
- Each step auto-saves to backend when clicking Next (`PATCH /test-drive-forms/:id`) and advances `currentStep`.
- Brand is included on create/update using `ThemeService.getSurveyBrand()`.
- Core wiring:
  - List create: `src/app/features/drafts/drafts-list.component.ts`
  - Step saves: `src/app/features/customer/customer.component.ts`, `src/app/features/vehicle/vehicle.component.ts`, `src/app/features/signature-summary/signature-summary.component.ts`, `src/app/features/evaluation/evaluation.component.ts`, `src/app/features/vehicle-return/vehicle-return.component.ts`, `src/app/features/confirmation/confirmation.component.ts`

### 6.3 Resuming an in-progress form
- List click on a `draft` loads form into wizard state (`DraftFormContextService.ensureLoaded`) and navigates based on `currentStep`.
- Files: `src/app/features/drafts/draft-form-context.service.ts`, `src/app/features/drafts/drafts-list.component.ts`

---

## 7) UI changes already applied (high value)

### 7.1 Customer page
- Input titles removed; placeholders used instead.
- “Escanear DNI” moved next to DNI input as an icon-only button (outside the input, with spacing).
- File: `src/app/features/customer/customer.component.html`

### 7.2 Vehicle page
- Input titles removed; placeholders used instead.
- QR scan button is at the top-right of the card (same row as “Información del Vehículo” title) using a QR icon (`cardActions`).
- Scanning QR JSON like:
  - `{ "marca": "...", "modelo": "...", "placa": "...", "vin": "...", "ubicacion": "..." }`
  auto-fills and disables provided fields (not editable).
- File: `src/app/features/vehicle/vehicle.component.ts`, `src/app/features/vehicle/vehicle.component.html`

### 7.3 Scanner dialog (camera component)
- Only “Cerrar” button exists; secondary/cancel button removed.
- Files: `src/app/shared/components/barcode-scanner-dialog/*`

### 7.4 Return page photos (mandatory)
- Return requires:
  - 1 mileage photo (required)
  - 1 fuel-level photo (required)
  - 1–3 vehicle photos (required, total max 2MB)
- File: `src/app/features/vehicle-return/vehicle-return.component.ts`

### 7.5 Confirmation page (temporary image placeholders)
- IMPORTANT TEMP BEHAVIOR: request keeps the same shape, but instead of sending base64 image data, sends placeholders: `"image 1"`, `"image 2"`, etc.
- File: `src/app/features/confirmation/confirmation.component.ts` (`toReturnStatePlaceholders`)
- Must be reverted later when backend is ready.

### 7.6 Signature page legal notes
- Signature step includes an enumerated “NOTAS” legal/informative block (Spanish) above/near signature.
- Files: `src/app/features/signature-summary/signature-summary.component.html`

---

## 8) Test drive forms list + submitted detail (current UI)

### 8.1 List (`/test-drive-forms`)
- Component: `src/app/features/drafts/drafts-list.component.ts/.html`
- Default filter: `draft` (En Progreso)
- `draft` sorting: oldest -> newest by `updatedAt || createdAt`
- Card layout:
  - Line 1: customer name + status pill
  - Line 2:
    - `draft`: progress mini-stepper (6 steps), with tooltip “Falta: …”
    - `submitted`: show “Intención de compra” with `{purchaseProbability}%` and `{estimatedPurchaseDate}`; do not show stars
  - Shows `salesExpert` (mocked if missing), phone, location, and date footer

Mini-stepper rules (implemented):
- Completed: `--td-step-done-fill` (green `#00B52E` globally; Andes uses filled color)
- Current: `--td-step-fill` (brand)
- Not started: gray (`--td-step-todo-bg`)
- Not-started steps are not clickable
- Step numbers are always white
- Not-started connector segments match the not-started circle color

### 8.2 Submitted form detail (`/test-drive-forms/:id/ver`)
- Component: `src/app/features/drafts/draft-view.component.ts/.html`
- No stepper at top.
- Toggle: “Formulario” / “Encuesta”
  - Default selected: “Encuesta”
  - For now, “Encuesta” shows purchase intention fields (probability + intended time). (Stars removed.)

---

## 9) “Where to edit what”

- Theme/branding tokens: `src/styles.css`, `src/app/core/services/theme.service.ts`
- App routes: `src/app/app.routes.ts`
- Test drive forms API service: `src/app/core/services/test-drive-form.service.ts`
- Wizard state: `src/app/core/services/test-drive-state.service.ts`
- Stepper: `src/app/shared/components/step-indicator/*`
- List/detail pages: `src/app/features/drafts/*`
- Scanner dialog: `src/app/shared/components/barcode-scanner-dialog/*`
- Surveys admin/public: `src/app/features/surveys/*`, `src/app/features/survey-public/*`

