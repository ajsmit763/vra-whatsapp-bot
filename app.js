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
  FEEDBACK: "feedback",
};

const whatsappSessions = new Map();
const telegramSessions = new Map();

const STATUS_LINK = "https://register.vatrefundagency.co.za/check-refund-progress/";
const BANKING_LINK =
  "https://vatrefundagency.co.za/forms/views/view.login.php?referral=thinksphere";
const NEW_CLAIM_PORTAL_LINK =
  "https://vatrefundagency.co.za/forms/views/view.login.php";
const NEW_CLAIM_VIDEO_LINK = "https://youtu.be/zatxMKDCNL4";
const WEBSITE_LINK = "https://vatrefundagency.co.za/";
const SUPPORT_EMAIL = "info@vatrefundagency.co.za";
const FINANCE_EMAIL = "finance@vatrefundagency.co.za";

const languageChoices = {
  "1": { code: "en", name: "English" },
  "2": { code: "ar", name: "Arabic" },
  "3": { code: "zh", name: "Chinese Simplified" },
  "4": { code: "nl", name: "Dutch" },
  "5": { code: "fr", name: "French" },
  "6": { code: "de", name: "German" },
  "7": { code: "it", name: "Italian" },
  "8": { code: "pt", name: "Portuguese" },
  "9": { code: "ru", name: "Russian" },
  "10": { code: "es", name: "Spanish" },
};

