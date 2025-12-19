# Tasks: Test Drive Wizard Application

**Input**: Design documents from `/specs/001-test-drive-wizard/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Tests**: Not explicitly requested in specification - tests omitted.

**Organization**: Tasks are grouped by customer story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which customer story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single Angular project**: `src/app/` at repository root
- Models: `src/app/core/models/`
- Services: `src/app/core/services/`
- Shared components: `src/app/shared/components/`
- Feature components: `src/app/features/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and Angular configuration

- [ ] T001 Create Angular project folder structure per plan.md in src/app/
- [ ] T002 Install dependencies: @fundamental-ngx/core, tailwindcss, @fortawesome/angular-fontawesome in package.json
- [ ] T003 [P] Configure Tailwind CSS with content paths in tailwind.config.js
- [ ] T004 [P] Add Tailwind directives and Fundamental styles import in src/styles.css
- [ ] T005 [P] Configure Font Awesome icons (faCar, faIdCard, faQrcode, faArrowRight, faArrowLeft) in src/app/app.config.ts
- [ ] T006 Configure provideHttpClient with interceptors in src/app/app.config.ts
- [ ] T007 Setup lazy-loaded routes for all 6 wizard steps in src/app/app.routes.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY customer story can be implemented

**⚠️ CRITICAL**: No customer story work can begin until this phase is complete

### Models (Parallelizable)

- [ ] T008 [P] Create Customer interface and CreateUserDto in src/app/core/models/customer.model.ts
- [ ] T009 [P] Create Vehicle interface and CreateVehicleDto in src/app/core/models/vehicle.model.ts
- [ ] T010 [P] Create CurrentLocation interface and CreateLocationDto in src/app/core/models/location.model.ts
- [ ] T011 [P] Create DigitalSignature interface in src/app/core/models/digital-signature.model.ts
- [ ] T012 [P] Create ReturnState interface and CreateReturnStateDto in src/app/core/models/return-state.model.ts
- [ ] T013 [P] Create Image interface in src/app/core/models/image.model.ts
- [ ] T014 [P] Create TestDriveForm interface, CreateTestDriveFormDto, UpdateTestDriveFormDto in src/app/core/models/test-drive-form.model.ts
- [ ] T015 Create models barrel export in src/app/core/models/index.ts

### Core Services (Sequential - depends on models)

- [ ] T016 Create API base URL interceptor in src/app/core/interceptors/api-base-url.interceptor.ts
- [ ] T017 [P] Create UsersApiService with createUser, getUsers methods in src/app/core/services/users-api.service.ts
- [ ] T018 [P] Create VehiclesApiService with createVehicle method in src/app/core/services/vehicles-api.service.ts
- [ ] T019 [P] Create LocationsApiService with createLocation method in src/app/core/services/locations-api.service.ts
- [ ] T020 [P] Create TestDriveFormsApiService with create, update, get methods in src/app/core/services/test-drive-forms-api.service.ts
- [ ] T021 Create NotificationService for success/error messages with Fundamental message strips in src/app/core/services/notification.service.ts
- [ ] T022 Create TestDriveStateService with signals for customer, vehicle, location, signatureData, evaluation, returnState in src/app/core/services/test-drive-state.service.ts

### Shared Components (Parallelizable after models)

- [ ] T023 [P] Create HeaderComponent with app logo, title "DiveDrive", step indicator text in src/app/shared/components/header/
- [ ] T024 [P] Create StepIndicatorComponent showing progress 1-6 with current step highlighted in src/app/shared/components/step-indicator/
- [ ] T025 [P] Create ContentCardComponent as centered card container with responsive width in src/app/shared/components/content-card/
- [ ] T026 [P] Create BottomNavComponent with Back/Next buttons, sticky positioning in src/app/shared/components/bottom-nav/
- [ ] T027 [P] Create SignaturePadComponent with Canvas drawing, Clear and Accept buttons in src/app/shared/components/signature-pad/

### Wizard Layout

- [ ] T028 Create WizardLayoutComponent combining header, step-indicator, content area, bottom-nav in src/app/shared/layouts/wizard-layout/

### Route Guard

- [ ] T029 Create StepGuard checking state completeness before allowing navigation in src/app/core/guards/step-guard.ts

**Checkpoint**: Foundation ready - customer story implementation can now begin in parallel

---

## Phase 3: Customer Story 1 - Complete Test Drive Registration Flow (Priority: P1) 🎯 MVP

**Goal**: Enable sales reps to complete full 6-step wizard and submit TestDriveForm to backend

**Independent Test**: Walk through all 6 wizard steps with valid data, click Submit, verify TestDriveForm created with status "submitted"

### Implementation for Customer Story 1

