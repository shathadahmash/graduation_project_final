# Project Architecture — Graduation Project

## Overview
This project consists of:
- Backend: Django (Django REST Framework) in `core/` app — models, serializers, viewsets, admin, channels consumers.
- Frontend: React + Vite in `graduation_project_frontend/` — pages, components, `src/services/api.ts` uses Axios pointing at `http://127.0.0.1:8000/api`.
- Real-time: Django Channels consumers exposing WebSocket endpoints (`ws/notifications/`, `ws/approvals/`).
- Database: MariaDB/MySQL (configured in `settings.py`).

## Key Backend Components
- Models: `core/models.py` — users, groups, projects, progress patterns, approvals, notifications.
- Serializers: `core/serializers.py` — define JSON shapes and validation.
- Views: `core/views.py` — DRF ViewSets and function views, custom `@action` endpoints.
- URLs: `core/urls.py` — DRF router registers endpoints exposed under `/api/`.
- Admin: `core/admin.py` — Django admin registrations and inlines.
- Migrations: `core/migrations/` — schema transformations; some migrations converted `Project.state` from string to FK (see 0021).
- Channels: `core/consumers.py`, `core/routing.py` — WebSocket consumers for push updates.

## Frontend Interaction
- Axios instance (`graduation_project_frontend/src/services/api.ts`) sets `baseURL: /api` and attaches `Authorization: Bearer <token>` when token present.
- Frontend calls endpoints to list/create/update projects, groups, invitations, approvals, etc.
- For notifications, frontend opens a WebSocket to `/ws/notifications/` and receives JSON payloads in real-time.

## Authentication & Permissions
- Token-based auth: token saved in `localStorage` and set on Axios `Authorization` header.
- Backend enforces role-based permissions via `PermissionManager` in `core/permissions.py`.
- Some actions (e.g., group creation by supervisor) require specific roles.

## Data Flow Examples
- Create Group (via frontend): frontend -> POST `/api/groups/` -> `GroupCreateSerializer` validates and creates `Project` + `GroupCreationRequest` + `GroupMemberApproval` rows -> notifications queued/sent -> Response with `request_id`.
- Supervisor adds group members: POST `/api/groups/<id>/add_member/` -> `GroupViewSet.add_member` checks permission -> updates `GroupMembers`.

## Notes and Known Pitfalls
- Keep frontend fields in sync with model migrations (e.g., `Project.type` or `college` may have been removed/changed by migrations).
- Migrations that change a column type (string -> FK) require data migration to convert existing values; see `core/migrations/0021_*`.
- WebSocket auth must be configured so `scope['user']` is the authenticated user (Channels configuration in `settings.py`).

---
For detailed endpoints and diagrams see `docs/API_REFERENCE.md` and `diagrams/`.