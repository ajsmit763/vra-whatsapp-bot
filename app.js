const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

const userLanguages = {};

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

Type 0 at any time to change language.`,

    af: `👋 Welkom by VRA Ondersteuning

Kies asseblief een van die volgende opsies:

1️⃣ Status van u eis
2️⃣ Werk bankbesonderhede op
3️⃣ Gereelde Vrae
4️⃣ Praat met 'n Agent

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

function faqMenu() {
  return `❓ Frequently Asked Questions

1️⃣ How long do refunds take?
2️⃣ What documents are required?
3️⃣ Why is my refund delayed?
4️⃣ How do I update banking details?

Type menu to return to the main menu.`;
}

function faqReply(option) {
  switch(option) {
    case "1":
      return `⏳ Refund processing times may vary depending on verification and banking processes.`;

    case "2":
      return `📄 Required documents usually include:

✅ Passport
✅ Tax Invoice
✅ Proof of Export
✅ Boarding Pass`;

    case "3":
      return `⚠️ Refund delays may occur due to:

• Missing documents
• Banking verification
• Incomplete information
• Customs verification`;

    case "4":
      return `🏦 Banking details can be updated here:

https://vatrefundagency.co.za/forms/views/view.login.php?referral=thinksphere

Facial recognition verification is required.`;

    default:
      return faqMenu();
  }
}

async function sendMessage(to, body) {
  await axios.post(
    `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      text: { body },
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
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

    let reply = "";

    if (
      text === "hi" ||
      text === "hello" ||
      text === "start" ||
      text === "0"
    ) {
      reply = languageMenu();
    }

    else if (languages[text]) {
      userLanguages[from] = languages[text];
      reply = mainMenu(userLanguages[from]);
    }

    else {
      const lang = userLanguages[from] || "en";

      switch(text) {

        case "1":
          reply = `🔎 Claim Status

Please use the secure VRA portal below to track your claim:

https://register.vatrefundagency.co.za/check-refund-progress/

Enter your VRA reference number to continue.`;
          break;

        case "2":
          reply = `🏦 Update Banking Details

Please use the secure banking portal below:

https://vatrefundagency.co.za/forms/views/view.login.php?referral=thinksphere

✅ Facial recognition verification is required.

📧 Once completed, VRA Finance will automatically receive notification at:
finance@vatrefundsa.co.za`;
          break;

        case "3":
          reply = faqMenu();
          break;

        case "4":
          reply = `👨‍💼 You are being connected to a VRA support agent.

📧 Email:
info@vatrefundagency.co.za

Please include:
• Your VRA Number
• Passport Number
• Description of your issue`;
          break;

        default:

          if (
            text === "faq1" ||
            text === "faq2" ||
            text === "faq3" ||
            text === "faq4"
          ) {
            reply = faqReply(text.replace("faq", ""));
          }

          else {
            reply = `❓ Please select a valid option.

${mainMenu(lang)}`;
          }
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
