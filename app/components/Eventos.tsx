import { XP_TRACKS } from "../site-data";
import Albumes, { type Album } from "./Albumes";

export default function Eventos({ albums }: { albums: Album[] }) {
  return (
    <section className="section-pad" id="eventos" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">Eventos</span>
          <h2>Nuestros encuentros</h2>
          <p>
            El evento insignia de la comunidad es el <b>Python eXposition Day</b>: un día completo de
            conferencias, talleres y exposición de proyectos.
          </p>
        </div>

        {/* Próximo evento 2026 */}
        <div className="event-upcoming reveal" id="ped2026">
          <div className="eu-glow" />
          <div className="eu-content">
            <span className="tag tag-live">● Próximo evento · 2026</span>
            <h3>
              Python eXposition Day <span className="eu-sub">2026</span>
            </h3>
            <p>
              Una nueva edición para aprender, construir y conectar en comunidad. Un día completo de
              charlas, talleres y exposición de proyectos hechos por la comunidad. ¡Las inscripciones
              están abiertas!
            </p>
            <p className="eu-recall">
              ¿Querés ver cómo estuvo la edición anterior?{" "}
              <a className="eu-link" href="#galeria">
                Mira los álbumes de la comunidad ↓
              </a>
            </p>
            <div className="eu-facts">
              <div className="eu-fact">
                <span className="ic">📅</span>
                <div>
                  <b>Sábado 3 de octubre de 2026</b>
                  <small>8:00 a.m. – 4:30 p.m.</small>
                </div>
              </div>
              <div className="eu-fact">
                <span className="ic">📍</span>
                <div>
                  <b>Universidad del Valle de Guatemala</b>
                  <small>UVG · Ciudad de Guatemala</small>
                </div>
              </div>
              <div className="eu-fact">
                <span className="ic">🎯</span>
                <div>
                  <b>Charlas · Talleres · Proyectos reales</b>
                  <small>Exposición en vivo de la comunidad</small>
                </div>
              </div>
              <div className="eu-fact">
                <span className="ic">🎟️</span>
                <div>
                  <b>Entrada gratuita</b>
                  <small>Cupo limitado · inscripción previa</small>
                </div>
              </div>
            </div>
            <div className="eu-cta">
              <a className="btn btn-yellow js-inscribir" href="#eventos">
                Inscríbete como asistente →
              </a>
              <a className="btn btn-primary js-ponente" href="#eventos">
                Ser conferencista, tallerista o expositor
              </a>
            </div>

            <div className="xp-tracks-head">
              <span className="eyebrow">Un día · tres experiencias</span>
              <h3>¿Qué vas a vivir en el Python eXposition Day?</h3>
            </div>
            <div className="xp-tracks">
              {XP_TRACKS.map((t) => (
                <article className="xp-track" key={t.title}>
                  <div className="xp-img">
                    <img src={t.img} alt={`${t.title} del Python eXposition Day`} loading="lazy" />
                    <span className="xp-tag">{t.tag}</span>
                  </div>
                  <div className="xp-body">
                    <h4>{t.title}</h4>
                    <p dangerouslySetInnerHTML={{ __html: t.html }} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* Álbumes de fotos de las actividades pasadas */}
        <div className="section-head reveal" style={{ margin: "66px 0 30px" }}>
          <span className="eyebrow">Así lo vivimos</span>
          <h2 style={{ fontSize: "clamp(1.7rem,3.2vw,2.3rem)" }}>
            Fotos de nuestras actividades
          </h2>
          <p>
Python eXposition Day, Foro de IA, Python After Office, Pyzzathon y más. Cada actividad tiene su álbum.
          </p>
        </div>

        <Albumes albums={albums} />
      </div>
    </section>
  );
}
