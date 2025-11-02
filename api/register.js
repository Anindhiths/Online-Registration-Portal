const fetch = require('node-fetch');
const UPSTASH_URL = process.env.UPSTASH_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_TOKEN;

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }
  
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return res.status(500).json({ 
      error: "Environment variables not configured",
      hasUrl: !!UPSTASH_URL,
      hasToken: !!UPSTASH_TOKEN
    });
  }
  
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  let body = "";
  await new Promise((resolve, reject) => {
    req.on("data", chunk => { body += chunk });
    req.on("end", resolve);
    req.on("error", reject);
  });

  let data;
  try {
    data = JSON.parse(body);
  } catch (e) {
    res.status(400).json({ error: "Invalid JSON body." });
    return;
  }

  let { name, email, psw } = data;
  if (!name || name.length < 3 || name.length > 32) {
    res.status(400).json({ error: "Server: Invalid name." }); 
    return;
  }
  if (!email || !email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
    res.status(400).json({ error: "Server: Invalid email format." }); 
    return;
  }
  if (!psw || psw.length < 6) {
    res.status(400).json({ error: "Server: Weak password." }); 
    return;
  }

  let key = 'user:' + name.toLowerCase().replace(/[^a-z0-9]/gi, "_") + ":" + Date.now();
  let payload = {
    name,
    email,
    created_at: new Date().toISOString(),
  };

  // FIX: Use the correct Upstash REST API format
  // Send data as JSON array: ["SET", "key", "value"]
  let url = `${UPSTASH_URL}`;
  let timestamp = new Date().toLocaleString();

  try {
    let upstash = await fetch(url, {
      method: "POST",
      headers: { 
        "Authorization": "Bearer " + UPSTASH_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(["SET", key, JSON.stringify(payload)])
    });
    
    let upstashResult = await upstash.json();
    
    // Check if the SET operation was successful
    if (upstashResult.error) {
      console.error("Upstash error:", upstashResult.error);
      res.status(500).json({ error: "Database error. Try again." });
      return;
    }

    res.status(200).json({ name, email, timestamp });
  } catch(err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Database error. Try again." });
  }
};
