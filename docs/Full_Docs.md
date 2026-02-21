# Graduation Project — Full Documentation

This consolidated document combines architecture, API reference, OpenAPI spec, and diagrams.

## Table of contents
- Architecture
- API Reference (summary)
- OpenAPI (link to full YAML)
- Diagrams (Mermaid files)
- How to render diagrams and build PDF

---

## Architecture
See `docs/ARCHITECTURE.md` for the full architecture overview. Key points:
- Backend: Django + Django REST Framework (`core/`) — models, serializers, viewsets, admin, channels consumers.
- Frontend: React + Vite (`graduation_project_frontend/`), communicates with backend via Axios at `/api`.
- Realtime: Django Channels consumers at `ws/notifications/` and `ws/approvals/`.
- Database: MariaDB / MySQL (configured in `settings.py`).

---

## API Reference (summary)
See `docs/API_REFERENCE.md` for short examples. Endpoints include (base: `/api/`):
- `/api/projects/`  — list, create, retrieve, update projects
- `/api/groups/` — list groups (role-based), create group requests, custom actions (`create-by-supervisor`, `add_member`)
- `/api/supervisor/groups/` — groups where current user is supervisor
- `/api/invitations/`, `/api/notifications/`, `/api/approvals/`, `/api/roles/`, `/api/user-roles/`
- Helpers: `/api/dropdown-data/`, `/api/bulk-fetch/`, `/api/dean-stats/`
- Approval actions: `/api/approvals/{id}/approve/`, `/api/approvals/{id}/reject/`

Authentication: `Authorization: Bearer <token>`; WebSockets use Channels and must authenticate similarly (see Channels config).

---

## OpenAPI
A more complete OpenAPI YAML for the current endpoints is available at:

- `docs/openapi_full.yaml`

This spec includes endpoints, parameter shapes, and basic component schemas for `Project`, `Group`, and common objects. It is suitable for importing into Swagger UI or Postman (may need adjustment for exact schemas).

---

## Diagrams (Mermaid)
Mermaid sources are in `diagrams/mermaid/`:
- `system_overview.mmd` — system overview flowchart
- `create_group_sequence.mmd` — sequence diagram for creating a group
- `websocket_flow.mmd` — WebSocket notification flow

I recommend rendering them with `mmdc` (mermaid-cli) to PNG/SVG as described below.

---

## Render diagrams & create PDF (recommended steps)
1. Install mermaid-cli, pandoc, and a PDF engine (wkhtmltopdf or TeX Live). Example (Windows):

```powershell
npm install -g @mermaid-js/mermaid-cli
choco install pandoc
choco install wkhtmltopdf
```

2. Render diagrams to SVG/PNG:

```bash
mmdc -i diagrams/mermaid/system_overview.mmd -o docs/system_overview.svg
mmdc -i diagrams/mermaid/create_group_sequence.mmd -o docs/create_group_sequence.svg
mmdc -i diagrams/mermaid/websocket_flow.mmd -o docs/websocket_flow.svg
```

3. Generate a single consolidated HTML and convert to PDF:

```bash
pandoc docs/Full_Docs.md docs/ARCHITECTURE.md docs/API_REFERENCE.md -o docs/Full_Docs.html --standalone
wkhtmltopdf docs/Full_Docs.html docs/Full_Docs.pdf
```

Or use Pandoc with LaTeX engine:

```bash
pandoc docs/Full_Docs.md docs/ARCHITECTURE.md docs/API_REFERENCE.md -o docs/Full_Docs.pdf --pdf-engine=xelatex
```

---

## Next steps I can do for you
- Run an automated extraction to expand the OpenAPI spec further (I can parse DRF routers and serializers to add more precise schemas).
- Generate Markdown pages per endpoint with example requests/responses.
- Help you render diagrams to SVG/PNG here if you give permission to run a renderer, or provide a script you can run locally.

Tell me which next step you want.