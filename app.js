const express = require("express");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT || 3000;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const ALERT_TO = process.env.ALERT_TO || "VRASupportbot@amaxsa.co.za";

const STATES = {
  LANGUAGE: "language",
  MAIN: "main",
  FAQ: "faq",
  FEEDBACK: "feedback",
  REVIEW: "review",
  COMPLETE: "complete",
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
const LIVE_CHAT_LINK = "https://vatrefundagency.co.za/agent-chat.php";
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
    supportHours:
      "Please note: Our support team is available from 07:00 to 21:00, Monday to Sunday. The support bot remains available 24/7.",
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
      "How can I proceed to get a refund?",
      "Back to Main Menu",
    ],
    vatPaymentAnswer: `Please contact our finance department at:
${FINANCE_EMAIL}`,
    vatAmountAnswer: `Please contact our support team at:
${SUPPORT_EMAIL}

or our finance team at:
${FINANCE_EMAIL}

They will provide the necessary information regarding your VAT amount.`,
    claimProcessAnswer: `To view the documentation required for your specific type of VAT refund claim, please follow these steps:

1. Visit our website: ${WEBSITE_LINK}
2. Tap or click the menu icon (☰) in the top-right corner of the page.
3. Select 'Documentation needed for different types of claims'.
4. Choose the claim type that applies to you.
5. Review the list of required supporting documents before submitting your claim.

If you are still unsure which documents are required, please contact our support team at ${SUPPORT_EMAIL} and we will gladly assist you.`,
    agentReply: `A VRA support agent will assist you.

Email:
${SUPPORT_EMAIL}

Live chat:
${LIVE_CHAT_LINK}

Please note: Our support team is available from 07:00 to 21:00, Monday to Sunday. The support bot remains available 24/7.`,
    feedbackIntro:
      "Your feedback is important to us. We welcome any suggestions or comments that may help us improve our services and enhance your overall experience with VRA. Please feel free to share your feedback with us at any time.",
    feedbackPrompt: "Please type your feedback below.",
    feedbackReceived: "Thank you. Your feedback has been received.",
    reviewTitle: "Client Review / Ratings",
    reviewIntro:
      "We value your opinion and would appreciate your review of our services. Your ratings and comments help us maintain high service standards and assist other clients in making informed decisions.",
    reviewPrompt: "Please rate your experience with VRA:",
    ratingLabels: {
      "1": "Very Poor",
      "2": "Poor",
      "3": "Average",
      "4": "Good",
      "5": "Excellent",
    },
    invalidRating: "Please select a rating from 1 to 5.",
    reviewReceived: "Thank you for your response. Your review has been received.",
    invalidInput: "Please select a valid option from the menu.",
    noFaqAnswer: `I could not find an FAQ answer for that. A VRA support agent will assist you.

Email:
${SUPPORT_EMAIL}`,
    backInstruction: "Reply B or Back to return to the main menu.",
    doneInstruction: "Reply D or Done to review our service.",
    changeInstruction: "Reply 0 to change language.",
  },
  ar: {
    mainTitle: "القائمة الرئيسية لـ VRA:",
    supportHours:
      "يرجى الملاحظة: فريق الدعم لدينا متاح من 07:00 إلى 21:00، من الاثنين إلى الأحد. يظل بوت الدعم متاحًا على مدار الساعة طوال أيام الأسبوع.",
    statusOption: "حالة المطالبة",
    bankingOption: "تحديث التفاصيل البنكية",
    newClaimOption: "مطالب جديد / تقديم مطالبة جديدة",
    faqOption: "الأسئلة الشائعة",
    agentOption: "التحدث مع وكيل",
    feedbackOption: "اقتراحات / ملاحظات العملاء",
    changeLanguageOption: "تغيير اللغة",
    statusReply:
      "يرجى استخدام الرابط أدناه للتحقق من حالة مطالبتك. ستحتاج إلى رقم VRA الخاص بك.",
    bankingReply:
      "يرجى استخدام الرابط أدناه لتحديث تفاصيلك البنكية.\n\nالتعرف على الوجه مطلوب.",
    financeNotice: `بعد تحديث التفاصيل البنكية، سيتم إخطار قسم المالية على:
${FINANCE_EMAIL}`,
    newClaimReply: `إذا كنت مطالبًا جديدًا أو ترغب في تقديم مطالبة استرداد ضريبة القيمة المضافة، يرجى تسجيل الدخول إلى بوابتنا الإلكترونية واتباع دليل الفيديو خطوة بخطوة أدناه:

تطبيق البوابة الإلكترونية:
${NEW_CLAIM_PORTAL_LINK}

فيديو خطوة بخطوة:
${NEW_CLAIM_VIDEO_LINK}

نوصي أيضًا بزيارة موقعنا الإلكتروني للتعرف على متطلبات المطالبة والمستندات الداعمة المطلوبة لضمان أن مطالبتك مؤهلة للمعالجة.

الموقع الإلكتروني:
${WEBSITE_LINK}`,
    faqTitle: "الأسئلة الشائعة:",
    faqOptions: [
      "متى سأستلم دفعة ضريبة القيمة المضافة؟",
      "ما هو مبلغ ضريبة القيمة المضافة الخاص بي؟",
      "كيف يمكنني المتابعة للحصول على استرداد؟",
      "العودة إلى القائمة الرئيسية",
    ],
    vatPaymentAnswer: `يرجى التواصل مع قسم المالية لدينا على:
${FINANCE_EMAIL}`,
    vatAmountAnswer: `يرجى التواصل مع فريق الدعم لدينا على:
${SUPPORT_EMAIL}

أو فريق المالية لدينا على:
${FINANCE_EMAIL}

سيقدمون المعلومات اللازمة بخصوص مبلغ ضريبة القيمة المضافة الخاص بك.`,
    claimProcessAnswer: `لعرض المستندات المطلوبة لنوع مطالبة استرداد ضريبة القيمة المضافة الخاص بك، يرجى اتباع الخطوات التالية:

1. قم بزيارة موقعنا الإلكتروني: ${WEBSITE_LINK}
2. اضغط أو انقر على أيقونة القائمة (☰) في الزاوية العلوية اليمنى من الصفحة.
3. اختر 'المستندات المطلوبة لأنواع المطالبات المختلفة'.
4. اختر نوع المطالبة الذي ينطبق عليك.
5. راجع قائمة المستندات الداعمة المطلوبة قبل تقديم مطالبتك.

إذا كنت لا تزال غير متأكد من المستندات المطلوبة، يرجى التواصل مع فريق الدعم لدينا على ${SUPPORT_EMAIL} وسنكون سعداء بمساعدتك.`,
    agentReply: `سيساعدك وكيل دعم VRA.

البريد الإلكتروني:
${SUPPORT_EMAIL}

الدردشة المباشرة:
${LIVE_CHAT_LINK}

يرجى الملاحظة: فريق الدعم لدينا متاح من 07:00 إلى 21:00، من الاثنين إلى الأحد. يظل بوت الدعم متاحًا على مدار الساعة طوال أيام الأسبوع.`,
    feedbackIntro:
      "ملاحظاتك مهمة لنا. نرحب بأي اقتراحات أو تعليقات قد تساعدنا على تحسين خدماتنا وتعزيز تجربتك العامة مع VRA. لا تتردد في مشاركة ملاحظاتك معنا في أي وقت.",
    feedbackPrompt: "يرجى كتابة ملاحظاتك أدناه.",
    feedbackReceived: "شكرًا لك. تم استلام ملاحظاتك.",
    reviewTitle: "مراجعة العميل / التقييمات",
    reviewIntro:
      "نحن نقدر رأيك وسنكون ممتنين لتقييمك لخدماتنا. تساعدنا تقييماتك وتعليقاتك في الحفاظ على معايير خدمة عالية وتساعد العملاء الآخرين على اتخاذ قرارات مستنيرة.",
    reviewPrompt: "يرجى تقييم تجربتك مع VRA:",
    ratingLabels: {
      "1": "سيئ جدًا",
      "2": "سيئ",
      "3": "متوسط",
      "4": "جيد",
      "5": "ممتاز",
    },
    invalidRating: "يرجى اختيار تقييم من 1 إلى 5.",
    reviewReceived: "شكرًا لك على ردك. تم استلام مراجعتك.",
    invalidInput: "يرجى اختيار خيار صالح من القائمة.",
    noFaqAnswer: `لم أتمكن من العثور على إجابة لهذا السؤال. سيساعدك وكيل دعم VRA.

البريد الإلكتروني:
${SUPPORT_EMAIL}`,
    backInstruction: "أرسل B أو Back للعودة إلى القائمة الرئيسية.",
    doneInstruction: "أرسل D أو Done لتقييم خدمتنا.",
    changeInstruction: "أرسل 0 لتغيير اللغة.",
  },
  zh: {
    mainTitle: "VRA 主菜单：",
    supportHours:
      "请注意：我们的支持团队服务时间为周一至周日 07:00 至 21:00。支持机器人全天候 24/7 可用。",
    statusOption: "索赔状态",
    bankingOption: "更新银行资料",
    newClaimOption: "新申请人 / 提交新申请",
    faqOption: "常见问题",
    agentOption: "与客服人员聊天",
    feedbackOption: "客户建议 / 反馈",
    changeLanguageOption: "更改语言",
    statusReply: "请使用下面的链接查询您的索赔状态。您需要您的 VRA 编号。",
    bankingReply: "请使用下面的链接更新您的银行资料。\n\n需要进行面部识别。",
    financeNotice: `银行资料更新后，财务部将收到通知：
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
      "我如何继续获得退款？",
      "返回主菜单",
    ],
    vatPaymentAnswer: `请联系我们的财务部门：
${FINANCE_EMAIL}`,
    vatAmountAnswer: `请联系我们的支持团队：
${SUPPORT_EMAIL}

或我们的财务团队：
${FINANCE_EMAIL}

他们会提供有关您增值税金额的必要信息。`,
    claimProcessAnswer: `要查看您的特定增值税退款申请类型所需的文件，请按照以下步骤操作：

1. 访问我们的网站：${WEBSITE_LINK}
2. 点击页面右上角的菜单图标 (☰)。
3. 选择“不同类型申请所需文件”。
4. 选择适用于您的申请类型。
5. 在提交申请前查看所需支持文件清单。

如果您仍不确定需要哪些文件，请通过 ${SUPPORT_EMAIL} 联系我们的支持团队，我们将很乐意协助您。`,
    agentReply: `VRA 支持人员将协助您。

电子邮件：
${SUPPORT_EMAIL}

在线聊天：
${LIVE_CHAT_LINK}

请注意：我们的支持团队服务时间为周一至周日 07:00 至 21:00。支持机器人全天候 24/7 可用。`,
    feedbackIntro:
      "您的反馈对我们很重要。我们欢迎任何有助于改进服务并提升您在 VRA 整体体验的建议或意见。欢迎您随时与我们分享反馈。",
    feedbackPrompt: "请在下面输入您的反馈。",
    feedbackReceived: "谢谢。您的反馈已收到。",
    reviewTitle: "客户评价 / 评分",
    reviewIntro:
      "我们重视您的意见，并希望您对我们的服务进行评价。您的评分和评论有助于我们保持高服务标准，并帮助其他客户做出明智决定。",
    reviewPrompt: "请为您在 VRA 的体验评分：",
    ratingLabels: {
      "1": "非常差",
      "2": "差",
      "3": "一般",
      "4": "好",
      "5": "优秀",
    },
    invalidRating: "请选择 1 到 5 的评分。",
    reviewReceived: "感谢您的回复。您的评价已收到。",
    invalidInput: "请从菜单中选择有效选项。",
    noFaqAnswer: `我找不到该问题的 FAQ 答案。VRA 支持人员将协助您。

电子邮件：
${SUPPORT_EMAIL}`,
    backInstruction: "回复 B 或 Back 返回主菜单。",
    doneInstruction: "回复 D 或 Done 评价我们的服务。",
    changeInstruction: "回复 0 更改语言。",
  },
  nl: {
    mainTitle: "VRA Hoofdmenu:",
    supportHours:
      "Let op: Ons supportteam is beschikbaar van 07:00 tot 21:00, maandag tot en met zondag. De supportbot blijft 24/7 beschikbaar.",
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
      "Hoe kan ik verdergaan om een terugbetaling te krijgen?",
      "Terug naar hoofdmenu",
    ],
    vatPaymentAnswer: `Neem contact op met onze financiële afdeling via:
${FINANCE_EMAIL}`,
    vatAmountAnswer: `Neem contact op met ons ondersteuningsteam via:
${SUPPORT_EMAIL}

of met ons financiële team via:
${FINANCE_EMAIL}

Zij zullen de nodige informatie over uw btw-bedrag verstrekken.`,
    claimProcessAnswer: `Volg deze stappen om te bekijken welke documentatie vereist is voor uw specifieke type btw-teruggaafclaim:

1. Bezoek onze website: ${WEBSITE_LINK}
2. Tik of klik op het menu-icoon (☰) rechtsboven op de pagina.
3. Selecteer 'Documentation needed for different types of claims'.
4. Kies het claimtype dat op u van toepassing is.
5. Bekijk de lijst met vereiste ondersteunende documenten voordat u uw claim indient.

Als u nog steeds niet zeker weet welke documenten vereist zijn, neem dan contact op met ons ondersteuningsteam via ${SUPPORT_EMAIL}; wij helpen u graag.`,
    agentReply: `Een VRA-supportagent zal u helpen.

E-mail:
${SUPPORT_EMAIL}

Live chat:
${LIVE_CHAT_LINK}

Let op: Ons supportteam is beschikbaar van 07:00 tot 21:00, maandag tot en met zondag. De supportbot blijft 24/7 beschikbaar.`,
    feedbackIntro:
      "Uw feedback is belangrijk voor ons. Wij verwelkomen alle suggesties of opmerkingen die ons kunnen helpen onze diensten te verbeteren en uw algemene ervaring met VRA te versterken. U kunt uw feedback op elk moment met ons delen.",
    feedbackPrompt: "Typ hieronder uw feedback.",
    feedbackReceived: "Dank u. Uw feedback is ontvangen.",
    reviewTitle: "Klantbeoordeling / Ratings",
    reviewIntro:
      "Wij waarderen uw mening en zouden uw beoordeling van onze diensten op prijs stellen. Uw ratings en opmerkingen helpen ons hoge servicestandaarden te handhaven en helpen andere klanten weloverwogen beslissingen te nemen.",
    reviewPrompt: "Beoordeel uw ervaring met VRA:",
    ratingLabels: {
      "1": "Zeer slecht",
      "2": "Slecht",
      "3": "Gemiddeld",
      "4": "Goed",
      "5": "Uitstekend",
    },
    invalidRating: "Selecteer een rating van 1 tot 5.",
    reviewReceived: "Dank u voor uw reactie. Uw beoordeling is ontvangen.",
    invalidInput: "Selecteer een geldige optie uit het menu.",
    noFaqAnswer: `Ik kon geen FAQ-antwoord daarvoor vinden. Een VRA-supportagent zal u helpen.

E-mail:
${SUPPORT_EMAIL}`,
    backInstruction: "Antwoord B of Back om terug te keren naar het hoofdmenu.",
    doneInstruction: "Antwoord D of Done om onze service te beoordelen.",
    changeInstruction: "Antwoord 0 om de taal te wijzigen.",
  },
  fr: {
    mainTitle: "Menu principal VRA :",
    supportHours:
      "Veuillez noter : Notre équipe d'assistance est disponible de 07:00 à 21:00, du lundi au dimanche. Le bot d'assistance reste disponible 24/7.",
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
      "Comment puis-je procéder pour obtenir un remboursement ?",
      "Retour au menu principal",
    ],
    vatPaymentAnswer: `Veuillez contacter notre service financier à :
${FINANCE_EMAIL}`,
    vatAmountAnswer: `Veuillez contacter notre équipe d'assistance à :
${SUPPORT_EMAIL}

ou notre équipe financière à :
${FINANCE_EMAIL}

Ils vous fourniront les informations nécessaires concernant votre montant de TVA.`,
    claimProcessAnswer: `Pour consulter les documents requis pour votre type spécifique de demande de remboursement de TVA, veuillez suivre ces étapes :

1. Visitez notre site Web : ${WEBSITE_LINK}
2. Appuyez ou cliquez sur l'icône du menu (☰) dans le coin supérieur droit de la page.
3. Sélectionnez 'Documentation needed for different types of claims'.
4. Choisissez le type de demande qui vous concerne.
5. Consultez la liste des documents justificatifs requis avant de soumettre votre demande.

Si vous ne savez toujours pas quels documents sont requis, veuillez contacter notre équipe d'assistance à ${SUPPORT_EMAIL} et nous vous aiderons volontiers.`,
    agentReply: `Un agent du support VRA vous aidera.

E-mail :
${SUPPORT_EMAIL}

Chat en direct :
${LIVE_CHAT_LINK}

Veuillez noter : Notre équipe d'assistance est disponible de 07:00 à 21:00, du lundi au dimanche. Le bot d'assistance reste disponible 24/7.`,
    feedbackIntro:
      "Vos commentaires sont importants pour nous. Nous accueillons toutes suggestions ou remarques pouvant nous aider à améliorer nos services et votre expérience globale avec VRA. N'hésitez pas à partager vos commentaires avec nous à tout moment.",
    feedbackPrompt: "Veuillez saisir vos commentaires ci-dessous.",
    feedbackReceived: "Merci. Vos commentaires ont été reçus.",
    reviewTitle: "Avis client / Évaluations",
    reviewIntro:
      "Nous apprécions votre opinion et serions reconnaissants de recevoir votre avis sur nos services. Vos évaluations et commentaires nous aident à maintenir des normes de service élevées et aident d'autres clients à prendre des décisions éclairées.",
    reviewPrompt: "Veuillez évaluer votre expérience avec VRA :",
    ratingLabels: {
      "1": "Très mauvais",
      "2": "Mauvais",
      "3": "Moyen",
      "4": "Bon",
      "5": "Excellent",
    },
    invalidRating: "Veuillez sélectionner une note de 1 à 5.",
    reviewReceived: "Merci pour votre réponse. Votre avis a été reçu.",
    invalidInput: "Veuillez sélectionner une option valide dans le menu.",
    noFaqAnswer: `Je n'ai pas trouvé de réponse FAQ pour cela. Un agent du support VRA vous aidera.

E-mail :
${SUPPORT_EMAIL}`,
    backInstruction: "Répondez B ou Back pour revenir au menu principal.",
    doneInstruction: "Répondez D ou Done pour évaluer notre service.",
    changeInstruction: "Répondez 0 pour changer de langue.",
  },
  de: {
    mainTitle: "VRA Hauptmenü:",
    supportHours:
      "Bitte beachten Sie: Unser Support-Team ist von 07:00 bis 21:00 Uhr, Montag bis Sonntag, verfügbar. Der Support-Bot bleibt rund um die Uhr verfügbar.",
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
      "Wie kann ich fortfahren, um eine Rückerstattung zu erhalten?",
      "Zurück zum Hauptmenü",
    ],
    vatPaymentAnswer: `Bitte kontaktieren Sie unsere Finanzabteilung unter:
${FINANCE_EMAIL}`,
    vatAmountAnswer: `Bitte kontaktieren Sie unser Support-Team unter:
${SUPPORT_EMAIL}

oder unser Finanzteam unter:
${FINANCE_EMAIL}

Sie erhalten dort die notwendigen Informationen zu Ihrem Mehrwertsteuerbetrag.`,
    claimProcessAnswer: `Um die für Ihre spezifische Art der Mehrwertsteuerrückerstattung erforderlichen Unterlagen einzusehen, folgen Sie bitte diesen Schritten:

1. Besuchen Sie unsere Website: ${WEBSITE_LINK}
2. Tippen oder klicken Sie auf das Menüsymbol (☰) oben rechts auf der Seite.
3. Wählen Sie 'Documentation needed for different types of claims'.
4. Wählen Sie die Anspruchsart aus, die auf Sie zutrifft.
5. Prüfen Sie die Liste der erforderlichen Nachweisdokumente, bevor Sie Ihren Antrag einreichen.

Wenn Sie weiterhin unsicher sind, welche Dokumente erforderlich sind, kontaktieren Sie bitte unser Support-Team unter ${SUPPORT_EMAIL}; wir helfen Ihnen gerne weiter.`,
    agentReply: `Ein VRA-Supportagent wird Ihnen helfen.

E-Mail:
${SUPPORT_EMAIL}

Live-Chat:
${LIVE_CHAT_LINK}

Bitte beachten Sie: Unser Support-Team ist von 07:00 bis 21:00 Uhr, Montag bis Sonntag, verfügbar. Der Support-Bot bleibt rund um die Uhr verfügbar.`,
    feedbackIntro:
      "Ihr Feedback ist uns wichtig. Wir begrüßen alle Vorschläge oder Kommentare, die uns helfen können, unsere Dienstleistungen zu verbessern und Ihre allgemeine Erfahrung mit VRA zu stärken. Teilen Sie uns Ihr Feedback gerne jederzeit mit.",
    feedbackPrompt: "Bitte geben Sie unten Ihr Feedback ein.",
    feedbackReceived: "Vielen Dank. Ihr Feedback wurde erhalten.",
    reviewTitle: "Kundenbewertung / Bewertungen",
    reviewIntro:
      "Wir schätzen Ihre Meinung und würden uns über Ihre Bewertung unserer Dienstleistungen freuen. Ihre Bewertungen und Kommentare helfen uns, hohe Servicestandards aufrechtzuerhalten und anderen Kunden fundierte Entscheidungen zu ermöglichen.",
    reviewPrompt: "Bitte bewerten Sie Ihre Erfahrung mit VRA:",
    ratingLabels: {
      "1": "Sehr schlecht",
      "2": "Schlecht",
      "3": "Durchschnittlich",
      "4": "Gut",
      "5": "Ausgezeichnet",
    },
    invalidRating: "Bitte wählen Sie eine Bewertung von 1 bis 5.",
    reviewReceived: "Vielen Dank für Ihre Antwort. Ihre Bewertung wurde erhalten.",
    invalidInput: "Bitte wählen Sie eine gültige Option aus dem Menü.",
    noFaqAnswer: `Ich konnte keine FAQ-Antwort dafür finden. Ein VRA-Supportagent wird Ihnen helfen.

E-Mail:
${SUPPORT_EMAIL}`,
    backInstruction: "Antworten Sie mit B oder Back, um zum Hauptmenü zurückzukehren.",
    doneInstruction: "Antworten Sie mit D oder Done, um unseren Service zu bewerten.",
    changeInstruction: "Antworten Sie mit 0, um die Sprache zu ändern.",
  },
  it: {
    mainTitle: "Menu principale VRA:",
    supportHours:
      "Nota bene: Il nostro team di supporto è disponibile dalle 07:00 alle 21:00, dal lunedì alla domenica. Il bot di supporto rimane disponibile 24/7.",
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
      "Utilizza il link qui sotto per aggiornare i tuoi dettagli bancari.\n\nÈ richiesto il riconoscimento facciale.",
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
      "Come posso procedere per ottenere un rimborso?",
      "Torna al menu principale",
    ],
    vatPaymentAnswer: `Contatta il nostro reparto finanziario a:
${FINANCE_EMAIL}`,
    vatAmountAnswer: `Contatta il nostro team di supporto a:
${SUPPORT_EMAIL}

o il nostro team finanziario a:
${FINANCE_EMAIL}

Forniranno le informazioni necessarie riguardo al tuo importo IVA.`,
    claimProcessAnswer: `Per visualizzare la documentazione richiesta per il tuo specifico tipo di richiesta di rimborso IVA, segui questi passaggi:

1. Visita il nostro sito web: ${WEBSITE_LINK}
2. Tocca o clicca l'icona del menu (☰) nell'angolo in alto a destra della pagina.
3. Seleziona 'Documentation needed for different types of claims'.
4. Scegli il tipo di richiesta applicabile a te.
5. Consulta l'elenco dei documenti di supporto richiesti prima di inviare la richiesta.

Se non sei ancora sicuro di quali documenti siano richiesti, contatta il nostro team di supporto all'indirizzo ${SUPPORT_EMAIL} e saremo lieti di assisterti.`,
    agentReply: `Un agente di supporto VRA ti assisterà.

Email:
${SUPPORT_EMAIL}

Chat dal vivo:
${LIVE_CHAT_LINK}

Nota bene: Il nostro team di supporto è disponibile dalle 07:00 alle 21:00, dal lunedì alla domenica. Il bot di supporto rimane disponibile 24/7.`,
    feedbackIntro:
      "Il tuo feedback è importante per noi. Accogliamo qualsiasi suggerimento o commento che possa aiutarci a migliorare i nostri servizi e la tua esperienza complessiva con VRA. Sentiti libero di condividere il tuo feedback con noi in qualsiasi momento.",
    feedbackPrompt: "Digita il tuo feedback qui sotto.",
    feedbackReceived: "Grazie. Il tuo feedback è stato ricevuto.",
    reviewTitle: "Recensione cliente / Valutazioni",
    reviewIntro:
      "La tua opinione è importante per noi e apprezzeremmo una recensione dei nostri servizi. Le tue valutazioni e i tuoi commenti ci aiutano a mantenere standard di servizio elevati e aiutano altri clienti a prendere decisioni informate.",
    reviewPrompt: "Valuta la tua esperienza con VRA:",
    ratingLabels: {
      "1": "Molto scarso",
      "2": "Scarso",
      "3": "Nella media",
      "4": "Buono",
      "5": "Eccellente",
    },
    invalidRating: "Seleziona una valutazione da 1 a 5.",
    reviewReceived: "Grazie per la tua risposta. La tua recensione è stata ricevuta.",
    invalidInput: "Seleziona un'opzione valida dal menu.",
    noFaqAnswer: `Non ho trovato una risposta FAQ per questo. Un agente di supporto VRA ti assisterà.

Email:
${SUPPORT_EMAIL}`,
    backInstruction: "Rispondi B o Back per tornare al menu principale.",
    doneInstruction: "Rispondi D o Done per recensire il nostro servizio.",
    changeInstruction: "Rispondi 0 per cambiare lingua.",
  },
  pt: {
    mainTitle: "Menu principal VRA:",
    supportHours:
      "Nota: A nossa equipa de apoio está disponível das 07:00 às 21:00, de segunda-feira a domingo. O bot de apoio permanece disponível 24/7.",
    statusOption: "Estado da reclamação",
    bankingOption: "Atualizar dados bancários",
    newClaimOption: "Novo requerente / Submeter uma nova reclamação",
    faqOption: "Perguntas frequentes",
    agentOption: "Conversar com um agente",
    feedbackOption: "Sugestões / feedback dos clientes",
    changeLanguageOption: "Alterar idioma",
    statusReply:
      "Utilize o link abaixo para verificar o estado da sua reclamação. Irá precisar do seu número VRA.",
    bankingReply:
      "Utilize o link abaixo para atualizar os seus dados bancários.\n\nÉ necessário reconhecimento facial.",
    financeNotice: `Assim que os dados bancários forem atualizados, o Finance será notificado em:
${FINANCE_EMAIL}`,
    newClaimReply: `Se é um novo requerente ou pretende submeter uma reclamação de reembolso de IVA, inicie sessão no nosso portal online e siga o guia em vídeo passo a passo fornecido abaixo:

Aplicação do portal online:
${NEW_CLAIM_PORTAL_LINK}

Vídeo passo a passo:
${NEW_CLAIM_VIDEO_LINK}

Também recomendamos que visite o nosso website para se familiarizar com os requisitos da reclamação e os documentos de suporte necessários para garantir que a sua reclamação é elegível para processamento.

Website:
${WEBSITE_LINK}`,
    faqTitle: "Perguntas frequentes:",
    faqOptions: [
      "Quando vou receber o pagamento do IVA?",
      "Qual é o meu valor de IVA?",
      "Como posso proceder para obter um reembolso?",
      "Voltar ao menu principal",
    ],
    vatPaymentAnswer: `Contacte o nosso departamento financeiro em:
${FINANCE_EMAIL}`,
    vatAmountAnswer: `Contacte a nossa equipa de apoio em:
${SUPPORT_EMAIL}

ou a nossa equipa financeira em:
${FINANCE_EMAIL}

Eles fornecerão as informações necessárias sobre o seu valor de IVA.`,
    claimProcessAnswer: `Para ver a documentação necessária para o seu tipo específico de reclamação de reembolso de IVA, siga estes passos:

1. Visite o nosso website: ${WEBSITE_LINK}
2. Toque ou clique no ícone do menu (☰) no canto superior direito da página.
3. Selecione 'Documentation needed for different types of claims'.
4. Escolha o tipo de reclamação que se aplica a si.
5. Consulte a lista de documentos de suporte necessários antes de submeter a sua reclamação.

Se ainda não tiver certeza sobre quais documentos são necessários, contacte a nossa equipa de apoio em ${SUPPORT_EMAIL} e teremos todo o gosto em ajudá-lo.`,
    agentReply: `Um agente de apoio VRA irá ajudá-lo.

Email:
${SUPPORT_EMAIL}

Chat ao vivo:
${LIVE_CHAT_LINK}

Nota: A nossa equipa de apoio está disponível das 07:00 às 21:00, de segunda-feira a domingo. O bot de apoio permanece disponível 24/7.`,
    feedbackIntro:
      "O seu feedback é importante para nós. Agradecemos quaisquer sugestões ou comentários que possam ajudar-nos a melhorar os nossos serviços e a sua experiência geral com a VRA. Sinta-se à vontade para partilhar o seu feedback connosco a qualquer momento.",
    feedbackPrompt: "Por favor, escreva o seu feedback abaixo.",
    feedbackReceived: "Obrigado. O seu feedback foi recebido.",
    reviewTitle: "Avaliação do cliente / Classificações",
    reviewIntro:
      "A sua opinião é importante para nós e gostaríamos de receber a sua avaliação dos nossos serviços. As suas classificações e comentários ajudam-nos a manter elevados padrões de serviço e ajudam outros clientes a tomar decisões informadas.",
    reviewPrompt: "Avalie a sua experiência com a VRA:",
    ratingLabels: {
      "1": "Muito fraco",
      "2": "Fraco",
      "3": "Médio",
      "4": "Bom",
      "5": "Excelente",
    },
    invalidRating: "Selecione uma classificação de 1 a 5.",
    reviewReceived: "Obrigado pela sua resposta. A sua avaliação foi recebida.",
    invalidInput: "Selecione uma opção válida do menu.",
    noFaqAnswer: `Não consegui encontrar uma resposta FAQ para isso. Um agente de apoio VRA irá ajudá-lo.

Email:
${SUPPORT_EMAIL}`,
    backInstruction: "Responda B ou Back para voltar ao menu principal.",
    doneInstruction: "Responda D ou Done para avaliar o nosso serviço.",
    changeInstruction: "Responda 0 para alterar o idioma.",
  },
  ru: {
    mainTitle: "Главное меню VRA:",
    supportHours:
      "Обратите внимание: наша служба поддержки доступна с 07:00 до 21:00, с понедельника по воскресенье. Бот поддержки остается доступным 24/7.",
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
      "Пожалуйста, используйте ссылку ниже, чтобы обновить ваши банковские данные.\n\nТребуется распознавание лица.",
    financeNotice: `После обновления банковских данных отдел Finance будет уведомлен по адресу:
${FINANCE_EMAIL}`,
    newClaimReply: `Если вы новый заявитель или хотите подать заявку на возврат НДС, пожалуйста, войдите в наш онлайн-портал и следуйте пошаговому видео-руководству ниже:

Приложение онлайн-портала:
${NEW_CLAIM_PORTAL_LINK}

Пошаговое видео:
${NEW_CLAIM_VIDEO_LINK}

Мы также рекомендуем посетить наш веб-сайт, чтобы ознакомиться с требованиями к заявке и необходимыми подтверждающими документами, чтобы убедиться, что ваша заявка подходит для обработки.

Веб-сайт:
${WEBSITE_LINK}`,
    faqTitle: "Часто задаваемые вопросы:",
    faqOptions: [
      "Когда я получу выплату НДС?",
      "Какова моя сумма НДС?",
      "Как мне продолжить, чтобы получить возврат?",
      "Вернуться в главное меню",
    ],
    vatPaymentAnswer: `Пожалуйста, свяжитесь с нашим финансовым отделом по адресу:
${FINANCE_EMAIL}`,
    vatAmountAnswer: `Пожалуйста, свяжитесь с нашей службой поддержки по адресу:
${SUPPORT_EMAIL}

или с нашей финансовой командой по адресу:
${FINANCE_EMAIL}

Они предоставят необходимую информацию о вашей сумме НДС.`,
    claimProcessAnswer: `Чтобы посмотреть документы, необходимые для вашего конкретного типа заявки на возврат НДС, пожалуйста, выполните следующие шаги:

1. Посетите наш веб-сайт: ${WEBSITE_LINK}
2. Нажмите на значок меню (☰) в правом верхнем углу страницы.
3. Выберите 'Documentation needed for different types of claims'.
4. Выберите тип заявки, который относится к вам.
5. Ознакомьтесь со списком необходимых подтверждающих документов перед подачей заявки.

Если вы все еще не уверены, какие документы требуются, свяжитесь с нашей службой поддержки по адресу ${SUPPORT_EMAIL}, и мы с радостью поможем вам.`,
    agentReply: `Агент поддержки VRA поможет вам.

Email:
${SUPPORT_EMAIL}

Онлайн-чат:
${LIVE_CHAT_LINK}

Обратите внимание: наша служба поддержки доступна с 07:00 до 21:00, с понедельника по воскресенье. Бот поддержки остается доступным 24/7.`,
    feedbackIntro:
      "Ваш отзыв важен для нас. Мы приветствуем любые предложения или комментарии, которые помогут нам улучшить наши услуги и ваш общий опыт работы с VRA. Пожалуйста, делитесь своими отзывами в любое время.",
    feedbackPrompt: "Пожалуйста, введите ваш отзыв ниже.",
    feedbackReceived: "Спасибо. Ваш отзыв получен.",
    reviewTitle: "Отзыв клиента / Оценки",
    reviewIntro:
      "Ваше мнение важно для нас, и мы будем благодарны за ваш отзыв о наших услугах. Ваши оценки и комментарии помогают нам поддерживать высокие стандарты обслуживания и помогают другим клиентам принимать обоснованные решения.",
    reviewPrompt: "Пожалуйста, оцените ваш опыт работы с VRA:",
    ratingLabels: {
      "1": "Очень плохо",
      "2": "Плохо",
      "3": "Средне",
      "4": "Хорошо",
      "5": "Отлично",
    },
    invalidRating: "Пожалуйста, выберите оценку от 1 до 5.",
    reviewReceived: "Спасибо за ваш ответ. Ваш отзыв получен.",
    invalidInput: "Пожалуйста, выберите действительный пункт меню.",
    noFaqAnswer: `Я не смог найти ответ FAQ на этот вопрос. Агент поддержки VRA поможет вам.

Email:
${SUPPORT_EMAIL}`,
    backInstruction: "Ответьте B или Back, чтобы вернуться в главное меню.",
    doneInstruction: "Ответьте D или Done, чтобы оценить наш сервис.",
    changeInstruction: "Ответьте 0, чтобы изменить язык.",
  },
  es: {
    mainTitle: "Menú principal de VRA:",
    supportHours:
      "Tenga en cuenta: Nuestro equipo de soporte está disponible de 07:00 a 21:00, de lunes a domingo. El bot de soporte permanece disponible 24/7.",
    statusOption: "Estado de la reclamación",
    bankingOption: "Actualizar datos bancarios",
    newClaimOption: "Nuevo reclamante / Enviar una nueva reclamación",
    faqOption: "Preguntas frecuentes",
    agentOption: "Chatear con un agente",
    feedbackOption: "Sugerencias / comentarios del cliente",
    changeLanguageOption: "Cambiar idioma",
    statusReply:
      "Utilice el siguiente enlace para verificar el estado de su reclamación. Necesitará su número VRA.",
    bankingReply:
      "Utilice el siguiente enlace para actualizar sus datos bancarios.\n\nSe requiere reconocimiento facial.",
    financeNotice: `Una vez actualizados los datos bancarios, Finance será notificado en:
${FINANCE_EMAIL}`,
    newClaimReply: `Si es un nuevo reclamante o desea enviar una reclamación de devolución de IVA, inicie sesión en nuestro portal en línea y siga la guía de video paso a paso proporcionada a continuación:

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
      "¿Cómo puedo proceder para obtener un reembolso?",
      "Volver al menú principal",
    ],
    vatPaymentAnswer: `Comuníquese con nuestro departamento de finanzas en:
${FINANCE_EMAIL}`,
    vatAmountAnswer: `Comuníquese con nuestro equipo de soporte en:
${SUPPORT_EMAIL}

o con nuestro equipo de finanzas en:
${FINANCE_EMAIL}

Ellos le proporcionarán la información necesaria sobre su monto de IVA.`,
    claimProcessAnswer: `Para ver la documentación requerida para su tipo específico de reclamación de reembolso de IVA, siga estos pasos:

1. Visite nuestro sitio web: ${WEBSITE_LINK}
2. Toque o haga clic en el ícono de menú (☰) en la esquina superior derecha de la página.
3. Seleccione 'Documentation needed for different types of claims'.
4. Elija el tipo de reclamación que corresponda a su caso.
5. Revise la lista de documentos de respaldo requeridos antes de enviar su reclamación.

Si aún no está seguro de qué documentos se requieren, comuníquese con nuestro equipo de soporte en ${SUPPORT_EMAIL} y con gusto le ayudaremos.`,
    agentReply: `Un agente de soporte de VRA le asistirá.

Email:
${SUPPORT_EMAIL}

Chat en vivo:
${LIVE_CHAT_LINK}

Tenga en cuenta: Nuestro equipo de soporte está disponible de 07:00 a 21:00, de lunes a domingo. El bot de soporte permanece disponible 24/7.`,
    feedbackIntro:
      "Sus comentarios son importantes para nosotros. Agradecemos cualquier sugerencia o comentario que pueda ayudarnos a mejorar nuestros servicios y mejorar su experiencia general con VRA. No dude en compartir sus comentarios con nosotros en cualquier momento.",
    feedbackPrompt: "Por favor escriba sus comentarios a continuación.",
    feedbackReceived: "Gracias. Sus comentarios han sido recibidos.",
    reviewTitle: "Reseña del cliente / Calificaciones",
    reviewIntro:
      "Valoramos su opinión y agradeceríamos su reseña de nuestros servicios. Sus calificaciones y comentarios nos ayudan a mantener altos estándares de servicio y ayudan a otros clientes a tomar decisiones informadas.",
    reviewPrompt: "Por favor califique su experiencia con VRA:",
    ratingLabels: {
      "1": "Muy malo",
      "2": "Malo",
      "3": "Promedio",
      "4": "Bueno",
      "5": "Excelente",
    },
    invalidRating: "Por favor seleccione una calificación del 1 al 5.",
    reviewReceived: "Gracias por su respuesta. Su reseña ha sido recibida.",
    invalidInput: "Seleccione una opción válida del menú.",
    noFaqAnswer: `No pude encontrar una respuesta de FAQ para eso. Un agente de soporte de VRA le asistirá.

Email:
${SUPPORT_EMAIL}`,
    backInstruction: "Responda B o Back para volver al menú principal.",
    doneInstruction: "Responda D o Done para evaluar nuestro servicio.",
    changeInstruction: "Responda 0 para cambiar el idioma.",
  },
};

const extraFaqTranslations = {
  en: [
    {
      question:
        "How long does clients need to wait for SARS to make payment to VRA since the claim has been approved by SARS?",
      answer:
        "We are unfortunately unable to provide a timeframe. We need to wait patiently for SARS to make payment for the claim/s.",
    },
    {
      question: "How can we contact SARS directly?",
      answer: `Please contact SARS directly using the following complaint email address:
SARSVRACOMPLAINTS@SARS.GOV.ZA`,
    },
    {
      question: "Documents have been couriered to post office AMAX",
      answer: `Physical courier - Please provide proof of delivery as well as the waybill number to ${SUPPORT_EMAIL} so that we can confirm whether we received the documents at our head office.`,
    },
    {
      question: "Claim has been rejected",
      answer: `Please visit the online portal and enter your VRA reference number to view the rejection reason for your claim.
Check Refund Progress - Vatrefundagency
${STATUS_LINK}`,
    },
    {
      question: "Can a credit card be used for the refund?",
      answer:
        "A credit card is unfortunately not acceptable. The account for payment must be in the name of the claimant.",
    },
    {
      question: "How long does the process take?",
      answer:
        "The process can take approximately 1-2 months at head office. If the claim is accepted at back office, it is submitted to SARS, which can take a further 3-6 months for processing and finalisation. Once the claim has been finalised by SARS, VRA must wait for SARS to make payment to us before payment can be made to the claimant's account.",
    },
    {
      question:
        "Cannot login to online portal or unable to upload bank confirmation letter",
      answer: `As per our standard procedures, banking details are considered sensitive information. For security reasons, VRA cannot manually update these details on behalf of clients.

Clients are required to update their banking information themselves through the online portal and upload any supporting documents as proof.

${BANKING_LINK}

If you are having difficulty logging in or uploading documents, please try the following:
1. Clear your browser cache and cookies or try using a different browser.
2. Ensure that your login credentials are entered correctly.
3. If you have already reset your password and it still is not working, please try resetting it again or use the "Forgot Password" option on the portal.`,
    },
    {
      question: "What is a bank confirmation letter?",
      answer:
        "A bank confirmation letter is a formal letter issued by your bank confirming that the bank account belongs to you.\n\nThis letter is required before any account details can be updated, as required by SARS regulations.",
    },
    {
      question:
        "How long does it take finance to make payment after funds were received from SARS?",
      answer:
        "We are unable to provide a timeframe. However, as soon as payment has been made, you will receive confirmation via email.",
    },
    {
      question: "Claim rejected due to entry / exit stamp for crew members",
      answer: `Please provide a copy of your crew member card via email to ${SUPPORT_EMAIL}.`,
    },
    {
      question: "What is the correct address to send the postal to?",
      answer: `262 Jack Hindon Street
Pretoria North
Gauteng
South Africa
0182`,
    },
    {
      question: "Why is my claim rejected?",
      answer: `Please visit the online portal and enter your VRA reference number to view the rejection reason. If you are still unsure, please email ${SUPPORT_EMAIL} for detailed information regarding your rejected claim.`,
    },
    {
      question:
        "I updated my bank details on the portal however the details have not been updated",
      answer:
        "The request for updated bank details must first be accepted or rejected. As soon as the request has been accepted or rejected, you will receive confirmation.",
    },
  ],
  ar: [
    {
      question:
        "كم من الوقت يحتاج العملاء للانتظار حتى تقوم SARS بالدفع إلى VRA بعد الموافقة على المطالبة من SARS؟",
      answer:
        "للأسف لا يمكننا تقديم إطار زمني. نحتاج إلى الانتظار بصبر حتى تقوم SARS بالدفع للمطالبة أو المطالبات.",
    },
    {
      question: "كيف يمكننا التواصل مع SARS مباشرة؟",
      answer: `يرجى التواصل مع SARS مباشرة باستخدام بريد الشكاوى التالي:
SARSVRACOMPLAINTS@SARS.GOV.ZA`,
    },
    {
      question: "تم إرسال المستندات بالبريد السريع إلى مكتب البريد AMAX",
      answer: `البريد السريع الفعلي - يرجى تزويدنا بإثبات التسليم ورقم بوليصة الشحن على ${SUPPORT_EMAIL} حتى نتمكن من تأكيد ما إذا كنا قد استلمنا المستندات في مكتبنا الرئيسي.`,
    },
    {
      question: "تم رفض المطالبة",
      answer: `يرجى زيارة البوابة الإلكترونية وإدخال رقم مرجع VRA الخاص بك لعرض سبب رفض مطالبتك.
Check Refund Progress - Vatrefundagency
${STATUS_LINK}`,
    },
    {
      question: "هل يمكن استخدام بطاقة ائتمان لاسترداد المبلغ؟",
      answer:
        "للأسف لا يمكن قبول بطاقة الائتمان. يجب أن يكون حساب الدفع باسم صاحب المطالبة.",
    },
    {
      question: "كم تستغرق العملية؟",
      answer:
        "قد تستغرق العملية حوالي شهر إلى شهرين في المكتب الرئيسي. إذا تم قبول المطالبة في المكتب الخلفي، يتم إرسالها إلى SARS، وقد يستغرق ذلك 3 إلى 6 أشهر إضافية للمعالجة والإنهاء. بعد أن تنتهي SARS من المطالبة، يجب على VRA انتظار دفع SARS لنا قبل أن يتم الدفع إلى حساب صاحب المطالبة.",
    },
    {
      question:
        "لا يمكنني تسجيل الدخول إلى البوابة الإلكترونية أو لا أستطيع تحميل خطاب تأكيد البنك",
      answer: `وفقًا لإجراءاتنا القياسية، تعتبر التفاصيل البنكية معلومات حساسة. لأسباب أمنية، لا يمكن لـ VRA تحديث هذه التفاصيل يدويًا نيابة عن العملاء.

يجب على العملاء تحديث معلوماتهم البنكية بأنفسهم من خلال البوابة الإلكترونية وتحميل أي مستندات داعمة كإثبات.

${BANKING_LINK}

إذا كنت تواجه صعوبة في تسجيل الدخول أو تحميل المستندات، يرجى تجربة ما يلي:
1. امسح ذاكرة التخزين المؤقت وملفات تعريف الارتباط في المتصفح أو استخدم متصفحًا مختلفًا.
2. تأكد من إدخال بيانات تسجيل الدخول بشكل صحيح.
3. إذا كنت قد أعدت تعيين كلمة المرور وما زالت لا تعمل، يرجى إعادة تعيينها مرة أخرى أو استخدام خيار "نسيت كلمة المرور" في البوابة.`,
    },
    {
      question: "ما هو خطاب تأكيد البنك؟",
      answer:
        "خطاب تأكيد البنك هو خطاب رسمي صادر عن البنك يؤكد أن الحساب البنكي يخصك.\n\nهذا الخطاب مطلوب قبل تحديث أي تفاصيل حساب، وفقًا للوائح SARS.",
    },
    {
      question:
        "كم يستغرق قسم المالية للدفع بعد استلام الأموال من SARS؟",
      answer:
        "لا يمكننا تقديم إطار زمني. ومع ذلك، بمجرد إجراء الدفع، ستتلقى تأكيدًا عبر البريد الإلكتروني.",
    },
    {
      question: "تم رفض المطالبة بسبب ختم الدخول / الخروج لأفراد الطاقم",
      answer: `يرجى إرسال نسخة من بطاقة عضو الطاقم عبر البريد الإلكتروني إلى ${SUPPORT_EMAIL}.`,
    },
    {
      question: "ما هو العنوان الصحيح لإرسال البريد إليه؟",
      answer: `262 Jack Hindon Street
Pretoria North
Gauteng
South Africa
0182`,
    },
    {
      question: "لماذا تم رفض مطالبتي؟",
      answer: `يرجى زيارة البوابة الإلكترونية وإدخال رقم مرجع VRA الخاص بك لعرض سبب الرفض. إذا كنت لا تزال غير متأكد، يرجى إرسال بريد إلكتروني إلى ${SUPPORT_EMAIL} للحصول على معلومات تفصيلية بشأن مطالبتك المرفوضة.`,
    },
    {
      question:
        "قمت بتحديث بياناتي البنكية على البوابة ولكن لم يتم تحديث التفاصيل",
      answer:
        "يجب أولاً قبول أو رفض طلب تحديث التفاصيل البنكية. بمجرد قبول الطلب أو رفضه، ستتلقى تأكيدًا.",
    },
  ],
  zh: [
    {
      question: "在 SARS 批准索赔后，客户需要等待多久 SARS 才会向 VRA 付款？",
      answer:
        "很遗憾，我们无法提供具体时间。我们需要耐心等待 SARS 为相关索赔付款。",
    },
    {
      question: "我们如何直接联系 SARS？",
      answer: `请使用以下投诉邮箱直接联系 SARS：
SARSVRACOMPLAINTS@SARS.GOV.ZA`,
    },
    {
      question: "文件已通过 AMAX 快递到邮局",
      answer: `实体快递 - 请将送达证明以及运单号发送至 ${SUPPORT_EMAIL}，以便我们确认总部是否已收到文件。`,
    },
    {
      question: "索赔已被拒绝",
      answer: `请访问在线门户并输入您的 VRA 参考编号，以查看索赔被拒绝的原因。
Check Refund Progress - Vatrefundagency
${STATUS_LINK}`,
    },
    {
      question: "可以使用信用卡接收退款吗？",
      answer: "很遗憾，信用卡不可接受。付款账户必须以索赔人本人名义开立。",
    },
    {
      question: "流程需要多长时间？",
      answer:
        "该流程在总部大约需要 1-2 个月。如果索赔在后台办公室被接受，将提交给 SARS，SARS 处理和最终确定可能还需要 3-6 个月。SARS 最终确定索赔后，VRA 必须等待 SARS 向我们付款，然后才能向索赔人的账户付款。",
    },
    {
      question: "无法登录在线门户或无法上传银行确认函",
      answer: `根据我们的标准程序，银行信息被视为敏感信息。出于安全原因，VRA 不能代表客户手动更新这些信息。

客户必须通过在线门户自行更新银行信息，并上传任何支持文件作为证明。

${BANKING_LINK}

如果您登录或上传文件遇到困难，请尝试以下操作：
1. 清除浏览器缓存和 Cookie，或尝试使用其他浏览器。
2. 确保您的登录凭据输入正确。
3. 如果您已经重置密码但仍无法使用，请再次重置，或使用门户上的“忘记密码”选项。`,
    },
    {
      question: "什么是银行确认函？",
      answer:
        "银行确认函是由您的银行出具的正式信函，用于确认该银行账户属于您。\n\n根据 SARS 规定，在更新任何账户详情之前需要提供此信函。",
    },
    {
      question: "VRA 从 SARS 收到资金后，财务部需要多久付款？",
      answer: "我们无法提供具体时间。但是，一旦付款完成，您将通过电子邮件收到确认。",
    },
    {
      question: "由于机组人员入境 / 出境印章导致索赔被拒绝",
      answer: `请通过电子邮件将您的机组人员证件副本发送至 ${SUPPORT_EMAIL}。`,
    },
    {
      question: "邮寄的正确地址是什么？",
      answer: `262 Jack Hindon Street
Pretoria North
Gauteng
South Africa
0182`,
    },
    {
      question: "为什么我的索赔被拒绝？",
      answer: `请访问在线门户并输入您的 VRA 参考编号以查看拒绝原因。如果您仍不确定，请发送电子邮件至 ${SUPPORT_EMAIL}，以获取有关您被拒绝索赔的详细信息。`,
    },
    {
      question: "我已在门户上更新银行资料，但资料尚未更新",
      answer: "更新银行资料的请求必须先被接受或拒绝。一旦请求被接受或拒绝，您将收到确认。",
    },
  ],
  nl: [
    {
      question:
        "Hoe lang moeten cliënten wachten voordat SARS aan VRA betaalt nadat de claim door SARS is goedgekeurd?",
      answer:
        "Helaas kunnen wij geen tijdsbestek geven. We moeten geduldig wachten tot SARS de claim(s) betaalt.",
    },
    {
      question: "Hoe kunnen we SARS rechtstreeks contacteren?",
      answer: `Neem rechtstreeks contact op met SARS via het volgende klachten-e-mailadres:
SARSVRACOMPLAINTS@SARS.GOV.ZA`,
    },
    {
      question: "Documenten zijn per koerier naar postkantoor AMAX gestuurd",
      answer: `Fysieke koerier - Stuur het bewijs van levering en het waybillnummer naar ${SUPPORT_EMAIL}, zodat wij kunnen bevestigen of wij de documenten op ons hoofdkantoor hebben ontvangen.`,
    },
    {
      question: "Claim is afgewezen",
      answer: `Bezoek het online portaal en voer uw VRA-referentienummer in om de reden van afwijzing van uw claim te bekijken.
Check Refund Progress - Vatrefundagency
${STATUS_LINK}`,
    },
    {
      question: "Kan een creditcard worden gebruikt voor de terugbetaling?",
      answer:
        "Een creditcard wordt helaas niet geaccepteerd. De rekening voor betaling moet op naam van de claimant staan.",
    },
    {
      question: "Hoe lang duurt het proces?",
      answer:
        "Het proces kan ongeveer 1-2 maanden duren op het hoofdkantoor. Als de claim bij back office wordt geaccepteerd, wordt deze ingediend bij SARS, wat nog eens 3-6 maanden kan duren voor verwerking en afronding. Zodra SARS de claim heeft afgerond, moet VRA wachten tot SARS aan ons betaalt voordat betaling aan de rekening van de claimant kan worden gedaan.",
    },
    {
      question:
        "Kan niet inloggen op het online portaal of kan de bankbevestigingsbrief niet uploaden",
      answer: `Volgens onze standaardprocedures worden bankgegevens beschouwd als gevoelige informatie. Om veiligheidsredenen kan VRA deze gegevens niet handmatig namens cliënten bijwerken.

Cliënten moeten hun bankgegevens zelf via het online portaal bijwerken en eventuele ondersteunende documenten als bewijs uploaden.

${BANKING_LINK}

Als u problemen heeft met inloggen of documenten uploaden, probeer dan het volgende:
1. Wis de cache en cookies van uw browser of gebruik een andere browser.
2. Controleer of uw inloggegevens correct zijn ingevoerd.
3. Als u uw wachtwoord al opnieuw heeft ingesteld en het nog steeds niet werkt, probeer het dan opnieuw in te stellen of gebruik de optie "Wachtwoord vergeten" op het portaal.`,
    },
    {
      question: "Wat is een bankbevestigingsbrief?",
      answer:
        "Een bankbevestigingsbrief is een formele brief van uw bank waarin wordt bevestigd dat de bankrekening van u is.\n\nDeze brief is vereist voordat rekeninggegevens kunnen worden bijgewerkt, zoals vereist door SARS-regels.",
    },
    {
      question:
        "Hoe lang duurt het voordat Finance betaalt nadat fondsen van SARS zijn ontvangen?",
      answer:
        "Wij kunnen geen tijdsbestek geven. Zodra de betaling is gedaan, ontvangt u echter een bevestiging per e-mail.",
    },
    {
      question: "Claim afgewezen vanwege entry / exit-stempel voor crewleden",
      answer: `Stuur een kopie van uw crew member card per e-mail naar ${SUPPORT_EMAIL}.`,
    },
    {
      question: "Wat is het juiste adres om de post naartoe te sturen?",
      answer: `262 Jack Hindon Street
Pretoria North
Gauteng
South Africa
0182`,
    },
    {
      question: "Waarom is mijn claim afgewezen?",
      answer: `Bezoek het online portaal en voer uw VRA-referentienummer in om de reden van afwijzing te bekijken. Als u nog steeds onzeker bent, stuur dan een e-mail naar ${SUPPORT_EMAIL} voor gedetailleerde informatie over uw afgewezen claim.`,
    },
    {
      question:
        "Ik heb mijn bankgegevens op het portaal bijgewerkt, maar de gegevens zijn nog niet bijgewerkt",
      answer:
        "Het verzoek om bijgewerkte bankgegevens moet eerst worden geaccepteerd of afgewezen. Zodra het verzoek is geaccepteerd of afgewezen, ontvangt u een bevestiging.",
    },
  ],
  fr: [
    {
      question:
        "Combien de temps les clients doivent-ils attendre que SARS effectue le paiement à VRA après l'approbation de la demande par SARS ?",
      answer:
        "Nous ne sommes malheureusement pas en mesure de fournir un délai. Nous devons attendre patiemment que SARS effectue le paiement de la ou des demandes.",
    },
    {
      question: "Comment pouvons-nous contacter SARS directement ?",
      answer: `Veuillez contacter SARS directement à l'adresse e-mail de réclamation suivante :
SARSVRACOMPLAINTS@SARS.GOV.ZA`,
    },
    {
      question: "Les documents ont été envoyés par courrier au bureau de poste AMAX",
      answer: `Courrier physique - Veuillez fournir la preuve de livraison ainsi que le numéro de bordereau à ${SUPPORT_EMAIL} afin que nous puissions confirmer si nous avons reçu les documents à notre siège social.`,
    },
    {
      question: "La demande a été rejetée",
      answer: `Veuillez visiter le portail en ligne et saisir votre numéro de référence VRA pour consulter le motif du rejet de votre demande.
Check Refund Progress - Vatrefundagency
${STATUS_LINK}`,
    },
    {
      question: "Une carte de crédit peut-elle être utilisée pour le remboursement ?",
      answer:
        "Une carte de crédit n'est malheureusement pas acceptable. Le compte de paiement doit être au nom du demandeur.",
    },
    {
      question: "Combien de temps prend le processus ?",
      answer:
        "Le processus peut prendre environ 1 à 2 mois au siège social. Si la demande est acceptée au back office, elle est soumise à SARS, ce qui peut prendre 3 à 6 mois supplémentaires pour le traitement et la finalisation. Une fois la demande finalisée par SARS, VRA doit attendre que SARS nous verse les fonds avant que le paiement puisse être effectué sur le compte du demandeur.",
    },
    {
      question:
        "Impossible de se connecter au portail en ligne ou de téléverser la lettre de confirmation bancaire",
      answer: `Conformément à nos procédures standard, les coordonnées bancaires sont considérées comme des informations sensibles. Pour des raisons de sécurité, VRA ne peut pas mettre à jour manuellement ces informations au nom des clients.

Les clients doivent mettre à jour eux-mêmes leurs informations bancaires via le portail en ligne et téléverser tout document justificatif comme preuve.

${BANKING_LINK}

Si vous avez des difficultés à vous connecter ou à téléverser des documents, veuillez essayer ce qui suit :
1. Effacez le cache et les cookies de votre navigateur ou utilisez un autre navigateur.
2. Assurez-vous que vos identifiants de connexion sont saisis correctement.
3. Si vous avez déjà réinitialisé votre mot de passe et que cela ne fonctionne toujours pas, essayez de le réinitialiser à nouveau ou utilisez l'option "Mot de passe oublié" sur le portail.`,
    },
    {
      question: "Qu'est-ce qu'une lettre de confirmation bancaire ?",
      answer:
        "Une lettre de confirmation bancaire est une lettre officielle émise par votre banque confirmant que le compte bancaire vous appartient.\n\nCette lettre est requise avant toute mise à jour des coordonnées de compte, conformément aux réglementations SARS.",
    },
    {
      question:
        "Combien de temps faut-il à Finance pour effectuer le paiement après réception des fonds de SARS ?",
      answer:
        "Nous ne pouvons pas fournir de délai. Cependant, dès que le paiement aura été effectué, vous recevrez une confirmation par e-mail.",
    },
    {
      question:
        "Demande rejetée en raison du cachet d'entrée / de sortie pour les membres d'équipage",
      answer: `Veuillez envoyer une copie de votre carte de membre d'équipage par e-mail à ${SUPPORT_EMAIL}.`,
    },
    {
      question: "Quelle est l'adresse correcte pour envoyer le courrier ?",
      answer: `262 Jack Hindon Street
Pretoria North
Gauteng
South Africa
0182`,
    },
    {
      question: "Pourquoi ma demande est-elle rejetée ?",
      answer: `Veuillez visiter le portail en ligne et saisir votre numéro de référence VRA pour consulter le motif du rejet. Si vous avez encore des doutes, veuillez envoyer un e-mail à ${SUPPORT_EMAIL} pour obtenir des informations détaillées concernant votre demande rejetée.`,
    },
    {
      question:
        "J'ai mis à jour mes coordonnées bancaires sur le portail, mais elles n'ont pas encore été mises à jour",
      answer:
        "La demande de mise à jour des coordonnées bancaires doit d'abord être acceptée ou rejetée. Dès que la demande aura été acceptée ou rejetée, vous recevrez une confirmation.",
    },
  ],
  de: [
    {
      question:
        "Wie lange müssen Kunden warten, bis SARS an VRA zahlt, nachdem der Anspruch von SARS genehmigt wurde?",
      answer:
        "Leider können wir keinen Zeitrahmen angeben. Wir müssen geduldig warten, bis SARS die Zahlung für den/die Anspruch(e) leistet.",
    },
    {
      question: "Wie können wir SARS direkt kontaktieren?",
      answer: `Bitte kontaktieren Sie SARS direkt über die folgende Beschwerde-E-Mail-Adresse:
SARSVRACOMPLAINTS@SARS.GOV.ZA`,
    },
    {
      question: "Dokumente wurden per Kurier an das Postamt AMAX gesendet",
      answer: `Physischer Kurier - Bitte senden Sie den Zustellnachweis sowie die Waybill-Nummer an ${SUPPORT_EMAIL}, damit wir bestätigen können, ob wir die Dokumente in unserer Zentrale erhalten haben.`,
    },
    {
      question: "Anspruch wurde abgelehnt",
      answer: `Bitte besuchen Sie das Online-Portal und geben Sie Ihre VRA-Referenznummer ein, um den Ablehnungsgrund für Ihren Anspruch einzusehen.
Check Refund Progress - Vatrefundagency
${STATUS_LINK}`,
    },
    {
      question: "Kann eine Kreditkarte für die Rückerstattung verwendet werden?",
      answer:
        "Eine Kreditkarte ist leider nicht akzeptabel. Das Zahlungskonto muss auf den Namen des Antragstellers lauten.",
    },
    {
      question: "Wie lange dauert der Prozess?",
      answer:
        "Der Prozess kann in der Zentrale etwa 1-2 Monate dauern. Wenn der Anspruch im Back Office akzeptiert wird, wird er an SARS übermittelt, was weitere 3-6 Monate für Bearbeitung und Abschluss dauern kann. Sobald der Anspruch von SARS abgeschlossen wurde, muss VRA warten, bis SARS an uns zahlt, bevor eine Zahlung auf das Konto des Antragstellers erfolgen kann.",
    },
    {
      question:
        "Anmeldung im Online-Portal nicht möglich oder Bankbestätigungsschreiben kann nicht hochgeladen werden",
      answer: `Gemäß unseren Standardverfahren gelten Bankdaten als sensible Informationen. Aus Sicherheitsgründen kann VRA diese Daten nicht manuell im Namen von Kunden aktualisieren.

Kunden müssen ihre Bankinformationen selbst über das Online-Portal aktualisieren und alle unterstützenden Dokumente als Nachweis hochladen.

${BANKING_LINK}

Wenn Sie Schwierigkeiten beim Einloggen oder Hochladen von Dokumenten haben, versuchen Sie bitte Folgendes:
1. Leeren Sie den Cache und die Cookies Ihres Browsers oder verwenden Sie einen anderen Browser.
2. Stellen Sie sicher, dass Ihre Zugangsdaten korrekt eingegeben wurden.
3. Wenn Sie Ihr Passwort bereits zurückgesetzt haben und es immer noch nicht funktioniert, setzen Sie es bitte erneut zurück oder verwenden Sie die Option "Passwort vergessen" im Portal.`,
    },
    {
      question: "Was ist ein Bankbestätigungsschreiben?",
      answer:
        "Ein Bankbestätigungsschreiben ist ein formelles Schreiben Ihrer Bank, das bestätigt, dass das Bankkonto Ihnen gehört.\n\nDieses Schreiben ist erforderlich, bevor Kontodaten aktualisiert werden können, wie von SARS-Vorschriften verlangt.",
    },
    {
      question:
        "Wie lange dauert es, bis Finance nach Erhalt der Gelder von SARS zahlt?",
      answer:
        "Wir können keinen Zeitrahmen angeben. Sobald die Zahlung jedoch erfolgt ist, erhalten Sie eine Bestätigung per E-Mail.",
    },
    {
      question: "Anspruch wegen Einreise-/Ausreisestempel für Crewmitglieder abgelehnt",
      answer: `Bitte senden Sie eine Kopie Ihrer Crew Member Card per E-Mail an ${SUPPORT_EMAIL}.`,
    },
    {
      question: "An welche Adresse soll die Post gesendet werden?",
      answer: `262 Jack Hindon Street
Pretoria North
Gauteng
South Africa
0182`,
    },
    {
      question: "Warum wurde mein Anspruch abgelehnt?",
      answer: `Bitte besuchen Sie das Online-Portal und geben Sie Ihre VRA-Referenznummer ein, um den Ablehnungsgrund einzusehen. Wenn Sie weiterhin unsicher sind, senden Sie bitte eine E-Mail an ${SUPPORT_EMAIL}, um detaillierte Informationen zu Ihrem abgelehnten Anspruch zu erhalten.`,
    },
    {
      question:
        "Ich habe meine Bankdaten im Portal aktualisiert, aber die Daten wurden nicht aktualisiert",
      answer:
        "Der Antrag auf aktualisierte Bankdaten muss zuerst akzeptiert oder abgelehnt werden. Sobald der Antrag akzeptiert oder abgelehnt wurde, erhalten Sie eine Bestätigung.",
    },
  ],
  it: [
    {
      question:
        "Quanto tempo devono attendere i clienti affinché SARS effettui il pagamento a VRA dopo l'approvazione della richiesta da parte di SARS?",
      answer:
        "Purtroppo non siamo in grado di fornire una tempistica. Dobbiamo attendere pazientemente che SARS effettui il pagamento per la/e richiesta/e.",
    },
    {
      question: "Come possiamo contattare direttamente SARS?",
      answer: `Contatta direttamente SARS utilizzando il seguente indirizzo email per reclami:
SARSVRACOMPLAINTS@SARS.GOV.ZA`,
    },
    {
      question: "I documenti sono stati inviati tramite corriere all'ufficio postale AMAX",
      answer: `Corriere fisico - Fornisci la prova di consegna e il numero di waybill a ${SUPPORT_EMAIL} in modo che possiamo confermare se abbiamo ricevuto i documenti presso la nostra sede centrale.`,
    },
    {
      question: "La richiesta è stata respinta",
      answer: `Visita il portale online e inserisci il tuo numero di riferimento VRA per visualizzare il motivo del rifiuto della tua richiesta.
Check Refund Progress - Vatrefundagency
${STATUS_LINK}`,
    },
    {
      question: "È possibile utilizzare una carta di credito per il rimborso?",
      answer:
        "Una carta di credito purtroppo non è accettabile. Il conto per il pagamento deve essere intestato al richiedente.",
    },
    {
      question: "Quanto dura il processo?",
      answer:
        "Il processo può richiedere circa 1-2 mesi presso la sede centrale. Se la richiesta viene accettata dal back office, viene inviata a SARS, che può richiedere ulteriori 3-6 mesi per l'elaborazione e la finalizzazione. Una volta finalizzata la richiesta da SARS, VRA deve attendere che SARS effettui il pagamento a noi prima che il pagamento possa essere effettuato sul conto del richiedente.",
    },
    {
      question:
        "Impossibile accedere al portale online o caricare la lettera di conferma bancaria",
      answer: `Secondo le nostre procedure standard, i dettagli bancari sono considerati informazioni sensibili. Per motivi di sicurezza, VRA non può aggiornare manualmente questi dettagli per conto dei clienti.

I clienti devono aggiornare autonomamente le proprie informazioni bancarie tramite il portale online e caricare eventuali documenti di supporto come prova.

${BANKING_LINK}

Se hai difficoltà ad accedere o caricare documenti, prova quanto segue:
1. Cancella la cache e i cookie del browser o prova a utilizzare un browser diverso.
2. Assicurati che le credenziali di accesso siano inserite correttamente.
3. Se hai già reimpostato la password e continua a non funzionare, prova a reimpostarla nuovamente o usa l'opzione "Password dimenticata" sul portale.`,
    },
    {
      question: "Che cos'è una lettera di conferma bancaria?",
      answer:
        "Una lettera di conferma bancaria è una lettera formale emessa dalla tua banca che conferma che il conto bancario appartiene a te.\n\nQuesta lettera è richiesta prima che qualsiasi dettaglio del conto possa essere aggiornato, come richiesto dalle normative SARS.",
    },
    {
      question:
        "Quanto tempo impiega Finance a effettuare il pagamento dopo aver ricevuto i fondi da SARS?",
      answer:
        "Non siamo in grado di fornire una tempistica. Tuttavia, non appena il pagamento sarà stato effettuato, riceverai una conferma via email.",
    },
    {
      question: "Richiesta respinta a causa del timbro di ingresso / uscita per i membri dell'equipaggio",
      answer: `Fornisci una copia della tua tessera di membro dell'equipaggio via email a ${SUPPORT_EMAIL}.`,
    },
    {
      question: "Qual è l'indirizzo corretto a cui inviare la posta?",
      answer: `262 Jack Hindon Street
Pretoria North
Gauteng
South Africa
0182`,
    },
    {
      question: "Perché la mia richiesta è stata respinta?",
      answer: `Visita il portale online e inserisci il tuo numero di riferimento VRA per visualizzare il motivo del rifiuto. Se non sei ancora sicuro, invia un'email a ${SUPPORT_EMAIL} per informazioni dettagliate sulla tua richiesta respinta.`,
    },
    {
      question:
        "Ho aggiornato i miei dati bancari sul portale, ma i dettagli non sono stati aggiornati",
      answer:
        "La richiesta di aggiornamento dei dati bancari deve prima essere accettata o respinta. Non appena la richiesta sarà accettata o respinta, riceverai una conferma.",
    },
  ],
  pt: [
    {
      question:
        "Quanto tempo os clientes precisam esperar para que a SARS faça o pagamento à VRA depois de a reclamação ter sido aprovada pela SARS?",
      answer:
        "Infelizmente não conseguimos fornecer um prazo. Precisamos aguardar pacientemente que a SARS faça o pagamento da(s) reclamação(ões).",
    },
    {
      question: "Como podemos contactar a SARS diretamente?",
      answer: `Contacte a SARS diretamente através do seguinte endereço de email para reclamações:
SARSVRACOMPLAINTS@SARS.GOV.ZA`,
    },
    {
      question: "Os documentos foram enviados por courier para os correios AMAX",
      answer: `Courier físico - Envie o comprovativo de entrega e o número da waybill para ${SUPPORT_EMAIL} para que possamos confirmar se recebemos os documentos na nossa sede.`,
    },
    {
      question: "A reclamação foi rejeitada",
      answer: `Visite o portal online e introduza o seu número de referência VRA para ver o motivo da rejeição da sua reclamação.
Check Refund Progress - Vatrefundagency
${STATUS_LINK}`,
    },
    {
      question: "Pode ser usado um cartão de crédito para o reembolso?",
      answer:
        "Infelizmente, um cartão de crédito não é aceitável. A conta para pagamento deve estar em nome do requerente.",
    },
    {
      question: "Quanto tempo demora o processo?",
      answer:
        "O processo pode demorar aproximadamente 1-2 meses na sede. Se a reclamação for aceite no back office, é submetida à SARS, o que pode demorar mais 3-6 meses para processamento e finalização. Assim que a reclamação for finalizada pela SARS, a VRA deve aguardar que a SARS nos faça o pagamento antes que o pagamento possa ser feito para a conta do requerente.",
    },
    {
      question:
        "Não consigo iniciar sessão no portal online ou não consigo carregar a carta de confirmação bancária",
      answer: `De acordo com os nossos procedimentos padrão, os dados bancários são considerados informação sensível. Por razões de segurança, a VRA não pode atualizar manualmente estes dados em nome dos clientes.

Os clientes devem atualizar eles próprios as suas informações bancárias através do portal online e carregar quaisquer documentos de suporte como prova.

${BANKING_LINK}

Se tiver dificuldades em iniciar sessão ou carregar documentos, tente o seguinte:
1. Limpe a cache e os cookies do navegador ou tente usar outro navegador.
2. Certifique-se de que as suas credenciais de acesso foram introduzidas corretamente.
3. Se já redefiniu a palavra-passe e ainda não funciona, tente redefini-la novamente ou use a opção "Esqueci a palavra-passe" no portal.`,
    },
    {
      question: "O que é uma carta de confirmação bancária?",
      answer:
        "Uma carta de confirmação bancária é uma carta formal emitida pelo seu banco confirmando que a conta bancária lhe pertence.\n\nEsta carta é exigida antes de quaisquer dados da conta poderem ser atualizados, conforme exigido pelos regulamentos da SARS.",
    },
    {
      question:
        "Quanto tempo demora o Finance a fazer o pagamento depois de os fundos serem recebidos da SARS?",
      answer:
        "Não conseguimos fornecer um prazo. No entanto, assim que o pagamento for efetuado, receberá confirmação por email.",
    },
    {
      question: "Reclamação rejeitada devido ao carimbo de entrada / saída para membros da tripulação",
      answer: `Envie uma cópia do seu cartão de membro da tripulação por email para ${SUPPORT_EMAIL}.`,
    },
    {
      question: "Qual é o endereço correto para enviar o correio?",
      answer: `262 Jack Hindon Street
Pretoria North
Gauteng
South Africa
0182`,
    },
    {
      question: "Porque foi a minha reclamação rejeitada?",
      answer: `Visite o portal online e introduza o seu número de referência VRA para ver o motivo da rejeição. Se ainda tiver dúvidas, envie um email para ${SUPPORT_EMAIL} para obter informações detalhadas sobre a sua reclamação rejeitada.`,
    },
    {
      question:
        "Atualizei os meus dados bancários no portal, mas os dados ainda não foram atualizados",
      answer:
        "O pedido de atualização dos dados bancários deve primeiro ser aceite ou rejeitado. Assim que o pedido for aceite ou rejeitado, receberá confirmação.",
    },
  ],
  ru: [
    {
      question:
        "Сколько времени клиентам нужно ждать, пока SARS произведет платеж VRA после одобрения заявки SARS?",
      answer:
        "К сожалению, мы не можем предоставить сроки. Нам нужно терпеливо ждать, пока SARS произведет платеж по заявке/заявкам.",
    },
    {
      question: "Как мы можем связаться с SARS напрямую?",
      answer: `Пожалуйста, свяжитесь с SARS напрямую по следующему адресу электронной почты для жалоб:
SARSVRACOMPLAINTS@SARS.GOV.ZA`,
    },
    {
      question: "Документы были отправлены курьером в почтовое отделение AMAX",
      answer: `Физический курьер - Пожалуйста, предоставьте подтверждение доставки, а также номер waybill на ${SUPPORT_EMAIL}, чтобы мы могли подтвердить, получили ли мы документы в нашем головном офисе.`,
    },
    {
      question: "Заявка была отклонена",
      answer: `Пожалуйста, посетите онлайн-портал и введите ваш справочный номер VRA, чтобы посмотреть причину отклонения вашей заявки.
Check Refund Progress - Vatrefundagency
${STATUS_LINK}`,
    },
    {
      question: "Можно ли использовать кредитную карту для возврата?",
      answer:
        "К сожалению, кредитная карта не принимается. Счет для выплаты должен быть на имя заявителя.",
    },
    {
      question: "Сколько времени занимает процесс?",
      answer:
        "Процесс может занять примерно 1-2 месяца в головном офисе. Если заявка принята в back office, она передается в SARS, что может занять еще 3-6 месяцев для обработки и завершения. После завершения заявки SARS, VRA должна дождаться платежа от SARS, прежде чем выплата может быть произведена на счет заявителя.",
    },
    {
      question:
        "Не могу войти в онлайн-портал или загрузить письмо-подтверждение банка",
      answer: `Согласно нашим стандартным процедурам, банковские данные считаются конфиденциальной информацией. По соображениям безопасности VRA не может вручную обновлять эти данные от имени клиентов.

Клиенты должны самостоятельно обновлять свою банковскую информацию через онлайн-портал и загружать любые подтверждающие документы.

${BANKING_LINK}

Если у вас возникли трудности со входом или загрузкой документов, попробуйте следующее:
1. Очистите кэш и cookies браузера или попробуйте другой браузер.
2. Убедитесь, что ваши учетные данные введены правильно.
3. Если вы уже сбросили пароль, но он все еще не работает, попробуйте сбросить его снова или используйте опцию "Забыли пароль" на портале.`,
    },
    {
      question: "Что такое письмо-подтверждение банка?",
      answer:
        "Письмо-подтверждение банка - это официальное письмо, выданное вашим банком, подтверждающее, что банковский счет принадлежит вам.\n\nЭто письмо требуется до обновления любых данных счета в соответствии с правилами SARS.",
    },
    {
      question:
        "Сколько времени требуется Finance для выплаты после получения средств от SARS?",
      answer:
        "Мы не можем предоставить сроки. Однако, как только платеж будет произведен, вы получите подтверждение по электронной почте.",
    },
    {
      question: "Заявка отклонена из-за штампа въезда / выезда для членов экипажа",
      answer: `Пожалуйста, отправьте копию вашей карты члена экипажа по электронной почте на ${SUPPORT_EMAIL}.`,
    },
    {
      question: "Какой правильный адрес для отправки почты?",
      answer: `262 Jack Hindon Street
Pretoria North
Gauteng
South Africa
0182`,
    },
    {
      question: "Почему моя заявка отклонена?",
      answer: `Пожалуйста, посетите онлайн-портал и введите ваш справочный номер VRA, чтобы посмотреть причину отклонения. Если вы все еще не уверены, напишите на ${SUPPORT_EMAIL}, чтобы получить подробную информацию о вашей отклоненной заявке.`,
    },
    {
      question:
        "Я обновил банковские данные на портале, но данные не были обновлены",
      answer:
        "Запрос на обновление банковских данных должен сначала быть принят или отклонен. Как только запрос будет принят или отклонен, вы получите подтверждение.",
    },
  ],
  es: [
    {
      question:
        "¿Cuánto tiempo deben esperar los clientes para que SARS realice el pago a VRA después de que la reclamación haya sido aprobada por SARS?",
      answer:
        "Lamentablemente no podemos proporcionar un plazo. Debemos esperar pacientemente a que SARS realice el pago de la(s) reclamación(es).",
    },
    {
      question: "¿Cómo podemos contactar directamente a SARS?",
      answer: `Comuníquese directamente con SARS utilizando el siguiente correo electrónico de quejas:
SARSVRACOMPLAINTS@SARS.GOV.ZA`,
    },
    {
      question: "Los documentos han sido enviados por mensajería a la oficina postal AMAX",
      answer: `Mensajería física - Proporcione el comprobante de entrega y el número de waybill a ${SUPPORT_EMAIL} para que podamos confirmar si recibimos los documentos en nuestra oficina principal.`,
    },
    {
      question: "La reclamación ha sido rechazada",
      answer: `Visite el portal en línea e introduzca su número de referencia VRA para ver el motivo del rechazo de su reclamación.
Check Refund Progress - Vatrefundagency
${STATUS_LINK}`,
    },
    {
      question: "¿Se puede usar una tarjeta de crédito para el reembolso?",
      answer:
        "Lamentablemente, una tarjeta de crédito no es aceptable. La cuenta de pago debe estar a nombre del reclamante.",
    },
    {
      question: "¿Cuánto tarda el proceso?",
      answer:
        "El proceso puede tardar aproximadamente 1-2 meses en la oficina principal. Si la reclamación es aceptada en back office, se envía a SARS, lo que puede tardar otros 3-6 meses para su procesamiento y finalización. Una vez que SARS finaliza la reclamación, VRA debe esperar a que SARS nos realice el pago antes de que se pueda pagar a la cuenta del reclamante.",
    },
    {
      question:
        "No puedo iniciar sesión en el portal en línea o no puedo cargar la carta de confirmación bancaria",
      answer: `Según nuestros procedimientos estándar, los datos bancarios se consideran información sensible. Por razones de seguridad, VRA no puede actualizar manualmente estos datos en nombre de los clientes.

Los clientes deben actualizar ellos mismos su información bancaria a través del portal en línea y cargar cualquier documento de respaldo como prueba.

${BANKING_LINK}

Si tiene dificultades para iniciar sesión o cargar documentos, intente lo siguiente:
1. Borre la caché y las cookies de su navegador o intente usar un navegador diferente.
2. Asegúrese de introducir correctamente sus credenciales de inicio de sesión.
3. Si ya restableció su contraseña y todavía no funciona, intente restablecerla nuevamente o use la opción "Olvidé mi contraseña" en el portal.`,
    },
    {
      question: "¿Qué es una carta de confirmación bancaria?",
      answer:
        "Una carta de confirmación bancaria es una carta formal emitida por su banco que confirma que la cuenta bancaria le pertenece.\n\nEsta carta es necesaria antes de que se puedan actualizar los datos de cualquier cuenta, según lo requerido por las regulaciones de SARS.",
    },
    {
      question:
        "¿Cuánto tarda Finance en realizar el pago después de recibir fondos de SARS?",
      answer:
        "No podemos proporcionar un plazo. Sin embargo, tan pronto como se haya realizado el pago, recibirá confirmación por correo electrónico.",
    },
    {
      question: "Reclamación rechazada debido al sello de entrada / salida para miembros de tripulación",
      answer: `Proporcione una copia de su tarjeta de miembro de tripulación por correo electrónico a ${SUPPORT_EMAIL}.`,
    },
    {
      question: "¿Cuál es la dirección correcta para enviar el correo postal?",
      answer: `262 Jack Hindon Street
Pretoria North
Gauteng
South Africa
0182`,
    },
    {
      question: "¿Por qué fue rechazada mi reclamación?",
      answer: `Visite el portal en línea e introduzca su número de referencia VRA para ver el motivo del rechazo. Si aún no está seguro, envíe un correo electrónico a ${SUPPORT_EMAIL} para obtener información detallada sobre su reclamación rechazada.`,
    },
    {
      question:
        "Actualicé mis datos bancarios en el portal, pero los datos no se han actualizado",
      answer:
        "La solicitud de actualización de datos bancarios primero debe ser aceptada o rechazada. Tan pronto como la solicitud haya sido aceptada o rechazada, recibirá confirmación.",
    },
  ],
};

