# Academic Admin Panel

Frontend operations panel for TutorsPath / TutorsNext (admin, sales, writers).

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

App runs at `http://localhost:5174`

## Environment

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (default `http://localhost:5000/api/v1`) |

## Login

Use a seeded admin or staff account from the backend:

- Email from `DEFAULT_ADMIN_EMAIL`
- Password from `DEFAULT_ADMIN_PASSWORD`

## Backend CORS

Add the admin origin to backend `.env`:

```
CLIENT_URLS=...,http://localhost:5174
```

## Features

- Dashboard stats
- Orders list / detail (assign writer, update status, edit price)
- Students list
- Staff management (admin only)
- Role-based access: admin, sales agent, writer
