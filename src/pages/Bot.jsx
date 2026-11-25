import { BOT_SUGGESTIONS } from '../data.js';

export default function Bot() {
  return (
    <section id="bot" className="page active" aria-labelledby="bot-title">
      <span className="eyebrow">a little help along the way</span>
      <h1 id="bot-title" className="page-title lesson-title">Agile Bot</h1>
      <p className="sub">Explore Agile, Scrum, Planning Poker and gamification with our educational chatbot, powered by BOTSchool.</p>
      <div className="bot-grid">
        <section className="card bot-guide" aria-labelledby="bot-guide-title">
          <span className="hand">Ask. Explore. Reflect.</span>
          <h2 id="bot-guide-title" className="card-title">Start a conversation</h2>
          <ol className="bot-steps">
            <li>Open the floating chat widget in the bottom-right corner of any page.</li>
            <li>Type a question, or copy one of the suggestions into the chat.</li>
            <li>Ask a follow-up for an example you can try with your team.</li>
          </ol>
          <p className="small">Using a keyboard? Tab to the chat launcher and press Enter to open it.</p>
          <p className="small">If the widget does not appear, check your connection and whether your browser blocks external chat content. You can keep exploring the <a href="#missions">learning missions</a>.</p>
        </section>
        <section className="card" aria-labelledby="bot-questions-title">
          <h2 id="bot-questions-title" className="card-title">Questions to explore</h2>
          <p>Choose a starting point for your next conversation:</p>
          <ul className="bot-questions">
            {BOT_SUGGESTIONS.map((question) => <li key={question}>{question}</li>)}
          </ul>
          <p className="small">Use the answers to support your learning and compare them with the course material and <a href="#sources">Sources &amp; references</a>.</p>
        </section>
      </div>
    </section>
  );
}
