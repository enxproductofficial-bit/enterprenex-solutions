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

  // Initial greeting based on active language
  const getGreeting = () => {
    const name = currentUser?.name || 'Colleague';
    if (language === 'hi') {
      return `नमस्ते **${name}**! मैं एंटरप्रेनेक्स EWMS एआई कोपायलट हूँ। मैं आपकी छुट्टियों, शिफ्ट के नियमों, लंबित कार्यों, वेतन गणना और कंपनी नीतियों में कैसे सहायता कर सकता हूँ?`;
    }
    if (language === 'mr') {
      return `नमस्कार **${name}**! मी एंटरप्रेनेक्स EWMS एआय कोपायलट आहे. मी तुम्हाला सुट्ट्या, कामाच्या वेळा, प्रलंबित कार्ये, वेतन गणना आणि कंपनीच्या नियमांबद्दल कशी मदत करू शकतो?`;
    }
    return `Hello **${name}**! I am your **Enterprenex EWMS AI Copilot**. How can I assist you with your leave balances, shift rules, assigned tasks, payroll calculations, or corporate compliance policies today?`;
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
      if (prev.length === 1 && prev[0].id === 'init-1') {
        return [{
          id: 'init-1',
          sender: 'assistant',
          text: getGreeting(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }];
      }
      return prev;
    });
  }, [language, currentUser?.name]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Knowledge Engine Generator
  const generateAiResponse = (query: string): string => {
    const q = query.toLowerCase();

    // 1. Leave Balances Inquiry
    if (q.includes('leave') || q.includes('holiday') || q.includes('vacation') || q.includes('सुट्टी') || q.includes('छुट्टी')) {
      const userLeaves = leaves.filter(l => l.employeeName?.toLowerCase() === currentUser?.name?.toLowerCase());
      const approvedCount = userLeaves.filter(l => l.status === 'Approved').length;
      const pendingCount = userLeaves.filter(l => l.status === 'Pending').length;

      if (language === 'hi') {
        return `📊 **आपकी अवकाश (Leave) स्थिति:**\n\n` +
          `• **आकस्मिक अवकाश (Casual Leave - CL):** 12 दिन प्रति वर्ष (शेष: ~${Math.max(0, 12 - approvedCount)} दिन)\n` +
          `• **चिकित्सा अवकाश (Sick Leave - SL):** 8 दिन प्रति वर्ष\n` +
          `• **अर्जित अवकाश (Earned Leave - EL):** 15 दिन प्रति वर्ष (10 दिन तक अगले वर्ष अग्रसारित)\n` +
          `• **प्रलंबित आवेदन:** ${pendingCount} आवेदन अनुमोदन हेतु प्रतीक्षारत\n\n` +
          `*नोट: 3 दिन से अधिक बीमारी अवकाश के लिए अधिकृत चिकित्सा प्रमाणपत्र अनिवार्य है (नीति: EPX-POL-002)।*`;
      }
      if (language === 'mr') {
        return `📊 **तुमची रजा (Leave) स्थिती:**\n\n` +
          `• **किरकोळ रजा (Casual Leave - CL):** वर्षाला १२ दिवस (शिल्लक: ~${Math.max(0, 12 - approvedCount)} दिवस)\n` +
          `• **वैद्यकीय रजा (Sick Leave - SL):** वर्षाला ८ दिवस\n` +
          `• **हक्काची रजा (Earned Leave - EL):** वर्षाला १५ दिवस\n` +
          `• **प्रलंबित अर्ज:** ${pendingCount} अर्ज मंजुरीच्या प्रतीक्षेत\n\n` +
          `*टीप: ३ दिवसांपेक्षा जास्त आजारपणाच्या रजेसाठी वैद्यकीय प्रमाणपत्र आवश्यक आहे (धोरण: EPX-POL-002).*`;
      }
      return `📊 **Your Statutory Leave Balances (Annual Allotment):**\n\n` +
        `• **Casual Leave (CL):** 12 Days / year (Available: ~${Math.max(0, 12 - approvedCount)} days)\n` +
        `• **Sick / Medical Leave (SL):** 8 Days / year\n` +
        `• **Earned / Annual Leave (EL):** 15 Days / year (Max 10 days carry forward)\n` +
        `• **Pending Leave Applications:** ${pendingCount} pending Manager/HR review\n\n` +
        `*Policy Reference: EPX-POL-002 (Maharashtra Shops & Establishments Act).*`;
    }

    // 2. Shift timing, late marks, attendance
    if (q.includes('shift') || q.includes('timing') || q.includes('late') || q.includes('attendance') || q.includes('हजेरी') || q.includes('उपस्थिति') || q.includes('समय')) {
      const todayRecord = attendance.find(a => a.employeeName?.toLowerCase() === currentUser?.name?.toLowerCase());

      if (language === 'hi') {
        return `⏰ **शिफ्ट समय एवं लेट मार्क नीति (EPX-POL-002):**\n\n` +
          `• **आधिकारिक समय:** प्रातः 09:30 AM से सायं 06:30 PM IST (कुल 9 घंटे)\n` +
          `• **लेट मार्क नियम:** प्रातः 09:30 AM के बाद चेक-इन स्वतः लेट मार्क में दर्ज होता है।\n` +
          `• **हाफ-डे नियम:** 4 से 5 घंटे की कार्य अवधि को हाफ-डे गिना जाता है। 4 घंटे से कम को अनुपस्थित माना जाता है।\n` +
          `• **आज की स्थिति:** ${todayRecord ? `चेक-इन: ${todayRecord.checkIn || '-'} (${todayRecord.status})` : 'आज अभी तक चेक-इन दर्ज नहीं हुआ है।'}`;
      }
      if (language === 'mr') {
        return `⏰ **कामाची वेळ आणि लेट मार्क धोरण (EPX-POL-002):**\n\n` +
          `• **अधिकृत वेळ:** सकाळी ०९:३० ते संध्याकाळी ०६:३० IST (एकूण ९ तास)\n` +
          `• **लेट मार्क:** सकाळी ०९:३० नंतर हजेरी लावल्यास लेट मार्क नोंदवला जातो.\n` +
          `• **हाफ-डे नियम:** ४ ते ५ तास काम केल्यास अर्धा दिवस धरला जातो. ४ तासांपेक्षा कमी असल्यास गैरहजर धरले जाते.\n` +
          `• **आजची हजेरी:** ${todayRecord ? `चेक-इन: ${todayRecord.checkIn || '-'} (${todayRecord.status})` : 'आज अजून चेक-इन केलेले नाही.'}`;
      }
      return `⏰ **Shift Timing & Attendance Regulations (EPX-POL-002):**\n\n` +
        `• **Official Working Hours:** 09:30 AM – 06:30 PM IST (9 Hours incl. lunch break)\n` +
        `• **Late Mark Threshold:** Check-in after 09:30 AM automatically triggers a Late Mark.\n` +
        `• **Half-Day Rule:** 4.0 to 5.0 hours duration is recorded as Half-Day. Less than 4 hours is logged as Absent.\n` +
        `• **Your Today's Status:** ${todayRecord ? `Logged at ${todayRecord.checkIn || '-'} (${todayRecord.status})` : 'No punch-in recorded yet today.'}`;
    }

    // 3. Pending tasks
    if (q.includes('task') || q.includes('work') || q.includes('sprint') || q.includes('कार्य') || q.includes('काम') || q.includes('प्रकल्प')) {
      const myAssignedTasks = tasks.filter(t => 
        (t.assignedTo || '').toLowerCase().includes((currentUser?.name || '').toLowerCase()) ||
        (currentUser?.employeeId && (t.assignedTo || '').includes(currentUser.employeeId))
      );
      const pendingTasks = myAssignedTasks.filter(t => t.status !== 'Done');

      if (pendingTasks.length === 0) {
        return language === 'hi'
          ? `🎉 बहुत बढ़िया! आपके पास वर्तमान में कोई अधूरा कार्य नहीं है। सभी कार्य पूर्ण हैं!`
          : language === 'mr'
          ? `🎉 अभिनंदन! तुमच्याकडे सध्या कोणतेही प्रलंबित काम नाही. सर्व कामे पूर्ण झाली आहेत!`
          : `🎉 Excellent! You have **0 pending tasks** right now. All your assigned deliverables are up to date!`;
      }

      const list = pendingTasks.slice(0, 3).map(t => `• **${t.title}** (${t.status}) - अंतिम तिथि: ${t.dueDate}`).join('\n');
      return `📋 **आपके सक्रिय कार्य (${pendingTasks.length} कुल):**\n\n${list}\n\n*कार्य शुरू करने पर स्प्रिंट स्टॉपवॉच (Live Stopwatch) चालू करना न भूलें!*`;
    }

    // 4. Statutory Company Info: GSTIN, CIN, Office
    if (q.includes('gstin') || q.includes('cin') || q.includes('company') || q.includes('office') || q.includes('कंपनी') || q.includes('जीएसटी')) {
      return `🏛️ **Enterprenex Solutions Private Limited (Corporate Registry):**\n\n` +
        `• **Corporate Identification Number (CIN):** U72900PN2023PTC221940\n` +
        `• **GSTIN:** 27AAACB2212P1ZX (Maharashtra, State Code 27)\n` +
        `• **Managing Director:** Rohit Pawar\n` +
        `• **Registered Domain:** https://enterprenexsolution.com\n` +
        `• **Compliance Classification:** Private Limited Company (Incorporated under Companies Act 2013).`;
    }

    // 5. POSH / Grievance Redressal
    if (q.includes('posh') || q.includes('harassment') || q.includes('grievance') || q.includes('complaint') || q.includes('तक्रार')) {
      return `🛡️ **Internal Complaints Committee (ICC) & POSH Policy (EPX-POL-004):**\n\n` +
        `Enterprenex Solutions maintains strict zero tolerance towards workplace harassment, discrimination, or hostile conduct.\n\n` +
        `• **Dedicated Grievance Email:** \`posh@enterprenex.solutions\`\n` +
        `• **Investigation Timeline:** Statutory resolution completed confidentially within 90 days.\n` +
        `• **Anti-Retaliation Guarantee:** Whistleblowers and complainants are legally protected under corporate governance protocols.`;
    }

    // 6. Payroll & Salary Formula
    if (q.includes('salary') || q.includes('payroll') || q.includes('payslip') || q.includes('pf') || q.includes('वेतन') || q.includes('पगार')) {
      return `💵 **Statutory Indian Payroll Formula (Rule-Based):**\n\n` +
        `• **Basic Salary:** 50% of Monthly Gross CTC\n` +
        `• **House Rent Allowance (HRA):** 30% of Monthly Gross CTC\n` +
        `• **Special Allowance:** 20% of Monthly Gross CTC\n` +
        `• **Provident Fund (EPF):** 12% of Basic Salary (Statutory Employee Contribution)\n` +
        `• **Professional Tax (PT):** ₹200 flat (Maharashtra State Regulation)\n` +
        `• **TDS:** Deducted as per applicable Income Tax slab if CTC exceeds annual tax threshold.\n\n` +
        `*आप फाइनेंस या टीम पेज से अपना डिजिटल पे-स्लिप एवं फॉर्म 16 पार्ट B डाउनलोड कर सकते हैं।*`;
    }

    // Default Fallback
    if (language === 'hi') {
      return `मैं आपकी सहायता के लिए तैयार हूँ! आप मुझसे निम्न विषयों पर पूछ सकते हैं:\n\n` +
        `1. "मेरे पास कितनी छुट्टियां शेष हैं?"\n` +
        `2. "आज का शिफ्ट समय और लेट मार्क नियम क्या है?"\n` +
        `3. "मेरे लंबित कार्य दिखाएं"\n` +
        `4. "कंपनी का GSTIN और CIN नंबर क्या है?"\n` +
        `5. "POSH या शिकायत निवारण के लिए किसे संपर्क करें?"\n` +
        `6. "मासिक वेतन की गणना कैसे होती है?"`;
    }
    if (language === 'mr') {
      return `मी मदतीसाठी तयार आहे! तुम्ही मला पुढील गोष्टींबद्दल विचारू शकता:\n\n` +
        `1. "माझ्याकडे किती सुट्ट्या शिल्लक आहेत?"\n` +
        `2. "कामाची वेळ आणि लेट मार्क नियम काय आहे?"\n` +
        `3. "माझी प्रलंबित कामे दाखवा"\n` +
        `4. "कंपनीचा GSTIN आणि CIN क्रमांक काय आहे?"\n` +
        `5. "POSH किंवा अंतर्गत तक्रारीसाठी कोणाशी संपर्क साधावा?"\n` +
        `6. "मासिक पगाराची गणना कशी केली जाते?"`;
    }
    return `I am here to assist you with Enterprise EWMS operations! You can ask me:\n\n` +
      `1. *"How many leaves do I have left?"*\n` +
      `2. *"What is today's shift timing and late mark threshold?"*\n` +
      `3. *"Show my pending sprint deliverables"*\n` +
      `4. *"What is Enterprenex's registered GSTIN and CIN?"*\n` +
      `5. *"How do I report a POSH grievance?"*\n` +
      `6. *"How is monthly salary & PF calculated?"*`;
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
    }, 450);
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
            border: '2px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 10px 25px rgba(246, 97, 53, 0.45)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.9rem',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            backdropFilter: 'blur(10px)'
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

      {/* ── FLOATING CHAT DIALOG WINDOW ── */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: isExpanded ? '540px' : '380px',
            height: isExpanded ? '650px' : '520px',
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: 'calc(100vh - 48px)',
            zIndex: 10000,
            background: 'var(--adm-surface, #111827)',
            border: '1px solid var(--adm-border, rgba(255, 255, 255, 0.12))',
            borderRadius: '16px',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(246, 97, 53, 0.25)',
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
              background: 'linear-gradient(135deg, rgba(246, 97, 53, 0.15) 0%, rgba(17, 24, 39, 0.95) 100%)',
              borderBottom: '1px solid var(--adm-border, rgba(255, 255, 255, 0.1))',
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
                  color: '#ffffff'
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>
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
                <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim, #94a3b8)' }}>
                  {currentUser?.name} • {currentUser?.role}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--adm-text-dim, #94a3b8)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
              <button
                onClick={() => setMessages([{ id: 'init-1', sender: 'assistant', text: getGreeting(), timestamp: 'Just now' }])}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--adm-text-dim, #94a3b8)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                title="Clear Chat History"
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                title="Close"
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
              gap: '12px'
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
                      background: 'var(--adm-primary-soft, rgba(246, 97, 53, 0.15))',
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
                    background: msg.sender === 'user' ? 'linear-gradient(135deg, #F66135 0%, #EA580C 100%)' : 'var(--adm-surface-hover, #1e293b)',
                    color: '#ffffff',
                    padding: '10px 14px',
                    borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    fontSize: '0.82rem',
                    lineHeight: '1.5',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--adm-border, rgba(255, 255, 255, 0.08))',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {msg.text}
                  <div
                    style={{
                      fontSize: '0.65rem',
                      color: msg.sender === 'user' ? 'rgba(255, 255, 255, 0.7)' : 'var(--adm-text-dim, #64748b)',
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
                    background: 'var(--adm-primary-soft, rgba(246, 97, 53, 0.15))',
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
                    background: 'var(--adm-surface-hover, #1e293b)',
                    padding: '8px 14px',
                    borderRadius: '14px',
                    fontSize: '0.78rem',
                    color: 'var(--adm-text-dim, #94a3b8)',
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
              background: 'var(--adm-bg, #0B0F19)',
              borderTop: '1px solid var(--adm-border, rgba(255, 255, 255, 0.08))',
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
                padding: '4px 8px',
                borderRadius: '12px',
                background: 'var(--adm-surface, #1e293b)',
                border: '1px solid var(--adm-border, rgba(255, 255, 255, 0.1))',
                color: 'var(--adm-text-muted, #94a3b8)',
                cursor: 'pointer'
              }}
            >
              🌴 {t('ai.promptLeaves', 'Leaves Balance')}
            </button>
            <button
              onClick={() => handleSendMessage(t('ai.promptShift', 'What is today shift timing & late mark rule?'))}
              style={{
                fontSize: '0.72rem',
                padding: '4px 8px',
                borderRadius: '12px',
                background: 'var(--adm-surface, #1e293b)',
                border: '1px solid var(--adm-border, rgba(255, 255, 255, 0.1))',
                color: 'var(--adm-text-muted, #94a3b8)',
                cursor: 'pointer'
              }}
            >
              ⏰ {t('ai.promptShift', 'Shift & Late Mark')}
            </button>
            <button
              onClick={() => handleSendMessage(t('ai.promptTasks', 'Show my pending tasks'))}
              style={{
                fontSize: '0.72rem',
                padding: '4px 8px',
                borderRadius: '12px',
                background: 'var(--adm-surface, #1e293b)',
                border: '1px solid var(--adm-border, rgba(255, 255, 255, 0.1))',
                color: 'var(--adm-text-muted, #94a3b8)',
                cursor: 'pointer'
              }}
            >
              📋 {t('ai.promptTasks', 'My Tasks')}
            </button>
            <button
              onClick={() => handleSendMessage(t('ai.promptSalary', 'How is monthly payroll calculated?'))}
              style={{
                fontSize: '0.72rem',
                padding: '4px 8px',
                borderRadius: '12px',
                background: 'var(--adm-surface, #1e293b)',
                border: '1px solid var(--adm-border, rgba(255, 255, 255, 0.1))',
                color: 'var(--adm-text-muted, #94a3b8)',
                cursor: 'pointer'
              }}
            >
              💵 {t('ai.promptSalary', 'Payroll Rules')}
            </button>
          </div>

          {/* Input Footer */}
          <div
            style={{
              padding: '10px 12px',
              background: 'var(--adm-surface, #111827)',
              borderTop: '1px solid var(--adm-border, rgba(255, 255, 255, 0.1))',
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
                background: 'var(--adm-bg, #0B0F19)',
                border: '1px solid var(--adm-border, rgba(255, 255, 255, 0.15))',
                borderRadius: '20px',
                padding: '8px 14px',
                fontSize: '0.82rem',
                color: '#ffffff',
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
                flexShrink: 0
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
