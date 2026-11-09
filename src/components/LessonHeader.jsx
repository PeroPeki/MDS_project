import { useApp } from '../App.jsx';

/** "Back to missions" link, handwritten label and the page title of a mission page. */
export default function LessonHeader({ id, label, title }) {
  const { go } = useApp();
  return (
    <>
      <button className="back" onClick={() => go('missions')}>
        <span aria-hidden="true">←</span> Back to missions
      </button>
      <span className="eyebrow">{label}</span>
      <h1 id={id} className="page-title lesson-title">{title}</h1>
    </>
  );
}