const faqMenuTranslations = {
  en: {
    items: [
      "VAT payment timing",
      "VAT amount",
      "Refund process",
      "SARS payment timeline after approval",
      "Contact SARS directly",
      "Couriered documents / AMAX delivery",
      "Rejected claim",
      "Credit card refunds",
      "Processing timeframe",
      "Portal login or document upload issues",
      "Bank confirmation letter",
      "Payment after SARS funds are received",
      "Crew member entry / exit stamp rejection",
      "Postal address for documents",
      "Reason for claim rejection",
      "Bank details updated but not reflected",
      "My question was not answered",
      "Back to Main Menu",
    ],
    unansweredAnswer: `If your question was not answered, please contact our support team by email at ${SUPPORT_EMAIL}.`,
  },
  ar: {
    items: [
      "موعد دفع ضريبة القيمة المضافة",
      "مبلغ ضريبة القيمة المضافة",
      "طريقة الحصول على الاسترداد",
      "موعد دفع SARS بعد الموافقة",
      "التواصل مع SARS مباشرة",
      "المستندات المرسلة عبر AMAX",
      "المطالبة المرفوضة",
      "استرداد المبلغ عبر بطاقة ائتمان",
      "مدة المعالجة",
      "مشاكل الدخول للبوابة أو رفع المستندات",
      "خطاب تأكيد البنك",
      "الدفع بعد استلام أموال SARS",
      "رفض ختم الدخول / الخروج لأفراد الطاقم",
      "العنوان البريدي للمستندات",
      "سبب رفض المطالبة",
      "تحديث البيانات البنكية غير ظاهر",
      "لم تتم الإجابة على سؤالي",
      "العودة إلى القائمة الرئيسية",
    ],
    unansweredAnswer: `إذا لم تتم الإجابة على سؤالك، يرجى التواصل مع فريق الدعم عبر البريد الإلكتروني على ${SUPPORT_EMAIL}.`,
  },
  zh: {
    items: [
      "增值税付款时间",
      "增值税金额",
      "退款流程",
      "SARS 批准后的付款时间",
      "直接联系 SARS",
      "AMAX 快递文件",
      "索赔被拒绝",
      "信用卡退款",
      "处理时间",
      "门户登录或文件上传问题",
      "银行确认函",
      "收到 SARS 资金后的付款",
      "机组人员入境 / 出境章被拒",
      "文件邮寄地址",
      "索赔被拒原因",
      "银行资料已更新但未显示",
      "我的问题未得到解答",
      "返回主菜单",
    ],
    unansweredAnswer: `如果您的问题未得到解答，请通过电子邮件联系支持团队：${SUPPORT_EMAIL}。`,
  },
  nl: {
    items: [
      "Timing van btw-betaling",
      "Btw-bedrag",
      "Terugbetalingsproces",
      "SARS-betalingstermijn na goedkeuring",
      "Rechtstreeks contact met SARS",
      "Gekoerierde documenten / AMAX",
      "Afgewezen claim",
      "Terugbetaling via creditcard",
      "Verwerkingstijd",
      "Portaalinlog of uploadproblemen",
      "Bankbevestigingsbrief",
      "Betaling na ontvangst van SARS-gelden",
      "Afwijzing door entry / exit-stempel crew",
      "Postadres voor documenten",
      "Reden voor afwijzing",
      "Bankgegevens bijgewerkt maar niet zichtbaar",
      "Mijn vraag is niet beantwoord",
      "Terug naar hoofdmenu",
    ],
    unansweredAnswer: `Als uw vraag niet is beantwoord, neem dan per e-mail contact op met ons ondersteuningsteam via ${SUPPORT_EMAIL}.`,
  },
  fr: {
    items: [
      "Délai de paiement de la TVA",
      "Montant de TVA",
      "Processus de remboursement",
      "Délai de paiement SARS après approbation",
      "Contacter SARS directement",
      "Documents envoyés par AMAX",
      "Demande rejetée",
      "Remboursement par carte de crédit",
      "Délai de traitement",
      "Connexion au portail ou téléversement",
      "Lettre de confirmation bancaire",
      "Paiement après réception des fonds SARS",
      "Rejet pour cachet entrée / sortie équipage",
      "Adresse postale des documents",
      "Motif du rejet",
      "Coordonnées bancaires mises à jour non visibles",
      "Ma question n'a pas été répondue",
      "Retour au menu principal",
    ],
    unansweredAnswer: `Si votre question n'a pas été répondue, veuillez contacter notre équipe d'assistance par e-mail à ${SUPPORT_EMAIL}.`,
  },
  de: {
    items: [
      "Zeitpunkt der MwSt.-Zahlung",
      "MwSt.-Betrag",
      "Rückerstattungsprozess",
      "SARS-Zahlungsdauer nach Genehmigung",
      "SARS direkt kontaktieren",
      "Kurierdokumente / AMAX",
      "Abgelehnter Anspruch",
      "Rückerstattung per Kreditkarte",
      "Bearbeitungsdauer",
      "Portal-Login oder Upload-Probleme",
      "Bankbestätigungsschreiben",
      "Zahlung nach Eingang der SARS-Gelder",
      "Ablehnung wegen Crew-Ein-/Ausreisestempel",
      "Postanschrift für Dokumente",
      "Grund der Ablehnung",
      "Bankdaten aktualisiert, aber nicht sichtbar",
      "Meine Frage wurde nicht beantwortet",
      "Zurück zum Hauptmenü",
    ],
    unansweredAnswer: `Wenn Ihre Frage nicht beantwortet wurde, kontaktieren Sie bitte unser Support-Team per E-Mail unter ${SUPPORT_EMAIL}.`,
  },
  it: {
    items: [
      "Tempistica del pagamento IVA",
      "Importo IVA",
      "Procedura di rimborso",
      "Tempi di pagamento SARS dopo approvazione",
      "Contattare direttamente SARS",
      "Documenti inviati con AMAX",
      "Richiesta respinta",
      "Rimborso su carta di credito",
      "Tempi di elaborazione",
      "Accesso al portale o caricamento documenti",
      "Lettera di conferma bancaria",
      "Pagamento dopo ricezione fondi SARS",
      "Rifiuto per timbro ingresso / uscita equipaggio",
      "Indirizzo postale per documenti",
      "Motivo del rifiuto",
      "Dati bancari aggiornati ma non visibili",
      "La mia domanda non ha ricevuto risposta",
      "Torna al menu principale",
    ],
    unansweredAnswer: `Se la tua domanda non ha ricevuto risposta, contatta il nostro team di supporto via email all'indirizzo ${SUPPORT_EMAIL}.`,
  },
  pt: {
    items: [
      "Prazo do pagamento do IVA",
      "Valor do IVA",
      "Processo de reembolso",
      "Prazo de pagamento da SARS após aprovação",
      "Contactar diretamente a SARS",
      "Documentos enviados por AMAX",
      "Reclamação rejeitada",
      "Reembolso por cartão de crédito",
      "Tempo de processamento",
      "Login no portal ou upload de documentos",
      "Carta de confirmação bancária",
      "Pagamento após fundos da SARS",
      "Rejeição por carimbo entrada / saída tripulação",
      "Endereço postal para documentos",
      "Motivo da rejeição",
      "Dados bancários atualizados mas não visíveis",
      "A minha pergunta não foi respondida",
      "Voltar ao menu principal",
    ],
    unansweredAnswer: `Se a sua pergunta não foi respondida, contacte a nossa equipa de apoio por email em ${SUPPORT_EMAIL}.`,
  },
  ru: {
    items: [
      "Срок выплаты НДС",
      "Сумма НДС",
      "Процесс возврата",
      "Срок платежа SARS после одобрения",
      "Связаться с SARS напрямую",
      "Документы, отправленные через AMAX",
      "Отклоненная заявка",
      "Возврат на кредитную карту",
      "Срок обработки",
      "Вход в портал или загрузка документов",
      "Письмо-подтверждение банка",
      "Платеж после получения средств SARS",
      "Отклонение из-за штампа въезда / выезда экипажа",
      "Почтовый адрес для документов",
      "Причина отклонения заявки",
      "Банковские данные обновлены, но не отображаются",
      "На мой вопрос не ответили",
      "Вернуться в главное меню",
    ],
    unansweredAnswer: `Если на ваш вопрос не ответили, пожалуйста, свяжитесь с нашей службой поддержки по электронной почте ${SUPPORT_EMAIL}.`,
  },
  es: {
    items: [
      "Fecha de pago del IVA",
      "Monto del IVA",
      "Proceso de reembolso",
      "Plazo de pago de SARS tras aprobación",
      "Contactar directamente a SARS",
      "Documentos enviados por AMAX",
      "Reclamación rechazada",
      "Reembolso con tarjeta de crédito",
      "Tiempo de procesamiento",
      "Acceso al portal o carga de documentos",
      "Carta de confirmación bancaria",
      "Pago tras recibir fondos de SARS",
      "Rechazo por sello de entrada / salida de tripulación",
      "Dirección postal para documentos",
      "Motivo del rechazo",
      "Datos bancarios actualizados pero no reflejados",
      "Mi pregunta no fue respondida",
      "Volver al menú principal",
    ],
    unansweredAnswer: `Si su pregunta no fue respondida, comuníquese con nuestro equipo de soporte por correo electrónico a ${SUPPORT_EMAIL}.`,
  },
};

