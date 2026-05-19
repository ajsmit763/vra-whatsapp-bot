const express = require("express");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const PORT = process.env.PORT || 3000;

const userSessions = new Map();

const MENUS = {
  LANGUAGE: "language",
  MAIN: "main",
  FAQ: "faq",
};

const languages = {
  "1": "English",
  "2": "Afrikaans",
  "3": "French",
  "4": "Portuguese",
  "5": "Spanish",
  "6": "Chinese",
};

function getSession(userId) {
  if (!userSessions.has(userId)) {
    userSessions.set(userId, {
      language: null,
      currentMenu: MENUS.LANGUAGE,
      previousMenu: null,
    });
  }

  return userSessions.get(userId);
}

function setMenu(session, nextMenu) {
  session.previousMenu = session.currentMenu;
  session.currentMenu = nextMenu;
}

function isGreeting(text) {
  return ["hi", "hello", "start"].includes(text.trim().toLowerCase());
}

function isBack(text) {
  const normalized = text.trim().toLowerCase();
  return normalized === "b" || normalized === "back";
}

function welcomeMessage() {
  return `Hello, welcome to VRA Support Bot.

${languageMenu()}`;
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

function mainMenu() {
  return `VRA Main Menu:

1 Status of your claim
2 Update banking details
3 Frequently Asked Questions
4 Chat with an Agent

Reply B or Back to go back.
Reply 0 to change language.`;
}

function faqMenu() {
  return `Frequently Asked Questions:

1 How do I check my claim status?
2 How do I update my banking details?
3 How do I contact VRA?
4 Why is my claim delayed?

Reply B or Back to go back.
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

async function handleLanguageMenu(from, text, session) {
  if (languages[text]) {
    session.language = languages[text];
    setMenu(session, MENUS.MAIN);
    await sendWhatsAppMessage(from, mainMenu());
    return;
  }

  await sendWhatsAppMessage(from, languageMenu());
}

async function handleMainMenu(from, text, session) {
  switch (text) {
    case "1":
      await sendWhatsAppMessage(
        from,
        `Claim Status link:
https://register.vatrefundagency.co.za/check-refund-progress/

Reply B or Back to return to the main menu.
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

Reply B or Back to return to the main menu.
Reply 0 to change language.`
      );
      break;

    case "3":
      setMenu(session, MENUS.FAQ);
      await sendWhatsAppMessage(from, faqMenu());
      break;

    case "4":
      await sendWhatsAppMessage(
        from,
        `A VRA support agent will assist you.

Email:
info@vatrefundagency.co.za

Reply B or Back to return to the main menu.
Reply 0 to change language.`
      );
      break;

    default:
      await sendWhatsAppMessage(from, mainMenu());
      break;
  }
}

async function handleFaqMenu(from, text) {
  switch (text) {
    case "1":
      await sendWhatsAppMessage(
        from,
        `You can check your claim status here:
https://register.vatrefundagency.co.za/check-refund-progress/

Reply B or Back to return to the main menu.
Reply 0 to change language.`
      );
      break;

    case "2":
      await sendWhatsAppMessage(
        from,
        `You can update your banking details here:
https://vatrefundagency.co.za/forms/views/view.login.php?referral=thinksphere

Facial recognition is required.

Finance email:
finance@vatrefundagency.co.za

Reply B or Back to return to the main menu.
Reply 0 to change language.`
      );
      break;

    case "3":
      await sendWhatsAppMessage(
        from,
        `You can contact VRA by email:
info@vatrefundagency.co.za

Reply B or Back to return to the main menu.
Reply 0 to change language.`
      );
      break;

    case "4":
      await sendWhatsAppMessage(
        from,
        `Claims may be delayed if documents, banking details, verification, or refund approval steps are still pending.

Please check your claim status here:
https://register.vatrefundagency.co.za/check-refund-progress/

Reply B or Back to return to the main menu.
Reply 0 to change language.`
      );
      break;

    default:
      await sendWhatsAppMessage(from, faqMenu());
      break;
  }
}

async function handleBack(from, session) {
  if (session.currentMenu === MENUS.FAQ) {
    setMenu(session, MENUS.MAIN);
    await sendWhatsAppMessage(from, mainMenu());
    return;
  }

  if (session.currentMenu === MENUS.MAIN) {
    setMenu(session, MENUS.LANGUAGE);
    await sendWhatsAppMessage(from, languageMenu());
    return;
  }

  await sendWhatsAppMessage(from, languageMenu());
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
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message || message.type !== "text") {
      return;
    }

    const from = message.from;
    const text = message.text?.body?.trim();

    if (!from || !text) {
      return;
    }

    const session = getSession(from);

    if (text === "0") {
      session.language = null;
      session.previousMenu = session.currentMenu;
      session.currentMenu = MENUS.LANGUAGE;
      await sendWhatsAppMessage(from, languageMenu());
      return;
    }

    if (isGreeting(text)) {
      session.previousMenu = session.currentMenu;
      session.currentMenu = MENUS.LANGUAGE;
      await sendWhatsAppMessage(from, welcomeMessage());
      return;
    }

    if (isBack(text)) {
      await handleBack(from, session);
      return;
    }

    if (!session.language) {
      session.currentMenu = MENUS.LANGUAGE;
    }

    switch (session.currentMenu) {
      case MENUS.LANGUAGE:
        await handleLanguageMenu(from, text, session);
        break;

      case MENUS.MAIN:
        await handleMainMenu(from, text, session);
        break;

      case MENUS.FAQ:
        await handleFaqMenu(from, text, session);
        break;

      default:
        session.currentMenu = MENUS.LANGUAGE;
        await sendWhatsAppMessage(from, languageMenu());
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
