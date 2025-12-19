# Locations API Contract

**Base URL**: `http://localhost:3000`
**Resource**: `/locations`

## Endpoints

### POST /locations

Create a new location (dealership).

**Request Body**:
```json
{
  "locationName": "Lima Center"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| locationName | string | Yes | Name of the dealership/location |

**Response** (201 Created):
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "locationName": "Lima Center"
}
```

**Errors**:
- 400 Bad Request: Validation failed

---

### GET /locations

List all locations.

**Response** (200 OK):
```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "locationName": "Lima Center"
  }
]
```

---

### GET /locations/:id

Get a specific location by ID.

**Parameters**:
- `id` (UUID): Location ID

**Response** (200 OK):
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "locationName": "Lima Center"
}
```

**Errors**:
- 404 Not Found: Location not found
