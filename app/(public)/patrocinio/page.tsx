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
              Puedes acompañar el <b>Python eXposition Day 2026</b> con un aporte en especie o con
              uno de los 3 niveles. En los niveles, los beneficios son acumulativos: cada uno
              incluye todo lo del anterior.
            </p>
          </div>

          <div className="tier-grid">
            {SPONSOR_TIERS.map((t) => (
              <article key={t.nombre} className={`tier reveal${t.destacado ? " destacado" : ""}`}>
                <span className="nivel">{t.nivel ? `Nivel ${t.nivel}` : t.etiqueta}</span>
                <h3>{t.nombre}</h3>
                <div className={`precio${t.precio.startsWith("Q") ? "" : " texto"}`}>{t.precio}</div>
                <p className="para">{t.para}</p>
                <ul>
                  {t.incluye.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <a className="btn btn-primary js-contacto" href="/contacto">
                  {t.nivel ? "Quiero este nivel →" : "Quiero apoyar así →"}
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
