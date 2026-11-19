# UdaanX

AI-powered interview preparation tailored to your experience and target role.

## Run locally

1. Start MongoDB locally, or prepare a MongoDB Atlas connection string.
2. If `backend/.env` does not exist, copy `.env.example` to `.env`. Set `MONGODB_URL` to your database connection string and replace `JWT_SECRET_KEY` with a private random value.
3. If `frontend/.env` does not exist, copy `.env.example` to `.env`.
4. Install dependencies with `npm install` in both `backend` and `frontend`.
5. Start the backend with `npm run dev` in `backend`, then start Vite with `npm run dev` in `frontend`.

The backend listens on port `3000` by default. During development, Vite proxies `/api` requests to it, so the frontend can run on any available local port. For a production frontend hosted separately from the backend, set `VITE_API_URL` to the backend's full `/api` URL and configure the backend's `CLIENT_URL` to the frontend origin.
