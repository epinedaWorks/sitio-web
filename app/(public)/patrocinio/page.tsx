import type { Metadata } from "next";
import { SPONSOR_TIERS } from "@/app/site-data";

// Página NO enlazada desde el sitio y fuera de los buscadores.
// Solo la ve quien reciba el link.
export const metadata: Metadata = {
  title: "Niveles de patrocinio",
  description: "Niveles de patrocinio del Python eXposition Day 2026 — Comunidad Python Guatemala.",
  robots: { index: false, follow: false },
};

export default function PatrocinioPage() {
  return (
    <main>
      <section className="section-pad" style={{ paddingTop: 140 }}>
        <div className="container">
          <div className="section-head center reveal">
            <span className="eyebrow">Sé aliado de la comunidad</span>
            <h1 style={{ fontSize: "clamp(2rem, 4.6vw, 3.4rem)", margin: "18px 0 14px" }}>
              Niveles de patrocinio
            </h1>
            <p style={{ color: "var(--soft)" }}>
              Actualmente contamos con 3 niveles para acompañar el <b>Python eXposition Day 2026</b>.
              Los beneficios son acumulativos: cada nivel incluye todo lo del anterior.
            </p>
          </div>

          <div className="tier-grid">
            {SPONSOR_TIERS.map((t) => (
              <article key={t.nivel} className={`tier reveal${t.destacado ? " destacado" : ""}`}>
                <span className="nivel">Nivel {t.nivel}</span>
                <h3>{t.nombre}</h3>
                <div className="precio">{t.precio}</div>
                <p className="para">{t.para}</p>
                <ul>
                  {t.incluye.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <a className="btn btn-primary js-contacto" href="/contacto">
                  Quiero este nivel →
                </a>
              </article>
            ))}
          </div>

          <p style={{ textAlign: "center", color: "var(--dim)", marginTop: 36, fontSize: "0.95rem" }}>
            ¿Dudas o quieres un esquema a la medida?{" "}
            <a className="eu-link js-contacto" href="/contacto">
              Escríbenos
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
