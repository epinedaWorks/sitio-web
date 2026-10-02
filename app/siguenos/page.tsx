import type { Metadata } from "next";
import { REDES_SIGUENOS } from "../site-data";

// Página standalone (sin el nav/footer del sitio) pensada para proyectarse en
// pantalla o compartirse como QR: que la gente nos escanee y nos siga.
export const metadata: Metadata = {
  title: "Síguenos",
  description: "Escanea y síguenos en Instagram, LinkedIn, Facebook, YouTube y GitHub — Comunidad Python Guatemala.",
};

const css = `
.sg-wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 20px;text-align:center}
.sg-logo{width:84px;height:84px;border-radius:50%;border:3px solid var(--gold);object-fit:cover;box-shadow:var(--shadow-hard)}
.sg-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:20px;max-width:1180px;width:100%;margin-top:40px}
.sg-card{background:var(--surface);border:1.5px solid var(--line);border-radius:var(--radius);padding:4px;overflow:hidden;display:flex;flex-direction:column;transition:transform .2s}
.sg-card:hover{transform:translateY(-4px)}
.sg-bar{height:7px;border-radius:999px 999px 0 0}
.sg-body{padding:22px 18px 26px;display:flex;flex-direction:column;align-items:center;gap:10px}
.sg-icono{font-size:2.1rem}
.sg-nombre{font-family:var(--font-head);font-weight:800;font-size:1.25rem}
.sg-usuario{color:var(--soft);font-size:.92rem;margin-top:-6px}
.sg-qr-box{background:#fff;border-radius:16px;padding:14px;margin-top:6px;border:2px solid var(--ink);box-shadow:var(--shadow-hard)}
.sg-qr-box img{display:block;width:170px;height:170px}
.sg-link{margin-top:4px;font-size:.82rem;color:var(--soft);word-break:break-all}
.sg-link:hover{color:var(--gold)}
`;

export default function SiguenosPage() {
  return (
    <main className="sg-wrap">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="sg-logo" src="/assets/img/brand/logo-badge.png" alt="Logo Python Guatemala" width={84} height={84} />

      <span className="eyebrow" style={{ marginTop: 20 }}>
        Comunidad Python Guatemala
      </span>
      <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", margin: "16px 0 10px" }}>Síguenos 🐍</h1>
      <p style={{ color: "var(--soft)", fontSize: "1.05rem", maxWidth: 560 }}>
        Escanea el código de la red que uses y síguenos — así no te perdés charlas, talleres y el
        próximo Python eXposition Day.
      </p>

      <div className="sg-grid">
        {REDES_SIGUENOS.map((r) => (
          <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="sg-card" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="sg-bar" style={{ background: r.color }} />
            <div className="sg-body">
              <span className="sg-icono">{r.icono}</span>
              <span className="sg-nombre">{r.nombre}</span>
              <span className="sg-usuario">{r.usuario}</span>
              <div className="sg-qr-box">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/api/qr/red/${r.id}`} alt={`Código QR de ${r.nombre}`} width={170} height={170} />
              </div>
              <span className="sg-link">{r.url.replace(/^https?:\/\//, "")}</span>
            </div>
          </a>
        ))}
      </div>

      <p style={{ marginTop: 44 }}>
        <a className="eu-link" href="/">
          ← pythonguatemala.dev
        </a>
      </p>
    </main>
  );
}
