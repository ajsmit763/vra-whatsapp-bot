// Country requirements supplied by the project owner. Form identifiers and
// monetary thresholds are deliberately retained in every translation.
const copy = {
  en: {
    countries: ['Eswatini', 'Lesotho', 'Botswana', 'Namibia', 'Mozambique'],
    checklist: 'VAT Refund Document Checklist',
    core: `Mandatory at EVERY route
* EXIT STAMP: clear photo showing the date you left South Africa
* ENTRY STAMP: clear photo showing the date you entered South Africa
* SIGNED FORM: issued VAT255, or signed postal application for postal claims
* PASSPORT: clear photo showing name, passport number and country of residence
* PAYMENT: printed slip, bank statement or cash receipt for invoices above R10,000
* CUSTOMS: release documents (TRD1 / SAD500 / CND2) and photo of Customs stamp on invoices
Printed payment proof only. Phone-screen confirmations are not accepted.`,
    additional: 'These route and claim-type documents are additional to the mandatory core. Printed payment proof only; phone-screen confirmations are not accepted.',
    eswatini: `Eswatini additions
* Valid SA tax invoices endorsed by the Eswatini Revenue Authority
* DA.185.D if a clearing agent appears as exporter on SAD500
* INDIVIDUALS: SRA Refund Forms for non-commercial exports
Submit these IN ADDITION to all mandatory core documents.

Commercial export checklist
* SRA Refund Envelope for commercial exports
* For invoices above R5,000 including VAT: SARS authorised release, including SAD500
* Voucher of Correction if the SAD500 needs amendment
* Asycuda declaration from the Eswatini Revenue Authority
Also submit the mandatory core and route additions.

Vehicle document checklist
* NEW VEHICLES: SARS authorised release
* SRA VAT Refund Envelope or Form
* Proof of registration in Eswatini
* Owner’s passport; SA passport holders also need the SRA vehicle certificate
* Manufacturer’s certificate, if applicable
* SECOND-HAND VEHICLES: SRA Envelope or Form and Eswatini registration
Also submit the mandatory core and route additions.`,
    lesotho: `Lesotho additions
* Completed LRA Refund Form
* Valid SA tax invoices endorsed by LRA Customs
* DA.185.D if a clearing agent appears as exporter on SAD500
Submit these IN ADDITION to all mandatory core documents.

Company document checklist
* LRA Refund Envelope
* Trading licence, LRA Tax Certificate or other SARS-accepted proof
* First page of SARS declaration showing LRN and MRN, including SAD500
* Voucher of Correction if amendments are needed
* LRA Customs-endorsed import documentation
* For air exports: air waybill with shipped-on-board endorsement
Also submit the mandatory core and route additions.

Vehicle & registrable goods
* LRA Refund Envelope or copy of LRA VAT 11
* Valid SA tax invoice and claimant’s passport copy
* SA passport holders also need LRA VAT 11
* Manufacturer’s certificate
* Inspection documents, including SAD500 and any correction
* Companies: trading licence or LRA Tax Certificate
* SECOND-HAND VEHICLES: SARPCO clearance and SA registration certificate copies
Also submit the mandatory core and route additions.`,
    general: 'Start with the mandatory core documents above. Border or airport requirements and any company, delivery or vehicle records are additional. Read the full carousel for your claim type. Printed payment proof is required for each invoice above R10,000. Check the complete requirements before travel.',
    learn: 'Learn more',
  },
  ar: {
    countries: ['إسواتيني', 'ليسوتو', 'بوتسوانا', 'ناميبيا', 'موزمبيق'], checklist: 'قائمة مستندات استرداد ضريبة القيمة المضافة',
    core: `إلزامي في جميع المسارات
* ختم الخروج: صورة واضحة تُظهر تاريخ مغادرتك جنوب أفريقيا
* ختم الدخول: صورة واضحة تُظهر تاريخ دخولك جنوب أفريقيا
* النموذج الموقّع: نموذج VAT255 الصادر، أو طلب بريدي موقّع للمطالبات البريدية
* جواز السفر: صورة واضحة للاسم ورقم الجواز وبلد الإقامة
* الدفع: إيصال مطبوع أو كشف حساب بنكي أو إيصال نقدي للفواتير التي تتجاوز R10,000
* الجمارك: مستندات الإفراج (TRD1 / SAD500 / CND2) وصورة ختم الجمارك على الفواتير
إثبات الدفع مطبوع فقط. لا تُقبل التأكيدات على شاشة الهاتف.`,
    additional: 'مستندات المسار ونوع المطالبة إضافية إلى المستندات الأساسية الإلزامية. إثبات الدفع مطبوع فقط؛ لا تُقبل التأكيدات على شاشة الهاتف.',
    eswatini: `إضافات إسواتيني
* فواتير ضريبية جنوب أفريقية صالحة معتمدة من هيئة الإيرادات في إسواتيني
* DA.185.D إذا ظهر وكيل التخليص كمصدّر في SAD500
* الأفراد: نماذج استرداد SRA للصادرات غير التجارية
قدّمها بالإضافة إلى جميع المستندات الأساسية الإلزامية.

الصادرات التجارية
* ظرف استرداد SRA للصادرات التجارية
* للفواتير التي تتجاوز R5,000 شاملة الضريبة: إفراج معتمد من SARS، بما فيه SAD500
* قسيمة تصحيح إذا لزم تعديل SAD500
* إقرار Asycuda من هيئة الإيرادات في إسواتيني
قدّم أيضًا المستندات الأساسية وإضافات المسار.

مستندات المركبات
* المركبات الجديدة: إفراج معتمد من SARS
* ظرف أو نموذج استرداد ضريبة القيمة المضافة SRA
* إثبات التسجيل في إسواتيني
* جواز سفر المالك؛ حاملو جواز جنوب أفريقيا يحتاجون أيضًا إلى شهادة المركبة من SRA
* شهادة الشركة المصنّعة، إن انطبقت
* المركبات المستعملة: ظرف أو نموذج SRA والتسجيل في إسواتيني
قدّم أيضًا المستندات الأساسية وإضافات المسار.`,
    lesotho: `إضافات ليسوتو
* نموذج استرداد LRA مكتمل
* فواتير ضريبية جنوب أفريقية صالحة معتمدة من جمارك LRA
* DA.185.D إذا ظهر وكيل التخليص كمصدّر في SAD500
قدّمها بالإضافة إلى جميع المستندات الأساسية الإلزامية.

مستندات الشركات
* ظرف استرداد LRA
* رخصة تجارية أو شهادة ضريبية من LRA أو إثبات آخر تقبله SARS
* الصفحة الأولى من إقرار SARS التي تُظهر LRN وMRN، بما فيها SAD500
* قسيمة تصحيح إذا لزمت تعديلات
* مستندات استيراد معتمدة من جمارك LRA
* للصادرات الجوية: بوليصة شحن جوي مع تأكيد التحميل على متن الطائرة
قدّم أيضًا المستندات الأساسية وإضافات المسار.

المركبات والسلع الخاضعة للتسجيل
* ظرف استرداد LRA أو نسخة من LRA VAT 11
* فاتورة ضريبية جنوب أفريقية صالحة ونسخة جواز سفر المطالب
* حاملو جواز جنوب أفريقيا يحتاجون أيضًا إلى LRA VAT 11
* شهادة الشركة المصنّعة
* مستندات الفحص، بما فيها SAD500 وأي تصحيح
* الشركات: رخصة تجارية أو شهادة ضريبية من LRA
* المركبات المستعملة: نسخ تصريح SARPCO وشهادة التسجيل الجنوب أفريقية
قدّم أيضًا المستندات الأساسية وإضافات المسار.`,
    general: 'ابدأ بالمستندات الأساسية الإلزامية أعلاه. متطلبات الحدود أو المطار وسجلات الشركات أو التسليم أو المركبات إضافية. اقرأ جميع شرائح المنشور حسب نوع مطالبتك. يلزم إثبات دفع مطبوع لكل فاتورة تتجاوز R10,000. تحقّق من المتطلبات الكاملة قبل السفر.', learn: 'اعرف المزيد',
  },
  zh: {
    countries: ['斯威士兰', '莱索托', '博茨瓦纳', '纳米比亚', '莫桑比克'], checklist: '增值税退税文件清单',
    core: `所有路线均必须提供
* 出境章：清晰照片，显示离开南非的日期
* 入境章：清晰照片，显示进入南非的日期
* 签署的表格：已签发的 VAT255，邮寄申请则须提供签署的邮寄申请表
* 护照：清晰照片，显示姓名、护照号码和居住国
* 付款：超过 R10,000 的发票须提供打印的付款凭条、银行对账单或现金收据
* 海关：放行文件（TRD1 / SAD500 / CND2）及发票上海关印章的照片
仅接受纸质付款证明。不接受手机屏幕上的付款确认。`,
    additional: '路线和申请类型所需文件是强制基本文件之外的补充。仅接受纸质付款证明，不接受手机屏幕上的付款确认。',
    eswatini: `斯威士兰补充文件
* 经斯威士兰税务局盖章认可的有效南非税务发票
* 如 SAD500 上的出口人为报关代理，须提供 DA.185.D
* 个人：非商业出口须提供 SRA 退税表格
须在所有强制基本文件之外另行提交。

商业出口清单
* 商业出口的 SRA 退税信封
* 含税超过 R5,000 的发票：SARS 批准的放行文件，包括 SAD500
* 如 SAD500 需要修改，须提供更正凭证
* 斯威士兰税务局的 Asycuda 申报单
还须提交基本文件和路线补充文件。

车辆文件清单
* 新车：SARS 批准的放行文件
* SRA 增值税退税信封或表格
* 在斯威士兰注册的证明
* 车主护照；南非护照持有人还须提供 SRA 车辆证书
* 制造商证书（如适用）
* 二手车：SRA 信封或表格以及斯威士兰注册证明
还须提交基本文件和路线补充文件。`,
    lesotho: `莱索托补充文件
* 填写完整的 LRA 退税表格
* 经 LRA 海关盖章认可的有效南非税务发票
* 如 SAD500 上的出口人为报关代理，须提供 DA.185.D
须在所有强制基本文件之外另行提交。

公司文件清单
* LRA 退税信封
* 营业执照、LRA 税务证书或 SARS 接受的其他证明
* 显示 LRN 和 MRN 的 SARS 申报单首页，包括 SAD500
* 如需修改，须提供更正凭证
* 经 LRA 海关盖章认可的进口文件
* 空运出口：带有已装机批注的航空运单
还须提交基本文件和路线补充文件。

车辆及须注册的货物
* LRA 退税信封或 LRA VAT 11 副本
* 有效南非税务发票及申请人护照副本
* 南非护照持有人还须提供 LRA VAT 11
* 制造商证书
* 检验文件，包括 SAD500 和任何更正文件
* 公司：营业执照或 LRA 税务证书
* 二手车：SARPCO 清关证明及南非注册证书副本
还须提交基本文件和路线补充文件。`,
    general: '请先准备以上强制基本文件。边境或机场要求，以及公司、交付或车辆记录均为额外要求。请阅读适用于您申请类型的全部轮播图片。每张超过 R10,000 的发票均须提供纸质付款证明。旅行前请查看完整要求。', learn: '了解更多',
  },
  nl: {
    countries: ['Eswatini', 'Lesotho', 'Botswana', 'Namibië', 'Mozambique'], checklist: 'Documentenchecklist voor btw-teruggave',
    core: `Verplicht voor ELKE route
* UITREISSTEMPEL: duidelijke foto met de datum waarop u Zuid-Afrika verliet
* INREISSTEMPEL: duidelijke foto met de datum waarop u Zuid-Afrika binnenkwam
* ONDERTEKEND FORMULIER: afgegeven VAT255, of ondertekende postaanvraag bij aanvragen per post
* PASPOORT: duidelijke foto met naam, paspoortnummer en woonland
* BETALING: afgedrukte betaalbon, bankafschrift of contante ontvangstbon voor facturen boven R10,000
* DOUANE: vrijgavedocumenten (TRD1 / SAD500 / CND2) en foto van de douanestempel op facturen
Alleen afgedrukt betalingsbewijs. Bevestigingen op een telefoonscherm worden niet geaccepteerd.`,
    additional: 'Route- en aanvraagdocumenten zijn aanvullend op de verplichte basisdocumenten. Alleen afgedrukt betalingsbewijs; geen bevestigingen op een telefoonscherm.',
    eswatini: `Aanvullingen voor Eswatini
* Geldige Zuid-Afrikaanse belastingfacturen bekrachtigd door de Eswatini Revenue Authority
* DA.185.D als een douaneagent op SAD500 als exporteur staat
* PARTICULIEREN: SRA-teruggaveformulieren voor niet-commerciële uitvoer
Dien deze IN AANVULLING op alle verplichte basisdocumenten in.

Commerciële uitvoer
* SRA-teruggave-envelop voor commerciële uitvoer
* Facturen boven R5,000 inclusief btw: door SARS goedgekeurde vrijgave, inclusief SAD500
* Correctiebewijs als SAD500 moet worden gewijzigd
* Asycuda-aangifte van de Eswatini Revenue Authority
Dien ook de basisdocumenten en route-aanvullingen in.

Voertuigdocumenten
* NIEUWE VOERTUIGEN: door SARS goedgekeurde vrijgave
* SRA-btw-teruggave-envelop of -formulier
* Bewijs van registratie in Eswatini
* Paspoort van de eigenaar; houders van een Zuid-Afrikaans paspoort hebben ook het SRA-voertuigcertificaat nodig
* Fabrikantcertificaat, indien van toepassing
* TWEEDEHANDS VOERTUIGEN: SRA-envelop of -formulier en registratie in Eswatini
Dien ook de basisdocumenten en route-aanvullingen in.`,
    lesotho: `Aanvullingen voor Lesotho
* Ingevuld LRA-teruggaveformulier
* Geldige Zuid-Afrikaanse belastingfacturen bekrachtigd door LRA Customs
* DA.185.D als een douaneagent op SAD500 als exporteur staat
Dien deze IN AANVULLING op alle verplichte basisdocumenten in.

Bedrijfsdocumenten
* LRA-teruggave-envelop
* Handelsvergunning, LRA-belastingcertificaat of ander door SARS geaccepteerd bewijs
* Eerste pagina van de SARS-aangifte met LRN en MRN, inclusief SAD500
* Correctiebewijs indien wijzigingen nodig zijn
* Door LRA Customs bekrachtigde invoerdocumenten
* Luchtvracht: luchtvrachtbrief met bevestiging van laden aan boord
Dien ook de basisdocumenten en route-aanvullingen in.

Voertuigen en registreerbare goederen
* LRA-teruggave-envelop of kopie van LRA VAT 11
* Geldige Zuid-Afrikaanse belastingfactuur en paspoortkopie van de aanvrager
* Houders van een Zuid-Afrikaans paspoort hebben ook LRA VAT 11 nodig
* Fabrikantcertificaat
* Inspectiedocumenten, inclusief SAD500 en eventuele correcties
* Bedrijven: handelsvergunning of LRA-belastingcertificaat
* TWEEDEHANDS VOERTUIGEN: kopieën van SARPCO-goedkeuring en Zuid-Afrikaans registratiecertificaat
Dien ook de basisdocumenten en route-aanvullingen in.`,
    general: 'Begin met de verplichte basisdocumenten hierboven. Grens- of luchthaveneisen en bedrijfs-, afleverings- of voertuigdocumenten zijn aanvullend. Lees de volledige carrousel voor uw aanvraagtype. Voor elke factuur boven R10,000 is afgedrukt betalingsbewijs vereist. Controleer vóór vertrek de volledige eisen.', learn: 'Meer informatie',
  },
  fr: {
    countries: ['Eswatini', 'Lesotho', 'Botswana', 'Namibie', 'Mozambique'], checklist: 'Liste des documents pour le remboursement de la TVA',
    core: `Obligatoire pour TOUS les itinéraires
* CACHET DE SORTIE : photo nette indiquant la date de sortie d’Afrique du Sud
* CACHET D’ENTRÉE : photo nette indiquant la date d’entrée en Afrique du Sud
* FORMULAIRE SIGNÉ : VAT255 délivré, ou demande postale signée pour les demandes par courrier
* PASSEPORT : photo nette indiquant le nom, le numéro du passeport et le pays de résidence
* PAIEMENT : justificatif imprimé, relevé bancaire ou reçu en espèces pour les factures supérieures à R10,000
* DOUANE : documents de mainlevée (TRD1 / SAD500 / CND2) et photo du cachet douanier sur les factures
Justificatifs de paiement imprimés uniquement. Les confirmations sur écran de téléphone ne sont pas acceptées.`,
    additional: 'Ces documents liés à l’itinéraire et au type de demande s’ajoutent aux pièces de base obligatoires. Justificatifs de paiement imprimés uniquement ; aucune confirmation sur écran de téléphone.',
    eswatini: `Pièces supplémentaires pour l’Eswatini
* Factures fiscales sud-africaines valides visées par l’Eswatini Revenue Authority
* DA.185.D si un agent de dédouanement figure comme exportateur sur SAD500
* PARTICULIERS : formulaires de remboursement SRA pour les exportations non commerciales
À fournir EN PLUS de toutes les pièces de base obligatoires.

Exportations commerciales
* Enveloppe de remboursement SRA pour les exportations commerciales
* Factures supérieures à R5,000 TVA comprise : mainlevée autorisée par SARS, dont SAD500
* Bordereau de rectification si SAD500 doit être modifié
* Déclaration Asycuda de l’Eswatini Revenue Authority
Fournir aussi les pièces de base et les suppléments liés à l’itinéraire.

Documents des véhicules
* VÉHICULES NEUFS : mainlevée autorisée par SARS
* Enveloppe ou formulaire de remboursement de TVA SRA
* Preuve d’immatriculation en Eswatini
* Passeport du propriétaire ; les titulaires d’un passeport sud-africain doivent aussi fournir le certificat de véhicule SRA
* Certificat du constructeur, le cas échéant
* VÉHICULES D’OCCASION : enveloppe ou formulaire SRA et immatriculation en Eswatini
Fournir aussi les pièces de base et les suppléments liés à l’itinéraire.`,
    lesotho: `Pièces supplémentaires pour le Lesotho
* Formulaire de remboursement LRA rempli
* Factures fiscales sud-africaines valides visées par les douanes LRA
* DA.185.D si un agent de dédouanement figure comme exportateur sur SAD500
À fournir EN PLUS de toutes les pièces de base obligatoires.

Documents des entreprises
* Enveloppe de remboursement LRA
* Licence commerciale, certificat fiscal LRA ou autre preuve acceptée par SARS
* Première page de la déclaration SARS indiquant LRN et MRN, dont SAD500
* Bordereau de rectification si des modifications sont nécessaires
* Documents d’importation visés par les douanes LRA
* Exportations aériennes : lettre de transport aérien avec mention de chargement à bord
Fournir aussi les pièces de base et les suppléments liés à l’itinéraire.

Véhicules et biens soumis à immatriculation
* Enveloppe de remboursement LRA ou copie de LRA VAT 11
* Facture fiscale sud-africaine valide et copie du passeport du demandeur
* Les titulaires d’un passeport sud-africain doivent aussi fournir LRA VAT 11
* Certificat du constructeur
* Documents d’inspection, dont SAD500 et toute rectification
* Entreprises : licence commerciale ou certificat fiscal LRA
* VÉHICULES D’OCCASION : copies de l’autorisation SARPCO et du certificat d’immatriculation sud-africain
Fournir aussi les pièces de base et les suppléments liés à l’itinéraire.`,
    general: 'Commencez par les pièces de base obligatoires ci-dessus. Les exigences frontalières ou aéroportuaires et les documents d’entreprise, de livraison ou de véhicule s’y ajoutent. Consultez tout le carrousel pour votre type de demande. Un justificatif de paiement imprimé est requis pour chaque facture supérieure à R10,000. Vérifiez toutes les exigences avant le voyage.', learn: 'En savoir plus',
  },
  de: {
    countries: ['Eswatini', 'Lesotho', 'Botswana', 'Namibia', 'Mosambik'], checklist: 'Dokumentencheckliste zur Mehrwertsteuererstattung',
    core: `Pflicht für JEDE Route
* AUSREISESTEMPEL: deutliches Foto mit dem Datum der Ausreise aus Südafrika
* EINREISESTEMPEL: deutliches Foto mit dem Datum der Einreise nach Südafrika
* UNTERSCHRIEBENES FORMULAR: ausgestelltes VAT255 oder unterschriebener Postantrag bei postalischen Anträgen
* REISEPASS: deutliches Foto mit Name, Passnummer und Wohnsitzland
* ZAHLUNG: gedruckter Zahlungsbeleg, Kontoauszug oder Barzahlungsquittung für Rechnungen über R10,000
* ZOLL: Freigabedokumente (TRD1 / SAD500 / CND2) und Foto des Zollstempels auf Rechnungen
Nur gedruckte Zahlungsnachweise. Bestätigungen auf dem Handybildschirm werden nicht akzeptiert.`,
    additional: 'Diese Dokumente für Route und Antragsart sind zusätzlich zu den Pflichtunterlagen einzureichen. Nur gedruckte Zahlungsnachweise; keine Bestätigungen auf dem Handybildschirm.',
    eswatini: `Zusätzliche Unterlagen für Eswatini
* Gültige südafrikanische Steuerrechnungen, bestätigt durch die Eswatini Revenue Authority
* DA.185.D, wenn ein Zollagent auf SAD500 als Exporteur angegeben ist
* PRIVATPERSONEN: SRA-Erstattungsformulare für nichtgewerbliche Ausfuhren
ZUSÄTZLICH zu allen Pflichtunterlagen einreichen.

Gewerbliche Ausfuhren
* SRA-Erstattungsumschlag für gewerbliche Ausfuhren
* Rechnungen über R5,000 einschließlich MwSt.: von SARS genehmigte Freigabe, einschließlich SAD500
* Korrekturbeleg, falls SAD500 geändert werden muss
* Asycuda-Erklärung der Eswatini Revenue Authority
Auch die Pflichtunterlagen und Routenergänzungen einreichen.

Fahrzeugunterlagen
* NEUFAHRZEUGE: von SARS genehmigte Freigabe
* SRA-MwSt.-Erstattungsumschlag oder -formular
* Zulassungsnachweis in Eswatini
* Reisepass des Eigentümers; Inhaber südafrikanischer Pässe benötigen auch die SRA-Fahrzeugbescheinigung
* Herstellerbescheinigung, falls zutreffend
* GEBRAUCHTFAHRZEUGE: SRA-Umschlag oder -formular und Zulassung in Eswatini
Auch die Pflichtunterlagen und Routenergänzungen einreichen.`,
    lesotho: `Zusätzliche Unterlagen für Lesotho
* Ausgefülltes LRA-Erstattungsformular
* Gültige südafrikanische Steuerrechnungen, bestätigt durch LRA Customs
* DA.185.D, wenn ein Zollagent auf SAD500 als Exporteur angegeben ist
ZUSÄTZLICH zu allen Pflichtunterlagen einreichen.

Unternehmensunterlagen
* LRA-Erstattungsumschlag
* Gewerbelizenz, LRA-Steuerbescheinigung oder anderer von SARS anerkannter Nachweis
* Erste Seite der SARS-Erklärung mit LRN und MRN, einschließlich SAD500
* Korrekturbeleg, falls Änderungen erforderlich sind
* Von LRA Customs bestätigte Einfuhrunterlagen
* Luftausfuhren: Luftfrachtbrief mit Bestätigung der Verladung an Bord
Auch die Pflichtunterlagen und Routenergänzungen einreichen.

Fahrzeuge und registrierungspflichtige Waren
* LRA-Erstattungsumschlag oder Kopie von LRA VAT 11
* Gültige südafrikanische Steuerrechnung und Passkopie des Antragstellers
* Inhaber südafrikanischer Pässe benötigen auch LRA VAT 11
* Herstellerbescheinigung
* Inspektionsunterlagen, einschließlich SAD500 und aller Korrekturen
* Unternehmen: Gewerbelizenz oder LRA-Steuerbescheinigung
* GEBRAUCHTFAHRZEUGE: Kopien der SARPCO-Freigabe und südafrikanischen Zulassungsbescheinigung
Auch die Pflichtunterlagen und Routenergänzungen einreichen.`,
    general: 'Beginnen Sie mit den Pflichtunterlagen oben. Grenz- oder Flughafenanforderungen sowie Unternehmens-, Liefer- oder Fahrzeugunterlagen kommen hinzu. Lesen Sie das vollständige Bilderkarussell für Ihre Antragsart. Für jede Rechnung über R10,000 ist ein gedruckter Zahlungsnachweis erforderlich. Prüfen Sie alle Anforderungen vor der Reise.', learn: 'Weitere Informationen',
  },
  it: {
    countries: ['Eswatini', 'Lesotho', 'Botswana', 'Namibia', 'Mozambico'], checklist: 'Elenco dei documenti per il rimborso IVA',
    core: `Obbligatorio per OGNI itinerario
* TIMBRO DI USCITA: foto nitida con la data di uscita dal Sudafrica
* TIMBRO DI INGRESSO: foto nitida con la data di ingresso in Sudafrica
* MODULO FIRMATO: VAT255 rilasciato, o domanda postale firmata per le richieste per posta
* PASSAPORTO: foto nitida con nome, numero del passaporto e paese di residenza
* PAGAMENTO: ricevuta stampata, estratto conto bancario o ricevuta in contanti per fatture superiori a R10,000
* DOGANA: documenti di svincolo (TRD1 / SAD500 / CND2) e foto del timbro doganale sulle fatture
Solo prove di pagamento stampate. Le conferme sullo schermo del telefono non sono accettate.`,
    additional: 'Questi documenti per itinerario e tipo di richiesta si aggiungono ai documenti di base obbligatori. Solo prove di pagamento stampate; nessuna conferma sullo schermo del telefono.',
    eswatini: `Documenti aggiuntivi per Eswatini
* Fatture fiscali sudafricane valide convalidate dall’Eswatini Revenue Authority
* DA.185.D se uno spedizioniere doganale figura come esportatore su SAD500
* PRIVATI: moduli di rimborso SRA per esportazioni non commerciali
Presentarli IN AGGIUNTA a tutti i documenti di base obbligatori.

Esportazioni commerciali
* Busta di rimborso SRA per esportazioni commerciali
* Fatture superiori a R5,000 IVA inclusa: svincolo autorizzato da SARS, incluso SAD500
* Documento di rettifica se SAD500 necessita di modifiche
* Dichiarazione Asycuda dell’Eswatini Revenue Authority
Presentare anche i documenti di base e quelli aggiuntivi dell’itinerario.

Documenti dei veicoli
* VEICOLI NUOVI: svincolo autorizzato da SARS
* Busta o modulo di rimborso IVA SRA
* Prova di immatricolazione in Eswatini
* Passaporto del proprietario; i titolari di passaporto sudafricano necessitano anche del certificato del veicolo SRA
* Certificato del produttore, se applicabile
* VEICOLI USATI: busta o modulo SRA e immatricolazione in Eswatini
Presentare anche i documenti di base e quelli aggiuntivi dell’itinerario.`,
    lesotho: `Documenti aggiuntivi per Lesotho
* Modulo di rimborso LRA compilato
* Fatture fiscali sudafricane valide convalidate dalla dogana LRA
* DA.185.D se uno spedizioniere doganale figura come esportatore su SAD500
Presentarli IN AGGIUNTA a tutti i documenti di base obbligatori.

Documenti aziendali
* Busta di rimborso LRA
* Licenza commerciale, certificato fiscale LRA o altra prova accettata da SARS
* Prima pagina della dichiarazione SARS con LRN e MRN, incluso SAD500
* Documento di rettifica se occorrono modifiche
* Documenti di importazione convalidati dalla dogana LRA
* Esportazioni aeree: lettera di vettura aerea con attestazione di carico a bordo
Presentare anche i documenti di base e quelli aggiuntivi dell’itinerario.

Veicoli e beni soggetti a registrazione
* Busta di rimborso LRA o copia di LRA VAT 11
* Fattura fiscale sudafricana valida e copia del passaporto del richiedente
* I titolari di passaporto sudafricano necessitano anche di LRA VAT 11
* Certificato del produttore
* Documenti di ispezione, incluso SAD500 ed eventuali rettifiche
* Aziende: licenza commerciale o certificato fiscale LRA
* VEICOLI USATI: copie del nulla osta SARPCO e del certificato di immatricolazione sudafricano
Presentare anche i documenti di base e quelli aggiuntivi dell’itinerario.`,
    general: 'Inizia con i documenti di base obbligatori indicati sopra. I requisiti di frontiera o aeroporto e i documenti aziendali, di consegna o dei veicoli sono aggiuntivi. Leggi l’intero carosello per il tuo tipo di richiesta. Per ogni fattura superiore a R10,000 è richiesta una prova di pagamento stampata. Verifica tutti i requisiti prima del viaggio.', learn: 'Ulteriori informazioni',
  },
  pt: {
    countries: ['Essuatíni', 'Lesoto', 'Botsuana', 'Namíbia', 'Moçambique'], checklist: 'Lista de documentos para reembolso do IVA',
    core: `Obrigatório em TODAS as rotas
* CARIMBO DE SAÍDA: fotografia nítida com a data de saída da África do Sul
* CARIMBO DE ENTRADA: fotografia nítida com a data de entrada na África do Sul
* FORMULÁRIO ASSINADO: VAT255 emitido, ou pedido postal assinado para pedidos por correio
* PASSAPORTE: fotografia nítida com nome, número do passaporte e país de residência
* PAGAMENTO: comprovativo impresso, extrato bancário ou recibo de pagamento em dinheiro para faturas acima de R10,000
* ALFÂNDEGA: documentos de desalfandegamento (TRD1 / SAD500 / CND2) e fotografia do carimbo aduaneiro nas faturas
Apenas comprovativos de pagamento impressos. Não são aceites confirmações no ecrã do telefone.`,
    additional: 'Estes documentos da rota e do tipo de pedido são adicionais aos documentos básicos obrigatórios. Apenas comprovativos de pagamento impressos; não são aceites confirmações no ecrã do telefone.',
    eswatini: `Documentos adicionais para Essuatíni
* Faturas fiscais sul-africanas válidas validadas pela Eswatini Revenue Authority
* DA.185.D se um despachante aduaneiro constar como exportador no SAD500
* PARTICULARES: formulários de reembolso SRA para exportações não comerciais
Apresente-os ALÉM de todos os documentos básicos obrigatórios.

Exportações comerciais
* Envelope de reembolso SRA para exportações comerciais
* Faturas acima de R5,000 incluindo IVA: autorização de desalfandegamento SARS, incluindo SAD500
* Documento de correção se o SAD500 precisar de alterações
* Declaração Asycuda da Eswatini Revenue Authority
Apresente também os documentos básicos e os adicionais da rota.

Documentos de veículos
* VEÍCULOS NOVOS: autorização de desalfandegamento SARS
* Envelope ou formulário de reembolso do IVA SRA
* Comprovativo de matrícula em Essuatíni
* Passaporte do proprietário; titulares de passaporte sul-africano também precisam do certificado de veículo SRA
* Certificado do fabricante, se aplicável
* VEÍCULOS USADOS: envelope ou formulário SRA e matrícula em Essuatíni
Apresente também os documentos básicos e os adicionais da rota.`,
    lesotho: `Documentos adicionais para Lesoto
* Formulário de reembolso LRA preenchido
* Faturas fiscais sul-africanas válidas validadas pela alfândega LRA
* DA.185.D se um despachante aduaneiro constar como exportador no SAD500
Apresente-os ALÉM de todos os documentos básicos obrigatórios.

Documentos de empresas
* Envelope de reembolso LRA
* Licença comercial, certificado fiscal LRA ou outro comprovativo aceite pela SARS
* Primeira página da declaração SARS com LRN e MRN, incluindo SAD500
* Documento de correção se forem necessárias alterações
* Documentação de importação validada pela alfândega LRA
* Exportações aéreas: carta de porte aéreo com confirmação de embarque
Apresente também os documentos básicos e os adicionais da rota.

Veículos e bens sujeitos a registo
* Envelope de reembolso LRA ou cópia do LRA VAT 11
* Fatura fiscal sul-africana válida e cópia do passaporte do requerente
* Titulares de passaporte sul-africano também precisam do LRA VAT 11
* Certificado do fabricante
* Documentos de inspeção, incluindo SAD500 e quaisquer correções
* Empresas: licença comercial ou certificado fiscal LRA
* VEÍCULOS USADOS: cópias da autorização SARPCO e do certificado de matrícula sul-africano
Apresente também os documentos básicos e os adicionais da rota.`,
    general: 'Comece pelos documentos básicos obrigatórios acima. Os requisitos da fronteira ou aeroporto e os documentos de empresas, entregas ou veículos são adicionais. Leia o carrossel completo para o seu tipo de pedido. É necessário comprovativo de pagamento impresso para cada fatura acima de R10,000. Verifique todos os requisitos antes da viagem.', learn: 'Saiba mais',
  },
  ru: {
    countries: ['Эсватини', 'Лесото', 'Ботсвана', 'Намибия', 'Мозамбик'], checklist: 'Список документов для возврата НДС',
    core: `Обязательно для ВСЕХ маршрутов
* ШТАМП ВЫЕЗДА: чёткое фото с датой выезда из Южной Африки
* ШТАМП ВЪЕЗДА: чёткое фото с датой въезда в Южную Африку
* ПОДПИСАННЫЙ БЛАНК: выданный VAT255 или подписанное почтовое заявление для заявок по почте
* ПАСПОРТ: чёткое фото с именем, номером паспорта и страной проживания
* ОПЛАТА: распечатанный платёжный документ, банковская выписка или квитанция об оплате наличными для счетов свыше R10,000
* ТАМОЖНЯ: документы о выпуске (TRD1 / SAD500 / CND2) и фото таможенного штампа на счетах
Только печатные подтверждения оплаты. Подтверждения на экране телефона не принимаются.`,
    additional: 'Документы для маршрута и типа заявления предоставляются дополнительно к обязательному основному комплекту. Только печатные подтверждения оплаты; подтверждения на экране телефона не принимаются.',
    eswatini: `Дополнения для Эсватини
* Действительные южноафриканские налоговые счета, заверенные Eswatini Revenue Authority
* DA.185.D, если таможенный агент указан экспортёром в SAD500
* ФИЗИЧЕСКИЕ ЛИЦА: бланки возврата SRA для некоммерческого экспорта
Предоставьте их ДОПОЛНИТЕЛЬНО ко всем обязательным основным документам.

Коммерческий экспорт
* Конверт возврата SRA для коммерческого экспорта
* Счета свыше R5,000 с НДС: разрешение SARS на выпуск, включая SAD500
* Документ о корректировке, если SAD500 требует изменений
* Декларация Asycuda от Eswatini Revenue Authority
Также предоставьте основные документы и дополнения для маршрута.

Документы на транспортные средства
* НОВЫЕ АВТОМОБИЛИ: разрешение SARS на выпуск
* Конверт или бланк возврата НДС SRA
* Подтверждение регистрации в Эсватини
* Паспорт владельца; владельцам южноафриканского паспорта также нужен сертификат SRA на автомобиль
* Сертификат производителя, если применимо
* ПОДЕРЖАННЫЕ АВТОМОБИЛИ: конверт или бланк SRA и регистрация в Эсватини
Также предоставьте основные документы и дополнения для маршрута.`,
    lesotho: `Дополнения для Лесото
* Заполненный бланк возврата LRA
* Действительные южноафриканские налоговые счета, заверенные таможней LRA
* DA.185.D, если таможенный агент указан экспортёром в SAD500
Предоставьте их ДОПОЛНИТЕЛЬНО ко всем обязательным основным документам.

Документы компаний
* Конверт возврата LRA
* Торговая лицензия, налоговый сертификат LRA или другое подтверждение, принимаемое SARS
* Первая страница декларации SARS с LRN и MRN, включая SAD500
* Документ о корректировке, если нужны изменения
* Импортные документы, заверенные таможней LRA
* Авиаперевозки: авианакладная с отметкой о погрузке на борт
Также предоставьте основные документы и дополнения для маршрута.

Автомобили и товары, подлежащие регистрации
* Конверт возврата LRA или копия LRA VAT 11
* Действительный южноафриканский налоговый счёт и копия паспорта заявителя
* Владельцам южноафриканского паспорта также нужен LRA VAT 11
* Сертификат производителя
* Документы осмотра, включая SAD500 и все корректировки
* Компании: торговая лицензия или налоговый сертификат LRA
* ПОДЕРЖАННЫЕ АВТОМОБИЛИ: копии разрешения SARPCO и южноафриканского регистрационного свидетельства
Также предоставьте основные документы и дополнения для маршрута.`,
    general: 'Начните с обязательных основных документов выше. Требования границы или аэропорта и документы компании, доставки или автомобиля предоставляются дополнительно. Прочитайте всю карусель для вашего типа заявления. Для каждого счёта свыше R10,000 требуется печатное подтверждение оплаты. Проверьте все требования до поездки.', learn: 'Подробнее',
  },
  es: {
    countries: ['Esuatini', 'Lesoto', 'Botsuana', 'Namibia', 'Mozambique'], checklist: 'Lista de documentos para la devolución del IVA',
    core: `Obligatorio en TODAS las rutas
* SELLO DE SALIDA: foto clara con la fecha de salida de Sudáfrica
* SELLO DE ENTRADA: foto clara con la fecha de entrada en Sudáfrica
* FORMULARIO FIRMADO: VAT255 emitido, o solicitud postal firmada para solicitudes por correo
* PASAPORTE: foto clara con nombre, número de pasaporte y país de residencia
* PAGO: comprobante impreso, extracto bancario o recibo de pago en efectivo para facturas superiores a R10,000
* ADUANA: documentos de levante (TRD1 / SAD500 / CND2) y foto del sello aduanero en las facturas
Solo justificantes de pago impresos. No se aceptan confirmaciones en la pantalla del teléfono.`,
    additional: 'Estos documentos de ruta y tipo de solicitud son adicionales a los documentos básicos obligatorios. Solo justificantes de pago impresos; no se aceptan confirmaciones en la pantalla del teléfono.',
    eswatini: `Documentos adicionales para Esuatini
* Facturas fiscales sudafricanas válidas visadas por la Eswatini Revenue Authority
* DA.185.D si un agente aduanero figura como exportador en SAD500
* PARTICULARES: formularios de devolución SRA para exportaciones no comerciales
Preséntelos ADEMÁS de todos los documentos básicos obligatorios.

Exportaciones comerciales
* Sobre de devolución SRA para exportaciones comerciales
* Facturas superiores a R5,000 IVA incluido: levante autorizado por SARS, incluido SAD500
* Documento de rectificación si SAD500 necesita cambios
* Declaración Asycuda de la Eswatini Revenue Authority
Presente también los documentos básicos y los adicionales de la ruta.

Documentos de vehículos
* VEHÍCULOS NUEVOS: levante autorizado por SARS
* Sobre o formulario de devolución del IVA SRA
* Prueba de matriculación en Esuatini
* Pasaporte del propietario; los titulares de pasaporte sudafricano también necesitan el certificado de vehículo SRA
* Certificado del fabricante, si corresponde
* VEHÍCULOS USADOS: sobre o formulario SRA y matriculación en Esuatini
Presente también los documentos básicos y los adicionales de la ruta.`,
    lesotho: `Documentos adicionales para Lesoto
* Formulario de devolución LRA cumplimentado
* Facturas fiscales sudafricanas válidas visadas por la aduana LRA
* DA.185.D si un agente aduanero figura como exportador en SAD500
Preséntelos ADEMÁS de todos los documentos básicos obligatorios.

Documentos de empresas
* Sobre de devolución LRA
* Licencia comercial, certificado fiscal LRA u otra prueba aceptada por SARS
* Primera página de la declaración SARS con LRN y MRN, incluido SAD500
* Documento de rectificación si se requieren cambios
* Documentación de importación visada por la aduana LRA
* Exportaciones aéreas: guía aérea con confirmación de carga a bordo
Presente también los documentos básicos y los adicionales de la ruta.

Vehículos y bienes sujetos a registro
* Sobre de devolución LRA o copia de LRA VAT 11
* Factura fiscal sudafricana válida y copia del pasaporte del solicitante
* Los titulares de pasaporte sudafricano también necesitan LRA VAT 11
* Certificado del fabricante
* Documentos de inspección, incluido SAD500 y cualquier rectificación
* Empresas: licencia comercial o certificado fiscal LRA
* VEHÍCULOS USADOS: copias de la autorización SARPCO y del certificado de matriculación sudafricano
Presente también los documentos básicos y los adicionales de la ruta.`,
    general: 'Empiece con los documentos básicos obligatorios indicados arriba. Los requisitos fronterizos o aeroportuarios y los documentos de empresas, entrega o vehículos son adicionales. Lea el carrusel completo para su tipo de solicitud. Se requiere justificante de pago impreso para cada factura superior a R10,000. Compruebe todos los requisitos antes del viaje.', learn: 'Más información',
  },
};

function countryChecklistItems(language) {
  const c = copy[language] || copy.en;
  return c.countries.map((country, index) => ({
    title: `${country} - ${c.checklist}`,
    description: [c.core, index === 0 ? c.eswatini : index === 1 ? c.lesotho : c.general,
      c.additional, `${c.learn}: https://vatrefundagency.co.za/`].join('\n\n'),
  }));
}

module.exports = { countryChecklistItems };
