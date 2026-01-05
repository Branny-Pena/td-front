# 07 Security Design

## Authentication and authorization
- JWT-based auth for all protected endpoints.
- Role-based access control for survey admin features.

## Transport security
- TLS enforced in qa/prod.
- HSTS enabled at edge.

## Data protection
- PII stored in PostgreSQL with least-privilege access.
- Encryption at rest (RDS) and in transit (TLS).
- S3 buckets configured with private ACLs and SSE.

## Input validation
- DTO validation with whitelist/forbid.
- Strict enum validation for brand/status.

## Logging and auditing
- Security events logged (login, token errors, admin actions).
- Audit fields on entities (createdAt, updatedAt, createdBy, updatedBy).

## Secrets management
- AWS Secrets Manager or SSM Parameter Store.
- Separate secrets per environment.

## Rate limiting
- API gateway or NestJS throttling for public survey endpoints.

## Threat mitigation
- CSRF: not applicable for JWT in Authorization header.
- XSS: encode output in SPA, avoid unsafe HTML.
- SQL injection: TypeORM parameterization.
- SSRF: restrict outbound hosts for email attachments.
