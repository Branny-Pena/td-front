# 12 Assumptions and Constraints

## Assumptions
- JWT auth is required in production.
- Brand theming is enforced across UI and survey responses.
- Backend validation strictly rejects extra fields.

## Constraints
- Survey versions immutable after responses exist.
- Survey responses immutable after submission.
- Return photos limited to 1..3 with total size <= 2 MB.
- Status transitions: pending when vehicle not confirmed.
- Environments are isolated (dev/qa/prod).
