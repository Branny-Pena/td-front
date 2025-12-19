# Data Model: Test Drive Wizard Application

**Date**: 2025-12-11
**Feature**: 001-test-drive-wizard
**Phase**: 1 - Design

## Entity Relationship Diagram

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│      Customer       │      │     Vehicle     │      │ CurrentLocation │
├─────────────────┤      ├─────────────────┤      ├─────────────────┤
│ id: UUID        │      │ id: UUID        │      │ id: UUID        │
│ firstName       │      │ make            │      │ locationName    │
│ lastName        │      │ model           │      └────────┬────────┘
│ dni             │      │ licensePlate    │               │
│ phoneNumber?    │      │ vinNumber?      │               │
│ email?          │      └────────┬────────┘               │
└────────┬────────┘               │                        │
         │                        │                        │
         │ N:1                    │ N:1                    │ N:1
         │                        │                        │
         ▼                        ▼                        ▼
    ┌────────────────────────────────────────────────────────────┐
    │                      TestDriveForm                          │
    ├────────────────────────────────────────────────────────────┤
    │ id: UUID                                                    │
    │ customerId: UUID ─────────────────────────────────────────────► │
    │ vehicleId: UUID ──────────────────────────────────────────► │
    │ locationId: UUID ─────────────────────────────────────────► │
    │ signatureData?: string (base64)                             │
    │ purchaseProbability: number (0-100)                         │
    │ estimatedPurchaseDate: string (YYYY-MM-DD)                  │
    │ observations: string                                        │
    │ requiresSatisfactionSurvey: boolean                         │
    │ status: 'draft' | 'submitted'                               │
    │ returnState?: ReturnState (nested, 1:1)                     │
    │ createdAt: string                                           │
    │ updatedAt: string                                           │
    └────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:1 (optional)
                                    ▼
                          ┌─────────────────┐
                          │   ReturnState   │
                          ├─────────────────┤
                          │ id: UUID        │
                          │ finalMileage    │
                          │ fuelLevel%      │
                          │ images: Image[] │
                          └────────┬────────┘
                                   │
                                   │ 1:N
                                   ▼
                          ┌─────────────────┐
                          │     Image       │
                          ├─────────────────┤
                          │ id: UUID        │
                          │ url: string     │
                          └─────────────────┘
```

## TypeScript Interfaces

### Customer Model

```typescript
// src/app/core/models/customer.model.ts

/**
 * Customer entity representing a customer taking a test drive.
 * Maps to backend `users` table.
 */
export interface Customer {
  id: string;           // UUID
  firstName: string;
  lastName: string;
  dni: string;          // National ID number
  phoneNumber: string | null;
  email: string | null;
}

/**
 * DTO for creating a new customer.
 * IMPORTANT: Do NOT include 'id' - backend generates it.
 */
export interface CreateUserDto {
  firstName: string;
  lastName: string;
  dni: string;
  phoneNumber?: string;
  email?: string;
}

/**
 * DTO for updating an existing customer.
 * All fields are optional for partial updates.
 */
export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  dni?: string;
  phoneNumber?: string;
  email?: string;
}
```

### Vehicle Model

```typescript
// src/app/core/models/vehicle.model.ts

/**
 * Vehicle entity representing the car being test driven.
 * Maps to backend `vehicles` table.
 */
export interface Vehicle {
  id: string;           // UUID
  make: string;         // e.g., "Toyota"
  model: string;        // e.g., "Corolla"
  licensePlate: string; // e.g., "ABC-123"
  vinNumber: string | null; // Vehicle Identification Number
}

/**
 * DTO for creating a new vehicle.
 */
export interface CreateVehicleDto {
  make: string;
  model: string;
  licensePlate: string;
  vinNumber?: string;
}

/**
 * DTO for updating an existing vehicle.
 */
export interface UpdateVehicleDto {
  make?: string;
  model?: string;
  licensePlate?: string;
  vinNumber?: string;
}
```

### Location Model

```typescript
// src/app/core/models/location.model.ts

/**
 * CurrentLocation entity representing the dealership location.
 * Maps to backend `current_locations` table.
 */
export interface CurrentLocation {
  id: string;           // UUID
  locationName: string; // e.g., "Lima Center"
}

/**
 * DTO for creating a new location.
 */
export interface CreateLocationDto {
  locationName: string;
}
```

### Digital Signature Model

```typescript
// src/app/core/models/digital-signature.model.ts

/**
 * DigitalSignature entity for customer acceptance.
 * Maps to backend `digital_signatures` table.
 * Note: Usually submitted inline with TestDriveForm, not as standalone.
 */
export interface DigitalSignature {
  id: string;           // UUID
  signatureData: string; // Base64 encoded PNG
}

/**
 * DTO for creating a standalone digital signature (optional use).
 */
export interface CreateDigitalSignatureDto {
  signatureData: string;
}
```

### Return State Model

```typescript
// src/app/core/models/return-state.model.ts

import { Image } from './image.model';

/**
 * ReturnState entity representing vehicle condition upon return.
 * Maps to backend `return_states` table.
 */
export interface ReturnState {
  id: string;                    // UUID
  finalMileage: number;
  fuelLevelPercentage: number;   // 0-100
  images: Image[];
}

/**
 * DTO for creating return state (used inline with TestDriveForm).
 * Note: images is array of URL strings, not Image objects.
 */
export interface CreateReturnStateDto {
  finalMileage: number;
  fuelLevelPercentage: number;
  images: string[];              // Array of image URLs
}
```

### Image Model

```typescript
// src/app/core/models/image.model.ts