const faqEmailNoteTranslations = {
  en: "Please also check your spam/junk mailbox if you have not received an email from us.",
  ar: "يرجى أيضًا التحقق من مجلد البريد العشوائي / غير المرغوب فيه إذا لم تستلم بريدًا إلكترونيًا منا.",
  zh: "如果您没有收到我们的电子邮件，也请检查您的垃圾邮件邮箱。",
  nl: "Controleer ook uw spam-/junkmailmap als u geen e-mail van ons heeft ontvangen.",
  fr: "Veuillez également vérifier votre dossier spam/courrier indésirable si vous n'avez pas reçu d'e-mail de notre part.",
  de: "Bitte prüfen Sie auch Ihren Spam-/Junk-Mail-Ordner, falls Sie keine E-Mail von uns erhalten haben.",
  it: "Controlla anche la cartella spam/posta indesiderata se non hai ricevuto una nostra email.",
  pt: "Verifique também a sua pasta de spam/lixo eletrónico caso não tenha recebido um email nosso.",
  ru: "Также проверьте папку спам/нежелательная почта, если вы не получили от нас письмо.",
  es: "Revise también su carpeta de spam/correo no deseado si no ha recibido un correo electrónico nuestro.",
};

const vatAmountIntroTranslations = {
  en: `The claim amount is reflected on the VAT255. If you are still unsure, please contact ${SUPPORT_EMAIL}.`,
  ar: `يظهر مبلغ المطالبة في نموذج VAT255. إذا كنت لا تزال غير متأكد، يرجى التواصل مع ${SUPPORT_EMAIL}.`,
  zh: `索赔金额显示在 VAT255 上。如果您仍不确定，请联系 ${SUPPORT_EMAIL}。`,
  nl: `Het claimbedrag staat vermeld op de VAT255. Als u nog steeds onzeker bent, neem dan contact op met ${SUPPORT_EMAIL}.`,
  fr: `Le montant de la demande est indiqué sur le VAT255. Si vous avez encore des doutes, veuillez contacter ${SUPPORT_EMAIL}.`,
  de: `Der Anspruchsbetrag ist auf dem VAT255 angegeben. Wenn Sie weiterhin unsicher sind, kontaktieren Sie bitte ${SUPPORT_EMAIL}.`,
  it: `L'importo della richiesta è indicato sul VAT255. Se non sei ancora sicuro, contatta ${SUPPORT_EMAIL}.`,
  pt: `O valor da reclamação está refletido no VAT255. Se ainda tiver dúvidas, contacte ${SUPPORT_EMAIL}.`,
  ru: `Сумма заявки указана в VAT255. Если вы все еще не уверены, свяжитесь с ${SUPPORT_EMAIL}.`,
  es: `El monto de la reclamación aparece en el VAT255. Si aún no está seguro, comuníquese con ${SUPPORT_EMAIL}.`,
};

