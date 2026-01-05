# 06 API Design

## Standards
- REST, JSON
- Versioning: `/api/v1` prefix recommended
- Content-Type: application/json
- Date/time: ISO-8601 (UTC)
- Errors: RFC 7807-like structure
- Pagination: cursor or offset/limit

### Error format
```json
{
  "type": "https://api.example.com/errors/validation",
  "title": "Validation error",
  "status": 400,
  "detail": "licensePlate is required",
  "instance": "/api/v1/vehicles"
}
```

### Pagination format
```json
{
  "data": [ ... ],
  "meta": { "limit": 25, "offset": 0, "total": 250 }
}
```

## Endpoints (core)

### Test Drive Forms
- POST /test-drive-forms
- GET /test-drive-forms
  - query: status, brand, customerId, vehicleId, vehicleLicensePlate, vehicleVinNumber, vehicleLocation
- GET /test-drive-forms/:id
- PATCH /test-drive-forms/:id
- DELETE /test-drive-forms/:id
- GET /test-drive-forms/:id/pdf
- POST /test-drive-forms/:id/email

### Vehicles
- POST /vehicles
- POST /vehicles/find-or-create
- POST /vehicles/qr-code
- GET /vehicles
- GET /vehicles/:id
- PATCH /vehicles/:id
- DELETE /vehicles/:id

### Customers
- POST /customers
- GET /customers
- GET /customers/:id
- PATCH /customers/:id
- DELETE /customers/:id

### Surveys
- POST /surveys
- PATCH /surveys/:id (status=ready)
- GET /surveys/active?brand=...
- POST /surveys/:id/versions
- GET /surveys/:id/versions
- GET /surveys/:id/versions/current
- GET /survey-versions/:versionId
- POST /survey-versions/:versionId/questions

### Survey Responses
- POST /survey-responses
- POST /survey-responses/:id/answers
- GET /survey-responses/:id
- GET /survey-responses?status=...&surveyId=...&surveyVersionId=...

### Reports
- POST /reports/test-drive-forms/excel-email

## Idempotency and constraints
- POST /survey-responses is idempotent by (surveyVersionId, testDriveFormIdentifier).
- Submitting answers twice returns 409 Conflict.

## Authentication
- JWT in Authorization header: Bearer <token>
