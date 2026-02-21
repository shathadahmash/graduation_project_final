# API Reference (summary)

Base URL: `http://<host>:<port>/api/`

Authentication: `Authorization: Bearer <token>` (Axios sets this automatically if saved token exists)

## Router endpoints (registered in `core/urls.py`)
- `GET /api/projects/` — list projects (paginated). Uses `ProjectSerializer`.
- `POST /api/projects/` — create project (requires proper fields/permissions).
- `GET /api/projects/{id}/` — retrieve project details.
- `PUT/PATCH /api/projects/{id}/` — update project.

- `GET /api/groups/` — list groups visible to the user (role-based in `GroupViewSet.get_queryset`).
- `POST /api/groups/` — create group request (serializer `GroupCreateSerializer`).
- `POST /api/groups/create-by-supervisor/` — create group directly by a supervisor (custom action).
- `POST /api/groups/{id}/add_member/` — add members (custom action).

- `GET /api/supervisor/groups/` — groups where current user is a supervisor (ReadOnlyModelViewSet).

- `GET/POST /api/invitations/` — manage `GroupInvitation` objects.
- `GET/POST /api/notifications/` — list/create notifications (NotificationLog / Notification endpoints).
- `GET/POST /api/approvals/` — approval requests; actions: `/api/approvals/{id}/approve/`, `/api/approvals/{id}/reject/`.
- `GET /api/dropdown-data/` — helper endpoint for frontend selects (universities, colleges, departments, programs).
- `GET /api/bulk-fetch/` — helper to fetch multiple resources in one request.
- `GET /api/dean-stats/` — aggregated statistics endpoint.

## Example cURL
List projects:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://127.0.0.1:8000/api/projects/"
```
Create group (simplified):
```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"group_name":"My Group","student_ids":[1,2],"department_id":3,"college_id":1,"project_title":"My P","project_type":"Internal","project_description":"Desc"}' \
  "http://127.0.0.1:8000/api/groups/"
```

## WebSockets
- `ws://<host>/ws/notifications/` — connect with authenticated user; server will push JSON messages like `{type: 'notification', notification: {...}}` and `{type: 'unread_count', count: N}`.
- `ws://<host>/ws/approvals/` — approval-related real-time messages.

## Important Serializer shapes (high-level)
- `ProjectSerializer` returns: `project_id, title, state, created_by (user object), start_date, end_date, description, college/department names`.
- `GroupSerializer` returns: `group_id, group_name, project, department, members[], supervisors[], members_count`.

## Errors and status codes
- Validation errors: `400` with JSON `{'field': ['message']}` or `{'error':'message'}`.
- Unauthorized: `401` / `403` depending on auth/permissions.
- Server error: `500` with stack trace only in debug.

---
Full OpenAPI spec is provided in `docs/openapi.yaml` (partial, core endpoints).