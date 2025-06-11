# Interviewer.AI

Simple full-stack proof of concept for an AI powered phone interviewer.

## Setup

```
cd backend
cp .env.example .env    # add your Twilio credentials
npm install
npm start
```

The server creates a SQLite database file in `./database/interviews.db` on first
run. Ensure this directory is writable.

In a separate terminal run the frontend:

```
cd frontend/frontend-app
npm install
npm run dev
```

Then open `http://localhost:3000` in the browser.
