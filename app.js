const express = require("express");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const PORT = process.env.PORT || 3000;

const userLanguages = new Map();

const languages = {
  "1": "English",
  "2": "Afrikaans",
  "3": "French",
  "4": "Portuguese",
  "5": "Spanish",
  "6": "Chinese",
};

function isGreeting(text) {
  return ["hi", "hello", "start"].includes(text.toLowerCase().trim());
}

function languageMenu() {
  return `Please choose your language:

1 English
2 Afrikaans
3 French
4 Portuguese
5 Spanish
6 Chinese`;
}

function vraMenu() {
  return `VRA Menu:

1 Status of your claim
2 Update banking details
3 Frequently Asked Questions
4 Chat with an Agent

Reply 0 to change language.`;
}

function faqMenu() {
  return `Frequently Asked Questions:

1 How do I check my claim status?
2 How do I update my banking details?
3 How do I contact VRA?

Reply 0 to change language.`;
}

async function sendWhatsAppMessage(to, message) {
  const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: {
        body: message,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("WhatsApp API error:", response.status, errorText);
  }
}

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (!message || message.type !== "text") {
      return;
    }

    const from = message.from;
    const text = message.text?.body?.trim();

    if (!from || !text) {
      return;
    }

    if (text === "0") {
      userLanguages.delete(from);
      await sendWhatsAppMessage(from, languageMenu());
      return;
    }

    const selectedLanguage = userLanguages.get(from);

    if (!selectedLanguage) {
      if (languages[text]) {
        userLanguages.set(from, languages[text]);
        await sendWhatsAppMessage(from, vraMenu());
        return;
      }

      if (isGreeting(text)) {
        await sendWhatsAppMessage(from, languageMenu());
        return;
      }

      await sendWhatsAppMessage(from, languageMenu());
      return;
    }

    switch (text) {
      case "1":
        await sendWhatsAppMessage(
          from,
          `Claim Status link:
https://register.vatrefundagency.co.za/check-refund-progress/

Reply 0 to change language.`
        );
        break;

      case "2":
        await sendWhatsAppMessage(
          from,
          `Banking update link:
https://vatrefundagency.co.za/forms/views/view.login.php?referral=thinksphere

Facial recognition is required to update your banking details.

Finance email:
finance@vatrefundagency.co.za

Reply 0 to change language.`
        );
        break;

      case "3":
        await sendWhatsAppMessage(from, faqMenu());
        break;

      case "4":
        await sendWhatsAppMessage(
          from,
          `A VRA support agent will assist you.

Email:
info@vatrefundagency.co.za

Reply 0 to change language.`
        );
        break;

      default:
        await sendWhatsAppMessage(from, vraMenu());
        break;
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
  }
});

app.get("/", (req, res) => {
  res.status(200).send("VRA WhatsApp bot is running.");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
