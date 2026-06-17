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

const languages = {
  "1": { languageName: "English", languageCode: "en" },
  "2": { languageName: "Arabic", languageCode: "ar" },
  "3": { languageName: "Chinese Simplified", languageCode: "zh" },
  "4": { languageName: "Dutch", languageCode: "nl" },
  "5": { languageName: "French", languageCode: "fr" },
  "6": { languageName: "German", languageCode: "de" },
  "7": { languageName: "Italian", languageCode: "it" },
  "8": { languageName: "Portuguese", languageCode: "pt" },
  "9": { languageName: "Russian", languageCode: "ru" },
  "10": { languageName: "Spanish", languageCode: "es" },
};

const FAQ_ITEMS = {
  "1": { answerKey: "faqAnswer1", linkType: "status" },
  "2": { answerKey: "faqAnswer2", linkType: "banking", includeFinance: true },
  "3": { answerKey: "faqAnswer3", includeInfoEmail: true },
  "4": { answerKey: "faqAnswer4" },
};

const translations = {
  en: {
    welcome: "Hello, welcome to VRA Support Bot.",
    chooseLanguage: "Please choose your language:",
    mainTitle: "VRA Main Menu:",
    statusOption: "Status of claim",
    bankingOption: "Update banking details",
    faqOption: "Frequently Asked Questions",
    agentOption: "Chat with an Agent",
    changeLanguageOption: "Change language",
    statusReply:
      "Please use the link below to check the status of your claim. You will need your VRA number.",
    bankingReply: "Please use the link below to update your banking details.",
    facialRequired: "Facial recognition is required.",
    financeNotified:
      "Once banking details are updated, Finance will be notified at:",
    faqTitle: "Frequently Asked Questions:",
    faqLinkLabel: "FAQ link:",
    faq1: "How do I check my claim status?",
    faq2: "How do I update my banking details?",
    faq3: "How do I contact VRA?",
    faq4: "Why is my claim delayed?",
    faqAnswer1:
      "You can check your claim status using the status link below. You will need your VRA number.",
    faqAnswer2:
      "You can update your banking details using the banking update link below. Facial recognition is required.",
    faqAnswer3: "You can contact VRA at:",
    faqAnswer4:
      "Delays may happen while claims are being reviewed or awaiting processing.",
    agentReply: "A VRA support agent will assist you.",
    emailLabel: "Email:",
    backInstruction: "Reply B or Back to return to the main menu.",
    changeInstruction: "Reply 0 to change language.",
  },
  ar: {
    welcome: "مرحباً، أهلاً بك في روبوت دعم VRA.",
    chooseLanguage: "يرجى اختيار لغتك:",
    mainTitle: "القائمة الرئيسية لـ VRA:",
    statusOption: "حالة المطالبة",
    bankingOption: "تحديث التفاصيل البنكية",
    faqOption: "الأسئلة الشائعة",
    agentOption: "التحدث مع وكيل",
    changeLanguageOption: "تغيير اللغة",
    statusReply:
      "يرجى استخدام الرابط أدناه للتحقق من حالة مطالبتك. ستحتاج إلى رقم VRA الخاص بك.",
    bankingReply: "يرجى استخدام الرابط أدناه لتحديث التفاصيل البنكية الخاصة بك.",
    facialRequired: "التعرف على الوجه مطلوب.",
    financeNotified: "بعد تحديث التفاصيل البنكية، سيتم إخطار قسم المالية على:",
    faqTitle: "الأسئلة الشائعة:",
    faqLinkLabel: "رابط الأسئلة الشائعة:",
    faq1: "كيف أتحقق من حالة مطالبتي؟",
    faq2: "كيف أحدث التفاصيل البنكية الخاصة بي؟",
    faq3: "كيف أتواصل مع VRA؟",
    faq4: "لماذا تأخرت مطالبتي؟",
    faqAnswer1:
      "يمكنك التحقق من حالة مطالبتك باستخدام رابط الحالة أدناه. ستحتاج إلى رقم VRA الخاص بك.",
    faqAnswer2:
      "يمكنك تحديث التفاصيل البنكية الخاصة بك باستخدام رابط تحديث البيانات البنكية أدناه. التعرف على الوجه مطلوب.",
    faqAnswer3: "يمكنك التواصل مع VRA على:",
    faqAnswer4:
      "قد تحدث التأخيرات أثناء مراجعة المطالبات أو أثناء انتظار المعالجة.",
    agentReply: "سيساعدك وكيل دعم VRA.",
    emailLabel: "البريد الإلكتروني:",
    backInstruction: "أرسل B أو Back للعودة إلى القائمة الرئيسية.",
    changeInstruction: "أرسل 0 لتغيير اللغة.",
  },
  zh: {
    welcome: "您好，欢迎使用 VRA 支持机器人。",
    chooseLanguage: "请选择您的语言：",
    mainTitle: "VRA 主菜单：",
    statusOption: "索赔状态",
    bankingOption: "更新银行资料",
    faqOption: "常见问题",
    agentOption: "与客服人员聊天",
    changeLanguageOption: "更改语言",
    statusReply: "请使用下面的链接查询您的索赔状态。您需要您的 VRA 编号。",
    bankingReply: "请使用下面的链接更新您的银行资料。",
    facialRequired: "需要进行面部识别。",
    financeNotified: "银行资料更新后，财务部门将收到通知：",
    faqTitle: "常见问题：",
    faqLinkLabel: "常见问题链接：",
    faq1: "如何查询我的索赔状态？",
    faq2: "如何更新我的银行资料？",
    faq3: "如何联系 VRA？",
    faq4: "为什么我的索赔延迟？",
    faqAnswer1: "您可以使用下面的状态链接查询索赔状态。您需要您的 VRA 编号。",
    faqAnswer2: "您可以使用下面的银行资料更新链接更新银行资料。需要进行面部识别。",
    faqAnswer3: "您可以通过以下方式联系 VRA：",
    faqAnswer4: "索赔在审核或等待处理期间可能会出现延迟。",
    agentReply: "VRA 支持人员将协助您。",
    emailLabel: "电子邮件：",
    backInstruction: "回复 B 或 Back 返回主菜单。",
    changeInstruction: "回复 0 更改语言。",
  },
  nl: {
    welcome: "Hallo, welkom bij de VRA Support Bot.",
    chooseLanguage: "Kies uw taal:",
    mainTitle: "VRA Hoofdmenu:",
    statusOption: "Status van claim",
    bankingOption: "Bankgegevens bijwerken",
    faqOption: "Veelgestelde vragen",
    agentOption: "Chat met een agent",
    changeLanguageOption: "Taal wijzigen",
    statusReply:
      "Gebruik de onderstaande link om de status van uw claim te controleren. U heeft uw VRA-nummer nodig.",
    bankingReply: "Gebruik de onderstaande link om uw bankgegevens bij te werken.",
    facialRequired: "Gezichtsherkenning is vereist.",
    financeNotified:
      "Zodra de bankgegevens zijn bijgewerkt, wordt Finance op de hoogte gesteld via:",
    faqTitle: "Veelgestelde vragen:",
    faqLinkLabel: "FAQ-link:",
    faq1: "Hoe controleer ik de status van mijn claim?",
    faq2: "Hoe werk ik mijn bankgegevens bij?",
    faq3: "Hoe neem ik contact op met VRA?",
    faq4: "Waarom is mijn claim vertraagd?",
    faqAnswer1:
      "U kunt de status van uw claim controleren via de onderstaande statuslink. U heeft uw VRA-nummer nodig.",
    faqAnswer2:
      "U kunt uw bankgegevens bijwerken via de onderstaande link voor bankgegevens. Gezichtsherkenning is vereist.",
    faqAnswer3: "U kunt contact opnemen met VRA via:",
    faqAnswer4:
      "Vertragingen kunnen optreden terwijl claims worden beoordeeld of wachten op verwerking.",
    agentReply: "Een VRA-supportagent zal u helpen.",
    emailLabel: "E-mail:",
    backInstruction: "Antwoord B of Back om terug te keren naar het hoofdmenu.",
    changeInstruction: "Antwoord 0 om de taal te wijzigen.",
  },
  fr: {
    welcome: "Bonjour, bienvenue sur le bot d'assistance VRA.",
    chooseLanguage: "Veuillez choisir votre langue :",
    mainTitle: "Menu principal VRA :",
    statusOption: "Statut de la demande",
    bankingOption: "Mettre à jour les coordonnées bancaires",
    faqOption: "Questions fréquemment posées",
    agentOption: "Discuter avec un agent",
    changeLanguageOption: "Changer de langue",
    statusReply:
      "Veuillez utiliser le lien ci-dessous pour vérifier le statut de votre demande. Vous aurez besoin de votre numéro VRA.",
    bankingReply:
      "Veuillez utiliser le lien ci-dessous pour mettre à jour vos coordonnées bancaires.",
    facialRequired: "La reconnaissance faciale est requise.",
    financeNotified:
      "Une fois les coordonnées bancaires mises à jour, le service Finance sera informé à :",
    faqTitle: "Questions fréquemment posées :",
    faqLinkLabel: "Lien FAQ :",
    faq1: "Comment vérifier le statut de ma demande ?",
    faq2: "Comment mettre à jour mes coordonnées bancaires ?",
    faq3: "Comment contacter VRA ?",
    faq4: "Pourquoi ma demande est-elle retardée ?",
    faqAnswer1:
      "Vous pouvez vérifier le statut de votre demande en utilisant le lien ci-dessous. Vous aurez besoin de votre numéro VRA.",
    faqAnswer2:
      "Vous pouvez mettre à jour vos coordonnées bancaires en utilisant le lien ci-dessous. La reconnaissance faciale est requise.",
    faqAnswer3: "Vous pouvez contacter VRA à :",
    faqAnswer4:
      "Des retards peuvent survenir pendant l'examen des demandes ou en attente de traitement.",
    agentReply: "Un agent d'assistance VRA vous aidera.",
    emailLabel: "E-mail :",
    backInstruction: "Répondez B ou Back pour revenir au menu principal.",
    changeInstruction: "Répondez 0 pour changer de langue.",
  },
  de: {
    welcome: "Hallo, willkommen beim VRA Support Bot.",
    chooseLanguage: "Bitte wählen Sie Ihre Sprache:",
    mainTitle: "VRA Hauptmenü:",
    statusOption: "Status des Anspruchs",
    bankingOption: "Bankdaten aktualisieren",
    faqOption: "Häufig gestellte Fragen",
    agentOption: "Mit einem Agenten chatten",
    changeLanguageOption: "Sprache ändern",
    statusReply:
      "Bitte verwenden Sie den untenstehenden Link, um den Status Ihres Anspruchs zu prüfen. Sie benötigen Ihre VRA-Nummer.",
    bankingReply:
      "Bitte verwenden Sie den untenstehenden Link, um Ihre Bankdaten zu aktualisieren.",
    facialRequired: "Gesichtserkennung ist erforderlich.",
    financeNotified:
      "Sobald die Bankdaten aktualisiert wurden, wird die Finanzabteilung benachrichtigt unter:",
    faqTitle: "Häufig gestellte Fragen:",
    faqLinkLabel: "FAQ-Link:",
    faq1: "Wie überprüfe ich den Status meines Anspruchs?",
    faq2: "Wie aktualisiere ich meine Bankdaten?",
    faq3: "Wie kontaktiere ich VRA?",
    faq4: "Warum verzögert sich mein Anspruch?",
    faqAnswer1:
      "Sie können den Status Ihres Anspruchs über den untenstehenden Statuslink prüfen. Sie benötigen Ihre VRA-Nummer.",
    faqAnswer2:
      "Sie können Ihre Bankdaten über den untenstehenden Link aktualisieren. Gesichtserkennung ist erforderlich.",
    faqAnswer3: "Sie können VRA kontaktieren unter:",
    faqAnswer4:
      "Verzögerungen können auftreten, während Ansprüche geprüft werden oder auf die Bearbeitung warten.",
    agentReply: "Ein VRA-Supportagent wird Ihnen helfen.",
    emailLabel: "E-Mail:",
    backInstruction:
      "Antworten Sie mit B oder Back, um zum Hauptmenü zurückzukehren.",
    changeInstruction: "Antworten Sie mit 0, um die Sprache zu ändern.",
  },
  it: {
    welcome: "Ciao, benvenuto nel bot di supporto VRA.",
    chooseLanguage: "Seleziona la tua lingua:",
    mainTitle: "Menu principale VRA:",
    statusOption: "Stato della richiesta",
    bankingOption: "Aggiorna dettagli bancari",
    faqOption: "Domande frequenti",
    agentOption: "Chatta con un agente",
    changeLanguageOption: "Cambia lingua",
    statusReply:
      "Utilizza il link qui sotto per controllare lo stato della tua richiesta. Avrai bisogno del tuo numero VRA.",
    bankingReply:
      "Utilizza il link qui sotto per aggiornare i tuoi dettagli bancari.",
    facialRequired: "Il riconoscimento facciale è richiesto.",
    financeNotified:
      "Una volta aggiornati i dettagli bancari, il reparto Finance sarà informato a:",
    faqTitle: "Domande frequenti:",
    faqLinkLabel: "Link FAQ:",
    faq1: "Come controllo lo stato della mia richiesta?",
    faq2: "Come aggiorno i miei dettagli bancari?",
    faq3: "Come contatto VRA?",
    faq4: "Perché la mia richiesta è in ritardo?",
    faqAnswer1:
      "Puoi controllare lo stato della tua richiesta usando il link qui sotto. Avrai bisogno del tuo numero VRA.",
    faqAnswer2:
      "Puoi aggiornare i tuoi dettagli bancari usando il link qui sotto. Il riconoscimento facciale è richiesto.",
    faqAnswer3: "Puoi contattare VRA a:",
    faqAnswer4:
      "I ritardi possono verificarsi mentre le richieste vengono esaminate o sono in attesa di elaborazione.",
    agentReply: "Un agente di supporto VRA ti assisterà.",
    emailLabel: "Email:",
    backInstruction: "Rispondi B o Back per tornare al menu principale.",
    changeInstruction: "Rispondi 0 per cambiare lingua.",
  },
  pt: {
    welcome: "Olá, bem-vindo ao Bot de Suporte VRA.",
    chooseLanguage: "Escolha o seu idioma:",
    mainTitle: "Menu principal VRA:",
    statusOption: "Estado da reclamação",
    bankingOption: "Atualizar dados bancários",
    faqOption: "Perguntas frequentes",
    agentOption: "Falar com um agente",
    changeLanguageOption: "Alterar idioma",
    statusReply:
      "Use o link abaixo para verificar o estado da sua reclamação. Irá precisar do seu número VRA.",
    bankingReply: "Use o link abaixo para atualizar os seus dados bancários.",
    facialRequired: "O reconhecimento facial é obrigatório.",
    financeNotified:
      "Assim que os dados bancários forem atualizados, o Finance será notificado em:",
    faqTitle: "Perguntas frequentes:",
    faqLinkLabel: "Link das FAQ:",
    faq1: "Como verifico o estado da minha reclamação?",
    faq2: "Como atualizo os meus dados bancários?",
    faq3: "Como contacto a VRA?",
    faq4: "Porque a minha reclamação está atrasada?",
    faqAnswer1:
      "Pode verificar o estado da sua reclamação usando o link abaixo. Irá precisar do seu número VRA.",
    faqAnswer2:
      "Pode atualizar os seus dados bancários usando o link abaixo. O reconhecimento facial é obrigatório.",
    faqAnswer3: "Pode contactar a VRA em:",
    faqAnswer4:
      "Podem ocorrer atrasos enquanto as reclamações estão a ser analisadas ou aguardam processamento.",
    agentReply: "Um agente de suporte VRA irá ajudá-lo.",
    emailLabel: "Email:",
    backInstruction: "Responda B ou Back para voltar ao menu principal.",
    changeInstruction: "Responda 0 para alterar o idioma.",
  },
  ru: {
    welcome: "Здравствуйте, добро пожаловать в бот поддержки VRA.",
    chooseLanguage: "Пожалуйста, выберите язык:",
    mainTitle: "Главное меню VRA:",
    statusOption: "Статус заявки",
    bankingOption: "Обновить банковские данные",
    faqOption: "Часто задаваемые вопросы",
    agentOption: "Связаться с агентом",
    changeLanguageOption: "Изменить язык",
    statusReply:
      "Пожалуйста, используйте ссылку ниже, чтобы проверить статус вашей заявки. Вам понадобится ваш номер VRA.",
    bankingReply:
      "Пожалуйста, используйте ссылку ниже, чтобы обновить банковские данные.",
    facialRequired: "Требуется распознавание лица.",
    financeNotified:
      "После обновления банковских данных финансовый отдел будет уведомлен по адресу:",
    faqTitle: "Часто задаваемые вопросы:",
    faqLinkLabel: "Ссылка на FAQ:",
    faq1: "Как проверить статус моей заявки?",
    faq2: "Как обновить банковские данные?",
    faq3: "Как связаться с VRA?",
    faq4: "Почему моя заявка задерживается?",
    faqAnswer1:
      "Вы можете проверить статус вашей заявки, используя ссылку ниже. Вам понадобится ваш номер VRA.",
    faqAnswer2:
      "Вы можете обновить банковские данные, используя ссылку ниже. Требуется распознавание лица.",
    faqAnswer3: "Вы можете связаться с VRA по адресу:",
    faqAnswer4:
      "Задержки могут возникать, пока заявки рассматриваются или ожидают обработки.",
    agentReply: "Агент поддержки VRA поможет вам.",
    emailLabel: "Эл. почта:",
    backInstruction:
      "Ответьте B или Back, чтобы вернуться в главное меню.",
    changeInstruction: "Ответьте 0, чтобы изменить язык.",
  },
  es: {
    welcome: "Hola, bienvenido al Bot de Soporte de VRA.",
    chooseLanguage: "Por favor elija su idioma:",
    mainTitle: "Menú principal de VRA:",
    statusOption: "Estado de la reclamación",
    bankingOption: "Actualizar datos bancarios",
    faqOption: "Preguntas frecuentes",
    agentOption: "Chatear con un agente",
    changeLanguageOption: "Cambiar idioma",
    statusReply:
      "Utilice el enlace de abajo para verificar el estado de su reclamación. Necesitará su número VRA.",
    bankingReply:
      "Utilice el enlace de abajo para actualizar sus datos bancarios.",
    facialRequired: "Se requiere reconocimiento facial.",
    financeNotified:
      "Una vez actualizados los datos bancarios, Finanzas será notificado en:",
    faqTitle: "Preguntas frecuentes:",
    faqLinkLabel: "Enlace de FAQ:",
    faq1: "¿Cómo verifico el estado de mi reclamación?",
    faq2: "¿Cómo actualizo mis datos bancarios?",
    faq3: "¿Cómo contacto con VRA?",
    faq4: "¿Por qué se retrasa mi reclamación?",
    faqAnswer1:
      "Puede verificar el estado de su reclamación usando el enlace de abajo. Necesitará su número VRA.",
    faqAnswer2:
      "Puede actualizar sus datos bancarios usando el enlace de abajo. Se requiere reconocimiento facial.",
    faqAnswer3: "Puede contactar con VRA en:",
    faqAnswer4:
      "Pueden ocurrir retrasos mientras las reclamaciones se revisan o esperan procesamiento.",
    agentReply: "Un agente de soporte de VRA le ayudará.",
    emailLabel: "Correo electrónico:",
    backInstruction: "Responda B o Back para volver al menú principal.",
    changeInstruction: "Responda 0 para cambiar el idioma.",
  },
};

