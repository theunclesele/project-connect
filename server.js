/**
 * PROJECT CONNECT — server.js
 */

import express from "express";
import cors from "cors";

const app = express();
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 3001;

// ---- Twilio config ----
const ACCOUNT_SID = "AC176c63ba7d4ae91d5fd6723ba6c969c4"; 
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN; 
const FROM_NUMBER = "whatsapp:+17372508034"; 

// The default message — SIMPLIFIED FOR TESTING
const DEFAULT_MESSAGE = "Hello! This is a test from Project Connect. If you see this, the pipeline is working!";

// ------------------------

if (!AUTH_TOKEN) {
  console.error("❌ TWILIO_AUTH_TOKEN is not set.");
  process.exit(1);
}

app.post("/api/send-test", async (req, res) => {
  const to = req.body.to || "+2348066143230";
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

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "PROJECT CONNECT backend is running" });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`   Send test: POST http://localhost:${PORT}/api/send-test`);
});
