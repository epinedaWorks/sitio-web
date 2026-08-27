import { FEATURES, STATS } from "../site-data";

export default function Comunidad() {
  return (
    <section className="section-pad" id="comunidad">
      <div className="container">
        <div className="about-grid reveal">
          <div className="about-logo">
            <img
              src="/assets/img/brand/logo-full.png"
              alt="Comunidad Python Guatemala"
              loading="lazy"
            />
          </div>
          <div className="about-text">
            <span className="eyebrow">Quiénes somos</span>
            <h2>Una comunidad que crece con cada línea de código</h2>
            <p>
              La Comunidad de Python Guatemala es un grupo activo que promueve el aprendizaje y uso
              de Python y tecnologías relacionadas:{" "}
              <b>inteligencia artificial, ciencia de datos, IoT y desarrollo web</b>. Somos una
              comunidad joven y en crecimiento continuo, que conecta a estudiantes, profesionales y
              empresas del sector tecnológico.
            </p>
            <p>
              Estamos <b>registrados oficialmente en la Python Software Foundation</b> y hemos
              llevado la bandera de Guatemala a eventos de Python en México, Costa Rica, Estados
              Unidos (PyCon US), Colombia y Panamá.
            </p>
          </div>
        </div>

        <div className="features">
          {FEATURES.map((f, i) => (
            <div className={`card reveal${i % 3 === 1 ? " d1" : i % 3 === 2 ? " d2" : ""}`} key={f.title}>
              <div className="ico">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>

        <div className="stats reveal">
          {STATS.map((s) => (
            <div className="stat" key={s.label}>
              <b className="gradient-text" data-count={s.count} data-suffix={s.suffix}>
                0
              </b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
