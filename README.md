# Institute Space Booking App

Educational full-stack starter app for booking institute spaces such as classrooms, computer labs, meeting rooms and workshops.

## Stack
- React + Vite frontend
- Node.js + Express API
- MySQL 8+ / Amazon RDS database

## Features
- Browse/filter active spaces by type and text
- View confirmed bookings by date and space
- Create bookings with overlap detection
- Cancel an existing booking
- Parameterised SQL queries and basic input validation

## Run locally
1. Install MySQL 8+ and Node.js 20+.
2. Create schema/sample spaces: `mysql -u root -p < database/schema.sql`
3. Backend: `cd backend`, copy `.env.example` to `.env`, set DB credentials, run `npm install`, then `npm run dev`.
4. Frontend in another terminal: `cd frontend`, run `npm install`, then `npm run dev`. Open the Vite URL, usually `http://localhost:5173`.
5. Test `http://localhost:3000/api/health`.

## API
- `GET /api/health`
- `GET /api/spaces?type=classroom&search=A101`
- `GET /api/bookings?date=2026-11-09`
- `GET /api/bookings/:id`
- `POST /api/bookings` with `spaceId, bookedBy, email, purpose, bookingDate, startTime, endTime`
- `PATCH /api/bookings/:id/cancel`

## ER model
See `database/er-model.md` (Mermaid ER diagram). `SPACES 1:N BOOKINGS`; `USERS 1:N BOOKINGS` with optional `user_id` on booking. Demo bookings capture name/email directly and do not require login.

## AWS deployment notes
Keep RDS in private subnets. Allow TCP 3306 only from the backend EC2 security group. Allow backend port 3000 only from the frontend/reverse-proxy EC2 security group. Configure Nginx to serve the React build and proxy `/api/` to the backend's private address. Store secrets in environment variables or AWS Secrets Manager; do not commit `.env`.

## Important limitation
This is a learning prototype, not a production-ready booking system. It does not implement login/role-based authorisation, email confirmation, or admin management. Add those before any real institutional use and review privacy/security requirements.