const telegramText = {
  mainMenu: `Welcome to VRA Support 👋

1. Status of your claim

2. Update banking details

3. Frequently Asked Questions

4. Chat with an Agent`,
  faqTitle: "Frequently Asked Questions:",
  statusReply:
    "Please use the link below to check the status of your claim. You will need your VRA number.",
  bankingReply:
    "Please use the link below to update your banking details.\n\nFacial recognition is required.\n\nOnce banking details are updated, Finance will be notified at:\nfinance@vatrefundsa.co.za",
  agentReply:
    "A VRA support agent will assist you.\n\nEmail:\ninfo@vatrefundagency.co.za",
  liveAgent:
    "I could not find an FAQ answer for that. A VRA support agent will assist you.\n\nEmail:\ninfo@vatrefundagency.co.za",
};

function getWhatsAppSession(phoneNumber) {
  if (!whatsappSessions.has(phoneNumber)) {
    whatsappSessions.set(phoneNumber, {
      languageCode: null,
      languageName: null,
      state: STATES.LANGUAGE,
    });
  }

  return whatsappSessions.get(phoneNumber);
}

function getTelegramSession(chatId) {
  if (!telegramSessions.has(chatId)) {
    telegramSessions.set(chatId, {
      state: STATES.MAIN,
    });
  }

  return telegramSessions.get(chatId);
}

