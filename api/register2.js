// File: /api/register.js

const fetch = require('node-fetch');

const UPSTASH_URL = process.env.UPSTASH_URL;      // e.g., https://us1-xxxx.upstash.io
const UPSTASH_TOKEN = process.env.UPSTASH_TOKEN;  // from Upstash dashboard

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }
  let { name, email, psw } = req.body;

  // Basic server-side validation
  if (!name || name.length < 3 || name.length > 32) {
    res.status(400).json({ error: "Server: Invalid name." }); return;
  }
  if (!email || !email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
    res.status(400).json({ error: "Server: Invalid email format." }); return;
  }
  if (!psw || psw.length < 6) {
    res.status(400).json({ error: "Server: Weak password." }); return;
  }

  let key = 'user:' + name.toLowerCase().replace(/[^a-z0-9]/gi, "_") + ":" + Date.now();
  let payload = JSON.stringify({
    name,
    email,
    created_at: new Date().toISOString(),
  });

  let url = `${UPSTASH_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(payload)}`;
  let timestamp = new Date().toLocaleString();

  try {
    let upstash = await fetch(url, {
      method: "POST",
      headers: { Authorization: "Bearer " + UPSTASH_TOKEN }
    });
    let upstashResult = await upstash.json();

    // Return formatted result
    res.status(200).json({ name, email, timestamp });
  } catch(err) {
    res.status(500).json({ error: "Database error. Try again." });
  }
};
