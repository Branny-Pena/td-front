# Research: Test Drive Wizard Application

**Date**: 2025-12-11
**Feature**: 001-test-drive-wizard
**Phase**: 0 - Research & Discovery

## Technology Decisions

### 1. Angular v20+ Standalone Components

**Decision**: Use Angular v20+ with standalone components (no NgModules)

**Rationale**:
- Constitution mandates Angular v20+ standalone architecture
- Standalone components reduce boilerplate and improve tree-shaking
- Default in Angular v20+, no need to set `standalone: true` in decorators
- Better performance with lazy loading per route

**Alternatives Considered**:
- NgModule-based architecture: Rejected - violates constitution principle III
- Micro-frontends: Rejected - over-engineering for 6-step wizard

### 2. State Management with Signals

**Decision**: Use Angular Signals for global wizard state via `TestDriveStateService`

**Rationale**:
- Constitution requires signals for local and shared state
- Signals provide fine-grained reactivity without external dependencies
- `computed()` for derived state (finalSummary)
- No need for NgRx/Akita for this application size

**Alternatives Considered**:
- NgRx Store: Rejected - over-engineering for single-customer wizard
- BehaviorSubject: Rejected - signals are preferred per constitution
- Component-local state only: Rejected - state must persist across wizard steps

### 3. SAP Fundamental Library for Angular

**Decision**: Use @fundamental-ngx as primary UI component library

**Rationale**:
- Constitution mandates SAP Fundamental as primary UI layer
- Provides form inputs, buttons, sliders, date pickers, file uploaders
- Built-in accessibility (WCAG 2.1 AA)
- Consistent theming (light theme)

**Key Components to Use**:
- `fd-form-control`, `fd-form-item`, `fd-form-label` - Form structure
- `fd-input` - Text inputs (firstName, lastName, dni, etc.)
- `fd-button` - All buttons (Next, Back, Submit, Scan ID, etc.)
- `fd-slider` - purchaseProbability, fuelLevelPercentage
- `fd-date-picker` - estimatedPurchaseDate
- `fd-textarea` - observations field
- `fd-checkbox` - requiresSatisfactionSurvey
- `fd-file-uploader` - Vehicle photos upload
- `fd-wizard` or `fd-step-tracker` - Progress indicator (if available)
- `fd-message-strip` - Success/error notifications

**Alternatives Considered**:
- Angular Material: Rejected - constitution requires SAP Fundamental
- PrimeNG: Rejected - constitution requires SAP Fundamental
- Custom components: Rejected - unnecessary when Fundamental provides all needed components

### 4. Tailwind CSS for Layout

**Decision**: Use Tailwind CSS v3.x exclusively for layout utilities

**Rationale**:
- Constitution limits Tailwind to layout, spacing, flex, grid only
- Mobile-first responsive design with breakpoint prefixes (sm:, md:, lg:)
- Utility-first approach for rapid layout development
- Must NOT override Fundamental's visual identity

**Usage Patterns**:
```html
<!-- Layout examples -->
<div class="flex flex-col min-h-screen">
<main class="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
<footer class="fixed bottom-0 left-0 right-0 px-4 py-3 flex justify-between">
```

**Alternatives Considered**:
- CSS Grid/Flexbox only: Rejected - Tailwind provides faster development
- Bootstrap: Rejected - would conflict with Fundamental theming

### 5. Signature Capture Implementation

**Decision**: Use HTML5 Canvas for signature capture, output as base64 PNG

**Rationale**:
- FR-016 requires drawable signature canvas
- FR-018 requires base64 storage
- Canvas API is native browser support, no external dependencies
- Can be wrapped in a reusable `SignaturePadComponent`

**Implementation Approach**:
- Create custom Angular component wrapping Canvas 2D context
- Track mouse/touch events for drawing
- Export canvas as base64 via `toDataURL('image/png')`
- Clear function resets canvas

**Alternatives Considered**:
- signature_pad library: Could be used if custom implementation proves complex
- SVG-based drawing: Rejected - base64 PNG is simpler for API integration

### 6. File Upload for Vehicle Photos

**Decision**: Use Fundamental's `fd-file-uploader` with client-side base64 conversion

**Rationale**:
- FR-026/FR-027 require file upload with URL format output
- Constitution assumption: photos as base64 or external URL references
- No dedicated file storage backend in current API

