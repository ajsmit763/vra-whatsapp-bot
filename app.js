const express = require("express");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT || 3000;

const STATES = {
  LANGUAGE: "language",
  MAIN: "main",
  FAQ: "faq",
};

const whatsappSessions = new Map();
const telegramSessions = new Map();

const STATUS_LINK = "https://register.vatrefundagency.co.za/check-refund-progress/";
const BANKING_LINK =
  "https://vatrefundagency.co.za/forms/views/view.login.php?referral=thinksphere";
const WEBSITE_LINK = "https://vatrefundagency.co.za/";
const SUPPORT_EMAIL = "info@vatrefundagency.co.za";
const FINANCE_EMAIL = "finance@vatrefundagency.co.za";

const languageChoices = {
  "1": { code: "en", name: "English" },
  "2": { code: "af", name: "Afrikaans" },
  "3": { code: "fr", name: "French" },
  "4": { code: "de", name: "German" },
  "5": { code: "pt", name: "Portuguese" },
  "6": { code: "es", name: "Spanish" },
  "7": { code: "zh", name: "Chinese Simplified" },
};

const translations = {
  en: {
    welcome: "Welcome to VRA Support 👋",
    chooseLanguage: "Please choose your language:",
    mainOptions: [
      "Status of your claim",
      "Update banking details",
      "Frequently Asked Questions",
      "Chat with an Agent",
    ],
    statusReply:
      "Please use the link below to check the status of your claim. You will need your VRA number.",
    bankingReply:
      "Please use the link below to update your banking details.\n\nFacial recognition is required.",
    faqTitle: "Frequently Asked Questions",
    faqOptions: [
      "When am I receiving the VAT payment?",
      "What is my VAT amount?",
      "How do I claim?",
      "Back to Main Menu",
    ],
    vatPaymentAnswer: `Please contact our finance department at:
${FINANCE_EMAIL}`,
    vatAmountAnswer: `Please contact our support team at:
${SUPPORT_EMAIL}

or our finance team at:
${FINANCE_EMAIL}

They will provide the necessary information regarding your VAT amount.`,
    claimProcessAnswer: `Please visit our website for the full claiming process and required documentation:

${WEBSITE_LINK}`,
    agentReply: `A VRA support agent will assist you.

Email:
${SUPPORT_EMAIL}`,
    financeNotice: `Once banking details are updated, Finance will be notified at:
${FINANCE_EMAIL}`,
    backToMain: "Back to Main Menu",
    noFaqAnswer: `I could not find an FAQ answer for that. A VRA support agent will assist you.

Email:
${SUPPORT_EMAIL}`,
  },

  af: {
    welcome: "Welkom by VRA Ondersteuning 👋",
    chooseLanguage: "Kies asseblief jou taal:",
    mainOptions: [
      "Status van jou eis",
      "Dateer bankbesonderhede op",
      "Gereelde vrae",
      "Gesels met 'n agent",
    ],
    statusReply:
      "Gebruik asseblief die skakel hieronder om die status van jou eis na te gaan. Jy sal jou VRA-nommer benodig.",
    bankingReply:
      "Gebruik asseblief die skakel hieronder om jou bankbesonderhede op te dateer.\n\nGesigsherkenning is nodig.",
    faqTitle: "Gereelde vrae",
    faqOptions: [
      "Wanneer ontvang ek my BTW terugbetaling?",
      "Wat is my BTW-bedrag?",
      "Hoe eis ek?",
      "Terug na hoofkieslys",
    ],
    vatPaymentAnswer: `Kontak asseblief ons finansiële afdeling by:
${FINANCE_EMAIL}`,
    vatAmountAnswer: `Kontak asseblief ons ondersteuningspan by:
${SUPPORT_EMAIL}

of ons finansiële span by:
${FINANCE_EMAIL}

Hulle sal die nodige inligting oor jou BTW-bedrag verskaf.`,
    claimProcessAnswer: `Besoek asseblief ons webwerf vir die volledige eisproses en vereiste dokumentasie:

${WEBSITE_LINK}`,
    agentReply: `’n VRA-ondersteuningsagent sal jou help.

E-pos:
${SUPPORT_EMAIL}`,
    financeNotice: `Sodra bankbesonderhede opgedateer is, sal Finansies in kennis gestel word by:
${FINANCE_EMAIL}`,
    backToMain: "Terug na hoofkieslys",
    noFaqAnswer: `Ek kon nie 'n FAQ-antwoord daarvoor vind nie. 'n VRA-ondersteuningsagent sal jou help.

E-pos:
${SUPPORT_EMAIL}`,
  },

  fr: {
    welcome: "Bienvenue au support VRA 👋",
    chooseLanguage: "Veuillez choisir votre langue :",
    mainOptions: [
      "Statut de votre demande",
      "Mettre à jour les coordonnées bancaires",
      "Questions fréquemment posées",
      "Discuter avec un agent",
    ],
    statusReply:
      "Veuillez utiliser le lien ci-dessous pour vérifier le statut de votre demande. Vous aurez besoin de votre numéro VRA.",
    bankingReply:
      "Veuillez utiliser le lien ci-dessous pour mettre à jour vos coordonnées bancaires.\n\nLa reconnaissance faciale est requise.",
    faqTitle: "Questions fréquemment posées",
    faqOptions: [
      "Quand vais-je recevoir mon remboursement de TVA ?",
      "Quel est mon montant de TVA ?",
      "Comment puis-je faire une demande ?",
      "Retour au menu principal",
    ],
    vatPaymentAnswer: `Veuillez contacter notre service financier à :
${FINANCE_EMAIL}`,
    vatAmountAnswer: `Veuillez contacter notre équipe d'assistance à :
${SUPPORT_EMAIL}

ou notre équipe financière à :
${FINANCE_EMAIL}

Ils vous fourniront les informations nécessaires concernant votre montant de TVA.`,
    claimProcessAnswer: `Veuillez visiter notre site Web pour connaître le processus complet de demande et les documents requis :

${WEBSITE_LINK}`,
    agentReply: `Un agent du support VRA vous aidera.

E-mail :
${SUPPORT_EMAIL}`,
    financeNotice: `Une fois les coordonnées bancaires mises à jour, le service financier sera informé à :
${FINANCE_EMAIL}`,
    backToMain: "Retour au menu principal",
    noFaqAnswer: `Je n'ai pas trouvé de réponse FAQ pour cela. Un agent du support VRA vous aidera.

E-mail :
${SUPPORT_EMAIL}`,
  },

  de: {
    welcome: "Willkommen beim VRA Support 👋",
    chooseLanguage: "Bitte wählen Sie Ihre Sprache:",
    mainOptions: [
      "Status Ihres Anspruchs",
      "Bankdaten aktualisieren",
      "Häufig gestellte Fragen",
      "Mit einem Agenten chatten",
    ],
    statusReply:
      "Bitte verwenden Sie den untenstehenden Link, um den Status Ihres Anspruchs zu prüfen. Sie benötigen Ihre VRA-Nummer.",
    bankingReply:
      "Bitte verwenden Sie den untenstehenden Link, um Ihre Bankdaten zu aktualisieren.\n\nGesichtserkennung ist erforderlich.",
    faqTitle: "Häufig gestellte Fragen",
    faqOptions: [
      "Wann erhalte ich meine Mehrwertsteuererstattung?",
      "Wie hoch ist mein Mehrwertsteuerbetrag?",
      "Wie stelle ich einen Antrag?",
      "Zurück zum Hauptmenü",
    ],
    vatPaymentAnswer: `Bitte kontaktieren Sie unsere Finanzabteilung unter:
${FINANCE_EMAIL}`,
    vatAmountAnswer: `Bitte kontaktieren Sie unser Support-Team unter:
${SUPPORT_EMAIL}

oder unser Finanzteam unter:
${FINANCE_EMAIL}

Sie erhalten dort die notwendigen Informationen zu Ihrem Mehrwertsteuerbetrag.`,
    claimProcessAnswer: `Bitte besuchen Sie unsere Website für den vollständigen Antragsprozess und die erforderlichen Unterlagen:

${WEBSITE_LINK}`,
    agentReply: `Ein VRA-Supportagent wird Ihnen helfen.

E-Mail:
${SUPPORT_EMAIL}`,
    financeNotice: `Sobald die Bankdaten aktualisiert wurden, wird die Finanzabteilung benachrichtigt unter:
${FINANCE_EMAIL}`,
    backToMain: "Zurück zum Hauptmenü",
    noFaqAnswer: `Ich konnte keine FAQ-Antwort dafür finden. Ein VRA-Supportagent wird Ihnen helfen.

E-Mail:
${SUPPORT_EMAIL}`,
  },

  pt: {
    welcome: "Bem-vindo ao Suporte VRA 👋",
    chooseLanguage: "Escolha o seu idioma:",
    mainOptions: [
      "Estado da sua reclamação",
      "Atualizar dados bancários",
      "Perguntas frequentes",
      "Falar com um agente",
    ],
    statusReply:
      "Use o link abaixo para verificar o estado da sua reclamação. Irá precisar do seu número VRA.",
    bankingReply:
      "Use o link abaixo para atualizar os seus dados bancários.\n\nO reconhecimento facial é obrigatório.",
    faqTitle: "Perguntas frequentes",
    faqOptions: [
      "Quando vou receber o reembolso do IVA?",
      "Qual é o meu valor de IVA?",
      "Como faço a reclamação?",
      "Voltar ao menu principal",
    ],
    vatPaymentAnswer: `Contacte o nosso departamento financeiro em:
${FINANCE_EMAIL}`,
    vatAmountAnswer: `Contacte a nossa equipa de apoio em:
${SUPPORT_EMAIL}

ou a nossa equipa financeira em:
${FINANCE_EMAIL}

Eles fornecerão as informações necessárias sobre o seu valor de IVA.`,
    claimProcessAnswer: `Visite o nosso website para ver o processo completo de reclamação e a documentação necessária:

${WEBSITE_LINK}`,
    agentReply: `Um agente de suporte VRA irá ajudá-lo.

Email:
${SUPPORT_EMAIL}`,
    financeNotice: `Assim que os dados bancários forem atualizados, o departamento financeiro será notificado em:
${FINANCE_EMAIL}`,
    backToMain: "Voltar ao menu principal",
    noFaqAnswer: `Não encontrei uma resposta nas FAQ para isso. Um agente de suporte VRA irá ajudá-lo.

Email:
${SUPPORT_EMAIL}`,
  },

  es: {
    welcome: "Bienvenido al Soporte VRA 👋",
    chooseLanguage: "Por favor elija su idioma:",
    mainOptions: [
      "Estado de su reclamación",
      "Actualizar datos bancarios",
      "Preguntas frecuentes",
      "Chatear con un agente",
    ],
    statusReply:
      "Utilice el enlace de abajo para verificar el estado de su reclamación. Necesitará su número VRA.",
    bankingReply:
      "Utilice el enlace de abajo para actualizar sus datos bancarios.\n\nSe requiere reconocimiento facial.",
    faqTitle: "Preguntas frecuentes",
    faqOptions: [
      "¿Cuándo recibiré mi reembolso del IVA?",
      "¿Cuál es mi monto de IVA?",
      "¿Cómo reclamo?",
      "Volver al menú principal",
    ],
    vatPaymentAnswer: `Por favor contacte a nuestro departamento financiero en:
${FINANCE_EMAIL}`,
    vatAmountAnswer: `Por favor contacte a nuestro equipo de soporte en:
${SUPPORT_EMAIL}

o a nuestro equipo financiero en:
${FINANCE_EMAIL}

Ellos le proporcionarán la información necesaria sobre su monto de IVA.`,
    claimProcessAnswer: `Visite nuestro sitio web para ver el proceso completo de reclamación y la documentación requerida:

${WEBSITE_LINK}`,
    agentReply: `Un agente de soporte de VRA le ayudará.

Correo electrónico:
${SUPPORT_EMAIL}`,
    financeNotice: `Una vez actualizados los datos bancarios, Finanzas será notificado en:
${FINANCE_EMAIL}`,
    backToMain: "Volver al menú principal",
    noFaqAnswer: `No encontré una respuesta de FAQ para eso. Un agente de soporte de VRA le ayudará.

Correo electrónico:
${SUPPORT_EMAIL}`,
  },

  zh: {
    welcome: "欢迎使用 VRA 支持 👋",
    chooseLanguage: "请选择您的语言：",
    mainOptions: [
      "查询您的索赔状态",
      "更新银行资料",
      "常见问题",
      "与客服人员聊天",
    ],
    statusReply: "请使用下面的链接查询您的索赔状态。您需要您的 VRA 编号。",
    bankingReply: "请使用下面的链接更新您的银行资料。\n\n需要进行面部识别。",
    faqTitle: "常见问题",
    faqOptions: [
      "我什么时候收到增值税退款？",
      "我的增值税金额是多少？",
      "我如何申请？",
      "返回主菜单",
    ],
    vatPaymentAnswer: `请联系我们的财务部门：
${FINANCE_EMAIL}`,
    vatAmountAnswer: `请联系我们的支持团队：
${SUPPORT_EMAIL}

或我们的财务团队：
${FINANCE_EMAIL}

他们会提供有关您增值税金额的必要信息。`,
    claimProcessAnswer: `请访问我们的网站，查看完整的申请流程和所需文件：

${WEBSITE_LINK}`,
    agentReply: `VRA 支持人员将协助您。

电子邮件：
${SUPPORT_EMAIL}`,
    financeNotice: `银行资料更新后，财务部门将收到通知：
${FINANCE_EMAIL}`,
    backToMain: "返回主菜单",
    noFaqAnswer: `我找不到该问题的 FAQ 答案。VRA 支持人员将协助您。

电子邮件：
${SUPPORT_EMAIL}`,
  },
};

