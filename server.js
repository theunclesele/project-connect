/**
 * PROJECT CONNECT — server.js
 *
 * A small backend that sits between your website and Twilio.
 * It holds your Auth Token privately (never sent to the browser) and
 * exposes one endpoint the website's "Send Live WhatsApp Test" button
 * can call to trigger a REAL WhatsApp message.
 *
 * SETUP:
 * 1. npm install express cors
 * 2. Set your Auth Token as an environment variable (never hardcode it):
 *      export TWILIO_AUTH_TOKEN="paste_it_here"
 * 3. Run:  node server.js
 * 4. It listens on http://localhost:3001
 *
 * Your website (running separately, e.g. on http://localhost:5173 via
 * Vite) calls this server instead of calling Twilio directly.
 */

import express from "express";
import cors from "cors";

const app = express();
app.use(cors({
  origin: "*", // Allow all origins for testing
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 3001;

// ---- Twilio config ----
const ACCOUNT_SID = "AC176c63ba7d4ae91d5fd6723ba6c969c4"; // safe to hardcode, not secret
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN; // NEVER hardcode this one, NEVER send to browser
const FROM_NUMBER = "whatsapp:+17372508034"; // your Twilio sandbox number

// The default message that will be sent if the frontend doesn't provide one.
const DEFAULT_MESSAGE = `Tonight's Parent Check-In ❤️ - Project CONNECT

Hi! Have you done these today?
1. Homework checked? Reply H
2. Reading 20min? Reply R
3. Connection talk? Reply C

Just reply with letters, e.g. 'H R'`;

// ------------------------

if (!AUTH_TOKEN) {
  console.error(
    "❌ TWILIO_AUTH_TOKEN is not set. Run:\n" +
    '   export TWILIO_AUTH_TOKEN="your_auth_token_here"\n' +
    "   before starting this server."
  );
  process.exit(1);
}

/**
 * POST /api/send-test
 * Body (optional): { "to": "+2348066143230", "message": "custom text" }
 */
app.post("/api/send-test", async (req, res) => {
  const to = req.body.to || "+2348066143230";
  // Use the custom message from the frontend, OR fall back to our default check-in message
  const messageBody = req.body.message || DEFAULT_MESSAGE;

  const toWhatsApp = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`;

  const params = new URLSearchParams({
    To: toWhatsApp,
    From: FROM_NUMBER,
    Body: messageBody
  });

  try {
    const twilioRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params
    });

    const data = await twilioRes.json();

    if (!twilioRes.ok) {
      console.error("❌ Twilio rejected the send:", data);
      return res.status(twilioRes.status).json({ success: false, error: data });
    }

    console.log(`✅ Sent to ${toWhatsApp}: ${data.sid}`);
    return res.json({ success: true, sid: data.sid, status: data.status, to: data.to });
  } catch (err) {
    console.error("❌ Server error calling Twilio:", err);
    return res.status(500).json({ success: false, error: "Server error, check server logs" });
  }
});

// Health check — visit http://localhost:3001/api/health to confirm it's running
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "PROJECT CONNECT backend is running" });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`   Send test: POST http://localhost:${PORT}/api/send-test`);
});
