import React, { useState, useRef, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Clock,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  quickChips?: string[];
}

export const AiChatbotWidget: React.FC = () => {
  const { currentUser, leaves, attendance, tasks, employees } = useAdmin();
  const { language, t } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initial greeting based on active language (Supports all 10 languages)
  const getGreeting = () => {
    const name = currentUser?.name || 'Colleague';
    switch (language) {
      case 'hi':
        return `नमस्ते **${name}**! मैं एंटरप्रेनेक्स EWMS एआई कोपायलट हूँ। मैं आपकी छुट्टियों, शिफ्ट के नियमों, लंबित कार्यों, वेतन गणना और नीतियों में कैसे सहायता कर सकता हूँ?`;
      case 'mr':
        return `नमस्कार **${name}**! मी एंटरप्रेनेक्स EWMS एआय कोपायलट आहे. मी तुम्हाला सुट्ट्या, कामाच्या वेळा, प्रलंबित कार्ये, वेतन गणना आणि कंपनीच्या नियमांबद्दल कशी मदत करू शकतो?`;
      case 'te':
        return `నమస్కారం **${name}**! నేను ఎంటర్‌ప్రెనెక్స్ EWMS AI కోపైలట్. సెలవులు, షిఫ్ట్ సమయాలు, పెండింగ్ పనులు, జీతం లెక్కింపుల గురించి మీకు ఎలా సహాయపడగలను?`;
      case 'ta':
        return `வணக்கம் **${name}**! நான் என்டர்பிரனக்ஸ் EWMS AI உதவியாளர். விடுப்பு இருப்பு, பணி நேரம், நிலுவையில் உள்ள பணிகள் மற்றும் சம்பள கணக்கீடு குறித்து நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?`;
      case 'kn':
        return `ನಮಸ್ಕಾರ **${name}**! ನಾನು ಎಂಟರ್‌ಪ್ರೆನೆಕ್ಸ್ EWMS AI ಸಹಾಯಕ. ರಜೆಗಳು, ಶಿಫ್ಟ್ ನಿಯಮಗಳು, ಬಾಕಿ ಕೆಲಸಗಳು ಮತ್ತು ವೇತನ ಲೆಕ್ಕಾಚಾರದಲ್ಲಿ ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?`;
      case 'bn':
        return `নমস্কার **${name}**! আমি এন্টারপ্রেনেক্স EWMS এআই কোপাইলট। ছুটি, শিফটের সময়, বাকি কাজ এবং বেতন গণনায় কীভাবে সাহায্য করতে পারি?`;
      case 'gu':
        return `નમસ્તે **${name}**! હું એન્ટરપ્રેનેક્સ EWMS AI કોપાયલટ છું. રજાઓ, શિફ્ટ નિયમો, બાકી કાર્યો અને પગાર ગણતરીમાં હું તમને કેવી રીતે મદદ કરી શકું?`;
      case 'es':
        return `¡Hola **${name}**! Soy el copiloto de IA de Enterprenex EWMS. ¿Cómo puedo ayudarte hoy con tus días de vacaciones, turnos, tareas pendientes o cálculo de nómina?`;
      case 'de':
        return `Hallo **${name}**! Ich bin der Enterprenex EWMS KI-Copilot. Wie kann ich Ihnen heute bei Urlaubstagen, Schichtzeiten, offenen Aufgaben oder der Gehaltsberechnung helfen?`;
      default:
        return `Hello **${name}**! I am your **Enterprenex EWMS AI Copilot**. How can I assist you with your leave balances, shift rules, assigned deliverables, payroll calculations, or corporate compliance policies today?`;
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      sender: 'assistant',
      text: getGreeting(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Update greeting if language changes and only initial message is present
  useEffect(() => {
    setMessages(prev => {
      if (prev.length <= 1) {
        return [
          {
            id: 'init-' + language,
            sender: 'assistant',
            text: getGreeting(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];
      }
      return prev;
    });
  }, [language, currentUser?.name]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isThinking]);

  // Knowledge Base Query Evaluator
  const generateAiResponse = (query: string): string => {
    const q = query.toLowerCase();

    // 1. Leave Balances Inquiry
    if (q.includes('leave') || q.includes('holiday') || q.includes('vacation') || q.includes('रजा') || q.includes('छुट्टी') || q.includes('సెలవు') || q.includes('விடுப்பு') || q.includes('ರಜೆ') || q.includes('ছুটি') || q.includes('રજા') || q.includes('vacaciones') || q.includes('urlaub')) {
      const userLeaves = leaves.filter(
        l => l.employeeName?.toLowerCase().includes((currentUser?.name || '').toLowerCase()) ||
             l.employeeName?.toLowerCase().includes((currentUser?.employeeId || '').toLowerCase())
      );
      const approvedCount = userLeaves.filter(l => l.status === 'Approved').length;
      const pendingCount = userLeaves.filter(l => l.status === 'Pending').length;

      const casualQuota = 12;
      const sickQuota = 8;
      const earnedQuota = 15;
      const remainingCasual = Math.max(0, casualQuota - approvedCount);

      if (language === 'hi') {
        return `🌴 **आपकी वैधानिक अवकाश शेष राशि (वार्षिक कोटा):**\n\n` +
          `• **आकस्मिक अवकाश (CL):** 12 दिन / वर्ष (शेष: ~${remainingCasual} दिन)\n` +
          `• **चिकित्सा अवकाश (SL):** 8 दिन / वर्ष\n` +
          `• **अर्जित / वार्षिक अवकाश (EL):** 15 दिन / वर्ष (अधिकतम 10 दिन अगले वर्ष ले जाए जा सकते हैं)\n\n` +
          `📌 **वर्तमान स्थिति:** ${approvedCount} स्वीकृत | ${pendingCount} समीक्षाधीन।\n` +
          `*आप टीम पेज के 'Statutory Leave Applications' टैब से तुरंत नया अवकाश आवेदन जमा कर सकते हैं।*`;
      }
      if (language === 'mr') {
        return `🌴 **तुमचा वैधानिक रजा शिल्लक कोटा (वार्षिक):**\n\n` +
          `• **किरकोळ रजा (CL):** 12 दिवस / वर्ष (शिल्लक: ~${remainingCasual} दिवस)\n` +
          `• **वैद्यकीय रजा (SL):** 8 दिवस / वर्ष\n` +
          `• **हक्काची रजा (EL):** 15 दिवस / वर्ष (कमाल 10 दिवस पुढे ओढले जाऊ शकतात)\n\n` +
          `📌 **सध्याची स्थिती:** ${approvedCount} मंजूर | ${pendingCount} प्रलंबित अर्ज.\n` +
          `*तुम्ही टीम पेजवरून तात्काळ नवीन रजेसाठी अर्ज करू शकता.*`;
      }
      if (language === 'te') {
        return `🌴 **మీ చట్టబద్ధమైన సెలవు బ్యాలెన్స్ (వార్షిక కోటా):**\n\n` +
          `• **కాజువల్ లీవ్ (CL):** 12 రోజులు (మిగిలినవి: ~${remainingCasual} రోజులు)\n` +
          `• **సిక్ లీవ్ (SL):** 8 రోజులు / సంవత్సరం\n` +
          `• **ప్రివిలేజ్ లీవ్ (EL):** 15 రోజులు / సంవత్సరం\n\n` +
          `📌 **ప్రస్తుత స్థితి:** ${approvedCount} ఆమోదించబడింది | ${pendingCount} పెండింగ్‌లో ఉన్నాయి.`;
      }
      if (language === 'es') {
        return `🌴 **Tu Saldo de Vacaciones y Licencias Estatutarias:**\n\n` +
          `• **Licencia Casual (CL):** 12 días / año (Disponibles: ~${remainingCasual} días)\n` +
          `• **Licencia por Enfermedad (SL):** 8 días / año\n` +
          `• **Vacaciones Pagadas (EL):** 15 días / año\n\n` +
          `📌 **Estado Actual:** ${approvedCount} Aprobadas | ${pendingCount} en Revisión.`;
      }
      if (language === 'de') {
        return `🌴 **Ihr Gesetzliches Urlaubsguthaben (Jahreskontingent):**\n\n` +
          `• **Sonderurlaub (CL):** 12 Tage / Jahr (Verfügbar: ~${remainingCasual} Tage)\n` +
          `• **Krankheitsurlaub (SL):** 8 Tage / Jahr\n` +
          `• **Jahresurlaub (EL):** 15 Tage / Jahr\n\n` +
          `📌 **Status:** ${approvedCount} Genehmigt | ${pendingCount} Ausstehend.`;
      }

      return `🌴 **Your Statutory Leave Balances (Annual Allotment):**\n\n` +
        `• **Casual Leave (CL):** 12 Days / year (Available: ~${remainingCasual} days)\n` +
        `• **Sick / Medical Leave (SL):** 8 Days / year\n` +
        `• **Earned / Annual Leave (EL):** 15 Days / year (Max 10 days carry forward)\n\n` +
        `📌 **Your Status:** ${approvedCount} Approved | ${pendingCount} Pending Review.\n` +
        `*You can submit a formal application directly under Team & Attendance → Statutory Leave Applications.*`;
    }

    // 2. Shift Timings & Late Mark Policy
    if (q.includes('shift') || q.includes('time') || q.includes('late') || q.includes('attendance') || q.includes('हजेरी') || q.includes('समय') || q.includes('वेळ') || q.includes('హాజరు') || q.includes('வருகை') || q.includes('turno')) {
      if (language === 'hi') {
        return `⏰ **कॉर्पोरेट शिफ्ट एवं लेट मार्क नीति (EPX-POL-002):**\n\n` +
          `• **मानक कार्य समय:** प्रातः 09:30 AM से सायं 06:30 PM IST (सोमवार से शुक्रवार)\n` +
          `• **लेट मार्क नियम:** प्रातः 09:30 AM के बाद चेक-इन करने पर स्वचालित 'Late Mark' दर्ज होता है। 09:45 AM तक 15 मिनट की रियायत उपलब्ध है।\n` +
          `• **हाफ-डे गणना:** 4.0 से 5.0 घंटे काम करने पर आधा दिन (Half-Day) माना जाता है। 4 घंटे से कम काम करने पर अनाधिकृत अनुपस्थिति मानी जाती है।`;
      }
      if (language === 'mr') {
        return `⏰ **कॉर्पोरेट शिफ्ट आणि लेट मार्क नियम (EPX-POL-002):**\n\n` +
          `• **कामाची अधिकृत वेळ:** सकाळी 09:30 AM ते संध्याकाळी 06:30 PM IST (सोमवार ते शुक्रवार)\n` +
          `• **लेट मार्क नियम:** सकाळी 09:30 नंतर चेक-इन केल्यास सिस्टीममध्ये 'Late Mark' नोंदवला जातो. 09:45 पर्यंत 15 मिनिटांची सवलت आहे.\n` +
          `• **हाफ-डे नियम:** 4 ते 5 तास कामाची नोंद झाल्यास अर्धा दिवस (Half Day) धरला जातो.`;
      }
      return `⏰ **Corporate Shift & Late Mark Regulations (EPX-POL-002):**\n\n` +
        `• **Core Working Hours:** 09:30 AM – 06:30 PM IST (Monday to Friday, 9h shift)\n` +
        `• **Late Mark Rule:** Check-in past 09:30 AM IST logs an automated Late Mark. A 15-minute grace window exists up to 09:45 AM.\n` +
        `• **Half-Day Threshold:** Working between 4.0 and 5.0 hours is audited as a Half-Day. Less than 4.0 hours counts as an unexcused absence unless pre-approved.`;
    }

    // 3. Assigned Deliverables / Tasks
    if (q.includes('task') || q.includes('work') || q.includes('todo') || q.includes('deliverable') || q.includes('काम') || q.includes('कार्य') || q.includes('పని') || q.includes('பணி') || q.includes('tarea')) {
      const myTasks = tasks.filter(
        t => t.assignedTo?.toLowerCase().includes((currentUser?.name || '').toLowerCase()) ||
             t.assignedTo?.toLowerCase().includes((currentUser?.employeeId || '').toLowerCase())
      );
      const pendingTasks = myTasks.filter(t => t.status !== 'Done');

      if (pendingTasks.length === 0) {
        return `🎉 **Great news!** You currently have **0 pending tasks**. All assigned engineering deliverables have been completed. Check the Sprint Backlog to pick up new workstreams.`;
      }

      const taskList = pendingTasks
        .slice(0, 4)
        .map(t => `• **${t.title}** [${t.status}] — Priority: *${t.priority}* (Due: ${t.dueDate || 'Sprint End'})`)
        .join('\n');

      return `📋 **Your Active Sprint Deliverables (${pendingTasks.length} Pending):**\n\n` +
        taskList +
        `\n\n*View full details or start the stopwatch under Sprint Backlog & Kanban.*`;
    }

    // 4. Corporate Information & Identity
    if (q.includes('gst') || q.includes('cin') || q.includes('company') || q.includes('director') || q.includes('address') || q.includes('कंपनी') || q.includes('पत्ता')) {
      return `🏢 **Enterprenex Solutions Private Limited (Corporate Identity):**\n\n` +
        `• **CIN:** \`U72200PN2026PTC239841\`\n` +
        `• **GSTIN:** \`27AAXPE1206M1ZV\` (Maharashtra Jurisdiction)\n` +
        `• **Managing Director:** Rohit Pawar\n` +
        `• **Corporate Head Office:** Tech Park Tower B, Shivajinagar, Pune, Maharashtra 411005\n` +
        `• **Official Portal:** \`https://enterprenex.solutions\``;
    }

    // 5. POSH & Compliance
    if (q.includes('posh') || q.includes('harassment') || q.includes('grievance') || q.includes('complaint') || q.includes('तक्रार') || q.includes('शिकायत')) {
      return `🛡️ **Internal Complaints Committee (ICC) & POSH Policy (EPX-POL-004):**\n\n` +
        `Enterprenex Solutions maintains strict zero tolerance towards workplace harassment, discrimination, or hostile conduct.\n\n` +
        `• **Dedicated Grievance Email:** \`posh@enterprenex.solutions\`\n` +
        `• **Investigation Timeline:** Statutory resolution completed confidentially within 90 days.\n` +
        `• **Anti-Retaliation Guarantee:** Whistleblowers and complainants are legally protected under corporate governance protocols.`;
    }

    // 6. Payroll & Salary Formula
    if (q.includes('salary') || q.includes('payroll') || q.includes('payslip') || q.includes('pf') || q.includes('वेतन') || q.includes('पगार') || q.includes('జీతం') || q.includes('சம்பளம்') || q.includes('sueldo') || q.includes('gehalt')) {
      return `💵 **Statutory Indian Payroll Formula (Rule-Based):**\n\n` +
        `• **Basic Salary:** 50% of Monthly Gross CTC\n` +
        `• **House Rent Allowance (HRA):** 30% of Monthly Gross CTC\n` +
        `• **Special Allowance:** 20% of Monthly Gross CTC\n` +
        `• **Provident Fund (EPF):** 12% of Basic Salary (Statutory Employee Contribution)\n` +
        `• **Professional Tax (PT):** ₹200 flat (Maharashtra State Regulation)\n` +
        `• **TDS:** Deducted as per applicable Income Tax slab.\n\n` +
        `*Download your verified payslip or Form 16 Part B from Workforce Roster → Payslips.*`;
    }

    // 7. Management Team & Leadership Contact Directory
    if (
      q.includes('management') ||
      q.includes('contact') ||
      q.includes('director') ||
      q.includes('rohit') ||
      q.includes('lead') ||
      q.includes('head') ||
      q.includes('escalat') ||
      q.includes('व्यवस्थापन') ||
      q.includes('प्रबंधन') ||
      q.includes('संपर्क') ||
      q.includes('సంప్రద') ||
      q.includes('தொடர்பு') ||
      q.includes('ಸಂಪರ್ಕ') ||
      q.includes('যোগাযোগ') ||
      q.includes('સંપર્ક') ||
      q.includes('directiv') ||
      q.includes('leitung')
    ) {
      if (language === 'hi') {
        return `👥 **एंटरप्रेनेक्स सोल्यूशन्स - प्रबंधन एवं कार्यकारी नेतृत्व संपर्क विवरण:**\n\n` +
          `• **प्रबंध निदेशक एवं मुख्य वास्तुकार (Managing Director):**\n` +
          `  👤 **Rohit Pawar (रोहित पवार)**\n` +
          `  ✉️ ईमेल: \`director@enterprenexsolution.com\` | \`director@enterprenex.solutions\`\n` +
          `  📞 फोन: \`+91-9226860060\`\n` +
          `  🏢 कार्यालय: कार्यकारी बोर्डरूम, पुणे मुख्यालय\n` +
          `  💼 अधिकार: वैधानिक नीतियां, क्लाइंट आर्किटेक्चर एवं अंतिम अनुमोदन\n\n` +
          `• **मानव संसाधन एवं संचालन प्रमुख (HR Administrator):**\n` +
          `  👤 **HR Head**\n` +
          `  ✉️ ईमेल: \`hr@enterprenexsolution.com\` | \`hr@enterprenex.solutions\`\n` +
          `  📞 फोन: \`+91-9226860060\` (Ext: 102)\n` +
          `  💼 अधिकार: उपस्थिति नियमितीकरण, वैधानिक अवकाश, वेतन पर्ची एवं ऑनबोर्डिंग\n\n` +
          `• **फुल स्टैक इंजीनियर एवं एआई विशेषज्ञ (Tech Lead):**\n` +
          `  👤 **POLAMREDDY REVANTH REDDY** (कर्मचारी आईडी: \`202600000002\`)\n` +
          `  ✉️ ईमेल: \`revanth@enterprenex.solutions\`\n` +
          `  📞 फोन: \`+91-9876543210\`\n` +
          `  💼 अधिकार: स्प्रिंट कार्य, तकनीकी सहायता एवं सिस्टम विकास\n\n` +
          `📌 **आधिकारिक हेल्पडेस्क:** \`/admin/helpdesk\` (सर्विस डेस्क एवं 24/7 एसएलए ट्रैकिंग)`;
      }
      if (language === 'mr') {
        return `👥 **एंटरप्रेनेक्स सोल्यूशन्स - व्यवस्थापन व वरिष्ठ नेतृत्व संपर्क निर्देशिका:**\n\n` +
          `• **व्यवस्थापकीय संचालक व मुख्य वास्तुकार (Managing Director):**\n` +
          `  👤 **Rohit Pawar (रोहित पवार)**\n` +
          `  ✉️ ईमेल: \`director@enterprenexsolution.com\` | \`director@enterprenex.solutions\`\n` +
          `  📞 फोन: \`+91-9226860060\`\n` +
          `  🏢 कार्यालय: मुख्य संचालनालय, पुणे कॉर्पोरेट मुख्यालय\n` +
          `  💼 कार्यक्षेत्र: वैधानिक धोरणे, ग्राहक प्रकल्प आणि अंतिम मंजुरी\n\n` +
          `• **मानव संसाधन व ऑपरेशन्स प्रमुख (HR Administrator):**\n` +
          `  👤 **HR Head**\n` +
          `  ✉️ ईमेल: \`hr@enterprenexsolution.com\` | \`hr@enterprenex.solutions\`\n` +
          `  📞 फोन: \`+91-9226860060\` (Ext: 102)\n` +
          `  💼 कार्यक्षेत्र: हजेरी पडताळणी, सुट्ट्या, पगारपत्रके व भरती\n\n` +
          `• **फुल स्टॅक इंजिनिअर व एआय तज्ज्ञ (Tech Lead):**\n` +
          `  👤 **POLAMREDDY REVANTH REDDY** (कर्मचारी क्र.: \`202600000002\`)\n` +
          `  ✉️ ईमेल: \`revanth@enterprenex.solutions\`\n` +
          `  📞 फोन: \`+91-9876543210\`\n` +
          `  💼 कार्यक्षेत्र: स्प्रिंट प्रकल्प, सिस्टीम आर्किटेक्चर आणि तांत्रिक सहाय्य\n\n` +
          `📌 **अधिकृत सेवा डेस्क:** \`/admin/helpdesk\``;
      }
      return `👥 **Enterprenex Solutions - Management Team & Executive Leadership Directory:**\n\n` +
        `• **Managing Director & Lead Architect:**\n` +
        `  👤 **Rohit Pawar**\n` +
        `  ✉️ **Email:** \`director@enterprenexsolution.com\` | \`director@enterprenex.solutions\`\n` +
        `  📞 **Phone:** \`+91-9226860060\`\n` +
        `  🏢 **Office:** Executive Boardroom, Pune Corporate Headquarters\n` +
        `  💼 **Escalation Scope:** Statutory approvals, enterprise architecture, client governance\n\n` +
        `• **Head of Human Resources & Operations:**\n` +
        `  👤 **HR Administrator**\n` +
        `  ✉️ **Email:** \`hr@enterprenexsolution.com\` | \`hr@enterprenex.solutions\`\n` +
        `  📞 **Phone:** \`+91-9226860060\` (Ext: 102)\n` +
        `  💼 **Escalation Scope:** Attendance regularizations, statutory leaves (CL/SL/EL), payroll slips & employee onboarding\n\n` +
        `• **Full Stack Engineer & AI Specialist (Tech Lead):**\n` +
        `  👤 **POLAMREDDY REVANTH REDDY** (Emp ID: \`202600000002\`)\n` +
        `  ✉️ **Email:** \`revanth@enterprenex.solutions\`\n` +
        `  📞 **Phone:** \`+91-9876543210\`\n` +
        `  💼 **Escalation Scope:** Sprint Kanban workstreams, system delivery, cloud telemetry\n\n` +
        `• **Central Service Desk & Escalation:**\n` +
        `  ✉️ **Official Support:** \`support@enterprenexsolution.com\`\n` +
        `  🌐 **Portal Desk:** \`/admin/helpdesk\` (24/7 SLA Tracking)`;
    }

    // Default Fallback
    if (language === 'hi') {
      return `मैं आपकी सहायता के लिए तैयार हूँ! आप मुझसे निम्न विषयों पर पूछ सकते हैं:\n\n` +
        `1. "मेरे पास कितनी छुट्टियां शेष हैं?"\n` +
        `2. "आज का शिफ्ट समय और लेट मार्क नियम क्या है?"\n` +
        `3. "मेरे लंबित कार्य दिखाएं"\n` +
        `4. "कंपनी का GSTIN और CIN नंबर क्या है?"\n` +
        `5. "POSH या शिकायत निवारण के लिए किसे संपर्क करें?"\n` +
        `6. "मासिक वेतन की गणना कैसे होती है?"\n` +
        `7. "प्रबंधन टीम संपर्क विवरण दिखाएं"`;
    }
    if (language === 'mr') {
      return `मी मदतीसाठी तयार आहे! तुम्ही मला पुढील गोष्टींबद्दल विचारू शकता:\n\n` +
        `1. "माझ्याकडे किती सुट्ट्या शिल्लक आहेत?"\n` +
        `2. "कामाची वेळ आणि लेट मार्क नियम काय आहे?"\n` +
        `3. "माझी प्रलंबित कामे दाखवा"\n` +
        `4. "कंपनीचा GSTIN आणि CIN क्रमांक काय आहे?"\n` +
        `5. "POSH किंवा अंतर्गत तक्रारीसाठी कोणाशी संपर्क साधावा?"\n` +
        `6. "मासिक पगाराची गणना कशी केली जाते?"\n` +
        `7. "व्यवस्थापन संघ संपर्क तपशील दाखवा"`;
    }
    return `I am here to assist you with Enterprise EWMS operations! You can ask me:\n\n` +
      `1. *"How many leaves do I have left?"*\n` +
      `2. *"What is today's shift timing and late mark threshold?"*\n` +
      `3. *"Show my pending sprint deliverables"*\n` +
      `4. *"What is Enterprenex's registered GSTIN and CIN?"*\n` +
      `5. *"How do I report a POSH grievance?"*\n` +
      `6. *"How is monthly salary & PF calculated?"*\n` +
      `7. *"Show Management Team contact details and executive directory"*`;
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    setTimeout(() => {
      const reply = generateAiResponse(query);
      const aiMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
    }, 400);
  };

  return (
    <>
      {/* ── FLOATING LAUNCHER BUTTON ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 20px',
            borderRadius: '50px',
            background: 'linear-gradient(135deg, #F66135 0%, #EA580C 100%)',
            color: '#ffffff',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 10px 25px rgba(246, 97, 53, 0.45)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.9rem',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0) scale(1)')}
          title="Open Enterprenex EWMS AI Copilot"
        >
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: '#ffffff',
              color: '#F66135',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sparkles size={16} />
          </div>
          <span>EWMS AI Copilot</span>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10B981',
              boxShadow: '0 0 8px #10B981'
            }}
          />
        </button>
      )}

      {/* ── FLOATING CHAT DIALOG WINDOW (Theme-Aware: Crisp in Light & Dark Mode) ── */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: isExpanded ? '540px' : '390px',
            height: isExpanded ? '660px' : '530px',
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: 'calc(100vh - 48px)',
            zIndex: 10000,
            background: 'var(--adm-surface, #ffffff)',
            border: '1px solid var(--adm-border, rgba(0, 0, 0, 0.12))',
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(246, 97, 53, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'width 0.25s ease, height 0.25s ease'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              background: 'linear-gradient(135deg, rgba(246, 97, 53, 0.12) 0%, var(--adm-surface, #ffffff) 100%)',
              borderBottom: '1px solid var(--adm-border, rgba(0, 0, 0, 0.08))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #F66135 0%, #EA580C 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 10px rgba(246, 97, 53, 0.35)'
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: 'var(--adm-text, #111827)' }}>
                    {t('ai.title', 'Enterprenex EWMS Copilot')}
                  </h3>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      color: '#10B981',
                      background: 'rgba(16, 185, 129, 0.15)',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}
                  >
                    LIVE
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim, #64748b)' }}>
                  {currentUser?.name || 'Enterprenex Member'} • {currentUser?.role || 'Team'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--adm-text-dim, #64748b)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={isExpanded ? 'Collapse' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>

              <button
                onClick={() => setMessages([{
                  id: 'init-' + Date.now(),
                  sender: 'assistant',
                  text: getGreeting(),
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }])}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--adm-text-dim, #64748b)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Clear conversation"
              >
                <Trash2 size={16} />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--adm-text-dim, #64748b)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Close Copilot"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'var(--adm-bg, #fafafa)'
            }}
          >
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}
              >
                {msg.sender === 'assistant' && (
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'var(--adm-primary-soft, rgba(246, 97, 53, 0.12))',
                      color: 'var(--adm-primary, #F66135)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <Bot size={14} />
                  </div>
                )}
                <div
                  style={{
                    background: msg.sender === 'user'
                      ? 'linear-gradient(135deg, #F66135 0%, #EA580C 100%)'
                      : 'var(--adm-surface, #ffffff)',
                    color: msg.sender === 'user'
                      ? '#ffffff'
                      : 'var(--adm-text, #111827)',
                    padding: '10px 14px',
                    borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    fontSize: '0.82rem',
                    lineHeight: '1.55',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--adm-border, rgba(0, 0, 0, 0.08))',
                    boxShadow: msg.sender === 'user' ? '0 2px 8px rgba(246, 97, 53, 0.3)' : '0 2px 6px rgba(0, 0, 0, 0.04)',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {msg.text}
                  <div
                    style={{
                      fontSize: '0.65rem',
                      color: msg.sender === 'user' ? 'rgba(255, 255, 255, 0.8)' : 'var(--adm-text-dim, #64748b)',
                      marginTop: '4px',
                      textAlign: 'right'
                    }}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isThinking && (
              <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'var(--adm-primary-soft, rgba(246, 97, 53, 0.12))',
                    color: 'var(--adm-primary, #F66135)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Bot size={14} />
                </div>
                <div
                  style={{
                    background: 'var(--adm-surface, #ffffff)',
                    border: '1px solid var(--adm-border, rgba(0, 0, 0, 0.08))',
                    padding: '8px 14px',
                    borderRadius: '14px',
                    fontSize: '0.78rem',
                    color: 'var(--adm-text-dim, #64748b)',
                    fontStyle: 'italic'
                  }}
                >
                  Analyzing EWMS records...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Inquiry Chips */}
          <div
            style={{
              padding: '6px 12px',
              background: 'var(--adm-surface, #ffffff)',
              borderTop: '1px solid var(--adm-border, rgba(0, 0, 0, 0.08))',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            <button
              onClick={() => handleSendMessage(t('ai.promptLeaves', 'How many leaves do I have?'))}
              style={{
                fontSize: '0.72rem',
                padding: '5px 10px',
                borderRadius: '12px',
                background: 'var(--adm-bg, #f4f4f5)',
                border: '1px solid var(--adm-border, rgba(0, 0, 0, 0.08))',
                color: 'var(--adm-text, #374151)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              🌴 {t('ai.promptLeaves', 'Leaves Balance')}
            </button>
            <button
              onClick={() => handleSendMessage(t('ai.promptShift', 'What is today shift timing & late mark rule?'))}
              style={{
                fontSize: '0.72rem',
                padding: '5px 10px',
                borderRadius: '12px',
                background: 'var(--adm-bg, #f4f4f5)',
                border: '1px solid var(--adm-border, rgba(0, 0, 0, 0.08))',
                color: 'var(--adm-text, #374151)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              ⏰ {t('ai.promptShift', 'Shift & Late Mark')}
            </button>
            <button
              onClick={() => handleSendMessage(t('ai.promptTasks', 'Show my pending tasks'))}
              style={{
                fontSize: '0.72rem',
                padding: '5px 10px',
                borderRadius: '12px',
                background: 'var(--adm-bg, #f4f4f5)',
                border: '1px solid var(--adm-border, rgba(0, 0, 0, 0.08))',
                color: 'var(--adm-text, #374151)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              📋 {t('ai.promptTasks', 'My Tasks')}
            </button>
            <button
              onClick={() => handleSendMessage(t('ai.promptSalary', 'How is monthly payroll calculated?'))}
              style={{
                fontSize: '0.72rem',
                padding: '5px 10px',
                borderRadius: '12px',
                background: 'var(--adm-bg, #f4f4f5)',
                border: '1px solid var(--adm-border, rgba(0, 0, 0, 0.08))',
                color: 'var(--adm-text, #374151)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              💵 {t('ai.promptSalary', 'Payroll Rules')}
            </button>
            <button
              onClick={() => handleSendMessage(t('ai.promptManagement', 'Show Management Team contact details and executive directory'))}
              style={{
                fontSize: '0.72rem',
                padding: '5px 10px',
                borderRadius: '12px',
                background: 'var(--adm-bg, #f4f4f5)',
                border: '1px solid var(--adm-border, rgba(0, 0, 0, 0.08))',
                color: 'var(--adm-text, #374151)',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              👥 {t('ai.promptManagement', 'Management Team')}
            </button>
          </div>

          {/* Input Footer */}
          <div
            style={{
              padding: '10px 12px',
              background: 'var(--adm-surface, #ffffff)',
              borderTop: '1px solid var(--adm-border, rgba(0, 0, 0, 0.08))',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder={t('ai.askPlaceholder', 'Ask Copilot about leaves, shifts, policies, or tasks...')}
              style={{
                flex: 1,
                background: 'var(--adm-bg, #fafafa)',
                border: '1px solid var(--adm-border, rgba(0, 0, 0, 0.12))',
                borderRadius: '20px',
                padding: '8px 14px',
                fontSize: '0.82rem',
                color: 'var(--adm-text, #111827)',
                outline: 'none'
              }}
            />
            <button
              onClick={() => handleSendMessage()}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F66135 0%, #EA580C 100%)',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(246, 97, 53, 0.35)'
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
