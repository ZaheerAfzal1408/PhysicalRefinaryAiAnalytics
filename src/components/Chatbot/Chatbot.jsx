import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Chatbot.css';

const CHATBOT_URL = 'https://n8n.srv800629.hstgr.cloud/webhook/12f82977-9c01-49a6-86a0-2b3a4aa88a86/chat';
const USER_ID = 'ad7103e4-9595-4000-a56a-8f650e3eddef';

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
  <div className="chatbot-typing-dots">
    {[0, 1, 2].map(i => (
      <div
        key={i}
        className="chatbot-typing-dot"
        style={{ animationDelay: `${i * 0.2}s` }}
      />
    ))}
  </div>
);

// ── Single message bubble ─────────────────────────────────────────
const Message = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`chatbot-message chatbot-message--${isUser ? 'user' : 'bot'}`}>
      {!isUser && (
        <div className="chatbot-message__avatar">
          <RobotIcon size={16} color="#fff" />
        </div>
      )}
      <div className={`chatbot-message__bubble chatbot-message__bubble--${isUser ? 'user' : 'bot'}`}>
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
    { role: 'assistant', content: `Hi! I'm your ColdRoom AI assistant. Ask me anything about your ${rooms?.length || 0} monitored rooms — anomalies, temperatures, alerts and more.` }
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

      console.log('[Chatbot] Sending payload:', JSON.stringify(payload));

      const res = await fetch(CHATBOT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('[Chatbot] Response status:', res.status, res.statusText);

      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const rawText = await res.text();
        console.log('[Chatbot] Non-JSON response:', rawText);
        try { data = JSON.parse(rawText); } catch { data = { output: rawText }; }
      }

      console.log('[Chatbot] Response data:', JSON.stringify(data));

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
      console.log('[Chatbot] Extracted reply:', raw);

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
      console.error('[Chatbot] Error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Request failed: ${err.message}\n\nCheck browser console (F12) for details.`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const suggestions = [
    'Show me the status of Coldroom 4?',
    'What is the average temperature?',
    'Is there any anomaly in coldroom 1',
    'What is Temperature of coldroom 5?',
  ];

  const sendActive = Boolean(input.trim()) && !loading;

  return (
    <>
      {/* ── FAB ── */}
      <div className="chatbot-fab-wrap">
        {!open && <div className="chatbot-pulse-ring" />}

        {unread > 0 && !open && (
          <div className="chatbot-unread-badge">{unread}</div>
        )}

        <button
          className="chatbot-fab"
          onClick={() => setOpen(o => !o)}
          title="ColdRoom AI Assistant"
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
        <div className="chatbot-panel">

          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header__avatar">
              <RobotIcon size={24} color="#fff" />
            </div>
            <div>
              <div className="chatbot-header__name">ColdRoom Assistant</div>
              <div className="chatbot-header__status">
                <div className="chatbot-header__status-dot" />
                <span className="chatbot-header__status-text">Online · n8n powered</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, i) => <Message key={i} msg={msg} />)}

            {loading && (
              <div className="chatbot-typing-row">
                <div className="chatbot-message__avatar">
                  <RobotIcon size={16} color="#fff" />
                </div>
                <div className="chatbot-typing-bubble">
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="chatbot-suggestions">
              {suggestions.map(s => (
                <button
                  key={s}
                  className="chatbot-suggestion-btn"
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chatbot-input-row">
            <textarea
              ref={inputRef}
              className="chatbot-textarea"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about your cold rooms…"
              rows={1}
            />
            <button
              className={`chatbot-send-btn ${sendActive ? 'chatbot-send-btn--active' : 'chatbot-send-btn--disabled'}`}
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
