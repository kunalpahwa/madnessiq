export default function Section({ id, eyebrow, title, children, right }) {
  return (
    <section id={id} className="section">
      <header className="section-head">
        <div>
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h2>{title}</h2>
        </div>
        {right && <div className="section-right">{right}</div>}
      </header>
      <div className="section-body">{children}</div>
    </section>
  )
}
