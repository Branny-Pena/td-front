# Feature Specification: Test Drive Wizard Application

**Feature Branch**: `001-test-drive-wizard`
**Created**: 2025-12-11
**Status**: Draft
**Input**: Multi-step Angular application to manage vehicle test-drive flows for a dealership

## Customer Scenarios & Testing *(mandatory)*

### Customer Story 1 - Complete Test Drive Registration Flow (Priority: P1)

A dealership sales representative needs to register a new customer for a test drive, capture their information, assign a vehicle, collect a digital signature for liability, evaluate the test drive experience, document the vehicle return condition, and submit the complete form to the system.

**Why this priority**: This is the core business flow that delivers the primary value of the application. Without this complete journey, the application serves no purpose. All other features depend on this foundational workflow.

**Independent Test**: Can be fully tested by walking through all 6 wizard steps with valid data and submitting. Delivers a complete test drive record in the system.

**Acceptance Scenarios**:

1. **Given** a sales rep opens the application, **When** they complete all 6 steps with valid data and click Submit, **Then** a TestDriveForm record is created with status "submitted" and all related data (customer, vehicle, location, signature, evaluation, return state) is persisted.

2. **Given** a sales rep is on any step (2-6), **When** they click the Back button, **Then** they return to the previous step with all previously entered data preserved.

3. **Given** a sales rep has incomplete required fields on any step, **When** they attempt to proceed to the next step, **Then** the Next button remains disabled and validation errors are displayed.

4. **Given** a sales rep completes the final submission, **When** the form is successfully saved, **Then** a confirmation screen is displayed with options to generate PDF or send by email.

---

### Customer Story 2 - Customer Data Entry with ID Scanning (Priority: P2)

A sales rep needs to quickly capture customer information, optionally using an ID scan feature to pre-fill form fields, reducing manual data entry time and errors.

**Why this priority**: Customer registration is the first step and can operate independently. The scanning feature provides significant UX improvement for high-volume dealerships.

**Independent Test**: Can be tested by completing Step 1 only. Successfully creates/updates a Customer record in the backend and stores the customer ID for subsequent steps.

**Acceptance Scenarios**:

1. **Given** a sales rep is on Step 1 (Customer Info), **When** they enter firstName, lastName, and dni (all required fields), **Then** the form becomes valid and the Next button is enabled.

2. **Given** a sales rep clicks "Scan ID" button, **When** the scan simulation completes, **Then** all customer fields are pre-populated with mock data.

3. **Given** valid customer data is entered, **When** the sales rep clicks Next, **Then** the system calls POST /users API and stores the returned customer.id in application state.

4. **Given** a customer with the same dni already exists, **When** the sales rep completes Step 1, **Then** the existing customer record is retrieved and reused (no duplicate created).

---

### Customer Story 3 - Vehicle and Location Assignment (Priority: P2)

A sales rep needs to assign a specific vehicle to the test drive and record the current location/dealership where the test drive originates.

**Why this priority**: Vehicle assignment is essential for test drive tracking and can be tested independently once a customer exists.

**Independent Test**: Can be tested after completing Step 1. Successfully creates Vehicle and CurrentLocation records and stores their IDs.

**Acceptance Scenarios**:

1. **Given** a sales rep is on Step 2 (Vehicle Info), **When** they enter make, model, licensePlate (required) and locationName, **Then** the form becomes valid.

2. **Given** a sales rep clicks "Scan QR/Car" button, **When** the scan simulation completes, **Then** vehicle fields are pre-populated with mock data.

3. **Given** valid vehicle and location data is entered, **When** the sales rep clicks Next, **Then** the system calls POST /vehicles and POST /locations APIs and stores both IDs.

---

### Customer Story 4 - Digital Signature Capture (Priority: P2)

A sales rep needs to capture the customer's digital signature acknowledging test drive terms and conditions before the vehicle is released.

**Why this priority**: Digital signature provides legal protection for the dealership and is a critical compliance step.

**Independent Test**: Can be tested on Step 3 by drawing a signature on the canvas and accepting it. The signature data is stored in application state as base64.

**Acceptance Scenarios**:

1. **Given** a sales rep is on Step 3 (Pre-Summary & Signature), **When** the screen loads, **Then** a summary of customer and vehicle data is displayed along with a blank signature canvas.

2. **Given** the signature canvas is blank, **When** the sales rep attempts to proceed, **Then** the Next button remains disabled.

3. **Given** a customer draws on the signature canvas, **When** they click "Clear", **Then** the canvas is reset to blank.

4. **Given** a customer draws on the signature canvas, **When** they click "Accept Signature", **Then** the signature data is captured as base64 and the Next button becomes enabled.

---