function isWhatsAppGreeting(input) {
  return ["hi", "hello", "start", "menu"].includes(input.trim().toLowerCase());
}

function isTelegramGreeting(input) {
  return ["hi", "hello", "start", "/start", "menu", "/menu"].includes(
    input.trim().toLowerCase()
  );
}

function isBack(input) {
  const value = input.trim().toLowerCase();
  return value === "b" || value === "back";
}

function getCopy(session) {
  return translations[session.languageCode] || translations.en;
}

function languageMenu() {
  return `${translations.en.welcome}

${translations.en.chooseLanguage}

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

function whatsappMainMenu(session) {
  const t = getCopy(session);

  return `${t.mainTitle}

1 ${t.statusOption}
2 ${t.bankingOption}
3 ${t.faqOption}
4 ${t.agentOption}
5 ${t.changeLanguageOption}

${t.changeInstruction}`;
}

function statusUrl(session) {
  return `https://vatrefundagency.co.za/check-refund-progress/?lang=${session.languageCode}`;
}

function bankingUrl(session) {
  return `https://vatrefundagency.co.za/forms/views/view.login.php?referral=thinksphere&lang=${session.languageCode}`;
}

function faqUrl(session) {
  return `https://vatrefundagency.co.za/faq/?lang=${session.languageCode}`;
}