/**
 * Image entity for vehicle photos.
 * Maps to backend `images` table.
 */
export interface Image {
  id: string;           // UUID
  url: string;          // Image URL or base64 data URL
}
```

### Test Drive Form Model

```typescript
// src/app/core/models/test-drive-form.model.ts

import { Customer } from './customer.model';
import { Vehicle } from './vehicle.model';
import { CurrentLocation } from './location.model';
import { DigitalSignature } from './digital-signature.model';
import { ReturnState, CreateReturnStateDto } from './return-state.model';

/**
 * TestDriveForm status enum.
 */
export type TestDriveFormStatus = 'draft' | 'submitted';

/**
 * TestDriveForm entity - the master record linking all test drive data.
 * Maps to backend `test_drive_forms` table.
 */
export interface TestDriveForm {
  id: string;                           // UUID
  purchaseProbability: number;          // 0-100
  estimatedPurchaseDate: string;        // YYYY-MM-DD format
  observations: string;
  requiresSatisfactionSurvey: boolean;
  status: TestDriveFormStatus;
  createdAt: string;                    // ISO timestamp
  updatedAt: string;                    // ISO timestamp

  // Relationships (populated in response)
  customer: Customer;
  vehicle: Vehicle;
  location: CurrentLocation;
  digitalSignature: DigitalSignature | null;
  returnState: ReturnState | null;
}

/**
 * DTO for creating a new test drive form.
 * CRITICAL: Must match backend DTO exactly - no extra fields!
 */
export interface CreateTestDriveFormDto {
  customerId: string;                       // UUID reference
  vehicleId: string;                    // UUID reference
  locationId: string;                   // UUID reference
  signatureData?: string;               // Base64 signature (inline)
  purchaseProbability: number;
  estimatedPurchaseDate: string;        // YYYY-MM-DD
  observations: string;
  requiresSatisfactionSurvey: boolean;
  status: TestDriveFormStatus;
  returnState?: CreateReturnStateDto;   // Nested creation
}

/**
 * DTO for updating an existing test drive form.
 * All fields optional for partial updates.
 */
export interface UpdateTestDriveFormDto {
  customerId?: string;
  vehicleId?: string;
  locationId?: string;
  signatureData?: string;
  purchaseProbability?: number;
  estimatedPurchaseDate?: string;
  observations?: string;
  requiresSatisfactionSurvey?: boolean;
  status?: TestDriveFormStatus;
  returnState?: CreateReturnStateDto;
}
```

## Application State Model

```typescript
// src/app/core/services/test-drive-state.service.ts (state shape)

import { Customer } from '../models/customer.model';
import { Vehicle } from '../models/vehicle.model';
import { CurrentLocation } from '../models/location.model';
import { TestDriveForm } from '../models/test-drive-form.model';

/**
 * Evaluation data collected in Step 4.
 */
export interface EvaluationData {
  purchaseProbability: number;          // 0-100
  estimatedPurchaseDate: string;        // YYYY-MM-DD
  observations: string;
  requiresSatisfactionSurvey: boolean;
}

/**
 * Return state draft data collected in Step 5.
 */
export interface ReturnStateDraft {
  finalMileage: number;
  fuelLevelPercentage: number;          // 0-100
  imageUrls: string[];                  // Base64 data URLs or external URLs
}

/**
 * Complete wizard state shape.
 * Managed by TestDriveStateService using signals.
 */
export interface WizardState {
  // Step 1 result
  customer: Customer | null;

  // Step 2 results
  vehicle: Vehicle | null;
  location: CurrentLocation | null;

  // Step 3 result
  signatureData: string | null;         // Base64 PNG

  // Step 4 result
  evaluation: EvaluationData | null;

  // Step 5 result
  returnState: ReturnStateDraft | null;

  // Step 6 result (after submission)
  testDriveForm: TestDriveForm | null;

  // Current wizard step (1-6)
  currentStep: number;

  // Draft form ID if resuming
  draftFormId: string | null;
}
```

## Validation Rules

### Customer Validation

| Field | Required | Rules |
|-------|----------|-------|
| firstName | Yes | Non-empty string |
| lastName | Yes | Non-empty string |
| dni | Yes | Non-empty string (national ID format) |
| phoneNumber | No | Valid phone format if provided |
| email | No | Valid email format if provided |

### Vehicle Validation

| Field | Required | Rules |
|-------|----------|-------|
| make | Yes | Non-empty string |
| model | Yes | Non-empty string |
| licensePlate | Yes | Non-empty string |
| vinNumber | No | VIN format if provided |

### Location Validation

| Field | Required | Rules |
|-------|----------|-------|
| locationName | Yes | Non-empty string |

### Evaluation Validation

| Field | Required | Rules |
|-------|----------|-------|
| purchaseProbability | Yes | Integer 0-100 |
| estimatedPurchaseDate | Yes | Valid date string YYYY-MM-DD |
| observations | Yes | Minimum 10 characters |
| requiresSatisfactionSurvey | Yes | Boolean |

### Return State Validation

| Field | Required | Rules |
|-------|----------|-------|
| finalMileage | Yes | Positive number |
| fuelLevelPercentage | Yes | Integer 0-100 |
| images | No | Array of valid URLs/base64 strings |

## Index File

```typescript
// src/app/core/models/index.ts

export * from './customer.model';
export * from './vehicle.model';
export * from './location.model';
export * from './digital-signature.model';
export * from './return-state.model';
export * from './image.model';
export * from './test-drive-form.model';
```
