import Nav from "../components/Nav";
import Footer from "../components/Footer";
import ToTop from "../components/ToTop";
import ClientEffects from "../components/ClientEffects";
import RegistroModales from "../components/RegistroModales";
import { getEventoActivo, cuposDeEvento, type Cupos } from "@/lib/settings";
import { soloFecha } from "@/lib/fecha";

// Sin evento activo no hay nada a lo que inscribirse: los formularios se
// muestran como "cupo lleno" en vez de aceptar envíos sin evento.
const SIN_EVENTO_ACTIVO: Cupos = {
  inscripcionAbierta: false,
  inscripcionMensaje: "No hay ningún evento activo en este momento.",
  charlaAbierta: false,
  tallerAbierta: false,
  proyectoAbierta: false,
  modalidadMensaje: "No hay ningún evento activo en este momento.",
};

// Envoltura del sitio público (tema oscuro, nav, footer, modales).
// El panel /admin NO pasa por aquí: tiene su propio layout claro.
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const eventoActivo = await getEventoActivo();
  const cupos = eventoActivo ? cuposDeEvento(eventoActivo) : SIN_EVENTO_ACTIVO;
  const evento = eventoActivo
    ? { title: eventoActivo.title, fecha: soloFecha(eventoActivo.date, "full"), location: eventoActivo.location }
    : null;
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
      <RegistroModales cupos={cupos} evento={evento} />
    </>
  );
}