function whatsappFaqMenu(session) {
  const t = getCopy(session);

  return `${t.faqTitle}

1 ${t.faq1}
2 ${t.faq2}
3 ${t.faq3}
4 ${t.faq4}

${t.faqLinkLabel}
${faqUrl(session)}

${t.backInstruction}
${t.changeInstruction}`;
}

function telegramFaqMenu() {
  return `${telegramText.faqTitle}

1 How do I check my claim status?
2 How do I update my banking details?
3 How do I contact VRA?
4 Why is my claim delayed?

FAQ link:
https://vatrefundagency.co.za/faq/`;
}

function buildWhatsAppFaqAnswer(input, session) {
  const item = FAQ_ITEMS[input];
  const t = getCopy(session);

  if (!item) {
    return null;
  }

  const parts = [t[item.answerKey]];

  if (item.linkType === "status") {
    parts.push(statusUrl(session));
  }

  if (item.linkType === "banking") {
    parts.push(bankingUrl(session));
  }

  if (item.includeFinance) {
    parts.push(`${t.financeNotified}\nfinance@vatrefundsa.co.za`);
  }

  if (item.includeInfoEmail) {
    parts.push("info@vatrefundagency.co.za");
  }

  parts.push(t.backInstruction);
  parts.push(t.changeInstruction);

  return parts.join("\n\n");
}

