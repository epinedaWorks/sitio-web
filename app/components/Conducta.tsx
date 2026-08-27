import { COC } from "../site-data";

export default function Conducta() {
  return (
    <section className="section-pad" id="conducta" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="coc reveal">
          <div className="coc-head">
            <span className="eyebrow">Código de conducta</span>
            <h2>Una comunidad inclusiva y respetuosa</h2>
            <p>
              Todas las personas afiliadas a Python Guatemala son inclusivas, consideradas y
              respetuosas. Estos valores construyen un ambiente positivo para todas y todos.
            </p>
          </div>
          <ul className="coc-list">
            {COC.map((c) => (
              <li key={c.b}>
                <b>{c.b}</b> {c.rest}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
