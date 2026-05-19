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
  "3": "zu",
  "4": "xh",
  "5": "fr",
  "6": "pt",
  "7": "es",
  "8": "ar",
  "9": "zh",
};

function languageMenu() {
  return `🌍 Please choose your language:

1️⃣ English
2️⃣ Afrikaans
3️⃣ isiZulu
4️⃣ isiXhosa
5️⃣ French
6️⃣ Portuguese
7️⃣ Spanish
8️⃣ Arabic
9️⃣ Chinese`;
}

const menus = {
  en: `👋 Welcome to VRA WhatsApp Support

1️⃣ VAT Refund Information
2️⃣ Track My Refund
3️⃣ Required Documents
4️⃣ Speak To Agent
5️⃣ Office Information
6️⃣ Finance Department

Type 0 to change language.`,

  af: `👋 Welkom by VRA WhatsApp Ondersteuning

1️⃣ BTW-terugbetaling inligting
2️⃣ Volg my terugbetaling
3️⃣ Vereiste dokumente
4️⃣ Praat met ’n agent
5️⃣ Kantoor inligting
6️⃣ Finansies afdeling

Tik 0 om taal te verander.`,

  zu: `👋 Siyakwamukela ku-VRA WhatsApp Support

1️⃣ Ulwazi lwe-VAT Refund
2️⃣ Landela imali yami
3️⃣ Amadokhumenti adingekayo
4️⃣ Khuluma no-agent
5️⃣ Ulwazi lwehhovisi
6️⃣ Umnyango wezezimali

Thumela 0 ukushintsha ulimi.`,

  xh: `👋 Wamkelekile kwi-VRA WhatsApp Support

1️⃣ Ulwazi lwe-VAT Refund
2️⃣ Landela imbuyekezo yam
3️⃣ Amaxwebhu afunekayo
4️⃣ Thetha ne-agent
5️⃣ Ulwazi lweofisi
6️⃣ Icandelo lezemali

Thumela 0 ukutshintsha ulwimi.`,

  fr: `👋 Bienvenue au support WhatsApp VRA

1️⃣ Informations sur le remboursement TVA
2️⃣ Suivre mon remboursement
3️⃣ Documents requis
4️⃣ Parler à un agent
5️⃣ Informations du bureau
6️⃣ Département finance

Tapez 0 pour changer de langue.`,

  pt: `👋 Bem-vindo ao Suporte WhatsApp VRA

1️⃣ Informação de reembolso de IVA
2️⃣ Acompanhar o meu reembolso
3️⃣ Documentos necessários
4️⃣ Falar com um agente
5️⃣ Informação do escritório
6️⃣ Departamento financeiro

Digite 0 para mudar o idioma.`,

  es: `👋 Bienvenido al soporte WhatsApp de VRA

1️⃣ Información de reembolso de IVA
2️⃣ Rastrear mi reembolso
3️⃣ Documentos requeridos
4️⃣ Hablar con un agente
5️⃣ Información de oficina
6️⃣ Departamento financiero

Escriba 0 para cambiar idioma.`,

  ar: `👋 مرحباً بك في دعم VRA عبر واتساب

1️⃣ معلومات استرداد ضريبة القيمة المضافة
2️⃣ تتبع الاسترداد
3️⃣ المستندات المطلوبة
4️⃣ التحدث مع موظف
5️⃣ معلومات المكتب
6️⃣ قسم المالية

اكتب 0 لتغيير اللغة.`,

  zh: `👋 欢迎使用 VRA WhatsApp 支持

1️⃣ 增值税退税信息
2️⃣ 查询我的退款
3️⃣ 所需文件
4️⃣ 联系客服
5️⃣ 办公室信息
6️⃣ 财务部门

输入 0 更改语言。`,
};

function getReply(lang, option) {
  const replies = {
    en: {
      "1": `💰 VAT Refund Information

VRA assists international travelers with VAT refunds on qualifying purchases made in South Africa.

You normally need:
✅ Tax Invoice
✅ Passport
✅ Purchased Goods
✅ Proof of Departure`,
      "2": `📦 To track your refund, email:

info@vatrefundagency.co.za

Include:
• Passport Number
• Invoice Number
• Date of Travel`,
      "3": `📄 Required Documents

✅ Original Tax Invoice
✅ Passport
✅ Flight Ticket / Boarding Pass
✅ Purchased Goods`,
      "4": `👨‍💼 A VRA support agent will assist you.

Please email:
info@vatrefundagency.co.za`,
      "5": `🏢 VAT Refund Agency

South Africa

📧 info@vatrefundagency.co.za`,
      "6": `💳 Finance Department

Please contact:
finance@vatrefundagency.co.za`,
    },
  };

  const base = replies.en;
  return base[option] || menus[lang] || menus.en;
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

    if (["hi", "hello", "hey", "start", "menu", "0"].includes(text)) {
      reply = languageMenu();
    } else if (languages[text]) {
      userLanguages[from] = languages[text];
      reply = menus[userLanguages[from]];
    } else {
      const lang = userLanguages[from] || "en";
      reply = getReply(lang, text);
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