function buildTelegramFaqAnswer(input) {
  const item = FAQ_ITEMS[input];

  if (!item) {
    return null;
  }

  if (item.answerKey === "faqAnswer1") {
    return `${translations.en.faqAnswer1}

https://register.vatrefundagency.co.za/check-refund-progress/`;
  }

  if (item.answerKey === "faqAnswer2") {
    return `${translations.en.faqAnswer2}

https://vatrefundagency.co.za/forms/views/view.login.php?referral=thinksphere

${translations.en.financeNotified}
finance@vatrefundsa.co.za`;
  }

  if (item.answerKey === "faqAnswer3") {
    return `${translations.en.faqAnswer3}

info@vatrefundagency.co.za`;
  }

  if (item.answerKey === "faqAnswer4") {
    return translations.en.faqAnswer4;
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
    const errorText = await response.text();
    console.error("Telegram API error:", response.status, errorText);
  }
}

async function showLanguageMenu(to, session) {
  session.state = STATES.LANGUAGE;
  await sendWhatsAppMessage(to, languageMenu());
}

async function showWhatsAppMainMenu(to, session) {
  session.state = STATES.MAIN;
  await sendWhatsAppMessage(to, whatsappMainMenu(session));
}

async function handleWhatsAppLanguageState(to, input, session) {
  const selectedLanguage = languages[input];

  if (!selectedLanguage) {
    await sendWhatsAppMessage(to, languageMenu());
    return;
  }

  session.languageCode = selectedLanguage.languageCode;
  session.languageName = selectedLanguage.languageName;
  session.state = STATES.MAIN;

  await sendWhatsAppMessage(to, whatsappMainMenu(session));
}

