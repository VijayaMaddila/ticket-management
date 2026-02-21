import React, { useState, useRef, useEffect } from "react";
import "./index.css";
import { API_BASE_URL } from "../../src/config/api";

const ChatBot = () => {
  const isLoginPage =
    typeof window !== "undefined" &&
    /(^\/login\b|\/login$|\/auth\/login)/i.test(window.location.pathname);
  if (isLoginPage) return null;

  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [userId, setUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  // Read user info from localStorage
  useEffect(() => {
    const readUser = () => {
      try {
        const u = localStorage.getItem("user");
        if (!u) return setUserId(null);
        const parsed = JSON.parse(u);
        setUserId(parsed?.id ?? null);
      } catch {
        setUserId(null);
      }
    };
    readUser();
    const onStorage = (e) => {
      if (e.key === "user") readUser();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Show welcome message when user logs in
  useEffect(() => {
    if (!userId) {
      setMessages([]);
      return;
    }
    let userName = null;
    try {
      const u = localStorage.getItem("user");
      if (u) {
        const parsedUser = JSON.parse(u);
        userName = parsedUser?.name?.split(" ")[0] ?? null;
      }
    } catch {
      userName = null;
    }
    const welcomeMsg = {
      from: "bot",
      text: `Hi ${userName || "there"} — welcome to Segmento Resolve. How can I help you today?`,
      time: new Date().toISOString(),
    };
    setMessages([welcomeMsg]);
  }, [userId]);

  // Send user message to backend
  const sendMessage = async (text) => {
    if (!text) return;
    const trimmed = text.trim();

    let displayText = trimmed;
    let payload = trimmed;

    // Handle quick replies
    try {
      const normalizedKey = trimmed.replace(/^[\s\(]+|[\s\)\.\-\:]+$/g, "").toLowerCase();
      const latestBotMsg = [...messages].reverse().find((m) => m.from === "bot");
      const possibleReplies = extractQuickReplies(latestBotMsg?.text ?? "");
      if (possibleReplies?.length) {
        const match = possibleReplies.find((q) => String(q.key).toLowerCase() === normalizedKey);
        if (match) {
          displayText = `${match.key} — ${match.label}`;
          payload = String(match.key);
        }
      }
    } catch {
      displayText = trimmed;
      payload = trimmed;
    }

    let currentUserId = userId;
    try {
      const u = localStorage.getItem("user");
      if (u) {
        const parsed = JSON.parse(u);
        if (parsed?.id) currentUserId = parsed.id;
      }
    } catch {}

    if (!currentUserId) {
      setMessages((m) => [
        ...m,
        { from: "bot", text: "Please log in to use the chat.", time: new Date().toISOString() },
      ]);
      return;
    }

    const userMsg = { from: "user", text: displayText, time: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat?userId=${currentUserId}`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: payload,
      });

      if (!res.ok) throw new Error("Network response was not ok");

      const ct = res.headers.get("content-type") || "";
      let data;
      if (ct.includes("application/json")) {
        const json = await res.json();
        data = json.text ?? json.reply ?? JSON.stringify(json);
      } else {
        data = await res.text();
      }

      const botMsg = { from: "bot", text: data, time: new Date().toISOString() };
      setMessages((m) => [...m, botMsg]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { from: "bot", text: "Error: " + err.message, time: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input.trim());
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
  };

  const formatTime = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  // Quick replies extraction
  const extractQuickReplies = (text) => {
    if (!text) return [];
    const lines = text.split(/\r?\n/);
    const opts = [];
    for (const line of lines) {
      const m = line.trim().match(/^[\-\*\s]*([0-9]+|[A-Za-z])[\.\)\-]\s*(.+)/);
      if (m) opts.push({ key: m[1], label: m[2].trim() });
    }
    if (!opts.length) {
      const split = text.split(/(?:\r?\n|1\.|2\.|3\.)/).map((s) => s.trim()).filter(Boolean);
      split.forEach((s, i) => opts.push({ key: String(i + 1), label: s }));
    }
    return opts.slice(0, 5);
  };

  // Prepare quick replies for the latest bot message
  const latestBot = [...messages].reverse().find((m) => m.from === "bot");
  let quickReplies = extractQuickReplies(latestBot?.text ?? "");
  const structuredDetailsRegex = /(ticket\s*details|title:|status:|priority:|due\s*date:)/i;
  if (latestBot && structuredDetailsRegex.test(latestBot.text)) {
    quickReplies = [];
  } else {
    quickReplies = quickReplies.filter(
      (q) => typeof q.label === "string" && q.label.length <= 60 && !q.label.includes("\n")
    );
  }

  // Render
  return (
    <>
      <button
        className="chatbot-button"
        aria-label="Open chat"
        onClick={() => { setOpen((v) => !v); setMinimized(false); }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M21 6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3v3l4-3h6a2 2 0 0 0 2-2V6z" fill="#fff"/>
        </svg>
      </button>

      {open && (
        <div className="chat-window" role="dialog" aria-modal="true">
          <div className={`chat-header ${minimized ? "min" : ""}`}>
            <div className="chat-title-group">
              <div className="chat-title">Segmento Resolve</div>
              <div className="chat-subtitle">How can I help you today?</div>
            </div>
            <div className="chat-actions">
              <button className="chat-minimize" onClick={() => setMinimized((v) => !v)} aria-label="Minimize">—</button>
              <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
            </div>
          </div>

          {minimized ? (
            <div className="chat-minimized" onClick={() => setMinimized(false)}>
              Click to expand chat
            </div>
          ) : (
            <>
              <div className="chat-messages" ref={scrollRef}>
                {messages.length === 0 && (
                  <div className="message bot">
                    <div className="bot-row">
                      <div className="bot-avatar" aria-hidden>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="4" width="18" height="14" rx="3" fill="#0b74ff"/>
                          <circle cx="9" cy="10" r="1.4" fill="#fff"/>
                          <circle cx="15" cy="10" r="1.4" fill="#fff"/>
                          <path d="M8 15c1 1.2 3 1.2 4 0" stroke="#fff" strokeWidth="0.8" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="bot-content">
                        Send any text to start the conversation.
                        <div className="msg-time">{formatTime(new Date().toISOString())}</div>
                      </div>
                    </div>
                  </div>
                )}

                {messages.map((m, i) => (
                  <div key={i} className={`message ${m.from}`}>
                    {m.from === "bot" ? (
                      <div className="bot-row">
                        <div className="bot-avatar" aria-hidden>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="4" width="18" height="14" rx="3" fill="#0b74ff"/>
                            <circle cx="9" cy="10" r="1.4" fill="#fff"/>
                            <circle cx="15" cy="10" r="1.4" fill="#fff"/>
                            <path d="M8 15c1 1.2 3 1.2 4 0" stroke="#fff" strokeWidth="0.8" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <div className="bot-content">
                          {m.text.split("\n").map((line, idx) => (
                            <div key={idx} className="bot-text">{line}</div>
                          ))}
                          <div className="msg-time">{m.time ? formatTime(m.time) : ""}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="user-row">
                        <div className="user-text">{m.text}</div>
                        <div className="msg-time">{m.time ? formatTime(m.time) : ""}</div>
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="message bot typing">
                    <div className="bot-row">
                      <div className="bot-avatar" aria-hidden>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="4" width="18" height="14" rx="3" fill="#0b74ff"/>
                        </svg>
                      </div>
                      <div className="bot-content">
                        <div className="typing-dots" aria-hidden>
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {quickReplies?.length > 0 && (
                  <div className="quick-replies">
                    {quickReplies.map((q) => (
                      <button key={q.key} className="quick-reply" onClick={() => sendMessage(q.key)}>
                        {q.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="chat-input-row">
                <textarea
                  ref={textareaRef}
                  className="chat-input"
                  placeholder="Type a message or enter an option..."
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className="chat-send"
                  onClick={() => sendMessage(input.trim())}
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M2 21L23 12 2 3v7l15 2-15 2v7z" fill="#fff"/>
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBot;