import { SOCIALS, NAV_LINKS } from "../site-data";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer>
      <div className="container">
        <div className="foot-grid">
          <div>
            <a className="brand" href="#inicio">
              <img
                className="logo"
                src="/assets/img/brand/logo-badge.png"
                alt="Logo Python Guatemala"
                width={40}
                height={40}
              />
              <span>
                Python Guatemala<small>Comunidad</small>
              </span>
            </a>
            <p>
              Comunidad abierta de Python en Guatemala, registrada en la Python Software Foundation.
              Aprendemos, construimos y compartimos juntos. 🐍🇬🇹
            </p>
          </div>
          <div className="foot-col">
            <h5>Explorar</h5>
            {NAV_LINKS.filter((l) => l.href !== "#unete").map((l) => (
              <a key={l.label} href={l.href} className={l.contacto ? "js-contacto" : undefined}>
                {l.label}
              </a>
            ))}
          </div>
          <div className="foot-col">
            <h5>Comunidad</h5>
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
                {s.label}
              </a>
            ))}
          </div>
        </div>
        <div className="foot-bottom">
          <span>
            © {year} Comunidad Python Guatemala. Sitio hecho con 🐍 y 💛 por la comunidad.
          </span>
          <span>Python eXposition Day · Guatemala</span>
        </div>
      </div>
    </footer>
  );
}
