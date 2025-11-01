const fetch = require('node-fetch');

const UPSTASH_URL = process.env.UPSTASH_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_TOKEN;

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }
  // Get all keys by prefix
  // Upstash Redis REST API: KEYS user:*
  let url = `${UPSTASH_URL}/keys/user:*`;
  try {
    let upstashKeys = await fetch(url, {
      method: "GET",
      headers: { Authorization: "Bearer " + UPSTASH_TOKEN }
    });
    let keys = await upstashKeys.json();

    // Then get values for each key
    let promises = (keys.result || []).map(async k => {
      let vurl = `${UPSTASH_URL}/get/${encodeURIComponent(k)}`;
      let vres = await fetch(vurl, {
        method: "GET",
        headers: { Authorization: "Bearer " + UPSTASH_TOKEN }
      });
      let vdata = await vres.json();
      return vdata.result ? JSON.parse(vdata.result) : null;
    });

    let registrations = (await Promise.all(promises)).filter(r => r);
    res.status(200).json(registrations);
  } catch(err) {
    res.status(500).json({ error: "Database error. Try again." });
  }
};
