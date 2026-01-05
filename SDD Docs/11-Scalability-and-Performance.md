# 11 Scalability and Performance

## API scaling
- Stateless NestJS containers on ECS.
- Horizontal scaling based on CPU/latency.

## Database
- RDS Multi-AZ with read replicas for reporting.
- Indexing for filters (status, brand, VIN, plate, location).

## Caching
- Optional Redis for survey versions and lookups.

## Large payload handling
- Limit base64 images and enforce total size constraints.
- Prefer S3 for large media in future iterations.

## Performance optimizations
- Pagination on list endpoints.
- Selective field projection for list responses.
- Compression for JSON responses.