async function handleWhatsAppMainState(to, input, session) {
  const t = getCopy(session);

  switch (input) {
    case "1":
      await sendWhatsAppMessage(
        to,
        `${t.statusReply}

${statusUrl(session)}

${t.backInstruction}
${t.changeInstruction}`
      );
      return;

    case "2":
      await sendWhatsAppMessage(
        to,
        `${t.bankingReply}

${bankingUrl(session)}

${t.facialRequired}

${t.financeNotified}
finance@vatrefundsa.co.za

${t.backInstruction}
${t.changeInstruction}`
      );
      return;

    case "3":
      session.state = STATES.FAQ;
      await sendWhatsAppMessage(to, whatsappFaqMenu(session));
      return;

    case "4":
      await sendWhatsAppMessage(
        to,
        `${t.agentReply}

${t.emailLabel}
info@vatrefundagency.co.za

${t.backInstruction}
${t.changeInstruction}`
      );
      return;

    case "5":
      await showLanguageMenu(to, session);
      return;

    default:
      await sendWhatsAppMessage(to, whatsappMainMenu(session));
      return;
  }
}

async function handleWhatsAppFaqState(to, input, session) {
  const answer = buildWhatsAppFaqAnswer(input, session);

  if (!answer) {
    await sendWhatsAppMessage(to, whatsappFaqMenu(session));
    return;
  }

  await sendWhatsAppMessage(to, answer);
}