### Customer Story 5 - Test Drive Evaluation Entry (Priority: P3)

After the test drive completes, the sales rep needs to record evaluation data including purchase probability, estimated purchase date, observations, and whether a satisfaction survey is needed.

**Why this priority**: Evaluation data provides business intelligence but the test drive can technically be recorded without it.

**Independent Test**: Can be tested on Step 4 by entering all evaluation fields. Data is stored in application state for final submission.

**Acceptance Scenarios**:

1. **Given** a sales rep is on Step 4 (Evaluation), **When** the screen loads, **Then** a slider for purchaseProbability (0-100), date picker for estimatedPurchaseDate, textarea for observations, and checkbox for requiresSatisfactionSurvey are displayed.

2. **Given** all required evaluation fields are completed (probability, date, observations with min 10 chars), **When** the sales rep clicks Next, **Then** the evaluation data is stored and navigation proceeds to Step 5.

3. **Given** observations text is less than 10 characters, **When** the sales rep attempts to proceed, **Then** a validation error is shown and Next remains disabled.

---

### Customer Story 6 - Vehicle Return Documentation (Priority: P3)

After the test drive, the sales rep needs to document the vehicle return condition including final mileage, fuel level, and photos of the vehicle.

**Why this priority**: Return documentation protects the dealership from disputes but can be optional for quick test drives.

**Independent Test**: Can be tested on Step 5 by entering mileage, fuel level, and uploading photos. Data is stored for final submission.

**Acceptance Scenarios**:

1. **Given** a sales rep is on Step 5 (Return Status), **When** the screen loads, **Then** numeric inputs for finalMileage and fuelLevelPercentage and a file uploader for photos are displayed.

2. **Given** valid return data is entered, **When** the sales rep clicks Next, **Then** the return state data is stored in application state.

3. **Given** photos are uploaded, **When** processing completes, **Then** the photos are converted to URL format ready for submission.

---

### Customer Story 7 - Draft Save and Resume (Priority: P4)

A sales rep needs to save their progress as a draft at any point and resume later, preventing data loss if interrupted.

**Why this priority**: Important for real-world usage but not essential for core functionality.

**Independent Test**: Can be tested by partially completing the wizard, saving as draft, refreshing the page, and resuming from saved state.

**Acceptance Scenarios**:

1. **Given** a sales rep has partially completed the wizard, **When** they choose to save as draft, **Then** a TestDriveForm is created/updated with status "draft".

2. **Given** a draft exists, **When** the sales rep returns to the application, **Then** they can resume from where they left off with all data restored.

---

### Edge Cases

- What happens when the backend API is unavailable during Step 1 customer creation?
  - Display error message, keep form data, allow retry
- What happens when a duplicate licensePlate is submitted in Step 2?
  - Display validation error from backend, allow correction
- What happens when file upload fails in Step 5?
  - Display error, allow removal and re-upload, do not block progress if photos are optional
- What happens when the signature canvas is not supported on older browsers?
  - Display fallback message indicating minimum browser requirements
- What happens when the customer navigates away mid-wizard?
  - Prompt to save as draft before leaving

## Requirements *(mandatory)*

### Functional Requirements

**Wizard Structure & Navigation**
- **FR-001**: System MUST display a 6-step progress indicator showing current step and total steps
- **FR-002**: System MUST display step number (e.g., "STEP 1 / 6") in the header area
- **FR-003**: Step 1 MUST show only a "Next" button in the bottom navigation
- **FR-004**: Steps 2-6 MUST show both "Back" and "Next" buttons in the bottom navigation
- **FR-005**: The bottom navigation bar MUST remain sticky/visible at all times
- **FR-006**: "Next" button MUST be disabled until the current step's form is valid and any required API calls succeed

**Step 1 - Customer Data**
- **FR-007**: System MUST capture firstName (required), lastName (required), dni (required), phoneNumber (optional), email (optional)
- **FR-008**: System MUST provide a "Scan ID" button that simulates pre-filling customer fields
- **FR-009**: Upon valid submission, system MUST call POST /users API and store returned customer.id
- **FR-010**: System SHOULD support looking up existing users by dni to prevent duplicates

**Step 2 - Vehicle Data**
- **FR-011**: System MUST capture make (required), model (required), licensePlate (required), vinNumber (optional), locationName (required)
- **FR-012**: System MUST provide a "Scan QR/Car" button that simulates pre-filling vehicle fields
- **FR-013**: Upon valid submission, system MUST call POST /vehicles API and store returned vehicle.id
- **FR-014**: Upon valid submission, system MUST call POST /locations API and store returned location.id

