const express = require("express");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const PORT = process.env.PORT || 3000;

const STATES = {
  LANGUAGE: "language",
  MAIN: "main",
  FAQ: "faq",
};

const sessions = new Map();

const languages = {
  "1": { name: "English", code: "en" },
  "2": { name: "Arabic", code: "ar" },
  "3": { name: "Chinese Simplified", code: "zh" },
  "4": { name: "Dutch", code: "nl" },
  "5": { name: "French", code: "fr" },
  "6": { name: "German", code: "de" },
  "7": { name: "Italian", code: "it" },
  "8": { name: "Portuguese", code: "pt" },
  "9": { name: "Russian", code: "ru" },
  "10": { name: "Spanish", code: "es" },
};

const menuText = {
  en: {
    mainTitle: "VRA Main Menu:",
    status: "Status of claim",
    banking: "Update banking details",
    faq: "Frequently Asked Questions",
    agent: "Chat with an Agent",
    changeLanguage: "Change language",
    faqTitle: "Frequently Asked Questions:",
    faq1: "How do I check my claim status?",
    faq2: "How do I update my banking details?",
    faq3: "How do I contact VRA?",
    faq4: "Why is my claim delayed?",
    back: "Reply B or Back to return to the main menu.",
    reset: "Reply 0 to change language.",
  },
  ar: {
    mainTitle: "قائمة VRA الرئيسية:",
    status: "حالة المطالبة",
    banking: "تحديث التفاصيل البنكية",
    faq: "الأسئلة الشائعة",
    agent: "الدردشة مع وكيل",
    changeLanguage: "تغيير اللغة",
    faqTitle: "الأسئلة الشائعة:",
    faq1: "كيف أتحقق من حالة مطالبتي؟",
    faq2: "كيف أحدث التفاصيل البنكية؟",
    faq3: "كيف أتواصل مع VRA؟",
    faq4: "لماذا تأخرت مطالبتي؟",
    back: "أرسل B أو Back للعودة إلى القائمة الرئيسية.",
    reset: "أرسل 0 لتغيير اللغة.",
  },
  zh: {
    mainTitle: "VRA 主菜单:",
    status: "索赔状态",
    banking: "更新银行资料",
    faq: "常见问题",
    agent: "与客服人员聊天",
    changeLanguage: "更改语言",
    faqTitle: "常见问题:",
    faq1: "如何查询我的索赔状态？",
    faq2: "如何更新我的银行资料？",
    faq3: "如何联系 VRA？",
    faq4: "为什么我的索赔延迟？",
    back: "回复 B 或 Back 返回主菜单。",
    reset: "回复 0 更改语言。",
  },
  nl: {
    mainTitle: "VRA Hoofdmenu:",
    status: "Status van claim",
    banking: "Bankgegevens bijwerken",
    faq: "Veelgestelde vragen",
    agent: "Chat met een agent",
    changeLanguage: "Taal wijzigen",
    faqTitle: "Veelgestelde vragen:",
    faq1: "Hoe controleer ik de status van mijn claim?",
    faq2: "Hoe werk ik mijn bankgegevens bij?",
    faq3: "Hoe neem ik contact op met VRA?",
    faq4: "Waarom is mijn claim vertraagd?",
    back: "Antwoord B of Back om terug te keren naar het hoofdmenu.",
    reset: "Antwoord 0 om de taal te wijzigen.",
  },
  fr: {
    mainTitle: "Menu principal VRA:",
    status: "Statut de la demande",
    banking: "Mettre à jour les coordonnées bancaires",
    faq: "Questions fréquemment posées",
    agent: "Discuter avec un agent",
    changeLanguage: "Changer de langue",
    faqTitle: "Questions fréquemment posées:",
    faq1: "Comment vérifier le statut de ma demande?",
    faq2: "Comment mettre à jour mes coordonnées bancaires?",
    faq3: "Comment contacter VRA?",
    faq4: "Pourquoi ma demande est-elle retardée?",
    back: "Répondez B ou Back pour revenir au menu principal.",
    reset: "Répondez 0 pour changer de langue.",
  },
  de: {
    mainTitle: "VRA Hauptmenü:",
    status: "Status des Anspruchs",
    banking: "Bankdaten aktualisieren",
    faq: "Häufig gestellte Fragen",
    agent: "Mit einem Agenten chatten",
    changeLanguage: "Sprache ändern",
    faqTitle: "Häufig gestellte Fragen:",
    faq1: "Wie überprüfe ich den Status meines Anspruchs?",
    faq2: "Wie aktualisiere ich meine Bankdaten?",
    faq3: "Wie kontaktiere ich VRA?",
    faq4: "Warum verzögert sich mein Anspruch?",
    back: "Antworten Sie mit B oder Back, um zum Hauptmenü zurückzukehren.",
    reset: "Antworten Sie mit 0, um die Sprache zu ändern.",
  },
  it: {
    mainTitle: "Menu principale VRA:",
    status: "Stato della richiesta",
    banking: "Aggiorna dettagli bancari",
    faq: "Domande frequenti",
    agent: "Chatta con un agente",
    changeLanguage: "Cambia lingua",
    faqTitle: "Domande frequenti:",
    faq1: "Come controllo lo stato della mia richiesta?",
    faq2: "Come aggiorno i miei dettagli bancari?",
    faq3: "Come contatto VRA?",
    faq4: "Perché la mia richiesta è in ritardo?",
    back: "Rispondi B o Back per tornare al menu principale.",
    reset: "Rispondi 0 per cambiare lingua.",
  },
  pt: {
    mainTitle: "Menu principal VRA:",
    status: "Estado da reclamação",
    banking: "Atualizar dados bancários",
    faq: "Perguntas frequentes",
    agent: "Falar com um agente",
    changeLanguage: "Alterar idioma",
    faqTitle: "Perguntas frequentes:",
    faq1: "Como verifico o estado da minha reclamação?",
    faq2: "Como atualizo os meus dados bancários?",
    faq3: "Como contacto a VRA?",
    faq4: "Por que a minha reclamação está atrasada?",
    back: "Responda B ou Back para voltar ao menu principal.",
    reset: "Responda 0 para alterar o idioma.",
  },
  ru: {
    mainTitle: "Главное меню VRA:",
    status: "Статус заявки",
    banking: "Обновить банковские данные",
    faq: "Часто задаваемые вопросы",
    agent: "Связаться с агентом",
    changeLanguage: "Изменить язык",
    faqTitle: "Часто задаваемые вопросы:",
    faq1: "Как проверить статус моей заявки?",
    faq2: "Как обновить банковские данные?",
    faq3: "Как связаться с VRA?",
    faq4: "Почему моя заявка задерживается?",
    back: "Ответьте B или Back, чтобы вернуться в главное меню.",
    reset: "Ответьте 0, чтобы изменить язык.",
  },
  es: {
    mainTitle: "Menú principal de VRA:",
    status: "Estado de la reclamación",
    banking: "Actualizar datos bancarios",
    faq: "Preguntas frecuentes",
    agent: "Chatear con un agente",
    changeLanguage: "Cambiar idioma",
    faqTitle: "Preguntas frecuentes:",
    faq1: "¿Cómo verifico el estado de mi reclamación?",
    faq2: "¿Cómo actualizo mis datos bancarios?",
    faq3: "¿Cómo contacto con VRA?",
    faq4: "¿Por qué se retrasa mi reclamación?",
    back: "Responda B o Back para volver al menú principal.",
    reset: "Responda 0 para cambiar el idioma.",
  },
};

