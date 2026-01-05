# 03 Technology Stack

## Frontend
| Layer | Technology | Purpose |
|---|---|---|
| SPA Framework | Angular (TypeScript) | UI, routing, stateful wizard flows |
| Styling | Tailwind CSS | Utility-first styling and theming |
| UI Patterns | SAP Fundamental style | Consistent enterprise UI patterns |
| Scanning | ZXing | Barcode/QR scanning in browser |

## Backend
| Layer | Technology | Purpose |
|---|---|---|
| Framework | NestJS (TypeScript) | REST API, layered architecture |
| ORM | TypeORM | Entity mapping and migrations |
| Validation | class-validator + pipes | DTO validation, whitelist/forbid |
| Auth | JWT | Stateless authentication |
| Email | Nodemailer | SMTP delivery |
| Docs | OpenAPI (recommended) | API contract publication |

## Database
| Technology | Purpose |
|---|---|
| PostgreSQL | Primary data store |

## Cloud and Infrastructure
| Service | Purpose |
|---|---|
| AWS ECS | Container orchestration for API |
| AWS RDS | Managed PostgreSQL |
| AWS S3 | Asset storage (images, PDFs as needed) |
| AWS CloudWatch | Logs and metrics |

## Environment Separation
- dev / qa / prod
- Isolated databases, secrets, and deployment pipelines per environment
