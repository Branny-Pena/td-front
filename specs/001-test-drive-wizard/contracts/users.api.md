# Users API Contract

**Base URL**: `http://localhost:3000`
**Resource**: `/users`

## Endpoints

### POST /users

Create a new customer (customer).

**Request Body**:
```json
{
  "firstName": "Ana",
  "lastName": "Lopez",
  "dni": "12345678",
  "phoneNumber": "999888777",
  "email": "ana@example.com"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| firstName | string | Yes | Customer's first name |
| lastName | string | Yes | Customer's last name |
| dni | string | Yes | National ID number |
| phoneNumber | string | No | Contact phone number |
| email | string | No | Email address |

**Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "Ana",
  "lastName": "Lopez",
  "dni": "12345678",
  "phoneNumber": "999888777",
  "email": "ana@example.com"
}
```

**Errors**:
- 400 Bad Request: Validation failed (extra fields or missing required fields)

---

### GET /users

List all users.

**Response** (200 OK):
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "Ana",
    "lastName": "Lopez",
    "dni": "12345678",
    "phoneNumber": "999888777",
    "email": "ana@example.com"
  }
]
```

---

### GET /users/:id

Get a specific customer by ID.

**Parameters**:
- `id` (UUID): Customer ID

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "Ana",
  "lastName": "Lopez",
  "dni": "12345678",
  "phoneNumber": "999888777",
  "email": "ana@example.com"
}
```

**Errors**:
- 404 Not Found: Customer not found

---

### PATCH /users/:id

Update an existing customer.

**Parameters**:
- `id` (UUID): Customer ID

**Request Body** (partial update):
```json
{
  "phoneNumber": "111222333"
}
```

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "Ana",
  "lastName": "Lopez",
  "dni": "12345678",
  "phoneNumber": "111222333",
  "email": "ana@example.com"
}
```

**Errors**:
- 400 Bad Request: Validation failed
- 404 Not Found: Customer not found
