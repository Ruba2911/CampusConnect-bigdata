# Backend Server

This repository now includes a small Express backend for MongoDB integration.

## Setup

1. Copy `.env.example` to `.env`.
2. Update `MONGODB_URI` to your MongoDB Compass / Atlas connection string.
3. Optionally set `CLIENT_URL` if your frontend runs on a different host.

## Run

```bash
npm install
npm run server
```

The backend starts on `http://localhost:4000` by default.

## API Endpoints

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/signup`
- `GET /api/registrations`
- `POST /api/registrations`
- `DELETE /api/registrations`
