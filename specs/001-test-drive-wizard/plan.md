# Implementation Plan: Test Drive Wizard Application

**Branch**: `001-test-drive-wizard` | **Date**: 2025-12-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-test-drive-wizard/spec.md`

## Summary

Build a 6-step Angular wizard application for managing vehicle test-drive flows at a dealership. The application captures customer data, vehicle information, digital signatures, test drive evaluation, vehicle return status, and submits the complete TestDriveForm to a REST API backend. Uses Angular v20+ standalone components with signals-based state management, SAP Fundamental Library for UI components, and Tailwind CSS for layout utilities.

## Technical Context

**Language/Version**: TypeScript 5.x with Angular v20+ (standalone components)
**Primary Dependencies**:
- Angular v20+ (standalone, signals, lazy routing)
- SAP Fundamental Library for Angular (@fundamental-ngx)
- Tailwind CSS v3.x
- Font Awesome icons
- RxJS for HTTP operations

**Storage**: N/A (backend API handles persistence via REST)
**Testing**: Jasmine + Karma (Angular default), optional Jest migration
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge), mobile-first responsive design
**Project Type**: Single Angular frontend application (SPA)
**Performance Goals**: Form validation feedback <500ms, full wizard completion <10 minutes manual / <5 minutes with scan
**Constraints**: Mobile-first (320px minimum width), WCAG 2.1 AA accessibility, strict DTO matching with backend
**Scale/Scope**: 6 wizard steps, 7 API services, single-customer application (no auth required)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. General Principles | PASS | Using TypeScript, Angular v20+, SAP Fundamental, Tailwind CSS, REST API integration |
| II. Backend Models | PASS | DTOs align exactly with Customer, Vehicle, CurrentLocation, DigitalSignature, ReturnState, Image, TestDriveForm |
| III. Angular Principles | PASS | Standalone components, signals state, inject(), lazy routes, 3-file split |
| IV. Template & Change Detection | PASS | Native @if/@for/@switch, OnPush change detection, no ngClass/ngStyle |
| V. Styling & Icons | PASS | SAP Fundamental for UI, Tailwind for layout only, Font Awesome icons |
| VI. Accessibility & UX | PASS | WCAG 2.1 AA, semantic HTML, keyboard accessible, mobile-first |
| API Integration Rules | PASS | Base URL http://localhost:3000, UUID IDs, strict DTO matching |

**Gate Result**: PASS - No violations. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-test-drive-wizard/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
│   ├── users.api.md
│   ├── vehicles.api.md
│   ├── locations.api.md
│   ├── test-drive-forms.api.md
│   └── openapi.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── app.component.ts
│   ├── app.component.html
│   ├── app.component.css
│   ├── app.config.ts
│   ├── app.routes.ts
│   ├── core/
│   │   ├── services/
│   │   │   ├── test-drive-state.service.ts
│   │   │   ├── users-api.service.ts
│   │   │   ├── vehicles-api.service.ts
│   │   │   ├── locations-api.service.ts
│   │   │   ├── test-drive-forms-api.service.ts
│   │   │   ├── pdf.service.ts
│   │   │   ├── email.service.ts
│   │   │   └── notification.service.ts
│   │   ├── models/
│   │   │   ├── customer.model.ts
│   │   │   ├── vehicle.model.ts
│   │   │   ├── location.model.ts
│   │   │   ├── digital-signature.model.ts
│   │   │   ├── return-state.model.ts
│   │   │   ├── image.model.ts
│   │   │   └── test-drive-form.model.ts
│   │   ├── guards/
│   │   │   └── step-guard.ts
│   │   └── interceptors/
│   │       └── api-base-url.interceptor.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── header/
│   │   │   │   ├── header.component.ts
│   │   │   │   ├── header.component.html
│   │   │   │   └── header.component.css
│   │   │   ├── step-indicator/
│   │   │   │   ├── step-indicator.component.ts
│   │   │   │   ├── step-indicator.component.html
│   │   │   │   └── step-indicator.component.css
│   │   │   ├── content-card/
│   │   │   │   ├── content-card.component.ts
│   │   │   │   ├── content-card.component.html
│   │   │   │   └── content-card.component.css
│   │   │   ├── bottom-nav/
│   │   │   │   ├── bottom-nav.component.ts
│   │   │   │   ├── bottom-nav.component.html
│   │   │   │   └── bottom-nav.component.css
│   │   │   └── signature-pad/
│   │   │       ├── signature-pad.component.ts
│   │   │       ├── signature-pad.component.html
│   │   │       └── signature-pad.component.css
│   │   └── layouts/
│   │       └── wizard-layout/
│   │           ├── wizard-layout.component.ts
│   │           ├── wizard-layout.component.html
│   │           └── wizard-layout.component.css
│   └── features/
│       ├── customer/
│       │   ├── customer.component.ts
│       │   ├── customer.component.html
│       │   ├── customer.component.css
│       │   └── customer.routes.ts
│       ├── vehicle/
│       │   ├── vehicle.component.ts
│       │   ├── vehicle.component.html
│       │   ├── vehicle.component.css
│       │   └── vehicle.routes.ts
│       ├── signature-summary/
│       │   ├── signature-summary.component.ts
│       │   ├── signature-summary.component.html
│       │   ├── signature-summary.component.css
│       │   └── signature-summary.routes.ts
│       ├── evaluation/
│       │   ├── evaluation.component.ts
│       │   ├── evaluation.component.html
│       │   ├── evaluation.component.css
│       │   └── evaluation.routes.ts
│       ├── vehicle-return/
│       │   ├── vehicle-return.component.ts
│       │   ├── vehicle-return.component.html
│       │   ├── vehicle-return.component.css
│       │   └── vehicle-return.routes.ts
│       └── confirmation/
│           ├── confirmation.component.ts
│           ├── confirmation.component.html
│           ├── confirmation.component.css
│           └── confirmation.routes.ts
├── styles.css           # Global styles + Tailwind imports
└── main.ts              # Bootstrap

src/assets/
└── icons/               # Any static assets
```

**Structure Decision**: Single Angular project with feature-based architecture. Core services handle API communication and state, shared components provide reusable UI pieces, and features implement each wizard step as lazy-loaded routes.

## Complexity Tracking

> No constitution violations - section not applicable.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
