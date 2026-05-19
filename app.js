const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    console.log("Webhook verified!");
    return res.status(200).send(challenge);
  }

  res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  try {
    const message =
      req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      return res.sendStatus(200);
    }

    const from = message.from;
    const text = message.text?.body?.toLowerCase() || "";

    let reply = "";

    // Welcome
    if (
      text === "hi" ||
      text === "hello" ||
      text === "hey" ||
      text === "start"
    ) {
      reply =
`👋 Welcome to VRA WhatsApp Support

Please choose an option:

1️⃣ VAT Refund Information
2️⃣ Track My Refund
3️⃣ Required Documents
4️⃣ Speak To Agent
5️⃣ Office Information
6️⃣ Finance Department`;
    }

    // VAT Refund Info
    else if (text === "1") {
      reply =
`💰 VAT Refund Information

VRA assists international travelers with VAT refunds on qualifying purchases made in South Africa.

You normally need:
✅ Tax Invoice
✅ Passport
✅ Purchased Goods
✅ Proof of Departure`;
    }

    // Track Refund
    else if (text === "2") {
      reply =
`📦 To track your refund please email:

info@vatrefundagency.co.za

Include:
• Passport Number
• Invoice Number
• Date of Travel`;
    }

    // Documents
    else if (text === "3") {
      reply =
`📄 Required Documents

✅ Original Tax Invoice
✅ Passport
✅ Flight Ticket / Boarding Pass
✅ Purchased Goods

Please ensure invoices clearly display VAT information.`;
    }

    // Agent
    else if (text === "4") {
      reply =
`👨‍💼 A VRA support agent will assist you shortly.

Please email:
info@vatrefundagency.co.za`;
    }

    // Office Info
    else if (text === "5") {
      reply =
`🏢 VAT Refund Agency

South Africa

For assistance:
📧 info@vatrefundagency.co.za`;
    }

    // Finance
    else if (text === "6") {
      reply =
`💳 Finance Department

Please contact:
📧 finance@vatrefundagency.co.za`;
    }

    // Unknown
    else {
      reply =
`❓ Sorry, I did not understand that.

Please type:

1 - VAT Refund Information
2 - Track Refund
3 - Required Documents
4 - Speak To Agent
5 - Office Information
6 - Finance Department`;
    }

    await axios.post(
      `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: from,
        text: {
          body: reply,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.sendStatus(200);

  } catch (error) {
    console.log(error.response?.data || error.message);
    res.sendStatus(500);
  }
});

app.get("/", (req, res) => {
  res.send("VRA WhatsApp Bot Running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
