/** Shared accessible link treatment for inline citations and the full bibliography. */
export default function ReferenceLink({ reference, children }) {
  return (
    <a className="reference-link" href={reference.url} target="_blank" rel="noopener noreferrer">
      {children ?? reference.shortCitation}
      {!children && <span className="sr-only">: {reference.title}</span>}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
