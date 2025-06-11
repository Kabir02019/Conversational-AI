const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const cron = require('node-cron');
const Twilio = require('twilio');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(express.json());

// open database
let db;
(async () => {
  const dbFile = path.join(__dirname, '..', 'database', 'interviews.db');
  fs.mkdirSync(path.dirname(dbFile), { recursive: true });
  db = await open({ filename: dbFile, driver: sqlite3.Database });
  await db.exec(`CREATE TABLE IF NOT EXISTS interviews(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT,
    datetime TEXT,
    phone TEXT,
    status TEXT DEFAULT 'scheduled',
    transcription TEXT,
    score TEXT
  )`);
})();

const questions = {
  "Software Engineer": ["What is a linked list?", "Explain REST vs GraphQL"],
  "Product Manager": ["Tell me about a product you've launched", "How do you prioritize features?"],
  "Marketing Specialist": ["Describe a successful campaign", "How do you measure ROI?"],
};

function scheduleCall(id, phone, role, time) {
  const callTime = new Date(time).getTime();
  const now = Date.now();
  const delay = callTime - now;
  if (delay < 0) return; // past
  setTimeout(() => runInterview(id, phone, role), delay);
}

async function runInterview(id, phone, role) {
  const client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const questionList = questions[role] || [];
  const transcript = [];

  for (const q of questionList) {
    // fake call + record
    transcript.push(`${q} - answer`);
  }

  await db.run('UPDATE interviews SET status=?, transcription=?, score=? WHERE id=?',
    'completed', transcript.join('\n'), 'mock-score', id);
}

app.post('/schedule-interview', async (req, res) => {
  const { role, datetime, phone } = req.body;
  if (!role || !datetime || !phone) return res.status(400).json({ error: 'Missing fields' });
  try {
    const result = await db.run('INSERT INTO interviews(role, datetime, phone) VALUES(?,?,?)', [role, datetime, phone]);
    const id = result.lastID;
    scheduleCall(id, phone, role, datetime);
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: 'db error' });
  }
});

app.get('/interviews/:id', async (req, res) => {
  const row = await db.get('SELECT * FROM interviews WHERE id=?', [req.params.id]);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(row);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log('Server running on', PORT);
});