**Step 3 - Pre-Summary & Signature**
- **FR-015**: System MUST display a summary of customer and vehicle information from previous steps
- **FR-016**: System MUST provide a drawable signature canvas
- **FR-017**: System MUST provide "Clear" and "Accept Signature" buttons for the signature canvas
- **FR-018**: System MUST store accepted signature as base64 string in application state
- **FR-019**: Navigation MUST be blocked until a signature is accepted

**Step 4 - Test Drive Evaluation**
- **FR-020**: System MUST capture purchaseProbability via slider (0-100 range, required)
- **FR-021**: System MUST capture estimatedPurchaseDate via date picker (YYYY-MM-DD format, required)
- **FR-022**: System MUST capture observations via textarea (minimum 10 characters, required)
- **FR-023**: System MUST capture requiresSatisfactionSurvey via checkbox (boolean)

**Step 5 - Vehicle Return Status**
- **FR-024**: System MUST capture finalMileage via numeric input (required)
- **FR-025**: System MUST capture fuelLevelPercentage via numeric input or slider (0-100 range, required)
- **FR-026**: System MUST provide a file uploader for vehicle photos
- **FR-027**: System MUST convert uploaded photos to URL format for API submission

**Step 6 - Final Confirmation**
- **FR-028**: System MUST display complete summary of all collected data including customer, vehicle, location, signature preview, evaluation, and return status
- **FR-029**: System MUST provide a "Submit" button to create TestDriveForm via POST /test-drive-forms
- **FR-030**: System MUST provide a "Generate PDF" button for document generation
- **FR-031**: System MUST provide a "Send by Email" button for sending the form
- **FR-032**: System MUST support saving as draft (status: "draft") at any point
- **FR-033**: System MUST support updating existing forms via PATCH /test-drive-forms/:id

**Cross-Cutting Requirements**
- **FR-034**: All forms MUST use the dealership's existing backend API at base URL http://localhost:3000
- **FR-035**: All entity IDs MUST be UUIDs
- **FR-036**: Request bodies MUST exactly match backend DTOs with no extra fields
- **FR-037**: Application state MUST persist across step navigation
- **FR-038**: System MUST display loading indicators during API calls
- **FR-039**: System MUST display customer-friendly error messages for API failures

### Key Entities

- **Customer**: Represents a customer taking a test drive. Attributes: id (UUID), firstName, lastName, dni, phoneNumber, email. Created in Step 1.

- **Vehicle**: Represents the vehicle being test driven. Attributes: id (UUID), make, model, licensePlate, vinNumber. Created in Step 2.

- **CurrentLocation**: Represents the dealership/location where the test drive originates. Attributes: id (UUID), locationName. Created in Step 2.

- **DigitalSignature**: Represents the customer's acceptance signature. Attributes: id (UUID), signatureData (base64). Captured in Step 3, submitted inline with TestDriveForm.

- **ReturnState**: Represents the vehicle condition upon return. Attributes: id (UUID), finalMileage, fuelLevelPercentage, images (array of URLs). Captured in Step 5, submitted inline with TestDriveForm.

- **Image**: Represents a photo of the vehicle. Attributes: id (UUID), url. Associated with ReturnState.

- **TestDriveForm**: The master record linking all test drive data. Attributes: id (UUID), customerId, vehicleId, locationId, signatureData, purchaseProbability, estimatedPurchaseDate, observations, requiresSatisfactionSurvey, status (draft/submitted), returnState (nested), timestamps. Created in Step 6.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Sales representatives can complete a full test drive registration (all 6 steps) in under 5 minutes with pre-populated scan data, or under 10 minutes with manual entry.

- **SC-002**: 95% of form submissions succeed on first attempt when all required fields are properly filled.

- **SC-003**: Users can navigate backward through the wizard without losing any previously entered data.

- **SC-004**: The application remains usable on mobile devices with screen widths as small as 320px.

- **SC-005**: All interactive elements (buttons, form fields, navigation) are accessible via keyboard navigation.

- **SC-006**: Form validation errors are displayed within 500ms of customer interaction.

- **SC-007**: Draft forms can be saved and resumed across browser sessions.

- **SC-008**: The progress indicator accurately reflects the current step (1-6) at all times.

- **SC-009**: The signature canvas captures customer input with sufficient fidelity for legal acceptance (clear, non-pixelated rendering).

- **SC-010**: Photo uploads complete successfully for images up to 5MB each.

## Assumptions

- The backend API at http://localhost:3000 is available and implements the documented endpoints
- Users have modern browsers that support HTML5 Canvas for signature capture
- Photo uploads will be handled as base64 or external URL references (not direct file storage)
- The "Scan ID" and "Scan QR/Car" features are simulations for MVP; actual scanner integration is future scope
- PDF generation and email sending functionality may depend on backend services
- The application does not require customer authentication (sales reps are trusted users)
