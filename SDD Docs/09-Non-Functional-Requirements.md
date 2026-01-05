# 09 Non-Functional Requirements

## Availability
- API uptime target: 99.9% in prod.
- Multi-AZ RDS.

## Performance
- P95 API response < 300 ms for core endpoints.
- Form submission < 2 s end-to-end.

## Scalability
- Stateless API containers scaled horizontally.

## Reliability
- Idempotent survey response creation.
- Transactional updates for form + return state.

## Usability
- Spanish UI, enterprise design parity.
- Mobile-first responsiveness.

## Accessibility
- Keyboard navigation and focus states.
- Contrast compliant with WCAG AA.

## Maintainability
- Layered architecture, clear module boundaries.
- Typed DTOs and strict validation.
