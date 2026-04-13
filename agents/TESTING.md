# Testing Guide for AI Agents

## Minimum Test Expectations

- Unit test validation and sanitization helpers.
- Integration test role-restricted endpoints for 401/403/200 flows.
- Verify bad payloads return deterministic 4xx responses.

## Priority Scenarios

- Admin-only endpoints reject lead/member/anonymous users.
- Duplicate team names and duplicate emails are blocked.
- Sanitization strips unsafe control characters.

## Regression Checklist

- New route handlers are covered by role tests.
- Error responses do not leak internal stack details.
- Type checks and lint pass before merge.