function getSession(userId) {
  if (!sessions.has(userId)) {
    sessions.set(userId, {
      language: null,
      state: STATES.LANGUAGE,
      previousState: null,
    });
  }

  return sessions.get(userId);
}

function setState(session, nextState) {
  session.previousState = session.state;
  session.state = nextState;
}

function isGreeting(input) {
  return ["hi", "hello", "start"].includes(input.trim().toLowerCase());
}

function isBack(input) {
  const value = input.trim().toLowerCase();
  return value === "b" || value === "back";
}

function getLanguageCode(session) {
  return session.language?.code || "en";
}

function copy(session) {
  return menuText[getLanguageCode(session)] || menuText.en;
}

function languageMenu() {
  return `Hello, welcome to VRA Support Bot.

Please choose your language:

1 English
2 Arabic
3 Chinese Simplified
4 Dutch
5 French
6 German
7 Italian
8 Portuguese
9 Russian
10 Spanish`;
}

function mainMenu(session) {
  const c = copy(session);

  return `${c.mainTitle}

1 ${c.status}
2 ${c.banking}
3 ${c.faq}
4 ${c.agent}
5 ${c.changeLanguage}

${c.reset}`;
}

function faqMenu(session) {
  const c = copy(session);
  const faqUrl = `https://vatrefundagency.co.za/faq/?lang=${getLanguageCode(session)}`;

  return `${c.faqTitle}

1 ${c.faq1}
2 ${c.faq2}
3 ${c.faq3}
4 ${c.faq4}

FAQ link:
${faqUrl}

${c.back}
${c.reset}`;
}

