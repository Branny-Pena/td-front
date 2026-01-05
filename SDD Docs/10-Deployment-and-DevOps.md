# 10 Deployment and DevOps

## Environments
- dev, qa, prod with isolated infrastructure and data.

## CI/CD pipeline
1) Lint + unit tests
2) Build Angular SPA
3) Build backend container
4) Security scanning (SAST, dependency audit)
5) Deploy to QA
6) Manual approval -> production

## Deployment flow (ECS)
```
Git -> CI -> Build -> Push to ECR -> ECS Deploy -> Health Checks
```

## Database migrations
- TypeORM migrations executed during deployment window.
- Rollback strategy using backward migrations.

## Configuration
- Environment variables stored in AWS SSM/Secrets Manager.
- Feature flags by environment.

## Observability
- CloudWatch logs and alarms
- Structured log dashboards