- [ ] T030 [US1] Create CustomerComponent with form fields (firstName, lastName, dni, phoneNumber, email) using Fundamental inputs in src/app/features/customer/customer.component.ts
- [ ] T031 [US1] Create CustomerComponent template with form layout, validation messages in src/app/features/customer/customer.component.html
- [ ] T032 [US1] Create CustomerComponent styles for mobile-first responsive layout in src/app/features/customer/customer.component.css
- [ ] T033 [US1] Implement customer form submission: validate, call UsersApiService.createUser, update state, navigate to step 2

- [ ] T034 [US1] Create VehicleComponent with form fields (make, model, licensePlate, vinNumber, locationName) in src/app/features/vehicle/vehicle.component.ts
- [ ] T035 [US1] Create VehicleComponent template with form layout in src/app/features/vehicle/vehicle.component.html
- [ ] T036 [US1] Create VehicleComponent styles in src/app/features/vehicle/vehicle.component.css
- [ ] T037 [US1] Implement vehicle form submission: call VehiclesApiService and LocationsApiService, update state, navigate to step 3

- [ ] T038 [US1] Create SignatureSummaryComponent displaying customer and vehicle summary cards in src/app/features/signature-summary/signature-summary.component.ts
- [ ] T039 [US1] Create SignatureSummaryComponent template with summary display and SignaturePad integration in src/app/features/signature-summary/signature-summary.component.html
- [ ] T040 [US1] Create SignatureSummaryComponent styles in src/app/features/signature-summary/signature-summary.component.css
- [ ] T041 [US1] Implement signature acceptance: capture base64 from SignaturePad, store in state, enable navigation

- [ ] T042 [US1] Create EvaluationComponent with purchaseProbability slider, estimatedPurchaseDate picker, observations textarea, requiresSatisfactionSurvey checkbox in src/app/features/evaluation/evaluation.component.ts
- [ ] T043 [US1] Create EvaluationComponent template with Fundamental form controls in src/app/features/evaluation/evaluation.component.html
- [ ] T044 [US1] Create EvaluationComponent styles in src/app/features/evaluation/evaluation.component.css
- [ ] T045 [US1] Implement evaluation validation (observations min 10 chars), store data in state, navigate to step 5

- [ ] T046 [US1] Create VehicleReturnComponent with finalMileage input, fuelLevelPercentage slider, file uploader in src/app/features/vehicle-return/vehicle-return.component.ts
- [ ] T047 [US1] Create VehicleReturnComponent template with Fundamental form controls in src/app/features/vehicle-return/vehicle-return.component.html
- [ ] T048 [US1] Create VehicleReturnComponent styles in src/app/features/vehicle-return/vehicle-return.component.css
- [ ] T049 [US1] Implement file upload: convert images to base64 URLs, store in state, navigate to step 6

- [ ] T050 [US1] Create ConfirmationComponent displaying full summary (customer, vehicle, location, signature preview, evaluation, return status) in src/app/features/confirmation/confirmation.component.ts
- [ ] T051 [US1] Create ConfirmationComponent template with summary sections and action buttons in src/app/features/confirmation/confirmation.component.html
- [ ] T052 [US1] Create ConfirmationComponent styles in src/app/features/confirmation/confirmation.component.css
- [ ] T053 [US1] Implement Submit button: build CreateTestDriveFormDto from state, call TestDriveFormsApiService.create with status "submitted"
- [ ] T054 [US1] Implement success/error handling: show notification, display confirmation message

- [ ] T055 [US1] Wire up BottomNavComponent in each step: disable Next until form valid, emit navigation events
- [ ] T056 [US1] Implement Back button navigation preserving all state across steps

**Checkpoint**: At this point, Customer Story 1 should be fully functional - complete wizard flow works end-to-end

---

## Phase 4: Customer Story 2 - Customer Data Entry with ID Scanning (Priority: P2)

**Goal**: Add "Scan ID" button to pre-fill customer form fields with simulated data

**Independent Test**: Click "Scan ID" button, verify all customer fields are pre-populated with mock data

### Implementation for Customer Story 2

- [ ] T057 [US2] Add "Scan ID" button with Font Awesome faIdCard icon to CustomerComponent header in src/app/features/customer/customer.component.html
- [ ] T058 [US2] Implement scanId() method in CustomerComponent simulating ID scan with mock data (Ana, Lopez, 12345678, etc.) in src/app/features/customer/customer.component.ts
- [ ] T059 [US2] Add loading state while "scanning" with brief delay for UX in src/app/features/customer/customer.component.ts

**Checkpoint**: Customer step now supports both manual entry and ID scanning

---

## Phase 5: Customer Story 3 - Vehicle and Location Assignment (Priority: P2)

**Goal**: Add "Scan QR/Car" button to pre-fill vehicle form fields with simulated data

