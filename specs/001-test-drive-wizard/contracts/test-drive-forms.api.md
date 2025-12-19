# Test Drive Forms API Contract

**Base URL**: `http://localhost:3000`
**Resource**: `/test-drive-forms`

## Endpoints

### POST /test-drive-forms

Create a new test drive form. This is the main endpoint for submitting or saving drafts.

**Request Body**:
```json
{
  "customerId": "550e8400-e29b-41d4-a716-446655440000",
  "vehicleId": "660e8400-e29b-41d4-a716-446655440001",
  "locationId": "770e8400-e29b-41d4-a716-446655440002",
  "signatureData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...",
  "purchaseProbability": 75,
  "estimatedPurchaseDate": "2025-12-30",
  "observations": "Customer prefers the red color variant",
  "requiresSatisfactionSurvey": true,
  "status": "submitted",
  "returnState": {
    "finalMileage": 12345,
    "fuelLevelPercentage": 70,
    "images": ["https://example.com/return1.jpg"]
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| customerId | string (UUID) | Yes | Reference to Customer |
| vehicleId | string (UUID) | Yes | Reference to Vehicle |
| locationId | string (UUID) | Yes | Reference to CurrentLocation |
| signatureData | string | No | Base64 encoded signature image |
| purchaseProbability | number | Yes | 0-100 percentage |
| estimatedPurchaseDate | string | Yes | YYYY-MM-DD format |
| observations | string | Yes | Minimum 10 characters |
| requiresSatisfactionSurvey | boolean | Yes | Whether survey is required |
| status | string | Yes | "draft" or "submitted" |
| returnState | object | No | Nested return state data |
| returnState.finalMileage | number | Yes* | Required if returnState provided |
| returnState.fuelLevelPercentage | number | Yes* | 0-100, required if returnState provided |
| returnState.images | string[] | No | Array of image URLs |

**Response** (201 Created):
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "purchaseProbability": 75,
  "estimatedPurchaseDate": "2025-12-30",
  "observations": "Customer prefers the red color variant",
  "requiresSatisfactionSurvey": true,
  "status": "submitted",
  "createdAt": "2025-12-11T10:30:00.000Z",
  "updatedAt": "2025-12-11T10:30:00.000Z",
  "customer": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "Ana",
    "lastName": "Lopez",
    "dni": "12345678",
    "phoneNumber": "999888777",
    "email": "ana@example.com"
  },
  "vehicle": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "make": "Toyota",
    "model": "Corolla",
    "licensePlate": "ABC-123",
    "vinNumber": "VIN123456789"
  },
  "location": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "locationName": "Lima Center"
  },
  "digitalSignature": {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "signatureData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
  },
  "returnState": {
    "id": "aa0e8400-e29b-41d4-a716-446655440005",
    "finalMileage": 12345,
    "fuelLevelPercentage": 70,
    "images": [
      {
        "id": "bb0e8400-e29b-41d4-a716-446655440006",
        "url": "https://example.com/return1.jpg"
      }
    ]
  }
}
```

**Errors**:
- 400 Bad Request: Validation failed (missing required fields, extra fields, invalid format)
- 404 Not Found: Referenced customer/vehicle/location not found

---

### GET /test-drive-forms

List all test drive forms.

**Query Parameters** (optional):
- `status`: Filter by status ("draft" or "submitted")

**Response** (200 OK):
```json
[
  {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "purchaseProbability": 75,
    "estimatedPurchaseDate": "2025-12-30",
    "observations": "Customer prefers the red color variant",
    "requiresSatisfactionSurvey": true,
    "status": "submitted",
    "createdAt": "2025-12-11T10:30:00.000Z",
    "updatedAt": "2025-12-11T10:30:00.000Z",
    "customer": { ... },
    "vehicle": { ... },
    "location": { ... },
    "digitalSignature": { ... },
    "returnState": { ... }
  }
]
```

---

### GET /test-drive-forms/:id

Get a specific test drive form by ID.

**Parameters**:
- `id` (UUID): Test drive form ID

**Response** (200 OK):
Same structure as single item in POST response.

**Errors**:
- 404 Not Found: Form not found

---

### PATCH /test-drive-forms/:id

Update an existing test drive form. Used for updating drafts or modifying submitted forms.

**Parameters**:
- `id` (UUID): Test drive form ID

**Request Body** (partial update):
```json
{
  "status": "submitted",
  "observations": "Updated observations text here"
}
```

All fields from CreateTestDriveFormDto are optional for partial updates.

**Important**: When `returnState` is provided, it replaces the entire return state including images array.

**Response** (200 OK):
Updated form object (same structure as POST response).

**Errors**:
- 400 Bad Request: Validation failed
- 404 Not Found: Form not found

---

### DELETE /test-drive-forms/:id

Delete a test drive form.

**Parameters**:
- `id` (UUID): Test drive form ID

**Response** (204 No Content)

**Errors**:
- 404 Not Found: Form not found
