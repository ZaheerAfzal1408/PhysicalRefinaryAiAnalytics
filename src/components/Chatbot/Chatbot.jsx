import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CHATBOT_URL = 'https://n8n.srv800629.hstgr.cloud/webhook/12f82977-9c01-49a6-86a0-2b3a4aa88a86/chat';
const USER_ID = '2c93a101-2fd6-4889-816d-b0c0075ce2ff';

// ── Robot SVG icon ────────────────────────────────────────────────
const RobotIcon = ({ size = 28, color = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="32" y1="4" x2="32" y2="14" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <circle cx="32" cy="4" r="3" fill={color} />
    <rect x="14" y="14" width="36" height="26" rx="7" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2.5" />
    <circle cx="24" cy="26" r="4" fill={color} />
    <circle cx="40" cy="26" r="4" fill={color} />
    <circle cx="25" cy="25" r="1.5" fill="#4f46e5" />
    <circle cx="41" cy="25" r="1.5" fill="#4f46e5" />
    <rect x="23" y="33" width="18" height="3" rx="1.5" fill={color} fillOpacity="0.7" />
    <rect x="8" y="22" width="6" height="10" rx="3" fill={color} />
    <rect x="50" y="22" width="6" height="10" rx="3" fill={color} />
    <rect x="18" y="42" width="28" height="18" rx="6" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2.5" />
    <circle cx="26" cy="51" r="3" fill={color} fillOpacity="0.6" />
    <circle cx="38" cy="51" r="3" fill={color} fillOpacity="0.6" />
  </svg>
);

// ── Typing dots ───────────────────────────────────────────────────
const TypingDots = () => (
  <div className="flex gap-1 items-center py-1">
    {[0, 1, 2].map(i => (
      <div
        key={i}
        className="w-[7px] h-[7px] rounded-full bg-indigo-600 animate-typing-bounce"
        style={{ animationDelay: `${i * 0.2}s` }}
      />
    ))}
  </div>
);

// ── Single message bubble ─────────────────────────────────────────
const Message = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center shrink-0 mr-2 self-end">
          <RobotIcon size={16} color="#fff" />
        </div>
      )}
      <div className={`max-w-[75%] px-3.5 py-2.5 text-[13px] leading-relaxed font-medium whitespace-pre-wrap break-words ${isUser
        ? 'rounded-[18px_18px_4px_18px] bg-indigo-600 text-white'
        : 'rounded-[18px_18px_18px_4px] bg-slate-100 text-slate-900 shadow-sm'
        }`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
      </div>
    </div>
  );
};

