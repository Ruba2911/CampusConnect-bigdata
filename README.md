# CampusConnect

CampusConnect is a campus feed and placement management app built for students, club admins, DA placement officers, and super admins.

## Features

- Student feed for campus posts, club events, workshops, announcements, placements, and internships.
- Student placement opt-in and event registration flow.
- Club admin profile page with club-wise uploaded posts.
- DA officer profile page with placement and internship posts.
- Role-based navigation for students, clubs, DA officers, and super admins.
- Super admin dashboard with student, club, DA, and combined analytics.
- MongoDB-backed authentication, posts, registrations, drives, and analytics.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Express
- MongoDB

## Roles

- `student`: Can view feed, placements, notifications, and register/apply.
- `club-admin`: Can create club posts and view club profile, registrations, and analytics.
- `da-officer`: Can create placement/internship posts and view DA profile, registrations, and analytics.
- `super-admin`: Can view dashboard, student analytics, club analytics, and DA analytics.

## Setup

Install dependencies:

```cmd
npm install
```

Create a local `.env` file from `.env.example`:

```cmd
copy .env.example .env
```

Default local MongoDB settings:

```env
MONGODB_URI=mongodb://localhost:27017/campusconnect
MONGODB_DB_NAME=campusconnect
PORT=4000
CLIENT_URL=http://localhost:8080,http://localhost:5173
VITE_API_URL=http://localhost:4000
```

Make sure MongoDB is running locally or update `MONGODB_URI` with your MongoDB Atlas connection string.

## Run Locally

Start the backend server:

```cmd
cd "C:\Users\RUBADEVI\Downloads\studentnexus-feed-main (2)\studentnexus-feed-main"
npm run server
```

Start the frontend in another terminal:

```cmd
cd "C:\Users\RUBADEVI\Downloads\studentnexus-feed-main (2)\studentnexus-feed-main"
npm run dev
```

Default URLs:

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:4000`
- Health check: `http://localhost:4000/api/health`

## Default Super Admin

The backend creates this account automatically if it does not exist:

```txt
Email: admin@gmail.com
Password: admin123
Role: super-admin
```

## Useful Commands

Build the frontend:

```cmd
npm run build
```

Run tests:

```cmd
npm run test
```

Run lint:

```cmd
npm run lint
```

## API Overview

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/signup`
- `GET /api/posts`
- `POST /api/posts`
- `GET /api/drives`
- `GET /api/analytics`
- `GET /api/admin/analytics`
- `GET /api/registrations`
- `POST /api/registrations`
- `DELETE /api/registrations`

## Notes

Existing records in MongoDB Compass remain until manually deleted from the database. The app no longer auto-seeds mock post or drive data.
