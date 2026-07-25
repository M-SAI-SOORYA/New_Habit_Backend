# Daymark Backend

A small, maintainable REST API for the Daymark habit tracker. It uses Node.js,
Express, MongoDB, and Mongoose. Authentication is intentionally omitted because
this deployment is designed for one trusted user.

## Why this stack

- **Node.js + Express:** minimal API layer and the same language as the React app.
- **MongoDB + Mongoose:** maps naturally to habits and date-keyed completion data.
- **Plain validation and services:** avoids unnecessary framework complexity for a
  personal application while keeping business logic out of routes.

## Project structure

```text
backend/
  src/
    config/       Environment and MongoDB setup
    constants/    Shared habit constraints
    controllers/  HTTP request and response handling
    middleware/   404 and centralized error handling
    models/       Mongoose schemas
    routes/       REST route definitions
    services/     Habit persistence and analytics logic
    utils/        Date, error, and async helpers
    validation/   Request validation
    app.js        Express application
    server.js     Database connection and process lifecycle
  test/           Unit tests
```

## Requirements

- Node.js 20 or newer
- MongoDB 7 or newer, either local or MongoDB Atlas

## Setup

From `F:\New Habit Tracker\backend`:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Edit `.env` if MongoDB is not running locally:

```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/daymark
CLIENT_ORIGINS=http://localhost:5173,http://localhost:3000
```

For MongoDB Atlas, replace `MONGODB_URI` with the Atlas connection string. Do
not commit `.env`; it is ignored.

## API

All successful JSON responses use:

```json
{ "success": true, "data": {} }
```

Errors use:

```json
{ "success": false, "error": { "message": "..." } }
```

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | API and database health |
| `GET` | `/api/habits` | List all habits |
| `POST` | `/api/habits` | Create a habit |
| `GET` | `/api/habits/:habitId` | Get one habit |
| `PATCH` | `/api/habits/:habitId` | Edit a habit |
| `DELETE` | `/api/habits/:habitId` | Delete a habit and its history |
| `PUT` | `/api/habits/:habitId/completions/:date` | Set a day's completion |
| `GET` | `/api/habits/:habitId/analytics` | Get calculated analytics |

### Create a habit

```http
POST /api/habits
Content-Type: application/json

{
  "name": "Morning meditation",
  "category": "mindfulness",
  "color": "#8b5cf6",
  "frequency": 7
}
```

`createdAt` defaults to today. An optional `completions` object can be supplied
when migrating existing localStorage data:

```json
{
  "createdAt": "2026-07-01",
  "completions": {
    "2026-07-01": true,
    "2026-07-02": true
  }
}
```

### Update a completion

The operation is idempotent, so retrying it is safe:

```http
PUT /api/habits/6881fc53cf31da12d245be90/completions/2026-07-25
Content-Type: application/json

{ "completed": true }
```

Send `{ "completed": false }` to remove that completion.

### Analytics

```http
GET /api/habits/6881fc53cf31da12d245be90/analytics
```

The response includes current and longest streaks, completion rate, completion
and missed-day totals, days tracked, last-30-day rate, consistency score, best
streak period, and most missed weekday.

Use `?through=2026-07-25` for deterministic historical analytics.

## Scripts

```powershell
npm run dev    # Development server with Node watch mode
npm start      # Production server
npm test       # Unit tests
npm run check  # Syntax check
```

## Frontend connection

The API returns habits in the frontend's existing shape, including `id`,
`createdAt`, and the date-keyed `completions` object. The frontend can therefore
replace its localStorage reads and writes with these endpoints without changing
the analytics UI data shape.

Because there is no authentication, do not expose this API directly to the
public internet. Keep it on a private device/network or protect access at the
deployment layer.