// ── Text cleaner ──────────────────────────────────────────────────
const formatBotReply = (text) => {
  if (!text) return '';
  let cleaned = text;
  cleaned = cleaned.replace(/###\s*/g, '');
  cleaned = cleaned.replace(/\*\*/g, '');
  cleaned = cleaned.replace(
    /\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|/g,
    '• $1 → $2 | $3'
  );
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  return cleaned.trim();
};

// ── Chatbot ───────────────────────────────────────────────────────
const Chatbot = ({ rooms }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi! I'm your Tank AI assistant. Ask me anything about your ${rooms?.length || 0} monitored rooms and Tanks like anomalies, level_feets, alerts and more.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    try {
      const payload = {
        sessionId: USER_ID,
        chatInput: `${USER_ID}: ${text}`,
      };

      const res = await fetch(CHATBOT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const rawText = await res.text();
        try { data = JSON.parse(rawText); } catch { data = { output: rawText }; }
      }

      let raw = '';
      if (typeof data === 'string') {
        raw = data;
      } else if (Array.isArray(data)) {
        raw = data[0]?.output || data[0]?.text || data[0]?.message ||
          data[0]?.response || data[0]?.answer ||
          JSON.stringify(data[0]);
      } else if (typeof data === 'object' && data !== null) {
        raw = data.output || data.text || data.message ||
          data.response || data.answer || data.reply ||
          data.result || data.content ||
          data.json?.output || data.json?.text || data.json?.message ||
          JSON.stringify(data);
      }

      raw = String(raw || '').trim();

      const isDisclaimer =
        raw.toLowerCase().includes('before doing any query') ||
        raw.toLowerCase().includes('give user id within') ||
        (raw.toLowerCase().includes('user') && raw.toLowerCase().includes('disclaimer'));

      const reply = isDisclaimer
        ? `⚠️ n8n returned a disclaimer. Your user ID (${USER_ID}) may not be registered in the database. Check the "Get User IDs" SQL query in n8n.`
        : raw || '(Empty response from n8n)';

      setMessages(prev => [...prev, { role: 'assistant', content: formatBotReply(reply) }]);
      if (!open) setUnread(n => n + 1);

    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Request failed: ${err.message}`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const suggestions = [
    'Show me the status of Physical 4?',
    'What is the average level_feet?',
    'Is there any anomaly in Physical 1',
    'What is level of Physical 12?',
  ];

  const sendActive = Boolean(input.trim()) && !loading;

  return (
    <>
      {/* ── FAB Wrapper ── */}
      <div className="fixed bottom-7 right-7 z-[4000]">
        {!open && <div className="absolute inset-[-4px] rounded-full bg-indigo-600/35 animate-pulse-ring pointer-events-none" />}

        {unread > 0 && !open && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white z-[1]">
            {unread}
          </div>
        )}

        <button
          className="relative z-[1] width-[60px] height-[60px] w-[60px] h-[60px] rounded-full border-none bg-gradient-to-br from-indigo-600 to-violet-600 cursor-pointer flex items-center justify-center shadow-[0_4px_20px_rgba(79,70,229,0.4)] transition-all duration-200 hover:scale-[1.08] hover:shadow-[0_8px_32px_rgba(79,70,229,0.5)] active:scale-[0.96] animate-fab-pop"
          onClick={() => setOpen(o => !o)}
          title="Tank AI Assistant"
        >
          {open
            ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            : <RobotIcon size={32} color="#fff" />
          }
        </button>
      </div>

      {/* ── Chat panel ── */}
      {open && (
        <div className="fixed bottom-[104px] right-7 z-[3999] w-[380px] max-w-[calc(100vw-56px)] h-[560px] max-h-[calc(100vh-140px)] bg-white rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden border border-slate-200 animate-chat-slide-up">

          {/* Header */}
          <div className="p-[14px_18px] bg-slate-900 flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shrink-0">
              <RobotIcon size={24} color="#fff" />
            </div>
            <div>
              <div className="text-[13px] font-black text-slate-50">Tank Assistant</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] color-slate-400 text-slate-400 font-bold uppercase tracking-wider">Online · n8n powered</span>
              </div>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-[16px_14px_8px] bg-slate-50/50">
            {messages.map((msg, i) => <Message key={i} msg={msg} />)}

            {loading && (
              <div className="flex mb-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center shrink-0 mr-2 self-end">
                  <RobotIcon size={16} color="#fff" />
                </div>
                <div className="bg-slate-100 rounded-[18px_18px_18px_4px] px-3.5 py-2.5 shadow-sm">
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="px-3 pb-3 flex gap-1.5 flex-wrap bg-slate-50/50">
              {suggestions.map(s => (
                <button
                  key={s}
                  className="px-2.5 py-1.5 rounded-full text-[11px] font-bold bg-white border border-slate-200 text-indigo-600 cursor-pointer transition-colors duration-200 hover:bg-indigo-600 hover:text-white"
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input row */}
          <div className="p-[10px_12px] border-t border-slate-200 flex gap-2 items-end bg-white shrink-0">
            <textarea
              ref={inputRef}
              className="flex-1 resize-none border-1.5 border-slate-200 focus:border-indigo-600 rounded-[14px] p-[9px_14px] text-[13px] outline-none leading-relaxed bg-slate-50 text-slate-900 max-height-[100px] transition-colors"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about your tanks…"
              rows={1}
            />
            <button
              className={`w-[38px] h-[38px] rounded-full border-none flex items-center justify-center shrink-0 transition-all duration-200 ${sendActive
                ? 'bg-indigo-600 text-white cursor-pointer shadow-md'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              onClick={sendMessage}
              disabled={!sendActive}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
