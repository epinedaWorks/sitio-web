export default function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="container hero-grid">
        <div className="hero-text reveal">
          <span className="eyebrow">🐍 Comunidad de Python en Guatemala</span>
          <h1>
            Donde la comunidad <span className="gradient-text">Python</span> de Guatemala se encuentra
          </h1>
          <p className="lead">
            Somos desarrolladores, estudiantes y entusiastas que compartimos, aprendemos y
            construimos con Python. Conferencias, talleres y exposición de proyectos, en un solo
            lugar.
          </p>
          <div className="hero-cta">
            <a className="btn btn-primary js-inscribir" href="#eventos">
              Inscríbete al Python eXposition Day 2026 →
            </a>
            <a className="btn btn-ghost" href="#eventos">
              Ver eventos
            </a>
          </div>
          <div className="hero-trust reveal d1">
            <span className="dot" /> Comunidad registrada oficialmente en la{" "}
            <b>Python Software Foundation</b>
          </div>
          <div className="hero-meta">
            <div>
              <strong>+300</strong>asistentes en 2025
            </div>
            <div>
              <strong>5</strong>países con presencia
            </div>
            <div>
              <strong>100%</strong>gratuito y abierto
            </div>
          </div>
        </div>

        <div className="hero-visual reveal d2">
          <div className="code-card">
            <div className="code-head">
              <i />
              <i />
              <i />
              <span>comunidad.py</span>
            </div>
            <div className="code-body">
              <span className="ln">
                <span className="tk-kw">class</span> <span className="tk-fn">PythonGuatemala</span>:
              </span>
              <span className="ln">
                {"    "}
                <span className="tk-var">mision</span> = <span className="tk-str">&quot;aprender juntos&quot;</span>
              </span>
              <span className="ln">
                {"    "}
                <span className="tk-var">valores</span> = [<span className="tk-str">&quot;comunidad&quot;</span>,{" "}
                <span className="tk-str">&quot;código&quot;</span>]
              </span>
              <span className="ln"> </span>
              <span className="ln">
                {"    "}
                <span className="tk-kw">def</span> <span className="tk-fn">unirse</span>(
                <span className="tk-var">self</span>, tú):
              </span>
              <span className="ln">
                {"        "}
                <span className="tk-cm"># siempre hay espacio 🐍</span>
              </span>
              <span className="ln">
                {"        "}
                <span className="tk-kw">return</span> <span className="tk-str">&quot;¡bienvenid@!&quot;</span>
              </span>
            </div>
          </div>
          <div className="chip chip-1">🇬🇹 Hecho en Guatemala</div>
          <div className="chip chip-3">🐍 100% gratis y abierto</div>
        </div>
      </div>
    </section>
  );
}
