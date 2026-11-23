import { REFERENCES } from '../references.js';
import ReferenceLink from '../components/ReferenceLink.jsx';

export default function Sources() {
  return (
    <section id="sources" className="page active sources-page" aria-labelledby="sources-title">
      <span className="eyebrow">research & reading</span>
      <h1 id="sources-title" className="page-title lesson-title">Sources & references</h1>
      <p className="sub">Explore the research and practical guides behind Sprint Quest’s learning materials. All source links open in a new tab.</p>
      <ol className="references-list" aria-label="References">
        {REFERENCES.map((reference) => (
          <li key={reference.id} id={'reference-' + reference.id}>
            <ReferenceLink reference={reference}>
              {reference.authors} ({reference.year}). <cite>{reference.title}{/[.!?]$/.test(reference.title) ? '' : '.'}</cite>
              {reference.publication && ' ' + reference.publication + '.'}
            </ReferenceLink>
          </li>
        ))}
      </ol>
    </section>
  );
}