const extraFaqAnswerOverrides = {
  en: {
    "4": `Unfortunately, we are unable to provide a specific timeframe for when payment will be made following approval of a claim.

Please note that SARS processes and finalizes payments in batches of approximately 150 claims. Once a claim has been approved, payment cannot be made until all claims within the relevant batch have been finalized and SARS has released the funds to VRA.

Should you wish to enquire whether payment for your batch has been received, please contact us at ${SUPPORT_EMAIL} or ${FINANCE_EMAIL}, and we will gladly provide you with an update.`,
    "7": `Please visit the online portal and enter your VRA reference number to view the rejection reason for your claim.
Check Refund Progress - Vatrefundagency
${STATUS_LINK}

If you are still unsure about the rejection reason, please contact ${SUPPORT_EMAIL} and provide your VRA reference number so that we can explain the rejection.`,
    "10": `${BANKING_LINK}

If you are having difficulty logging in or uploading documents, please try the following:
1. Clear your browser cache and cookies or try using a different browser.
2. Ensure that your login credentials are entered correctly.
3. If you have already reset your password and it still is not working, please try resetting it again or use the "Forgot Password" option on the portal.`,
    "12": "After funds are received from SARS, VRA has 30 working days to make payment to the claimant.",
    "16": `The request for updated bank details must first be accepted or rejected. As soon as the request has been accepted or rejected, you will receive confirmation.

You will receive confirmation from ${SUPPORT_EMAIL}.`,
  },
  ar: {
    "4": `للأسف، لا يمكننا تقديم إطار زمني محدد لموعد الدفع بعد الموافقة على المطالبة.

يرجى ملاحظة أن SARS تعالج وتُنهي المدفوعات على دفعات تضم حوالي 150 مطالبة. بعد الموافقة على المطالبة، لا يمكن إجراء الدفع حتى يتم الانتهاء من جميع المطالبات ضمن الدفعة المعنية وتقوم SARS بتحويل الأموال إلى VRA.

إذا كنت ترغب في الاستفسار عما إذا تم استلام دفعة مجموعتك، يرجى التواصل معنا على ${SUPPORT_EMAIL} أو ${FINANCE_EMAIL} وسنقدم لك تحديثًا بكل سرور.`,
    "7": `يرجى زيارة البوابة الإلكترونية وإدخال رقم مرجع VRA الخاص بك لعرض سبب رفض مطالبتك.
Check Refund Progress - Vatrefundagency
${STATUS_LINK}

إذا كنت لا تزال غير متأكد من سبب الرفض، يرجى التواصل مع ${SUPPORT_EMAIL} وتزويدنا برقم مرجع VRA الخاص بك حتى نتمكن من شرح الرفض.`,
    "10": `${BANKING_LINK}

إذا كنت تواجه صعوبة في تسجيل الدخول أو تحميل المستندات، يرجى تجربة ما يلي:
1. امسح ذاكرة التخزين المؤقت وملفات تعريف الارتباط في المتصفح أو استخدم متصفحًا مختلفًا.
2. تأكد من إدخال بيانات تسجيل الدخول بشكل صحيح.
3. إذا كنت قد أعدت تعيين كلمة المرور وما زالت لا تعمل، يرجى إعادة تعيينها مرة أخرى أو استخدام خيار "نسيت كلمة المرور" في البوابة.`,
    "12": "بعد استلام الأموال من SARS، لدى VRA مدة 30 يوم عمل للدفع إلى صاحب المطالبة.",
    "16": `يجب أولاً قبول أو رفض طلب تحديث التفاصيل البنكية. بمجرد قبول الطلب أو رفضه، ستتلقى تأكيدًا.

ستتلقى التأكيد من ${SUPPORT_EMAIL}.`,
  },
  zh: {
    "4": `很遗憾，我们无法提供索赔获批后付款的具体时间。

请注意，SARS 会按每批约 150 个索赔处理并最终确定付款。索赔获批后，必须等相关批次内所有索赔均完成并且 SARS 将资金释放给 VRA 后，才能付款。

如果您想查询您所在批次的付款是否已收到，请通过 ${SUPPORT_EMAIL} 或 ${FINANCE_EMAIL} 联系我们，我们将很乐意为您提供更新。`,
    "7": `请访问在线门户并输入您的 VRA 参考编号，以查看索赔被拒绝的原因。
Check Refund Progress - Vatrefundagency
${STATUS_LINK}

如果您仍不确定拒绝原因，请联系 ${SUPPORT_EMAIL} 并提供您的 VRA 参考编号，以便我们解释拒绝原因。`,
    "10": `${BANKING_LINK}

如果您登录或上传文件遇到困难，请尝试以下操作：
1. 清除浏览器缓存和 Cookie，或尝试使用其他浏览器。
2. 确保您的登录凭据输入正确。
3. 如果您已经重置密码但仍无法使用，请再次重置，或使用门户上的“忘记密码”选项。`,
    "12": "从 SARS 收到资金后，VRA 有 30 个工作日向索赔人付款。",
    "16": `更新银行资料的请求必须先被接受或拒绝。一旦请求被接受或拒绝，您将收到确认。

您将收到来自 ${SUPPORT_EMAIL} 的确认。`,
  },
  nl: {
    "4": `Helaas kunnen wij geen specifieke termijn geven voor wanneer betaling wordt gedaan na goedkeuring van een claim.

SARS verwerkt en finaliseert betalingen in batches van ongeveer 150 claims. Zodra een claim is goedgekeurd, kan betaling pas plaatsvinden wanneer alle claims binnen de relevante batch zijn afgerond en SARS de fondsen aan VRA heeft vrijgegeven.

Als u wilt navragen of betaling voor uw batch is ontvangen, neem dan contact met ons op via ${SUPPORT_EMAIL} of ${FINANCE_EMAIL}; wij geven u graag een update.`,
    "7": `Bezoek het online portaal en voer uw VRA-referentienummer in om de reden van afwijzing van uw claim te bekijken.
Check Refund Progress - Vatrefundagency
${STATUS_LINK}

Als u nog steeds niet zeker bent van de reden van afwijzing, neem dan contact op met ${SUPPORT_EMAIL} en vermeld uw VRA-referentienummer zodat wij de afwijzing kunnen toelichten.`,
    "10": `${BANKING_LINK}

Als u problemen heeft met inloggen of documenten uploaden, probeer dan het volgende:
1. Wis de cache en cookies van uw browser of gebruik een andere browser.
2. Controleer of uw inloggegevens correct zijn ingevoerd.
3. Als u uw wachtwoord al opnieuw heeft ingesteld en het nog steeds niet werkt, probeer het dan opnieuw in te stellen of gebruik de optie "Wachtwoord vergeten" op het portaal.`,
    "12": "Nadat fondsen van SARS zijn ontvangen, heeft VRA 30 werkdagen om betaling aan de claimant te doen.",
    "16": `Het verzoek om bijgewerkte bankgegevens moet eerst worden geaccepteerd of afgewezen. Zodra het verzoek is geaccepteerd of afgewezen, ontvangt u een bevestiging.

U ontvangt bevestiging van ${SUPPORT_EMAIL}.`,
  },
  fr: {
    "4": `Malheureusement, nous ne pouvons pas fournir de délai précis pour le paiement après l'approbation d'une demande.

Veuillez noter que SARS traite et finalise les paiements par lots d'environ 150 demandes. Une fois qu'une demande est approuvée, le paiement ne peut pas être effectué tant que toutes les demandes du lot concerné n'ont pas été finalisées et que SARS n'a pas libéré les fonds à VRA.

Si vous souhaitez savoir si le paiement de votre lot a été reçu, veuillez nous contacter à ${SUPPORT_EMAIL} ou ${FINANCE_EMAIL}, et nous vous fournirons volontiers une mise à jour.`,
    "7": `Veuillez visiter le portail en ligne et saisir votre numéro de référence VRA pour consulter le motif du rejet de votre demande.
Check Refund Progress - Vatrefundagency
${STATUS_LINK}

Si vous avez encore des doutes sur le motif du rejet, veuillez contacter ${SUPPORT_EMAIL} et fournir votre numéro de référence VRA afin que nous puissions expliquer le rejet.`,
    "10": `${BANKING_LINK}

Si vous avez des difficultés à vous connecter ou à téléverser des documents, veuillez essayer ce qui suit :
1. Effacez le cache et les cookies de votre navigateur ou utilisez un autre navigateur.
2. Assurez-vous que vos identifiants de connexion sont saisis correctement.
3. Si vous avez déjà réinitialisé votre mot de passe et que cela ne fonctionne toujours pas, essayez de le réinitialiser à nouveau ou utilisez l'option "Mot de passe oublié" sur le portail.`,
    "12": "Après réception des fonds de SARS, VRA dispose de 30 jours ouvrables pour effectuer le paiement au demandeur.",
    "16": `La demande de mise à jour des coordonnées bancaires doit d'abord être acceptée ou rejetée. Dès que la demande aura été acceptée ou rejetée, vous recevrez une confirmation.

Vous recevrez une confirmation de ${SUPPORT_EMAIL}.`,
  },
  de: {
    "4": `Leider können wir keinen bestimmten Zeitrahmen angeben, wann die Zahlung nach Genehmigung eines Anspruchs erfolgt.

Bitte beachten Sie, dass SARS Zahlungen in Chargen von etwa 150 Ansprüchen verarbeitet und abschließt. Sobald ein Anspruch genehmigt wurde, kann keine Zahlung erfolgen, bis alle Ansprüche der betreffenden Charge abgeschlossen sind und SARS die Gelder an VRA freigegeben hat.

Wenn Sie erfahren möchten, ob die Zahlung für Ihre Charge eingegangen ist, kontaktieren Sie uns bitte unter ${SUPPORT_EMAIL} oder ${FINANCE_EMAIL}; wir geben Ihnen gerne ein Update.`,
    "7": `Bitte besuchen Sie das Online-Portal und geben Sie Ihre VRA-Referenznummer ein, um den Ablehnungsgrund für Ihren Anspruch einzusehen.
Check Refund Progress - Vatrefundagency
${STATUS_LINK}

Wenn Sie den Ablehnungsgrund weiterhin nicht verstehen, kontaktieren Sie bitte ${SUPPORT_EMAIL} und geben Sie Ihre VRA-Referenznummer an, damit wir die Ablehnung erklären können.`,
    "10": `${BANKING_LINK}

Wenn Sie Schwierigkeiten beim Einloggen oder Hochladen von Dokumenten haben, versuchen Sie bitte Folgendes:
1. Leeren Sie den Cache und die Cookies Ihres Browsers oder verwenden Sie einen anderen Browser.
2. Stellen Sie sicher, dass Ihre Zugangsdaten korrekt eingegeben wurden.
3. Wenn Sie Ihr Passwort bereits zurückgesetzt haben und es immer noch nicht funktioniert, setzen Sie es bitte erneut zurück oder verwenden Sie die Option "Passwort vergessen" im Portal.`,
    "12": "Nach Eingang der Gelder von SARS hat VRA 30 Arbeitstage Zeit, die Zahlung an den Antragsteller zu leisten.",
    "16": `Der Antrag auf aktualisierte Bankdaten muss zuerst akzeptiert oder abgelehnt werden. Sobald der Antrag akzeptiert oder abgelehnt wurde, erhalten Sie eine Bestätigung.

Sie erhalten eine Bestätigung von ${SUPPORT_EMAIL}.`,
  },
  it: {
    "4": `Purtroppo non siamo in grado di fornire una tempistica specifica per il pagamento dopo l'approvazione di una richiesta.

SARS elabora e finalizza i pagamenti in lotti di circa 150 richieste. Una volta approvata una richiesta, il pagamento non può essere effettuato finché tutte le richieste del lotto pertinente non sono state finalizzate e SARS non ha rilasciato i fondi a VRA.

Se desideri sapere se il pagamento del tuo lotto è stato ricevuto, contattaci a ${SUPPORT_EMAIL} o ${FINANCE_EMAIL} e ti forniremo volentieri un aggiornamento.`,
    "7": `Visita il portale online e inserisci il tuo numero di riferimento VRA per visualizzare il motivo del rifiuto della tua richiesta.
Check Refund Progress - Vatrefundagency
${STATUS_LINK}

Se non sei ancora sicuro del motivo del rifiuto, contatta ${SUPPORT_EMAIL} e fornisci il tuo numero di riferimento VRA in modo che possiamo spiegare il rifiuto.`,
    "10": `${BANKING_LINK}

Se hai difficoltà ad accedere o caricare documenti, prova quanto segue:
1. Cancella la cache e i cookie del browser o prova a utilizzare un browser diverso.
2. Assicurati che le credenziali di accesso siano inserite correttamente.
3. Se hai già reimpostato la password e continua a non funzionare, prova a reimpostarla nuovamente o usa l'opzione "Password dimenticata" sul portale.`,
    "12": "Dopo che i fondi sono stati ricevuti da SARS, VRA ha 30 giorni lavorativi per effettuare il pagamento al richiedente.",
    "16": `La richiesta di aggiornamento dei dati bancari deve prima essere accettata o respinta. Non appena la richiesta sarà accettata o respinta, riceverai una conferma.

Riceverai conferma da ${SUPPORT_EMAIL}.`,
  },
  pt: {
    "4": `Infelizmente, não conseguimos fornecer um prazo específico para quando o pagamento será efetuado após a aprovação de uma reclamação.

Tenha em atenção que a SARS processa e finaliza pagamentos em lotes de aproximadamente 150 reclamações. Depois de uma reclamação ser aprovada, o pagamento não pode ser efetuado até que todas as reclamações do lote relevante sejam finalizadas e a SARS liberte os fundos para a VRA.

Se desejar saber se o pagamento do seu lote foi recebido, contacte-nos em ${SUPPORT_EMAIL} ou ${FINANCE_EMAIL}, e teremos todo o gosto em fornecer uma atualização.`,
    "7": `Visite o portal online e introduza o seu número de referência VRA para ver o motivo da rejeição da sua reclamação.
Check Refund Progress - Vatrefundagency
${STATUS_LINK}

Se ainda tiver dúvidas sobre o motivo da rejeição, contacte ${SUPPORT_EMAIL} e forneça o seu número de referência VRA para que possamos explicar a rejeição.`,
    "10": `${BANKING_LINK}

Se tiver dificuldades em iniciar sessão ou carregar documentos, tente o seguinte:
1. Limpe a cache e os cookies do navegador ou tente usar outro navegador.
2. Certifique-se de que as suas credenciais de acesso foram introduzidas corretamente.
3. Se já redefiniu a palavra-passe e ainda não funciona, tente redefini-la novamente ou use a opção "Esqueci a palavra-passe" no portal.`,
    "12": "Depois de os fundos serem recebidos da SARS, a VRA tem 30 dias úteis para efetuar o pagamento ao requerente.",
    "16": `O pedido de atualização dos dados bancários deve primeiro ser aceite ou rejeitado. Assim que o pedido for aceite ou rejeitado, receberá confirmação.

Receberá confirmação de ${SUPPORT_EMAIL}.`,
  },
  ru: {
    "4": `К сожалению, мы не можем предоставить конкретный срок, когда будет произведена выплата после одобрения заявки.

Обратите внимание, что SARS обрабатывает и завершает платежи партиями примерно по 150 заявок. После одобрения заявки выплата не может быть произведена, пока все заявки в соответствующей партии не будут завершены и SARS не перечислит средства VRA.

Если вы хотите узнать, получена ли оплата по вашей партии, свяжитесь с нами по ${SUPPORT_EMAIL} или ${FINANCE_EMAIL}, и мы с радостью предоставим обновление.`,
    "7": `Пожалуйста, посетите онлайн-портал и введите ваш справочный номер VRA, чтобы посмотреть причину отклонения вашей заявки.
Check Refund Progress - Vatrefundagency
${STATUS_LINK}

Если вы все еще не уверены в причине отклонения, свяжитесь с ${SUPPORT_EMAIL} и укажите ваш справочный номер VRA, чтобы мы могли объяснить отклонение.`,
    "10": `${BANKING_LINK}

Если у вас возникли трудности со входом или загрузкой документов, попробуйте следующее:
1. Очистите кэш и cookies браузера или попробуйте другой браузер.
2. Убедитесь, что ваши учетные данные введены правильно.
3. Если вы уже сбросили пароль, но он все еще не работает, попробуйте сбросить его снова или используйте опцию "Забыли пароль" на портале.`,
    "12": "После получения средств от SARS у VRA есть 30 рабочих дней для выплаты заявителю.",
    "16": `Запрос на обновление банковских данных должен сначала быть принят или отклонен. Как только запрос будет принят или отклонен, вы получите подтверждение.

Вы получите подтверждение от ${SUPPORT_EMAIL}.`,
  },
  es: {
    "4": `Lamentablemente, no podemos proporcionar un plazo específico para cuándo se realizará el pago tras la aprobación de una reclamación.

Tenga en cuenta que SARS procesa y finaliza pagos en lotes de aproximadamente 150 reclamaciones. Una vez aprobada una reclamación, el pago no puede realizarse hasta que todas las reclamaciones del lote correspondiente hayan sido finalizadas y SARS haya liberado los fondos a VRA.

Si desea consultar si se ha recibido el pago de su lote, comuníquese con nosotros en ${SUPPORT_EMAIL} o ${FINANCE_EMAIL}, y con gusto le proporcionaremos una actualización.`,
    "7": `Visite el portal en línea e introduzca su número de referencia VRA para ver el motivo del rechazo de su reclamación.
Check Refund Progress - Vatrefundagency
${STATUS_LINK}

Si aún no está seguro sobre el motivo del rechazo, comuníquese con ${SUPPORT_EMAIL} y proporcione su número de referencia VRA para que podamos explicar el rechazo.`,
    "10": `${BANKING_LINK}

Si tiene dificultades para iniciar sesión o cargar documentos, intente lo siguiente:
1. Borre la caché y las cookies de su navegador o intente usar un navegador diferente.
2. Asegúrese de introducir correctamente sus credenciales de inicio de sesión.
3. Si ya restableció su contraseña y todavía no funciona, intente restablecerla nuevamente o use la opción "Olvidé mi contraseña" en el portal.`,
    "12": "Después de recibir los fondos de SARS, VRA tiene 30 días hábiles para realizar el pago al reclamante.",
    "16": `La solicitud de actualización de datos bancarios primero debe ser aceptada o rechazada. Tan pronto como la solicitud haya sido aceptada o rechazada, recibirá confirmación.

Recibirá confirmación de ${SUPPORT_EMAIL}.`,
  },
};