**Independent Test**: Click "Scan QR/Car" button, verify vehicle fields are pre-populated with mock data

### Implementation for Customer Story 3

- [ ] T060 [US3] Add "Scan QR/Car" button with Font Awesome faQrcode icon to VehicleComponent header in src/app/features/vehicle/vehicle.component.html
- [ ] T061 [US3] Implement scanVehicle() method in VehicleComponent simulating QR scan with mock data (Toyota, Corolla, ABC-123, etc.) in src/app/features/vehicle/vehicle.component.ts
- [ ] T062 [US3] Add loading state while "scanning" with brief delay for UX in src/app/features/vehicle/vehicle.component.ts

**Checkpoint**: Vehicle step now supports both manual entry and QR scanning

---

## Phase 6: Customer Story 4 - Digital Signature Capture (Priority: P2)

**Goal**: Enhance signature canvas with responsive sizing and accessibility

**Independent Test**: Draw signature, click Clear to reset, draw again, click Accept - signature captured as base64

### Implementation for Customer Story 4

- [ ] T063 [US4] Enhance SignaturePadComponent Canvas with responsive width based on container in src/app/shared/components/signature-pad/signature-pad.component.ts
- [ ] T064 [US4] Add aria-label and keyboard focus support to signature canvas in src/app/shared/components/signature-pad/signature-pad.component.html
- [ ] T065 [US4] Style Clear and Accept buttons with Fundamental button classes in src/app/shared/components/signature-pad/signature-pad.component.css

**Checkpoint**: Signature capture is responsive and accessible

---

## Phase 7: Customer Story 5 - Test Drive Evaluation Entry (Priority: P3)

**Goal**: Polish evaluation form with proper Fundamental slider and date picker integration

**Independent Test**: Set probability slider to 75, select date, enter 10+ char observations, check survey box - all values stored

### Implementation for Customer Story 5

- [ ] T066 [US5] Enhance purchaseProbability slider with Fundamental fd-slider, show value label in src/app/features/evaluation/evaluation.component.html
- [ ] T067 [US5] Configure fd-date-picker for estimatedPurchaseDate with YYYY-MM-DD format output in src/app/features/evaluation/evaluation.component.ts
- [ ] T068 [US5] Add character counter for observations textarea showing current/minimum count in src/app/features/evaluation/evaluation.component.html

**Checkpoint**: Evaluation form has polished UX with proper Fundamental components

---

## Phase 8: Customer Story 6 - Vehicle Return Documentation (Priority: P3)

**Goal**: Polish file upload with image preview and multiple file support

**Independent Test**: Upload 2 photos, see previews, verify both URLs stored in state

### Implementation for Customer Story 6

- [ ] T069 [US6] Enhance file uploader to support multiple images using Fundamental fd-file-uploader in src/app/features/vehicle-return/vehicle-return.component.html
- [ ] T070 [US6] Implement image preview grid showing uploaded photos as thumbnails in src/app/features/vehicle-return/vehicle-return.component.html
- [ ] T071 [US6] Add remove button for each uploaded image in preview in src/app/features/vehicle-return/vehicle-return.component.ts
- [ ] T072 [US6] Enhance fuelLevelPercentage with Fundamental slider showing percentage value in src/app/features/vehicle-return/vehicle-return.component.html

**Checkpoint**: Vehicle return documentation has full image upload/preview functionality

---

## Phase 9: Customer Story 7 - Draft Save and Resume (Priority: P4)

**Goal**: Enable saving wizard progress as draft and resuming later

**Independent Test**: Partially complete wizard, click Save Draft, refresh page, verify wizard resumes from saved state

### Implementation for Customer Story 7

- [ ] T073 [US7] Add "Save Draft" button to BottomNavComponent visible on steps 2-6 in src/app/shared/components/bottom-nav/bottom-nav.component.html
- [ ] T074 [US7] Implement saveDraft() in TestDriveStateService: build partial DTO, call TestDriveFormsApiService.create with status "draft" in src/app/core/services/test-drive-state.service.ts
- [ ] T075 [US7] Store draftFormId in state after successful draft save in src/app/core/services/test-drive-state.service.ts
- [ ] T076 [US7] Implement loadDraft() to fetch existing draft and populate state signals in src/app/core/services/test-drive-state.service.ts
- [ ] T077 [US7] Add draft detection on app initialization: check for existing drafts, prompt to resume in src/app/app.component.ts
- [ ] T078 [US7] Update Submit to use PATCH when draftFormId exists in ConfirmationComponent in src/app/features/confirmation/confirmation.component.ts

**Checkpoint**: Users can save partial progress and resume later

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting multiple customer stories