async function showTelegramMainMenu(chatId, session) {
  session.state = STATES.MAIN;
  await sendTelegramMessage(chatId, telegramText.mainMenu);
}

async function handleTelegramMainState(chatId, input, session) {
  switch (input) {
    case "1":
      await sendTelegramMessage(
        chatId,
        `${telegramText.statusReply}

https://register.vatrefundagency.co.za/check-refund-progress/`
      );
      return;

    case "2":
      await sendTelegramMessage(
        chatId,
        `${telegramText.bankingReply}

https://vatrefundagency.co.za/forms/views/view.login.php?referral=thinksphere`
      );
      return;

    case "3":
      session.state = STATES.FAQ;
      await sendTelegramMessage(chatId, telegramFaqMenu());
      return;

    case "4":
      await sendTelegramMessage(chatId, telegramText.agentReply);
      return;

    default:
      await sendTelegramMessage(chatId, telegramText.liveAgent);
      return;
  }
}

async function handleTelegramFaqState(chatId, input, session) {
  const answer = buildTelegramFaqAnswer(input);

  if (!answer) {
    session.state = STATES.MAIN;
    await sendTelegramMessage(chatId, telegramText.liveAgent);
    return;
  }

  await sendTelegramMessage(chatId, answer);
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

    if (input === "0") {
      await showLanguageMenu(from, session);
      return;
    }

    if (isWhatsAppGreeting(input)) {
      if (session.languageCode) {
        await showWhatsAppMainMenu(from, session);
      } else {
        await showLanguageMenu(from, session);
      }
      return;
    }

    if (isBack(input)) {
      if (session.languageCode) {
        await showWhatsAppMainMenu(from, session);
      } else {
        await showLanguageMenu(from, session);
      }
      return;
    }

    if (session.state === STATES.LANGUAGE || !session.languageCode) {
      await handleWhatsAppLanguageState(from, input, session);
      return;
    }

    if (session.state === STATES.FAQ) {
      await handleWhatsAppFaqState(from, input, session);
      return;
    }

    await handleWhatsAppMainState(from, input, session);
  } catch (error) {
    console.error("Webhook processing error:", error);
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

    if (isTelegramGreeting(input)) {
      await showTelegramMainMenu(chatId, session);
      return;
    }

    if (isBack(input)) {
      await showTelegramMainMenu(chatId, session);
      return;
    }

    if (session.state === STATES.FAQ) {
      await handleTelegramFaqState(chatId, input, session);
      return;
    }

    await handleTelegramMainState(chatId, input, session);
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
