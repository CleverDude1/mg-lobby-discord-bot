

// ===== CONFIG =====
const API_URL = "https://martiangames.com/api/lobbychat";
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK; // put your webhook URL in Railway env vars
const API_TOKEN = process.env.MG_API_TOKEN; // put your MartianGames API token in Railway env vars
const POLL_INTERVAL = 60 * 1000; // 1 minute

let lastTimestamp = 0; // tracks latest message

// ===== FUNCTION TO SEND MESSAGE TO DISCORD =====
async function sendToDiscord(msg) {
  const content = `🎮 [${msg.game}] **${msg.nickname}**: ${msg.message}`;
  try {
    await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    console.log("Sent to Discord:", content);
  } catch (err) {
    console.error("Error sending to Discord:", err);
  }
}

// ===== FUNCTION TO GET LOBBY CHAT =====
async function pollLobbyChat() {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Bearer ${API_TOKEN}`,
      },
      body: "", // empty body is fine
    });

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("Unexpected API response:", data);
      return;
    }

    // initialize lastTimestamp on first run to avoid spamming old messages
    if (lastTimestamp === 0 && data.length > 0) {
      lastTimestamp = data[data.length - 1].timestamp;
      console.log("Initialized lastTimestamp:", lastTimestamp);
      return;
    }

    for (const msg of data) {
      if (msg.timestamp > lastTimestamp) {
        lastTimestamp = msg.timestamp;
        await sendToDiscord(msg);
      }
    }

  } catch (err) {
    console.error("Error fetching lobby chat:", err);
  }
}

// ===== START POLLING =====
console.log("Starting lobby chat bot...");
pollLobbyChat();
setInterval(pollLobbyChat, POLL_INTERVAL);
