import { SOCIALS } from "../site-data";

export default function Unete() {
  return (
    <section className="section-pad" id="unete" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="section-head center reveal">
          <span className="eyebrow">Únete</span>
          <h2>Sé parte de Python Guatemala</h2>
          <p>
            Seguinos en nuestras redes para no perderte charlas, talleres y el próximo Python
            Exposition Day. Entrar es gratis y siempre hay espacio para uno más.
          </p>
        </div>
        <div className="join-grid">
          {SOCIALS.map((s, i) => (
            <a
              className={`social-card reveal${i % 3 === 1 ? " d1" : i % 3 === 2 ? " d2" : ""}`}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              key={s.label}
            >
              <span className="si">{s.icon}</span>
              <div>
                <b>{s.label}</b>
                <span>{s.handle}</span>
              </div>
            </a>
          ))}
          <a className="social-card reveal js-inscribir" href="#eventos">
            <span className="si">🎟️</span>
            <div>
              <b>Inscríbete al XPDay 2026</b>
              <span>Sábado 3 de octubre · UVG</span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