const faqPatterns = [
  {
    id: "vatPayment",
    phrases: [
      "when am i receiving the vat payment",
      "when will i receive my vat payment",
      "when will i receive my vat refund",
      "wanneer ontvang ek my btw terugbetaling",
      "quand vais je recevoir mon remboursement de tva",
      "quand vais-je recevoir mon remboursement de tva",
      "wann erhalte ich meine mehrwertsteuererstattung",
      "quando vou receber o reembolso do iva",
      "cuando recibire mi reembolso del iva",
      "cuándo recibiré mi reembolso del iva",
      "我什么时候收到增值税退款",
    ],
  },
  {
    id: "vatAmount",
    phrases: [
      "what is my vat amount",
      "wat is my btw bedrag",
      "quel est mon montant de tva",
      "wie hoch ist mein mehrwertsteuerbetrag",
      "qual e o meu valor de iva",
      "qual é o meu valor de iva",
      "cual es mi monto de iva",
      "cuál es mi monto de iva",
      "我的增值税金额是多少",
    ],
  },
  {
    id: "claimProcess",
    phrases: [
      "how do i claim",
      "what is the process",
      "hoe eis ek",
      "wat is die proses",
      "comment puis je faire une demande",
      "comment puis-je faire une demande",
      "quel est le processus",
      "wie stelle ich einen antrag",
      "wie ist der prozess",
      "como faco a reclamacao",
      "como faço a reclamação",
      "qual e o processo",
      "qual é o processo",
      "como reclamo",
      "cual es el proceso",
      "cuál es el proceso",
      "我如何申请",
      "流程是什么",
    ],
  },
];

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[?!.,;:()[\]{}'"¿¡]/g, "")
    .replace(/\s+/g, " ");
}

