# Vehicles API Contract

**Base URL**: `http://localhost:3000`
**Resource**: `/vehicles`

## Endpoints

### POST /vehicles

Create a new vehicle.

**Request Body**:
```json
{
  "make": "Toyota",
  "model": "Corolla",
  "licensePlate": "ABC-123",
  "vinNumber": "VIN123456789"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| make | string | Yes | Vehicle manufacturer |
| model | string | Yes | Vehicle model |
| licensePlate | string | Yes | License plate number |
| vinNumber | string | No | Vehicle Identification Number |

**Response** (201 Created):
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "make": "Toyota",
  "model": "Corolla",
  "licensePlate": "ABC-123",
  "vinNumber": "VIN123456789"
}
```

**Errors**:
- 400 Bad Request: Validation failed

---

### GET /vehicles

List all vehicles.

**Response** (200 OK):
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "make": "Toyota",
    "model": "Corolla",
    "licensePlate": "ABC-123",
    "vinNumber": "VIN123456789"
  }
]
```

---

### GET /vehicles/:id

Get a specific vehicle by ID.

**Parameters**:
- `id` (UUID): Vehicle ID

**Response** (200 OK):
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "make": "Toyota",
  "model": "Corolla",
  "licensePlate": "ABC-123",
  "vinNumber": "VIN123456789"
}
```

**Errors**:
- 404 Not Found: Vehicle not found
