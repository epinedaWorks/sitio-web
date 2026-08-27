import Nav from "../components/Nav";
import Footer from "../components/Footer";
import ToTop from "../components/ToTop";
import ClientEffects from "../components/ClientEffects";
import RegistroModales from "../components/RegistroModales";

// Envoltura del sitio público (tema oscuro, nav, footer, modales).
// El panel /admin NO pasa por aquí: tiene su propio layout claro.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>

      <div className="aurora" aria-hidden="true"><span /><span /><span /></div>
      <div className="grain" aria-hidden="true" />

      <Nav />
      <div id="contenido">{children}</div>
      <Footer />

      <ToTop />
      <ClientEffects />
      <RegistroModales />
    </>
  );
}
