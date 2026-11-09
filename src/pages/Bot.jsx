import { useEffect, useRef, useState } from 'react';
import { BOT_SUGGESTIONS, botAnswer } from '../data.js';

/* Agile Bot: prototype with predefined answers. US-14 replaces botAnswer() with BOTSchool.ai. */
export default function Bot() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi! I'm Agile Bot. Ask me anything about Agile, Scrum or gamification." },
  ]);
  const [input, setInput] = useState('');
  const boxRef = useRef(null);

  useEffect(() => {
    const box = boxRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages]);

  const ask = (text) => {
    setMessages((m) => [...m, { from: 'user', text }, { from: 'bot', text: botAnswer(text) }]);
  };

  const send = (e) => {
    e.preventDefault();
    const v = input.trim();
    if (!v) return;
    setInput('');
    ask(v);
  };

  return (
    <section id="bot" className="page active" aria-labelledby="bot-title">
      <span className="eyebrow">ask the bot</span>
      <h1 id="bot-title" className="page-title lesson-title">Agile Bot</h1>
      <p className="sub">Ask questions about Agile, Scrum, Planning Poker and gamification.</p>
      <div className="chat-grid">
        <aside className="card" aria-label="Suggested questions">
          <strong>Suggested questions</strong>
          {BOT_SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => ask(s)}>{s}</button>
          ))}
          <p className="small" style={{ marginTop: 25 }}>Prototype bot: predefined answers, no API or backend required.</p>
        </aside>
        <div className="card chat">
          <div className="messages" ref={boxRef} role="log" aria-live="polite" aria-label="Chat messages">
            {messages.map((m, i) => (
              <div key={i} className={`bubble ${m.from}`}>{m.text}</div>
            ))}
          </div>
          <form className="chat-entry" onSubmit={send}>
            <label htmlFor="chatInput" className="sr-only">Your question</label>
            <input
              id="chatInput"
              placeholder="Ask a question about Agile or Scrum…"
              autoComplete="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="button">Send <span className="arrow" aria-hidden="true">→</span></button>
          </form>
        </div>
      </div>
    </section>
  );
}
