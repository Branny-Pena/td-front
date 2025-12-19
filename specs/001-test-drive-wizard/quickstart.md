# Quickstart: Test Drive Wizard Application

**Date**: 2025-12-11
**Feature**: 001-test-drive-wizard

## Prerequisites

- Node.js 20.x or later
- npm 10.x or later
- Angular CLI 20.x (`npm install -g @angular/cli@20`)
- Backend API running at `http://localhost:3000`

## Project Setup

### 1. Create New Angular Application

```bash
# Create new Angular project (standalone by default in v20+)
ng new td-frontend --style=css --routing=true --ssr=false

cd td-frontend
```

### 2. Install Dependencies

```bash
# SAP Fundamental Library for Angular
npm install @fundamental-ngx/core @fundamental-ngx/i18n

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Font Awesome
npm install @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/angular-fontawesome

# PDF generation (optional)
npm install jspdf
```

### 3. Configure Tailwind CSS

**tailwind.config.js**:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**src/styles.css**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* SAP Fundamental styles */
@import '@fundamental-ngx/core/styles/fundamental-ngx-core.css';
```

### 4. Configure SAP Fundamental

**src/app/app.config.ts**:
```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      // Add API base URL interceptor here
    ])),
  ]
};
```

### 5. Configure Font Awesome

**src/app/app.config.ts** (add to providers):
```typescript
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCar, faIdCard, faQrcode, faArrowRight, faArrowLeft, faCheck, faFilePdf, faEnvelope } from '@fortawesome/free-solid-svg-icons';

// In component or app initialization:
// library.addIcons(faCar, faIdCard, faQrcode, faArrowRight, faArrowLeft, faCheck, faFilePdf, faEnvelope);
```

## Project Structure

Generate the folder structure:

```bash
# Core services
mkdir -p src/app/core/services
mkdir -p src/app/core/models
mkdir -p src/app/core/guards
mkdir -p src/app/core/interceptors

# Shared components
mkdir -p src/app/shared/components/header
mkdir -p src/app/shared/components/step-indicator
mkdir -p src/app/shared/components/content-card
mkdir -p src/app/shared/components/bottom-nav
mkdir -p src/app/shared/components/signature-pad
mkdir -p src/app/shared/layouts/wizard-layout

# Feature modules
mkdir -p src/app/features/customer
mkdir -p src/app/features/vehicle
mkdir -p src/app/features/signature-summary
mkdir -p src/app/features/evaluation
mkdir -p src/app/features/vehicle-return
mkdir -p src/app/features/confirmation
```

## Generate Components

```bash
# Shared components
ng generate component shared/components/header --skip-tests
ng generate component shared/components/step-indicator --skip-tests
ng generate component shared/components/content-card --skip-tests
ng generate component shared/components/bottom-nav --skip-tests
ng generate component shared/components/signature-pad --skip-tests
ng generate component shared/layouts/wizard-layout --skip-tests

# Feature components
ng generate component features/customer --skip-tests
ng generate component features/vehicle --skip-tests
ng generate component features/signature-summary --skip-tests
ng generate component features/evaluation --skip-tests
ng generate component features/vehicle-return --skip-tests
ng generate component features/confirmation --skip-tests
```

## Configure Routes

**src/app/app.routes.ts**:
```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'customer', pathMatch: 'full' },
  {
    path: 'customer',
    loadComponent: () => import('./features/customer/customer.component')
      .then(m => m.CustomerComponent)
  },
  {
    path: 'vehicle',
    loadComponent: () => import('./features/vehicle/vehicle.component')
      .then(m => m.VehicleComponent)
  },
  {
    path: 'signature',
    loadComponent: () => import('./features/signature-summary/signature-summary.component')
      .then(m => m.SignatureSummaryComponent)
  },
  {
    path: 'evaluation',
    loadComponent: () => import('./features/evaluation/evaluation.component')
      .then(m => m.EvaluationComponent)
  },
  {
    path: 'return',
    loadComponent: () => import('./features/vehicle-return/vehicle-return.component')
      .then(m => m.VehicleReturnComponent)
  },
  {
    path: 'confirmation',
    loadComponent: () => import('./features/confirmation/confirmation.component')
      .then(m => m.ConfirmationComponent)
  },
];
```

## Development Commands

```bash
# Start development server
ng serve

# Run tests
ng test

# Build for production
ng build --configuration=production

# Lint
ng lint
```

## Backend API

Ensure the backend is running at `http://localhost:3000` with these endpoints available:

- `POST /users` - Create customer
- `POST /vehicles` - Create vehicle
- `POST /locations` - Create location
- `POST /test-drive-forms` - Submit test drive form
- `GET /test-drive-forms` - List forms
- `PATCH /test-drive-forms/:id` - Update form

## Verification Checklist

- [ ] Angular app starts without errors
- [ ] Tailwind CSS classes apply correctly
- [ ] SAP Fundamental components render
- [ ] Font Awesome icons display
- [ ] Routes navigate correctly
- [ ] Backend API is reachable at http://localhost:3000
- [ ] All 6 wizard steps are accessible

## Common Issues

### SAP Fundamental Styles Not Loading
Ensure the CSS import is in `styles.css`:
```css
@import '@fundamental-ngx/core/styles/fundamental-ngx-core.css';
```

### Tailwind Not Working
Check that `tailwind.config.js` content paths include your source files.

### CORS Errors
Backend must allow requests from `http://localhost:4200` (Angular dev server).
