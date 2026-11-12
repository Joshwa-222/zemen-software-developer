# Zemen Software Developer

A bilingual (English / Amharic) software studio website with a React frontend, Express API, MongoDB inquiry storage and a protected admin inbox.

## Features

- Responsive landing page with Home, About, Services, Work, Process and Contact sections
- English / Amharic language switch
- Project inquiry form with server-side validation
- MongoDB persistence for inquiries
- Admin sign-in using bcrypt password verification and JWT sessions
- Admin inbox for viewing recent project inquiries
- Production static hosting through the Express server

## Technology

React 18, Vite, plain CSS, Express, MongoDB / Mongoose, JSON Web Tokens and bcrypt.

## Requirements

- Node.js 18+
- MongoDB connection string (MongoDB Atlas or local MongoDB)

## Local setup

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. Copy `server/.env.example` to `.env` in the project root and set:
   - `MONGODB_URI`
   - `JWT_SECRET` (use a long, unique random value)
   - `ADMIN_PASSWORD_HASH` (bcrypt hash of your admin password)

3. Start development mode:

   ```bash
   npm run dev
   ```

   Vite runs on http://localhost:5173 and the API runs on http://localhost:5000. For local development, configure your Vite proxy if you want frontend requests to be forwarded to the API, or run the frontend and API behind a local reverse proxy. The included default Vite setup does not proxy API calls automatically.

4. Build and run production:

   ```bash
   npm run build
   NODE_ENV=production npm start
   ```

## Create an admin password hash

Run this locally after installing dependencies:

```bash
node -e "import('bcryptjs').then(async b => console.log(await b.hash('YOUR_PASSWORD_HERE', 12)))"
```

Put the printed hash in `ADMIN_PASSWORD_HASH`. Do not use the example text as a real password. Do not commit your `.env` file.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Server and database status |
| POST | `/api/inquiries` | Save a project inquiry |
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/inquiries` | List inquiries (JWT required) |

## Deployment

Deploy to a Node.js host that supports environment variables and persistent outbound access to MongoDB. Set `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, and `ADMIN_PASSWORD_HASH`. Build with `npm run build`; start with `npm start`.

## Important configuration notes

- The contact form requires a working MongoDB connection.
- The admin login is disabled until both the password hash and JWT secret are configured.
- Replace the placeholder email and social links in `src/App.jsx` with the studio's real contact details.
- The portfolio cards are presentation examples, not claims of completed client projects.
- Add rate limiting, CAPTCHA and email notifications before using the contact form for a high-traffic production site.