const faqPatterns = [
  {
    id: "vatPayment",
    phrases: [
      "when am i receiving the vat payment",
      "when will i receive my vat payment",
      "when will i receive my vat refund",
      "متى سأستلم دفعة ضريبة القيمة المضافة",
      "我什么时候收到增值税退款",
      "wanneer ontvang ik de btw betaling",
      "quand vais je recevoir le paiement de la tva",
      "quand vais-je recevoir le paiement de la tva",
      "wann erhalte ich die mehrwertsteuerzahlung",
      "quando ricevero il pagamento iva",
      "quando riceverò il pagamento iva",
      "quando vou receber o pagamento do iva",
      "когда я получу выплату ндс",
      "cuando recibire el pago del iva",
      "cuándo recibiré el pago del iva",
    ],
  },
  {
    id: "vatAmount",
    phrases: [
      "what is my vat amount",
      "ما هو مبلغ ضريبة القيمة المضافة",
      "我的增值税金额是多少",
      "wat is mijn btw bedrag",
      "quel est mon montant de tva",
      "wie hoch ist mein mehrwertsteuerbetrag",
      "qual e il mio importo iva",
      "qual è il mio importo iva",
      "qual e o meu valor de iva",
      "qual é o meu valor de iva",
      "какова моя сумма ндс",
      "cual es mi monto de iva",
      "cuál es mi monto de iva",
    ],
  },
  {
    id: "claimProcess",
    phrases: [
      "how can i proceed to get a refund",
      "what is the process",
      "كيف يمكنني المتابعة للحصول على استرداد",
      "我如何继续获得退款",
      "流程是什么",
      "hoe kan ik verdergaan om een terugbetaling te krijgen",
      "comment puis je proceder pour obtenir un remboursement",
      "comment puis-je proceder pour obtenir un remboursement",
      "quel est le processus",
      "wie kann ich fortfahren um eine ruckerstattung zu erhalten",
      "wie ist der prozess",
      "come posso procedere per ottenere un rimborso",
      "qual e il processo",
      "qual è il processo",
      "como posso proceder para obter um reembolso",
      "qual e o processo",
      "qual é o processo",
      "как мне продолжить чтобы получить возврат",
      "каков процесс",
      "como puedo proceder para obtener un reembolso",
      "cual es el proceso",
      "cuál es el proceso",
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

function t(languageCode) {
  return translations[languageCode] || translations.en;
}

function getExtraFaqItems(languageCode) {
  return extraFaqTranslations[languageCode] || extraFaqTranslations.en;
}

function getFaqMenuCopy(languageCode) {
  return faqMenuTranslations[languageCode] || faqMenuTranslations.en;
}

function getFaqEmailNote(languageCode) {
  return faqEmailNoteTranslations[languageCode] || faqEmailNoteTranslations.en;
}

function getVatAmountAnswer(languageCode) {
  return `${vatAmountIntroTranslations[languageCode] || vatAmountIntroTranslations.en}

${t(languageCode).vatAmountAnswer}`;
}

function getExtraFaqAnswer(languageCode, itemNumber, defaultAnswer) {
  const overrides = extraFaqAnswerOverrides[languageCode] || extraFaqAnswerOverrides.en;

  return overrides[String(itemNumber)] || defaultAnswer;
}

function isGreeting(input) {
  return ["hi", "hello", "start", "/start", "menu"].includes(normalizeText(input));
}

function isDoneRequest(input) {
  return ["d", "done", "complete", "finished"].includes(normalizeText(input));
}

function isChangeLanguageRequest(input) {
  return ["0", "change language"].includes(normalizeText(input));
}

function isBackToMain(input) {
  const value = normalizeText(input);

  return [
    "b",
    "back",
    "main menu",
    "back to main menu",
    "العودة الى القائمة الرئيسية",
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
    "الاسئلة الشائعة",
    "الأسئلة الشائعة",
    "常见问题",
    "veelgestelde vragen",
    "questions frequemment posees",
    "haufig gestellte fragen",
    "häufig gestellte fragen",
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

function navigationText(languageCode) {
  const copy = t(languageCode);

  return `${copy.backInstruction}
${copy.doneInstruction}
${copy.changeInstruction}`;
}

function mainMenu(languageCode) {
  const copy = t(languageCode);

  return `${copy.mainTitle}

${copy.supportHours}

1 ${copy.statusOption}
2 ${copy.bankingOption}
3 ${copy.newClaimOption}
4 ${copy.faqOption}
5 ${copy.agentOption}
6 ${copy.feedbackOption}
7 ${copy.changeLanguageOption}

${navigationText(languageCode)}`;
}

function faqMenu(languageCode) {
  const copy = t(languageCode);
  const menuItems = getFaqMenuCopy(languageCode).items;

  const numberedItems = menuItems
    .map((item, index) => `${index + 1} ${item}`)
    .join("\n");

  return `${copy.faqTitle}

${numberedItems}

${getFaqEmailNote(languageCode)}

${navigationText(languageCode)}`;
}

function statusMessage(languageCode) {
  return `${t(languageCode).statusReply}

${STATUS_LINK}

${navigationText(languageCode)}`;
}

function bankingMessage(languageCode) {
  const copy = t(languageCode);

  return `${copy.bankingReply}

${BANKING_LINK}

${copy.financeNotice}

${navigationText(languageCode)}`;
}

function newClaimMessage(languageCode) {
  return `${t(languageCode).newClaimReply}

${navigationText(languageCode)}`;
}

function agentMessage(languageCode) {
  return `${t(languageCode).agentReply}

${navigationText(languageCode)}`;
}

function feedbackPromptMessage(languageCode) {
  const copy = t(languageCode);

  return `${copy.feedbackIntro}

${copy.feedbackPrompt}

${navigationText(languageCode)}`;
}

function feedbackReceivedMessage(languageCode) {
  return `${t(languageCode).feedbackReceived}

${navigationText(languageCode)}`;
}

function reviewPromptMessage(languageCode) {
  const copy = t(languageCode);

  return `${copy.reviewTitle}

${copy.reviewIntro}

${copy.reviewPrompt}

1 ${copy.ratingLabels["1"]}
2 ${copy.ratingLabels["2"]}
3 ${copy.ratingLabels["3"]}
4 ${copy.ratingLabels["4"]}
5 ${copy.ratingLabels["5"]}`;
}

function reviewReceivedMessage(languageCode) {
  return t(languageCode).reviewReceived;
}

function invalidInputMessage(languageCode) {
  return `${t(languageCode).invalidInput}

${navigationText(languageCode)}`;
}

function matchFaq(input) {
  const value = normalizeText(input);

  if (value === "1") return "vatPayment";
  if (value === "2") return "vatAmount";
  if (value === "3") return "claimProcess";
  if (value === "17") return "unanswered";
  if (/^(4|5|6|7|8|9|10|11|12|13|14|15|16)$/.test(value)) {
    return `extra${value}`;
  }

  const match = faqPatterns.find((item) =>
    item.phrases.some((phrase) => value.includes(normalizeText(phrase)))
  );

  return match?.id || null;
}

function faqAnswer(input, languageCode) {
  const copy = t(languageCode);
  const faqId = matchFaq(input);

  if (faqId === "vatPayment") {
    return `${copy.vatPaymentAnswer}

${navigationText(languageCode)}`;
  }

  if (faqId === "vatAmount") {
    return `${getVatAmountAnswer(languageCode)}

${navigationText(languageCode)}`;
  }

  if (faqId === "claimProcess") {
    return `${copy.claimProcessAnswer}

${navigationText(languageCode)}`;
  }

  if (faqId === "unanswered") {
    return `${getFaqMenuCopy(languageCode).unansweredAnswer}

${navigationText(languageCode)}`;
  }

  if (faqId?.startsWith("extra")) {
    const itemNumber = Number(faqId.replace("extra", ""));
    const extraItem = getExtraFaqItems(languageCode)[itemNumber - 4];

    if (extraItem) {
      return `${getExtraFaqAnswer(languageCode, itemNumber, extraItem.answer)}

${navigationText(languageCode)}`;
    }
  }

  return null;
}

function noFaqAnswerMessage(languageCode) {
  return `${t(languageCode).noFaqAnswer}

${navigationText(languageCode)}`;
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

function formatWhatsAppRecipient(number) {
  if (!number) {
    return "";
  }

  let formatted = String(number).trim().replace(/\s+/g, "");

  if (formatted.startsWith("+")) {
    formatted = formatted.slice(1);
  }

  formatted = formatted.replace(/\D/g, "");

  if (formatted.startsWith("0")) {
    formatted = `27${formatted.slice(1)}`;
  }

  return formatted;
}

function logFeedback(platform, userId, session, feedbackText) {
  console.log({
    platform,
    userId,
    selectedLanguage: session.languageName || session.languageCode || "Unknown",
    feedbackMessage: feedbackText,
    timestamp: new Date().toISOString(),
  });
}

function logReview(platform, userId, session, ratingNumber, ratingLabel) {
  console.log({
    platform,
    userId,
    selectedLanguage: session.languageName || session.languageCode || "Unknown",
    ratingNumber,
    ratingLabel,
    timestamp: new Date().toISOString(),
  });
}

function formatDateTimeForEmail(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const value = (type) => parts.find((part) => part.type === type)?.value || "00";

  return `${value("year")}-${value("month")}-${value("day")} ${value("hour")}:${value("minute")}:${value("second")}`;
}

async function sendSmtpMail({ to, subject, body }) {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error("Missing SMTP_HOST, SMTP_PORT, SMTP_USER, or SMTP_PASS");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    requireTLS: true,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: SMTP_USER,
    to,
    subject,
    text: body,
  });
}

function buildClientMessageAlert({ platform, clientId, clientMessage, botResponse }) {
  return `Platform: ${platform}
Client Number / Telegram Username: ${clientId}
Date & Time: ${formatDateTimeForEmail()}

Client Message:
${clientMessage}

Bot Response:
${botResponse || "(No bot response sent)"}`;
}

async function sendClientMessageAlert(details) {
  const subject = `[${details.platform}] New Client Message`;
  const body = buildClientMessageAlert(details);

  try {
    console.log("SMTP alert sending started");
    await sendSmtpMail({
      to: ALERT_TO,
      subject,
      body,
    });
    console.log("SMTP alert sent successfully");
  } catch (error) {
    console.error("SMTP alert failed with full error:", error);
  }
}

async function sendWhatsAppMessage(to, body) {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    console.error("Missing WHATSAPP_TOKEN or PHONE_NUMBER_ID");
    return;
  }

  const recipient = formatWhatsAppRecipient(to);

  if (!recipient) {
    console.error("Missing WhatsApp recipient");
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
        to: recipient,
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

async function startReview(session, sendReply) {
  session.state = STATES.REVIEW;
  await sendReply(reviewPromptMessage(session.languageCode));
}

async function handleSupportInput(input, session, sendReply, platform, userId) {
  const normalizedInput = normalizeText(input);

  if (isChangeLanguageRequest(input)) {
    await showLanguageMenu(session, sendReply);
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

  if (isBackToMain(input)) {
    session.state = STATES.MAIN;
    await sendReply(mainMenu(languageCode));
    return;
  }

  if (isDoneRequest(input) && session.state !== STATES.COMPLETE) {
    await startReview(session, sendReply);
    return;
  }

  if (session.state === STATES.REVIEW) {
    const copy = t(languageCode);

    if (["1", "2", "3", "4", "5"].includes(normalizedInput)) {
      logReview(platform, userId, session, normalizedInput, copy.ratingLabels[normalizedInput]);
      session.state = STATES.COMPLETE;
      await sendReply(reviewReceivedMessage(languageCode));
      return;
    }

    await sendReply(copy.invalidRating);
    return;
  }

  if (session.state === STATES.COMPLETE) {
    return;
  }

  if (session.state === STATES.FEEDBACK) {
    logFeedback(platform, userId, session, input);
    session.state = STATES.MAIN;
    await sendReply(feedbackReceivedMessage(languageCode));
    return;
  }

  if (session.state === STATES.FAQ) {
    if (normalizedInput === "18") {
      session.state = STATES.MAIN;
      await sendReply(mainMenu(languageCode));
      return;
    }

    const answer = faqAnswer(input, languageCode);

    if (answer) {
      await sendReply(answer);
      return;
    }

    await sendReply(noFaqAnswerMessage(languageCode));
    return;
  }

  if (isFaqRequest(input)) {
    session.state = STATES.FAQ;
    await sendReply(faqMenu(languageCode));
    return;
  }

  if (normalizedInput === "1") {
    session.state = STATES.MAIN;
    await sendReply(statusMessage(languageCode));
    return;
  }

  if (normalizedInput === "2") {
    session.state = STATES.MAIN;
    await sendReply(bankingMessage(languageCode));
    return;
  }

  if (normalizedInput === "3") {
    session.state = STATES.MAIN;
    await sendReply(newClaimMessage(languageCode));
    return;
  }

  if (normalizedInput === "5") {
    session.state = STATES.MAIN;
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

  const directFaqAnswer = /^\d+$/.test(normalizedInput)
    ? null
    : faqAnswer(input, languageCode);

  if (directFaqAnswer) {
    await sendReply(directFaqAnswer);
    return;
  }

  await sendReply(invalidInputMessage(languageCode));
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
    const value = req.body.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    if (!message || message.type !== "text") {
      return;
    }

    const rawFrom = value?.contacts?.[0]?.wa_id || message.from;
    const from = formatWhatsAppRecipient(rawFrom);
    const input = message.text?.body?.trim();

    if (!from || !input) {
      return;
    }

    const session = getWhatsAppSession(from);
    const botResponses = [];

    try {
      await handleSupportInput(
        input,
        session,
        async (reply) => {
          botResponses.push(reply);
          await sendWhatsAppMessage(from, reply);
        },
        "WhatsApp",
        from
      );
    } finally {
      await sendClientMessageAlert({
        platform: "WhatsApp",
        clientId: `+${from}`,
        clientMessage: input,
        botResponse: botResponses.join("\n\n---\n\n"),
      });
    }
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
    const telegramUser =
      message.from?.username
        ? `@${message.from.username}`
        : [message.from?.first_name, message.from?.last_name].filter(Boolean).join(" ") ||
          String(chatId);
    const botResponses = [];

    try {
      await handleSupportInput(
        input,
        session,
        async (reply) => {
          botResponses.push(reply);
          await sendTelegramMessage(chatId, reply);
        },
        "Telegram",
        chatId
      );
    } finally {
      await sendClientMessageAlert({
        platform: "Telegram",
        clientId: telegramUser,
        clientMessage: input,
        botResponse: botResponses.join("\n\n---\n\n"),
      });
    }
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