- [ ] T079 Add PdfService with generateSummaryPdf() method using jsPDF in src/app/core/services/pdf.service.ts
- [ ] T080 Implement "Generate PDF" button in ConfirmationComponent calling PdfService in src/app/features/confirmation/confirmation.component.ts
- [ ] T081 Add EmailService stub with sendSummaryEmail() method ready for backend integration in src/app/core/services/email.service.ts
- [ ] T082 Implement "Send by Email" button in ConfirmationComponent (simulated for MVP) in src/app/features/confirmation/confirmation.component.ts
- [ ] T083 [P] Add loading spinners to all API call buttons across all components
- [ ] T084 [P] Implement error handling with customer-friendly messages in NotificationService
- [ ] T085 [P] Verify all form labels have proper for/id linkage for accessibility
- [ ] T086 [P] Verify all icon-only buttons have aria-label attributes
- [ ] T087 [P] Test keyboard navigation through entire wizard flow
- [ ] T088 [P] Test mobile responsiveness at 320px width breakpoint
- [ ] T089 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all customer stories
- **Customer Stories (Phase 3-9)**: All depend on Foundational phase completion
  - US1 must complete first (provides base wizard flow)
  - US2-US7 can proceed in parallel after US1
- **Polish (Phase 10)**: Depends on US1 minimum, ideally all stories complete

### Customer Story Dependencies

- **Customer Story 1 (P1)**: Can start after Foundational - No other dependencies (MVP)
- **Customer Story 2 (P2)**: Requires US1 CustomerComponent exists
- **Customer Story 3 (P2)**: Requires US1 VehicleComponent exists
- **Customer Story 4 (P2)**: Requires US1 SignaturePadComponent exists
- **Customer Story 5 (P3)**: Requires US1 EvaluationComponent exists
- **Customer Story 6 (P3)**: Requires US1 VehicleReturnComponent exists
- **Customer Story 7 (P4)**: Requires US1 complete wizard flow

### Within Each Customer Story

- Models before services
- Services before components
- Template before styles (for component files)
- Core functionality before enhancements

### Parallel Opportunities

- All Setup tasks T003-T005 can run in parallel
- All Model tasks T008-T014 can run in parallel
- All API Service tasks T017-T020 can run in parallel
- All Shared Component tasks T023-T027 can run in parallel
- US2-US4 can run in parallel after US1 completes
- US5-US6 can run in parallel after US1 completes
- All Polish tasks T083-T088 can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch all models in parallel:
Task: "Create Customer interface in src/app/core/models/customer.model.ts"
Task: "Create Vehicle interface in src/app/core/models/vehicle.model.ts"
Task: "Create CurrentLocation interface in src/app/core/models/location.model.ts"
Task: "Create DigitalSignature interface in src/app/core/models/digital-signature.model.ts"
Task: "Create ReturnState interface in src/app/core/models/return-state.model.ts"
Task: "Create Image interface in src/app/core/models/image.model.ts"
Task: "Create TestDriveForm interface in src/app/core/models/test-drive-form.model.ts"

# Then launch all shared components in parallel:
Task: "Create HeaderComponent in src/app/shared/components/header/"
Task: "Create StepIndicatorComponent in src/app/shared/components/step-indicator/"
Task: "Create ContentCardComponent in src/app/shared/components/content-card/"
Task: "Create BottomNavComponent in src/app/shared/components/bottom-nav/"
Task: "Create SignaturePadComponent in src/app/shared/components/signature-pad/"
```

---

## Implementation Strategy

### MVP First (Customer Story 1 Only)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T029)
3. Complete Phase 3: Customer Story 1 (T030-T056)
4. **STOP and VALIDATE**: Test complete wizard flow end-to-end
5. Deploy MVP if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add Customer Story 1 → Test full wizard → Deploy MVP!
3. Add Customer Story 2 + 3 → Test scanning features → Deploy
4. Add Customer Story 4 + 5 + 6 → Test polish features → Deploy
5. Add Customer Story 7 → Test draft save/resume → Deploy
6. Complete Polish → Final release

### Parallel Team Strategy

With multiple developers:

1. All complete Setup + Foundational together
2. Developer A: Customer Story 1 (critical path)
3. Once US1 Step 1 done:
   - Developer B: Customer Story 2 (scan ID)
4. Once US1 Step 2 done:
   - Developer C: Customer Story 3 (scan QR)
5. Continue parallel work as components become available

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific customer story
- Each Angular component = 3 files (.ts, .html, .css) per constitution
- Use OnPush change detection in all components
- Use @if/@for in templates, NOT *ngIf/*ngFor
- Use signals for state, computed() for derived values
- All API calls must match backend DTOs exactly (no extra fields)
- Verify keyboard accessibility on each component
- Test mobile responsiveness at each checkpoint