function detectLanguage(input, fallback = "en") {
  const raw = String(input || "").trim();
  const value = normalizeText(raw);

  if (/[\u4e00-\u9fff]/.test(raw)) return "zh";

  if (/\b(btw|wanneer|ontvang|terugbetaling|hoe eis|wat is)\b/.test(value)) {
    return "af";
  }

  if (/\b(quand|remboursement|tva|veuillez|comment puis|demande)\b/.test(value)) {
    return "fr";
  }

  if (/\b(wann|mehrwertsteuer|erhalte|anspruch|antrag|prozess)\b/.test(value)) {
    return "de";
  }

  if (/\b(quando|reembolso|iva|faco|reclamacao|processo)\b/.test(value)) {
    return "pt";
  }

  if (/\b(cuando|recibire|reembolso|iva|reclamo|proceso|monto)\b/.test(value)) {
    return "es";
  }

  return fallback;
}

function t(languageCode) {
  return translations[languageCode] || translations.en;
}

function getSessionLanguage(session, input) {
  const detected = detectLanguage(input, session.languageCode || "en");

  session.languageCode = detected;
  session.languageName =
    Object.values(languageChoices).find((language) => language.code === detected)
      ?.name || "English";

  return detected;
}

function isGreeting(input) {
  return ["hi", "hello", "start", "/start", "menu", "/menu"].includes(
    normalizeText(input)
  );
}