function statusUrl(session) {
  return `https://vatrefundagency.co.za/check-refund-progress/?lang=${getLanguageCode(session)}`;
}

function bankingUrl(session) {
  return `https://vatrefundagency.co.za/forms/views/view.login.php?referral=thinksphere&lang=${getLanguageCode(session)}`;
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
        text: {
          body,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("WhatsApp API error:", response.status, errorText);
  }
}

async function showLanguageMenu(from, session) {
  session.language = null;
  setState(session, STATES.LANGUAGE);
  await sendWhatsAppMessage(from, languageMenu());
}

async function showMainMenu(from, session) {
  setState(session, STATES.MAIN);
  await sendWhatsAppMessage(from, mainMenu(session));
}

async function handleLanguageState(from, input, session) {
  const selectedLanguage = languages[input];

  if (!selectedLanguage) {
    await sendWhatsAppMessage(from, languageMenu());
    return;
  }

  session.language = selectedLanguage;
  setState(session, STATES.MAIN);
  await sendWhatsAppMessage(from, mainMenu(session));
}

async function handleMainState(from, input, session) {
  const c = copy(session);

  switch (input) {
    case "1":
      await sendWhatsAppMessage(
        from,
        `Please use the link below to check the status of your claim. You will need your VRA number.

${statusUrl(session)}

${c.back}
${c.reset}`
      );
      return;

    case "2":
      await sendWhatsAppMessage(
        from,
        `Please use the link below to update your banking details.

${bankingUrl(session)}

Facial recognition is required.

Once banking details are updated, Finance will be notified at:
finance@vatrefundsa.co.za

${c.back}
${c.reset}`
      );
      return;

    case "3":
      setState(session, STATES.FAQ);
      await sendWhatsAppMessage(from, faqMenu(session));
      return;

    case "4":
      await sendWhatsAppMessage(
        from,
        `A VRA support agent will assist you.

Email:
info@vatrefundagency.co.za

${c.back}
${c.reset}`
      );
      return;

    case "5":
      await showLanguageMenu(from, session);
      return;

    default:
      await sendWhatsAppMessage(from, mainMenu(session));
      return;
  }
}

async function handleFaqState(from, input, session) {
  const c = copy(session);

  switch (input) {
    case "1":
      await sendWhatsAppMessage(
        from,
        `You can check your claim status using the status link below. You will need your VRA number.

${statusUrl(session)}

${c.back}
${c.reset}`
      );
      return;

    case "2":
      await sendWhatsAppMessage(
        from,
        `You can update your banking details using the banking update link below.

${bankingUrl(session)}

Facial recognition is required.

Once banking details are updated, Finance will be notified at:
finance@vatrefundsa.co.za

${c.back}
${c.reset}`
      );
      return;

    case "3":
      await sendWhatsAppMessage(
        from,
        `You can contact VRA at:

info@vatrefundagency.co.za

${c.back}
${c.reset}`
      );
      return;

    case "4":
      await sendWhatsAppMessage(
        from,
        `Delays may happen while claims are being reviewed or awaiting processing.

Please check your claim status here:
${statusUrl(session)}

${c.back}
${c.reset}`
      );
      return;

    default:
      await sendWhatsAppMessage(from, faqMenu(session));
      return;
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
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message || message.type !== "text") {
      return;
    }

    const from = message.from;
    const input = message.text?.body?.trim();

    if (!from || !input) {
      return;
    }

    const session = getSession(from);

    if (input === "0") {
      await showLanguageMenu(from, session);
      return;
    }

    if (isGreeting(input)) {
      await sendWhatsAppMessage(from, languageMenu());
      return;
    }

    if (isBack(input)) {
      if (session.language) {
        await showMainMenu(from, session);
      } else {
        await sendWhatsAppMessage(from, languageMenu());
      }
      return;
    }

    if (!session.language || session.state === STATES.LANGUAGE) {
      await handleLanguageState(from, input, session);
      return;
    }

    if (session.state === STATES.FAQ) {
      await handleFaqState(from, input, session);
      return;
    }

    await handleMainState(from, input, session);
  } catch (error) {
    console.error("Webhook processing error:", error);
  }
});

app.get("/", (req, res) => {
  res.status(200).send("VRA WhatsApp Bot Running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
