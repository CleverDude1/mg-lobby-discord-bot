const fs = require("fs");

const API_URL = "https://martiangames.com/api/lobbychat";
const TOKEN = process.env.API_TOKEN;
const WEBHOOK = process.env.DISCORD_WEBHOOK;

let lastTimestamp = 0;


async function fetchChat() {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `last_id=${lastId}`
    });

    const data = await res.json();

    if (!data || !Array.isArray(data)) return;

    for (const msg of data) {
      if (msg.id > lastId) {
        lastId = msg.id;

        await sendToDiscord(msg);
      }
    }

    console.log("Checked chat. Last ID:", lastId);

  } catch (err) {
    console.error("Error:", err);
  }
}

async function sendToDiscord(msg) {
  const content = `**${msg.nickname}**: ${msg.message}`;

  await fetch(WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content })
  });
}

setInterval(fetchChat, 60000); // 1 minute