function isFaqRequest(input) {
  const value = normalizeText(input);

  return [
    "3",
    "faq",
    "frequently asked questions",
    "frequently asked questions menu",
    "gereelde vrae",
    "questions frequemment posees",
    "häufig gestellte fragen",
    "haufig gestellte fragen",
    "perguntas frequentes",
    "preguntas frecuentes",
    "常见问题",
  ].includes(value);
}

function isBackToMain(input) {
  const value = normalizeText(input);

  return [
    "b",
    "back",
    "main menu",
    "back to main menu",
    "terug na hoofkieslys",
    "retour au menu principal",
    "zuruck zum hauptmenu",
    "zurück zum hauptmenü",
    "voltar ao menu principal",
    "volver al menu principal",
    "返回主菜单",
  ].includes(value);
}

function mainMenu(languageCode = "en") {
  const copy = t(languageCode);

  return `${copy.welcome}

1. ${copy.mainOptions[0]}
2. ${copy.mainOptions[1]}
3. ${copy.mainOptions[2]}
4. ${copy.mainOptions[3]}`;
}

function languageMenu() {
  return `${translations.en.chooseLanguage}

1. English
2. Afrikaans
3. French
4. German
5. Portuguese
6. Spanish
7. Chinese Simplified`;
}

function faqMenu(languageCode = "en") {
  const copy = t(languageCode);

  return `${copy.faqTitle}

1. ${copy.faqOptions[0]}
2. ${copy.faqOptions[1]}
3. ${copy.faqOptions[2]}
4. ${copy.faqOptions[3]}`;
}

