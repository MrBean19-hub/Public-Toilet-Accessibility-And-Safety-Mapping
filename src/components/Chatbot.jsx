import { useState, useRef, useEffect } from "react";
import "./components/Chatbot.css";

const CHAT_URL = "https://safestop-chat.sunnygupta192007.workers.dev";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Hi! I'm the SafeStop assistant. Ask me how to find a safe, clean or accessible toilet.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user", text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages([
        ...next,
        { role: "model", text: data.reply || data.error || "Something went wrong." },
      ]);
    } catch {
      setMessages([
        ...next,
        { role: "model", text: "I couldn't connect. Check your internet and try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        className="chat-fab"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close chat" : "Open chat assistant"}
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <section className="chat-panel" aria-label="SafeStop assistant">
          <header className="chat-head">SafeStop assistant</header>

          <div className="chat-body" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role === "user" ? "me" : "bot"}`}>
                {m.text}
              </div>
            ))}
            {loading && <div className="chat-msg bot">Typing…</div>}
            <div ref={endRef} />
          </div>

          <form className="chat-form" onSubmit={send}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about toilets, safety…"
              maxLength={500}
            />
            <button type="submit" disabled={loading}>Send</button>
          </form>
        </section>
      )}
    </>
  );
}