const translations = {
  en: {
    mainTitle: "VRA Main Menu:",
    statusOption: "Status of claim",
    bankingOption: "Update banking details",
    newClaimOption: "New Claimant / Submit a New Claim",
    faqOption: "Frequently Asked Questions",
    agentOption: "Chat with an Agent",
    feedbackOption: "Client Suggestions / Feedback",
    changeLanguageOption: "Change language",
    statusReply:
      "Please use the link below to check the status of your claim. You will need your VRA number.",
    bankingReply:
      "Please use the link below to update your banking details.\n\nFacial recognition is required.",
    financeNotice: `Once banking details are updated, Finance will be notified at:
${FINANCE_EMAIL}`,
    newClaimReply: `If you are a new claimant or would like to submit a VAT refund claim, please log in to our online portal and follow the step-by-step video guide provided below:

Online Portal App:
${NEW_CLAIM_PORTAL_LINK}

Step-by-Step Video:
${NEW_CLAIM_VIDEO_LINK}

We also recommend visiting our website to familiarise yourself with the claim requirements and supporting documents needed to ensure that your claim is eligible for processing.

Website:
${WEBSITE_LINK}`,
    faqTitle: "Frequently Asked Questions:",
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
    feedbackIntro:
      "Your feedback is important to us. We welcome any suggestions or comments that may help us improve our services and enhance your overall experience with VRA. Please feel free to share your feedback with us at any time.",
    feedbackPrompt: "Please type your feedback below.",
    feedbackReceived: "Thank you. Your feedback has been received.",
    backInstruction: "Reply B or Back to return to the main menu.",
    changeInstruction: "Reply 0 to change language.",
    backToMain: "Back to Main Menu",
    noFaqAnswer: `I could not find an FAQ answer for that. A VRA support agent will assist you.

Email:
${SUPPORT_EMAIL}`,
  },

  ar: {
    mainTitle: "القائمة الرئيسية لـ VRA:",
    statusOption: "حالة المطالبة",
    bankingOption: "تحديث التفاصيل البنكية",
    newClaimOption: "مطالب جديد / تقديم مطالبة جديدة",
    faqOption: "الأسئلة الشائعة",
    agentOption: "التحدث مع وكيل",
    feedbackOption: "اقتراحات العملاء / الملاحظات",
    changeLanguageOption: "تغيير اللغة",
    statusReply:
      "يرجى استخدام الرابط أدناه للتحقق من حالة مطالبتك. ستحتاج إلى رقم VRA الخاص بك.",
    bankingReply:
      "يرجى استخدام الرابط أدناه لتحديث التفاصيل البنكية الخاصة بك.\n\nالتعرف على الوجه مطلوب.",
    financeNotice: `بعد تحديث التفاصيل البنكية، سيتم إخطار قسم المالية على:
${FINANCE_EMAIL}`,
    newClaimReply: `إذا كنت مطالباً جديداً أو ترغب في تقديم مطالبة استرداد ضريبة القيمة المضافة، يرجى تسجيل الدخول إلى بوابتنا الإلكترونية واتباع دليل الفيديو خطوة بخطوة أدناه:

تطبيق البوابة الإلكترونية:
${NEW_CLAIM_PORTAL_LINK}

فيديو خطوة بخطوة:
${NEW_CLAIM_VIDEO_LINK}

نوصي أيضاً بزيارة موقعنا الإلكتروني للتعرف على متطلبات المطالبة والمستندات الداعمة المطلوبة لضمان أن مطالبتك مؤهلة للمعالجة.

الموقع الإلكتروني:
${WEBSITE_LINK}`,
    faqTitle: "الأسئلة الشائعة:",
    faqOptions: [
      "متى سأستلم دفعة ضريبة القيمة المضافة؟",
      "ما هو مبلغ ضريبة القيمة المضافة الخاص بي؟",
      "كيف أقدم مطالبة؟",
      "العودة إلى القائمة الرئيسية",
    ],
    vatPaymentAnswer: `يرجى التواصل مع قسم المالية لدينا على:
${FINANCE_EMAIL}`,
    vatAmountAnswer: `يرجى التواصل مع فريق الدعم لدينا على:
${SUPPORT_EMAIL}

أو فريق المالية لدينا على:
${FINANCE_EMAIL}

سيقدمون المعلومات اللازمة بخصوص مبلغ ضريبة القيمة المضافة الخاص بك.`,
    claimProcessAnswer: `يرجى زيارة موقعنا الإلكتروني لمعرفة عملية المطالبة الكاملة والوثائق المطلوبة:

${WEBSITE_LINK}`,
    agentReply: `سيساعدك وكيل دعم VRA.

البريد الإلكتروني:
${SUPPORT_EMAIL}`,
    feedbackIntro:
      "ملاحظاتك مهمة بالنسبة لنا. نرحب بأي اقتراحات أو تعليقات قد تساعدنا على تحسين خدماتنا وتعزيز تجربتك العامة مع VRA. لا تتردد في مشاركة ملاحظاتك معنا في أي وقت.",
    feedbackPrompt: "يرجى كتابة ملاحظاتك أدناه.",
    feedbackReceived: "شكراً لك. تم استلام ملاحظاتك.",
    backInstruction: "أرسل B أو Back للعودة إلى القائمة الرئيسية.",
    changeInstruction: "أرسل 0 لتغيير اللغة.",
    backToMain: "العودة إلى القائمة الرئيسية",
    noFaqAnswer: `لم أتمكن من العثور على إجابة لهذا السؤال. سيساعدك وكيل دعم VRA.

البريد الإلكتروني:
${SUPPORT_EMAIL}`,
  },

  zh: {
    mainTitle: "VRA 主菜单：",
    statusOption: "索赔状态",
    bankingOption: "更新银行资料",
    newClaimOption: "新申请人 / 提交新申请",
    faqOption: "常见问题",
    agentOption: "与客服人员聊天",
    feedbackOption: "客户建议 / 反馈",
    changeLanguageOption: "更改语言",
    statusReply: "请使用下面的链接查询您的索赔状态。您需要您的 VRA 编号。",
    bankingReply: "请使用下面的链接更新您的银行资料。\n\n需要进行面部识别。",
    financeNotice: `银行资料更新后，财务部门将收到通知：
${FINANCE_EMAIL}`,
    newClaimReply: `如果您是新申请人，或想提交增值税退款申请，请登录我们的在线门户，并按照下面提供的分步视频指南操作：

在线门户应用：
${NEW_CLAIM_PORTAL_LINK}

分步视频：
${NEW_CLAIM_VIDEO_LINK}

我们还建议您访问我们的网站，熟悉申请要求和所需支持文件，以确保您的申请符合处理条件。

网站：
${WEBSITE_LINK}`,
    faqTitle: "常见问题：",
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
    feedbackIntro:
      "您的反馈对我们很重要。我们欢迎任何有助于改进服务并提升您在 VRA 整体体验的建议或意见。欢迎您随时与我们分享反馈。",
    feedbackPrompt: "请在下面输入您的反馈。",
    feedbackReceived: "谢谢。您的反馈已收到。",
    backInstruction: "回复 B 或 Back 返回主菜单。",
    changeInstruction: "回复 0 更改语言。",
    backToMain: "返回主菜单",
    noFaqAnswer: `我找不到该问题的 FAQ 答案。VRA 支持人员将协助您。

电子邮件：
${SUPPORT_EMAIL}`,
  },

  nl: {
    mainTitle: "VRA Hoofdmenu:",
    statusOption: "Status van claim",
    bankingOption: "Bankgegevens bijwerken",
    newClaimOption: "Nieuwe claimant / Nieuwe claim indienen",
    faqOption: "Veelgestelde vragen",
    agentOption: "Chat met een agent",
    feedbackOption: "Suggesties / feedback van klanten",
    changeLanguageOption: "Taal wijzigen",
    statusReply:
      "Gebruik de onderstaande link om de status van uw claim te controleren. U heeft uw VRA-nummer nodig.",
    bankingReply:
      "Gebruik de onderstaande link om uw bankgegevens bij te werken.\n\nGezichtsherkenning is vereist.",
    financeNotice: `Zodra de bankgegevens zijn bijgewerkt, wordt Finance op de hoogte gesteld via:
${FINANCE_EMAIL}`,
    newClaimReply: `Als u een nieuwe claimant bent of een btw-teruggaafclaim wilt indienen, log dan in op ons online portaal en volg de stapsgewijze videogids hieronder:

Online portaal-app:
${NEW_CLAIM_PORTAL_LINK}

Stapsgewijze video:
${NEW_CLAIM_VIDEO_LINK}

Wij raden u ook aan onze website te bezoeken om vertrouwd te raken met de claimvereisten en ondersteunende documenten die nodig zijn om ervoor te zorgen dat uw claim in aanmerking komt voor verwerking.

Website:
${WEBSITE_LINK}`,
    faqTitle: "Veelgestelde vragen:",
    faqOptions: [
      "Wanneer ontvang ik de btw-betaling?",
      "Wat is mijn btw-bedrag?",
      "Hoe dien ik een claim in?",
      "Terug naar hoofdmenu",
    ],
    vatPaymentAnswer: `Neem contact op met onze financiële afdeling via:
${FINANCE_EMAIL}`,
    vatAmountAnswer: `Neem contact op met ons ondersteuningsteam via:
${SUPPORT_EMAIL}

of met ons financiële team via:
${FINANCE_EMAIL}

Zij zullen de nodige informatie over uw btw-bedrag verstrekken.`,
    claimProcessAnswer: `Bezoek onze website voor het volledige claimproces en de vereiste documentatie:

${WEBSITE_LINK}`,
    agentReply: `Een VRA-supportagent zal u helpen.

E-mail:
${SUPPORT_EMAIL}`,
    feedbackIntro:
      "Uw feedback is belangrijk voor ons. Wij verwelkomen alle suggesties of opmerkingen die ons kunnen helpen onze diensten te verbeteren en uw algemene ervaring met VRA te versterken. U kunt uw feedback op elk moment met ons delen.",
    feedbackPrompt: "Typ hieronder uw feedback.",
    feedbackReceived: "Dank u. Uw feedback is ontvangen.",
    backInstruction: "Antwoord B of Back om terug te keren naar het hoofdmenu.",
    changeInstruction: "Antwoord 0 om de taal te wijzigen.",
    backToMain: "Terug naar hoofdmenu",
    noFaqAnswer: `Ik kon geen FAQ-antwoord daarvoor vinden. Een VRA-supportagent zal u helpen.

E-mail:
${SUPPORT_EMAIL}`,
  },

  fr: {
    mainTitle: "Menu principal VRA :",
    statusOption: "Statut de la demande",
    bankingOption: "Mettre à jour les coordonnées bancaires",
    newClaimOption: "Nouveau demandeur / Soumettre une nouvelle demande",
    faqOption: "Questions fréquemment posées",
    agentOption: "Discuter avec un agent",
    feedbackOption: "Suggestions / commentaires des clients",
    changeLanguageOption: "Changer de langue",
    statusReply:
      "Veuillez utiliser le lien ci-dessous pour vérifier le statut de votre demande. Vous aurez besoin de votre numéro VRA.",
    bankingReply:
      "Veuillez utiliser le lien ci-dessous pour mettre à jour vos coordonnées bancaires.\n\nLa reconnaissance faciale est requise.",
    financeNotice: `Une fois les coordonnées bancaires mises à jour, le service Finance sera informé à :
${FINANCE_EMAIL}`,
    newClaimReply: `Si vous êtes un nouveau demandeur ou souhaitez soumettre une demande de remboursement de TVA, veuillez vous connecter à notre portail en ligne et suivre le guide vidéo étape par étape fourni ci-dessous :

Application du portail en ligne :
${NEW_CLAIM_PORTAL_LINK}

Vidéo étape par étape :
${NEW_CLAIM_VIDEO_LINK}

Nous vous recommandons également de visiter notre site Web afin de vous familiariser avec les exigences de la demande et les documents justificatifs nécessaires pour garantir que votre demande est admissible au traitement.

Site Web :
${WEBSITE_LINK}`,
    faqTitle: "Questions fréquemment posées :",
    faqOptions: [
      "Quand vais-je recevoir le paiement de la TVA ?",
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
    feedbackIntro:
      "Vos commentaires sont importants pour nous. Nous accueillons toutes les suggestions ou remarques qui peuvent nous aider à améliorer nos services et à renforcer votre expérience globale avec VRA. N'hésitez pas à nous faire part de vos commentaires à tout moment.",
    feedbackPrompt: "Veuillez saisir vos commentaires ci-dessous.",
    feedbackReceived: "Merci. Vos commentaires ont été reçus.",
    backInstruction: "Répondez B ou Back pour revenir au menu principal.",
    changeInstruction: "Répondez 0 pour changer de langue.",
    backToMain: "Retour au menu principal",
    noFaqAnswer: `Je n'ai pas trouvé de réponse FAQ pour cela. Un agent du support VRA vous aidera.

E-mail :
${SUPPORT_EMAIL}`,
  },

  de: {
    mainTitle: "VRA Hauptmenü:",
    statusOption: "Status des Anspruchs",
    bankingOption: "Bankdaten aktualisieren",
    newClaimOption: "Neuer Antragsteller / Neuen Antrag einreichen",
    faqOption: "Häufig gestellte Fragen",
    agentOption: "Mit einem Agenten chatten",
    feedbackOption: "Kundenvorschläge / Feedback",
    changeLanguageOption: "Sprache ändern",
    statusReply:
      "Bitte verwenden Sie den untenstehenden Link, um den Status Ihres Anspruchs zu prüfen. Sie benötigen Ihre VRA-Nummer.",
    bankingReply:
      "Bitte verwenden Sie den untenstehenden Link, um Ihre Bankdaten zu aktualisieren.\n\nGesichtserkennung ist erforderlich.",
    financeNotice: `Sobald die Bankdaten aktualisiert wurden, wird die Finanzabteilung benachrichtigt unter:
${FINANCE_EMAIL}`,
    newClaimReply: `Wenn Sie ein neuer Antragsteller sind oder einen Antrag auf Mehrwertsteuerrückerstattung einreichen möchten, melden Sie sich bitte in unserem Online-Portal an und folgen Sie der unten bereitgestellten Schritt-für-Schritt-Videoanleitung:

Online-Portal-App:
${NEW_CLAIM_PORTAL_LINK}

Schritt-für-Schritt-Video:
${NEW_CLAIM_VIDEO_LINK}

Wir empfehlen Ihnen außerdem, unsere Website zu besuchen, um sich mit den Antragsanforderungen und den erforderlichen Nachweisdokumenten vertraut zu machen, damit Ihr Antrag für die Bearbeitung geeignet ist.

Website:
${WEBSITE_LINK}`,
    faqTitle: "Häufig gestellte Fragen:",
    faqOptions: [
      "Wann erhalte ich die Mehrwertsteuerzahlung?",
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
    feedbackIntro:
      "Ihr Feedback ist uns wichtig. Wir freuen uns über alle Vorschläge oder Kommentare, die uns helfen können, unsere Dienstleistungen zu verbessern und Ihre gesamte Erfahrung mit VRA zu optimieren. Sie können uns Ihr Feedback jederzeit mitteilen.",
    feedbackPrompt: "Bitte geben Sie unten Ihr Feedback ein.",
    feedbackReceived: "Vielen Dank. Ihr Feedback wurde erhalten.",
    backInstruction: "Antworten Sie mit B oder Back, um zum Hauptmenü zurückzukehren.",
    changeInstruction: "Antworten Sie mit 0, um die Sprache zu ändern.",
    backToMain: "Zurück zum Hauptmenü",
    noFaqAnswer: `Ich konnte keine FAQ-Antwort dafür finden. Ein VRA-Supportagent wird Ihnen helfen.

E-Mail:
${SUPPORT_EMAIL}`,
  },

  it: {
    mainTitle: "Menu principale VRA:",
    statusOption: "Stato della richiesta",
    bankingOption: "Aggiorna dettagli bancari",
    newClaimOption: "Nuovo richiedente / Invia una nuova richiesta",
    faqOption: "Domande frequenti",
    agentOption: "Chatta con un agente",
    feedbackOption: "Suggerimenti / feedback dei clienti",
    changeLanguageOption: "Cambia lingua",
    statusReply:
      "Utilizza il link qui sotto per controllare lo stato della tua richiesta. Avrai bisogno del tuo numero VRA.",
    bankingReply:
      "Utilizza il link qui sotto per aggiornare i tuoi dettagli bancari.\n\nIl riconoscimento facciale è richiesto.",
    financeNotice: `Una volta aggiornati i dettagli bancari, il reparto Finance sarà informato a:
${FINANCE_EMAIL}`,
    newClaimReply: `Se sei un nuovo richiedente o desideri inviare una richiesta di rimborso IVA, accedi al nostro portale online e segui la guida video passo dopo passo fornita di seguito:

App del portale online:
${NEW_CLAIM_PORTAL_LINK}

Video passo dopo passo:
${NEW_CLAIM_VIDEO_LINK}

Ti consigliamo inoltre di visitare il nostro sito web per familiarizzare con i requisiti della richiesta e i documenti di supporto necessari per garantire che la tua richiesta sia idonea all'elaborazione.

Sito web:
${WEBSITE_LINK}`,
    faqTitle: "Domande frequenti:",
    faqOptions: [
      "Quando riceverò il pagamento IVA?",
      "Qual è il mio importo IVA?",
      "Come posso richiedere il rimborso?",
      "Torna al menu principale",
    ],
    vatPaymentAnswer: `Contatta il nostro reparto finanziario a:
${FINANCE_EMAIL}`,
    vatAmountAnswer: `Contatta il nostro team di supporto a:
${SUPPORT_EMAIL}

o il nostro team finanziario a:
${FINANCE_EMAIL}

Ti forniranno le informazioni necessarie sul tuo importo IVA.`,
    claimProcessAnswer: `Visita il nostro sito web per il processo completo di richiesta e la documentazione richiesta:

${WEBSITE_LINK}`,
    agentReply: `Un agente di supporto VRA ti assisterà.

Email:
${SUPPORT_EMAIL}`,
    feedbackIntro:
      "Il tuo feedback è importante per noi. Accogliamo con piacere qualsiasi suggerimento o commento che possa aiutarci a migliorare i nostri servizi e la tua esperienza complessiva con VRA. Sentiti libero di condividere il tuo feedback con noi in qualsiasi momento.",
    feedbackPrompt: "Digita il tuo feedback qui sotto.",
    feedbackReceived: "Grazie. Il tuo feedback è stato ricevuto.",
    backInstruction: "Rispondi B o Back per tornare al menu principale.",
    changeInstruction: "Rispondi 0 per cambiare lingua.",
    backToMain: "Torna al menu principale",
    noFaqAnswer: `Non ho trovato una risposta FAQ per questo. Un agente di supporto VRA ti assisterà.

Email:
${SUPPORT_EMAIL}`,
  },

  pt: {
    mainTitle: "Menu principal VRA:",
    statusOption: "Estado da reclamação",
    bankingOption: "Atualizar dados bancários",
    newClaimOption: "Novo reclamante / Submeter uma nova reclamação",
    faqOption: "Perguntas frequentes",
    agentOption: "Falar com um agente",
    feedbackOption: "Sugestões / feedback do cliente",
    changeLanguageOption: "Alterar idioma",
    statusReply:
      "Use o link abaixo para verificar o estado da sua reclamação. Irá precisar do seu número VRA.",
    bankingReply:
      "Use o link abaixo para atualizar os seus dados bancários.\n\nO reconhecimento facial é obrigatório.",
    financeNotice: `Assim que os dados bancários forem atualizados, o departamento financeiro será notificado em:
${FINANCE_EMAIL}`,
    newClaimReply: `Se é um novo reclamante ou pretende submeter uma reclamação de reembolso de IVA, inicie sessão no nosso portal online e siga o guia em vídeo passo a passo fornecido abaixo:

Aplicação do portal online:
${NEW_CLAIM_PORTAL_LINK}

Vídeo passo a passo:
${NEW_CLAIM_VIDEO_LINK}

Também recomendamos que visite o nosso website para se familiarizar com os requisitos da reclamação e os documentos de apoio necessários para garantir que a sua reclamação é elegível para processamento.

Website:
${WEBSITE_LINK}`,
    faqTitle: "Perguntas frequentes:",
    faqOptions: [
      "Quando vou receber o pagamento do IVA?",
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
    feedbackIntro:
      "O seu feedback é importante para nós. Acolhemos quaisquer sugestões ou comentários que possam ajudar-nos a melhorar os nossos serviços e a melhorar a sua experiência geral com a VRA. Sinta-se à vontade para partilhar o seu feedback connosco a qualquer momento.",
    feedbackPrompt: "Digite o seu feedback abaixo.",
    feedbackReceived: "Obrigado. O seu feedback foi recebido.",
    backInstruction: "Responda B ou Back para voltar ao menu principal.",
    changeInstruction: "Responda 0 para alterar o idioma.",
    backToMain: "Voltar ao menu principal",
    noFaqAnswer: `Não encontrei uma resposta nas FAQ para isso. Um agente de suporte VRA irá ajudá-lo.

Email:
${SUPPORT_EMAIL}`,
  },

  ru: {
    mainTitle: "Главное меню VRA:",
    statusOption: "Статус заявки",
    bankingOption: "Обновить банковские данные",
    newClaimOption: "Новый заявитель / Подать новую заявку",
    faqOption: "Часто задаваемые вопросы",
    agentOption: "Связаться с агентом",
    feedbackOption: "Предложения / отзывы клиентов",
    changeLanguageOption: "Изменить язык",
    statusReply:
      "Пожалуйста, используйте ссылку ниже, чтобы проверить статус вашей заявки. Вам понадобится ваш номер VRA.",
    bankingReply:
      "Пожалуйста, используйте ссылку ниже, чтобы обновить банковские данные.\n\nТребуется распознавание лица.",
    financeNotice: `После обновления банковских данных финансовый отдел будет уведомлен по адресу:
${FINANCE_EMAIL}`,
    newClaimReply: `Если вы новый заявитель или хотите подать заявку на возврат НДС, пожалуйста, войдите в наш онлайн-портал и следуйте пошаговому видео-руководству ниже:

Приложение онлайн-портала:
${NEW_CLAIM_PORTAL_LINK}

Пошаговое видео:
${NEW_CLAIM_VIDEO_LINK}

Мы также рекомендуем посетить наш сайт, чтобы ознакомиться с требованиями к заявке и необходимыми подтверждающими документами, чтобы ваша заявка соответствовала условиям обработки.

Сайт:
${WEBSITE_LINK}`,
    faqTitle: "Часто задаваемые вопросы:",
    faqOptions: [
      "Когда я получу выплату НДС?",
      "Какова моя сумма НДС?",
      "Как подать заявку?",
      "Вернуться в главное меню",
    ],
    vatPaymentAnswer: `Пожалуйста, свяжитесь с нашим финансовым отделом по адресу:
${FINANCE_EMAIL}`,
    vatAmountAnswer: `Пожалуйста, свяжитесь с нашей службой поддержки по адресу:
${SUPPORT_EMAIL}

или с нашей финансовой командой по адресу:
${FINANCE_EMAIL}

Они предоставят необходимую информацию о вашей сумме НДС.`,
    claimProcessAnswer: `Пожалуйста, посетите наш сайт, чтобы узнать полный процесс подачи заявки и необходимые документы:

${WEBSITE_LINK}`,
    agentReply: `Агент поддержки VRA поможет вам.

Эл. почта:
${SUPPORT_EMAIL}`,
    feedbackIntro:
      "Ваш отзыв важен для нас. Мы приветствуем любые предложения или комментарии, которые помогут нам улучшить наши услуги и ваш общий опыт работы с VRA. Пожалуйста, делитесь своим отзывом с нами в любое время.",
    feedbackPrompt: "Пожалуйста, введите ваш отзыв ниже.",
    feedbackReceived: "Спасибо. Ваш отзыв получен.",
    backInstruction: "Ответьте B или Back, чтобы вернуться в главное меню.",
    changeInstruction: "Ответьте 0, чтобы изменить язык.",
    backToMain: "Вернуться в главное меню",
    noFaqAnswer: `Я не смог найти ответ в FAQ на этот вопрос. Агент поддержки VRA поможет вам.

Эл. почта:
${SUPPORT_EMAIL}`,
  },

  es: {
    mainTitle: "Menú principal de VRA:",
    statusOption: "Estado de la reclamación",
    bankingOption: "Actualizar datos bancarios",
    newClaimOption: "Nuevo reclamante / Enviar una nueva reclamación",
    faqOption: "Preguntas frecuentes",
    agentOption: "Chatear con un agente",
    feedbackOption: "Sugerencias / comentarios del cliente",
    changeLanguageOption: "Cambiar idioma",
    statusReply:
      "Utilice el enlace de abajo para verificar el estado de su reclamación. Necesitará su número VRA.",
    bankingReply:
      "Utilice el enlace de abajo para actualizar sus datos bancarios.\n\nSe requiere reconocimiento facial.",
    financeNotice: `Una vez actualizados los datos bancarios, Finanzas será notificado en:
${FINANCE_EMAIL}`,
    newClaimReply: `Si es un nuevo reclamante o desea presentar una reclamación de reembolso del IVA, inicie sesión en nuestro portal en línea y siga la guía de video paso a paso que se proporciona a continuación:

Aplicación del portal en línea:
${NEW_CLAIM_PORTAL_LINK}

Video paso a paso:
${NEW_CLAIM_VIDEO_LINK}

También recomendamos visitar nuestro sitio web para familiarizarse con los requisitos de la reclamación y los documentos de respaldo necesarios para garantizar que su reclamación sea elegible para procesamiento.

Sitio web:
${WEBSITE_LINK}`,
    faqTitle: "Preguntas frecuentes:",
    faqOptions: [
      "¿Cuándo recibiré el pago del IVA?",
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
    feedbackIntro:
      "Sus comentarios son importantes para nosotros. Agradecemos cualquier sugerencia o comentario que pueda ayudarnos a mejorar nuestros servicios y su experiencia general con VRA. No dude en compartir sus comentarios con nosotros en cualquier momento.",
    feedbackPrompt: "Por favor escriba sus comentarios abajo.",
    feedbackReceived: "Gracias. Sus comentarios han sido recibidos.",
    backInstruction: "Responda B o Back para volver al menú principal.",
    changeInstruction: "Responda 0 para cambiar el idioma.",
    backToMain: "Volver al menú principal",
    noFaqAnswer: `No encontré una respuesta de FAQ para eso. Un agente de soporte de VRA le ayudará.

Correo electrónico:
${SUPPORT_EMAIL}`,
  },
};

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[?!.,;:()[\]{}'"¿¡]/g, "")
    .replace(/\s+/g, " ");
}

function t(languageCode) {
  return translations[languageCode] || translations.en;
}

function isGreeting(input) {
  return ["hi", "hello", "start", "/start"].includes(normalizeText(input));
}

function isBackToMain(input) {
  const value = normalizeText(input);

  return [
    "b",
    "back",
    "main menu",
    "back to main menu",
    "العودة إلى القائمة الرئيسية",
    "返回主菜单",
    "terug naar hoofdmenu",
    "retour au menu principal",
    "zuruck zum hauptmenu",
    "zurück zum hauptmenü",
    "torna al menu principale",
    "voltar ao menu principal",
    "вернуться в главное меню",
    "volver al menu principal",
  ].includes(value);
}

function isFaqRequest(input) {
  const value = normalizeText(input);

  return [
    "4",
    "faq",
    "frequently asked questions",
    "frequently asked questions menu",
    "الأسئلة الشائعة",
    "常见问题",
    "veelgestelde vragen",
    "questions frequemment posees",
    "häufig gestellte fragen",
    "haufig gestellte fragen",
    "domande frequenti",
    "perguntas frequentes",
    "часто задаваемые вопросы",
    "preguntas frecuentes",
  ].includes(value);
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

function mainMenu(languageCode) {
  const copy = t(languageCode);

  return `${copy.mainTitle}

1 ${copy.statusOption}
2 ${copy.bankingOption}
3 ${copy.newClaimOption}
4 ${copy.faqOption}
5 ${copy.agentOption}
6 ${copy.feedbackOption}
7 ${copy.changeLanguageOption}`;
}

function faqMenu(languageCode) {
  const copy = t(languageCode);

  return `${copy.faqTitle}

1 ${copy.faqOptions[0]}
2 ${copy.faqOptions[1]}
3 ${copy.faqOptions[2]}
4 ${copy.faqOptions[3]}`;
}

function statusMessage(languageCode) {
  return `${t(languageCode).statusReply}

${STATUS_LINK}`;
}

function bankingMessage(languageCode) {
  const copy = t(languageCode);

  return `${copy.bankingReply}

${BANKING_LINK}

${copy.financeNotice}`;
}

function newClaimMessage(languageCode) {
  const copy = t(languageCode);

  return `${copy.newClaimReply}

${copy.backInstruction}
${copy.changeInstruction}`;
}

function agentMessage(languageCode) {
  return t(languageCode).agentReply;
}

function feedbackPromptMessage(languageCode) {
  const copy = t(languageCode);

  return `${copy.feedbackIntro}

${copy.feedbackPrompt}`;
}

function feedbackReceivedMessage(languageCode) {
  const copy = t(languageCode);

  return `${copy.feedbackReceived}

${copy.backInstruction}
${copy.changeInstruction}`;
}

function matchFaq(input) {
  const value = normalizeText(input);

  if (value === "1") return "vatPayment";
  if (value === "2") return "vatAmount";
  if (value === "3") return "claimProcess";

  return null;
}

function faqAnswer(input, languageCode) {
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
      languageCode: null,
      languageName: null,
      state: STATES.LANGUAGE,
    });
  }

  return telegramSessions.get(chatId);
}

function logFeedback(platform, userId, session, feedbackMessage) {
  console.log({
    platform,
    userId,
    selectedLanguage: session.languageName || session.languageCode || "Unknown",
    feedbackMessage,
    timestamp: new Date().toISOString(),
  });
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

async function showLanguageMenu(session, sendReply) {
  session.languageCode = null;
  session.languageName = null;
  session.state = STATES.LANGUAGE;
  await sendReply(languageMenu());
}

async function handleSupportInput(input, session, sendReply, platform, userId) {
  const normalizedInput = normalizeText(input);

  if (normalizedInput === "0" || normalizedInput === "change language") {
    await showLanguageMenu(session, sendReply);
    return;
  }

  if (session.state === STATES.FEEDBACK) {
    if (isBackToMain(input)) {
      session.state = STATES.MAIN;
      await sendReply(mainMenu(session.languageCode));
      return;
    }

    logFeedback(platform, userId, session, input);
    session.state = STATES.MAIN;
    await sendReply(feedbackReceivedMessage(session.languageCode));
    return;
  }

  if (isGreeting(input)) {
    if (session.languageCode) {
      session.state = STATES.MAIN;
      await sendReply(mainMenu(session.languageCode));
    } else {
      await showLanguageMenu(session, sendReply);
    }
    return;
  }

  if (session.state === STATES.LANGUAGE || !session.languageCode) {
    const selectedLanguage = languageChoices[normalizedInput];

    if (selectedLanguage) {
      session.languageCode = selectedLanguage.code;
      session.languageName = selectedLanguage.name;
      session.state = STATES.MAIN;
      await sendReply(mainMenu(session.languageCode));
      return;
    }

    await showLanguageMenu(session, sendReply);
    return;
  }

  const languageCode = session.languageCode;

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

  if (normalizedInput === "3") {
    await sendReply(newClaimMessage(languageCode));
    return;
  }

  if (normalizedInput === "5") {
    await sendReply(agentMessage(languageCode));
    return;
  }

  if (normalizedInput === "6") {
    session.state = STATES.FEEDBACK;
    await sendReply(feedbackPromptMessage(languageCode));
    return;
  }

  if (normalizedInput === "7") {
    await showLanguageMenu(session, sendReply);
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

    await handleSupportInput(
      input,
      session,
      (reply) => sendWhatsAppMessage(from, reply),
      "WhatsApp",
      from
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

    await handleSupportInput(
      input,
      session,
      (reply) => sendTelegramMessage(chatId, reply),
      "Telegram",
      chatId
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