function statusMessage(languageCode = "en") {
  return `${t(languageCode).statusReply}

${STATUS_LINK}`;
}

function bankingMessage(languageCode = "en") {
  const copy = t(languageCode);

  return `${copy.bankingReply}

${BANKING_LINK}

${copy.financeNotice}`;
}

function agentMessage(languageCode = "en") {
  return t(languageCode).agentReply;
}

function matchFaq(input) {
  const value = normalizeText(input);

  if (value === "1") return "vatPayment";
  if (value === "2") return "vatAmount";
  if (value === "3") return "claimProcess";

  const match = faqPatterns.find((item) =>
    item.phrases.some((phrase) => value.includes(normalizeText(phrase)))
  );

  return match?.id || null;
}

function faqAnswer(input, languageCode = "en") {
  const copy = t(languageCode);
  const faqId = matchFaq(input);

  if (faqId === "vatPayment") {
    return `${copy.vatPaymentAnswer}

${copy.backToMain}`;
  }

  if (faqId === "vatAmount") {
    return `${copy.vatAmountAnswer}

${copy.backToMain}`;
  }

  if (faqId === "claimProcess") {
    return `${copy.claimProcessAnswer}

${copy.backToMain}`;
  }

  return null;
}

async function sendWhatsAppMessage(to, body) {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    console.error("Missing WHATSAPP_TOKEN or PHONE_NUMBER_ID");
    return;
  }

  const response = await fetch(
    `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body },
      }),
    }
  );

  if (!response.ok) {
    console.error("WhatsApp API error:", response.status, await response.text());
  }
}

async function sendTelegramMessage(chatId, message) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error("Missing TELEGRAM_BOT_TOKEN");
    return;
  }

  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        disable_web_page_preview: false,
      }),
    }
  );

  if (!response.ok) {
    console.error("Telegram API error:", response.status, await response.text());
  }
}

function getWhatsAppSession(phoneNumber) {
  if (!whatsappSessions.has(phoneNumber)) {
    whatsappSessions.set(phoneNumber, {
      languageCode: "en",
      languageName: "English",
      state: STATES.MAIN,
    });
  }

  return whatsappSessions.get(phoneNumber);
}

function getTelegramSession(chatId) {
  if (!telegramSessions.has(chatId)) {
    telegramSessions.set(chatId, {
      languageCode: "en",
      languageName: "English",
      state: STATES.MAIN,
    });
  }

  return telegramSessions.get(chatId);
}

async function handleSupportInput(input, session, sendReply) {
  const languageCode = getSessionLanguage(session, input);
  const normalizedInput = normalizeText(input);

  if (input === "0" || normalizedInput === "change language") {
    session.state = STATES.LANGUAGE;
    await sendReply(languageMenu());
    return;
  }

  if (session.state === STATES.LANGUAGE) {
    const selectedLanguage = languageChoices[normalizedInput];

    if (selectedLanguage) {
      session.languageCode = selectedLanguage.code;
      session.languageName = selectedLanguage.name;
      session.state = STATES.MAIN;
      await sendReply(mainMenu(session.languageCode));
      return;
    }

    await sendReply(languageMenu());
    return;
  }

  if (isGreeting(input)) {
    session.state = STATES.MAIN;
    await sendReply(mainMenu(languageCode));
    return;
  }

  if (session.state === STATES.FAQ) {
    if (normalizedInput === "4" || isBackToMain(input)) {
      session.state = STATES.MAIN;
      await sendReply(mainMenu(languageCode));
      return;
    }

    const answer = faqAnswer(input, languageCode);

    if (answer) {
      await sendReply(answer);
      return;
    }

    session.state = STATES.MAIN;
    await sendReply(t(languageCode).noFaqAnswer);
    return;
  }

  if (isBackToMain(input)) {
    session.state = STATES.MAIN;
    await sendReply(mainMenu(languageCode));
    return;
  }

  if (isFaqRequest(input)) {
    session.state = STATES.FAQ;
    await sendReply(faqMenu(languageCode));
    return;
  }

  if (normalizedInput === "1") {
    await sendReply(statusMessage(languageCode));
    return;
  }

  if (normalizedInput === "2") {
    await sendReply(bankingMessage(languageCode));
    return;
  }

  if (normalizedInput === "4") {
    await sendReply(agentMessage(languageCode));
    return;
  }

  const directFaqAnswer = faqAnswer(input, languageCode);

  if (directFaqAnswer) {
    await sendReply(directFaqAnswer);
    return;
  }

  await sendReply(mainMenu(languageCode));
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
    const input = message.text?.body?.trim();

    if (!from || !input) {
      return;
    }

    const session = getWhatsAppSession(from);

    await handleSupportInput(input, session, (reply) =>
      sendWhatsAppMessage(from, reply)
    );
  } catch (error) {
    console.error("WhatsApp webhook processing error:", error);
  }
});

app.post("/telegram-webhook", async (req, res) => {
  res.sendStatus(200);

  try {
    const message = req.body.message;
    const chatId = message?.chat?.id;
    const input = message?.text?.trim();

    if (!chatId || !input) {
      return;
    }

    const session = getTelegramSession(chatId);

    await handleSupportInput(input, session, (reply) =>
      sendTelegramMessage(chatId, reply)
    );
  } catch (error) {
    console.error("Telegram webhook processing error:", error);
  }
});

app.get("/", (req, res) => {
  res.status(200).send("VRA WhatsApp Bot Running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
