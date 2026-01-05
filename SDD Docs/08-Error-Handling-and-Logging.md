# 08 Error Handling and Logging

## Frontend
- Validation errors surfaced inline and with toast notifications.
- Retry prompts for transient failures.
- Route guards redirect when required state is missing.

## Backend
- Central exception filter returning consistent error format.
- Validation errors: 400 with field details.
- Not found: 404.
- Conflict: 409 for immutable entities.
- Server errors: 500 with correlation ID.

## Logging
- Structured logs (JSON) in backend.
- Correlation ID per request.
- Logs shipped to CloudWatch.

## Metrics
- HTTP latency, error rates, throughput.
- Email send success/failure counts.
- Survey submission success rate.
