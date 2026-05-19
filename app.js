const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

const users = {};

const languages = {
  "1": "en",
  "2": "af",
  "3": "fr",
  "4": "pt",
  "5": "es",
  "6": "zh"
};

function languageMenu() {
  return `🌍 Welcome to VRA Support

Please select your language:

1️⃣ English
2️⃣ Afrikaans
3️⃣ French
4️⃣ Portuguese
5️⃣ Spanish
6️⃣ Chinese`;
}

function mainMenu(lang) {
  const menus = {
    en: `👋 Welcome to VRA Support

Please select one of the options below:

1️⃣ Status of your claim
2️⃣ Update banking details
3️⃣ Frequently Asked Questions
4️⃣ Chat with an Agent

Type 0 to change language.`,

    af: `👋 Welkom by VRA Ondersteuning

Kies asseblief een van die opsies:

1️⃣ Status van u eis
2️⃣ Werk bankbesonderhede op
3️⃣ Gereelde vrae
4️⃣ Praat met 'n agent

Tik 0 om taal te verander.`,

    fr: `👋 Bienvenue au support VRA

Veuillez sélectionner une option:

1️⃣ Statut de votre réclamation
2️⃣ Mettre à jour les coordonnées bancaires
3️⃣ Questions fréquentes
4️⃣ Parler à un agent

Tapez 0 pour changer de langue.`,

    pt: `👋 Bem-vindo ao suporte VRA

Selecione uma opção:

1️⃣ Estado da reclamação
2️⃣ Atualizar dados bancários
3️⃣ Perguntas frequentes
4️⃣ Falar com um agente

Digite 0 para mudar idioma.`,

    es: `👋 Bienvenido al soporte VRA

Seleccione una opción:

1️⃣ Estado de su reclamo
2️⃣ Actualizar datos bancarios
3️⃣ Preguntas frecuentes
4️⃣ Hablar con un agente

Escriba 0 para cambiar idioma.`,

    zh: `👋 欢迎使用 VRA 支持

请选择以下选项：

1️⃣ 查询退款状态
2️⃣ 更新银行资料
3️⃣ 常见问题
4️⃣ 联系客服

输入 0 更改语言。`
  };

  return menus[lang] || menus.en;
}

function optionReply(option) {
  switch (option) {
    case "1":
      return `🔎 Status of your claim

Please use the secure VRA portal below to check your claim status:

https://register.vatrefundagency.co.za/check-refund-progress/

Please enter your VRA number on the portal.`;

    case "2":
      return `🏦 Update banking details

Please use the secure online portal below to update your banking details:

https://vatrefundagency.co.za/forms/views/view.login.php?referral=thinksphere

Facial recognition verification is required to confirm that the correct person is logging in.

Once banking details are updated, Finance must be notified at:
finance@vatrefundagency.co.za`;

    case "3":
      return `❓ Frequently Asked Questions

Please type your question and VRA Support will assist.

Examples:
• How long does my refund take?
• What documents are required?
• Why is my claim delayed?
• How do I update my banking details?

If your question cannot be answered, you will be referred to an agent.`;

    case "4":
      return `👨‍💼 Chat with an Agent

A VRA support agent will assist you.

Please email:
info@vatrefundagency.co.za

Please include:
• Your VRA number
• Passport number
• Short description of your issue`;

    default:
      return null;
  }
}

async function sendMessage(to, body) {
  await axios.post(
    `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      text: { body }
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
}

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  try {
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) return res.sendStatus(200);

    const from = message.from;
    const text = message.text?.body?.trim().toLowerCase() || "";

    if (!users[from]) {
      users[from] = {
        language: null,
        waitingForLanguage: true
      };
    }

    let reply = "";

    if (["hi", "hello", "start", "menu"].includes(text)) {
      users[from].waitingForLanguage = true;
      reply = languageMenu();
    }

    else if (text === "0") {
      users[from].waitingForLanguage = true;
      reply = languageMenu();
    }

    else if (users[from].waitingForLanguage === true) {
      if (languages[text]) {
        users[from].language = languages[text];
        users[from].waitingForLanguage = false;
        reply = mainMenu(users[from].language);
      } else {
        reply = languageMenu();
      }
    }

    else {
      const menuReply = optionReply(text);

      if (menuReply) {
        reply = menuReply;
      } else {
        reply = `❓ Sorry, I did not understand that.

${mainMenu(users[from].language || "en")}`;
      }
    }

    await sendMessage(from, reply);
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
