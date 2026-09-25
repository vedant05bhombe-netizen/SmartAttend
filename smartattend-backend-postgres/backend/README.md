# SmartAttend — Spring Boot Backend

Face-recognition attendance system backend. Talks to PostgreSQL for storage and to the
FastAPI face-recognition service (InsightFace) for embeddings and live attendance.

## Run

Requires Java 17+, Maven, and a PostgreSQL instance running locally (create a `smartattend`
database), or override `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`.

```bash
mvn spring-boot:run
```

Tables are created/updated automatically on boot (`spring.jpa.hibernate.ddl-auto=update`).

Runs on `http://localhost:8080/api`.

On first boot it seeds:
- Organization `SYSTEM`
- Admin `fastapi@system.com` / `fastapi123` — this is the account your FastAPI
  `face_service.py` logs in as (`SPRING_AUTH_LOGIN`), so keep it as-is unless you
  change the credentials in both places.

## Key endpoints

| Method | Path | Used by |
|---|---|---|
| POST | /api/auth/org/signup | Frontend — create org + first admin |
| POST | /api/auth/admin/join | Frontend — join org as admin via org code |
| POST | /api/auth/student/signup | Frontend — student self-signup via org code |
| POST | /api/auth/login | Frontend + FastAPI service |
| GET  | /api/class-sections | Admin — list class sections |
| POST | /api/class-sections | Admin — create class section |
| POST | /api/subjects | Admin — create subject |
| POST | /api/students | Admin — add a student |
| GET  | /api/students/admin/face/org/{orgId} | **FastAPI** — fetch students + embeddings |
| PATCH | /api/students/admin/{id}/face-encoding | **FastAPI** — save embeddings after `/register-face` |
| POST | /api/sessions/start | Admin — start a lecture |
| POST | /api/sessions/{id}/end | Admin — end a lecture |
| GET  | /api/sessions/active | **FastAPI** — find the active session for a class |
| POST | /api/attendance/face/mark | **FastAPI** — mark attendance after a confident match |
| GET  | /api/attendance/me | Student — own attendance history |
| GET  | /api/attendance?classSectionId= | Admin — attendance report |

All endpoints except `/auth/**` and `/health` require `Authorization: Bearer <jwt>`.
