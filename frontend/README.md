# Consultant CRUD Frontend (Angular)

Angular frontend for the consultant CRUD job-test project.

## Setup

```bash
npm install
```

## Run

```bash
npm start
```

The app runs on `http://localhost:4200` and proxies `/api/*` requests to `http://localhost:8080` using `proxy.conf.json`.

## Build

```bash
npm run build
```

## Manual Verification Checklist

1. Start backend: `cd .. && mvn spring-boot:run`
2. Start frontend: `npm start`
3. Open `http://localhost:4200`
4. Verify the following flows:
   - Consultants list loads from API.
   - Create consultant success path.
   - Create validation errors (frontend + backend `400`).
   - Duplicate email conflict (`409`).
   - Edit consultant success path.
   - Edit validation errors.
   - Delete confirmation and success path.
   - Delete not-found handling (`404`).
   - Responsive layout on small screens.
   - `Esc` key closes panel/dialog when idle.

## Notes

- No automated tests were added for this submission by request.
- UI is built with custom SCSS (no UI component framework).
