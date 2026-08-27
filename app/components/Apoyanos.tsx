export default function Apoyanos() {
  return (
    <section className="section-pad" id="apoyanos" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="section-head center reveal">
          <span className="eyebrow">Apóyanos</span>
          <h2>Sé aliado de la comunidad</h2>
          <p>
            Buscamos alianzas para acercar a más personas a las tendencias y herramientas
            tecnológicas más recientes, mediante actividades prácticas y conferencias de alto nivel.
          </p>
        </div>
        <div className="sponsor-grid">
          <div className="sponsor-col reveal">
            <h3>¿Cómo apoyarnos?</h3>
            <p className="muted">
              Buscamos un lugar y recursos para realizar talleres, conferencias y charlas breves para
              la comunidad:
            </p>
            <ul className="check-list">
              <li>🏛️ <b>Espacio físico</b> — auditorio, salón de reuniones o coworking.</li>
              <li>🔌 <b>Apoyo logístico</b> — equipo de proyección, audio e internet.</li>
              <li>🏷️ <b>Co-branding</b> — tu logo como aliado de la comunidad en las charlas.</li>
              <li>☕ <b>Refacción</b> — café, galletas o refrigerio para asistentes.</li>
            </ul>
          </div>
          <div className="sponsor-col highlight reveal d1">
            <h3>Lo que ofrecemos</h3>
            <ul className="check-list">
              <li>🎯 <b>Acceso a talento</b> — estudiantes, profesionales y entusiastas de la tecnología.</li>
              <li>📣 <b>Visibilidad</b> — presencia de tu marca en charlas, talleres y redes sociales.</li>
              <li>🤝 <b>Colaboración</b> — propón temas y participa en las actividades.</li>
              <li>🌱 <b>Proyección social</b> — apoyo al desarrollo tecnológico y educativo del país.</li>
              <li>🔗 <b>Networking</b> — contacto con líderes, expertos y futuros colaboradores.</li>
            </ul>
            <a className="btn btn-primary js-contacto" href="#apoyanos">
              Conviértete en aliado →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