**Implementation Approach**:
- Use FileReader API to convert uploads to base64 data URLs
- Store in state as array of strings
- Display previews using base64 src
- Send as image URLs in returnState.images array

**Alternatives Considered**:
- Direct upload to S3/cloud storage: Not available in current backend
- Server-side file handling: Backend doesn't expose file upload endpoint

### 7. PDF Generation

**Decision**: Use jsPDF library for client-side PDF generation

**Rationale**:
- FR-030 requires PDF generation capability
- Spec assumption: may depend on backend services (not available)
- Client-side generation provides immediate feedback

**Implementation Approach**:
- Generate summary PDF from state data
- Include signature image, customer/vehicle info, evaluation data
- Trigger browser download

**Alternatives Considered**:
- Backend PDF service: Not available in current API
- Print-to-PDF: Less control over formatting

### 8. Email Service

**Decision**: Implement as stub service ready for backend integration

**Rationale**:
- FR-031 requires email capability
- Spec assumption: may depend on backend services
- No email endpoint in current API

**Implementation Approach**:
- Create EmailService with `sendSummaryEmail()` method
- For MVP: Show simulated success message
- Ready to integrate with backend email endpoint when available

**Alternatives Considered**:
- Client-side email (mailto:): Limited functionality, no attachments
- Third-party email service: Adds external dependency, cost

### 9. Route Guards for Step Navigation

**Decision**: Implement `canActivate` guards to enforce wizard step completion

**Rationale**:
- Users must complete each step before proceeding
- Prevents direct URL navigation to later steps with incomplete data
- Redirects to first incomplete step

**Implementation Approach**:
- Single `StepGuard` that checks TestDriveStateService
- Step 2: requires customer
- Step 3: requires customer + vehicle + location
- Step 4: requires signature
- Step 5: requires evaluation
- Step 6: requires return state

**Alternatives Considered**:
- No guards (UI-only enforcement): Users could bypass via URL
- Resolver-based: Guards are simpler for boolean checks

### 10. HTTP Interceptor for Base URL

**Decision**: Use HTTP interceptor to prepend base URL to all API requests

**Rationale**:
- Constitution requires base URL `http://localhost:3000`
- Centralizes URL configuration
- Simplifies service implementations

**Implementation Approach**:
- `ApiBaseUrlInterceptor` prepends base URL to relative paths
- Configure in `app.config.ts` via `provideHttpClient(withInterceptors([...]))`

**Alternatives Considered**:
- Environment variables in each service: More duplication
- Proxy configuration: Development-only solution

## Dependencies Research

### @fundamental-ngx Package Structure

```
@fundamental-ngx/core - Core UI components (buttons, forms, etc.)
@fundamental-ngx/platform - Higher-level components
@fundamental-ngx/i18n - Internationalization
```

**Recommended**: Start with `@fundamental-ngx/core` for basic form components.

### Font Awesome Integration

**Decision**: Use `@fortawesome/angular-fontawesome` package

**Icons Needed**:
- `faCar` - App logo in header
- `faIdCard` - Scan ID button
- `faQrcode` - Scan QR/Car button
- `faArrowRight` / `faArrowLeft` - Navigation arrows
- `faCheck` - Submit confirmation
- `faFilePdf` - PDF generation
- `faEnvelope` - Email sending

## API Integration Patterns

### DTO Strictness

**Critical**: Backend uses `ValidationPipe` with `whitelist` and `forbidNonWhitelisted`.

**Pattern**: Create separate DTOs for create/update operations matching backend exactly.

```typescript
// CORRECT - matches backend DTO exactly
interface CreateUserDto {
  firstName: string;
  lastName: string;
  dni: string;
  phoneNumber?: string;
  email?: string;
}

// WRONG - includes id (not in create DTO)
interface CreateUserDto {
  id?: string;  // WILL CAUSE 400 ERROR
  firstName: string;
  // ...
}
```

### Error Handling Pattern

```typescript
// Consistent error handling across API services
this.http.post<Customer>(url, dto).pipe(
  catchError(error => {
    // Extract backend validation messages
    const message = error.error?.message || 'An error occurred';
    this.notificationService.showError(message);
    return throwError(() => error);
  })
);
```

## Unresolved Questions

All technical questions from the specification have been resolved. No NEEDS CLARIFICATION items remain.

## Next Steps

1. Proceed to Phase 1: Design & Contracts
2. Create data-model.md with TypeScript interfaces
3. Generate API contracts documentation
4. Create quickstart.md for development setup
