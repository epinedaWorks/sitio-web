"use client";

import { useCallback, useEffect, useState } from "react";

export type AlbumFoto = { url: string; caption: string | null };
export type Album = {
  id: string;
  title: string;
  description: string | null;
  images: AlbumFoto[];
};

// Miniatura para la retícula:
//  - fotos locales del seed: usan su versión /thumb/ ya generada
//  - fotos subidas al panel (/api/img/...): las redimensiona el Image CDN de Netlify
const thumbOf = (url: string) => {
  if (url.includes("/full/")) return url.replace("/full/", "/thumb/");
  if (url.startsWith("/api/img/"))
    return `/.netlify/images?url=${encodeURIComponent(url)}&w=700&fit=cover&q=72`;
  return url;
};

export default function Albumes({
  albums,
  heading = "Galería de la comunidad",
  sub = "Álbumes por actividad · haz clic para ver todas las fotos",
}: {
  albums: Album[];
  heading?: string;
  sub?: string;
}) {
  const [abierto, setAbierto] = useState<Album | null>(null);
  const [lb, setLb] = useState<number | null>(null);

  const cerrarAlbum = useCallback(() => {
    setAbierto(null);
    setLb(null);
  }, []);

  const showAt = useCallback(
    (i: number) => {
      if (!abierto) return;
      const n = abierto.images.length;
      setLb(((i % n) + n) % n);
    },
    [abierto]
  );

  // Escape + bloqueo de scroll cuando hay algo abierto
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lb !== null) setLb(null);
        else cerrarAlbum();
      } else if (lb !== null && e.key === "ArrowRight") showAt(lb + 1);
      else if (lb !== null && e.key === "ArrowLeft") showAt(lb - 1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [abierto, lb, showAt, cerrarAlbum]);

  if (albums.length === 0) return null;

  const foto = abierto && lb !== null ? abierto.images[lb] : null;

  return (
    <div id="galeria">
      <div className="albumes-head reveal">
        <div>
          <h4>{heading}</h4>
          <p>{sub}</p>
        </div>
        <span className="eyebrow">
          {albums.length} álbum{albums.length === 1 ? "" : "es"}
        </span>
      </div>

      <div className="album-grid">
        {albums.map((a) => {
          const vacio = a.images.length === 0;
          return (
            <button
              key={a.id}
              className="album-card reveal"
              disabled={vacio}
              onClick={() => !vacio && setAbierto(a)}
            >
              {vacio ? (
                <div className="album-cover empty">📷</div>
              ) : (
                <div className="album-cover">
                  <img src={thumbOf(a.images[0].url)} alt={a.title} loading="lazy" />
                </div>
              )}
              <span className={`album-count${vacio ? " soon" : ""}`}>
                {vacio ? "Próximamente" : `${a.images.length} fotos`}
              </span>
              <div className="album-body">
                <h5>{a.title}</h5>
                {a.description && <p>{a.description}</p>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Vista del álbum abierto */}
      {abierto && (
        <div className="modal-scrim" onClick={(e) => e.target === e.currentTarget && cerrarAlbum()}>
          <div className="modal-card album-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3>{abierto.title}</h3>
                {abierto.description && <p>{abierto.description}</p>}
              </div>
              <button className="modal-close" aria-label="Cerrar" onClick={cerrarAlbum}>
                ✕
              </button>
            </div>
            <div className="gallery">
              {abierto.images.map((p, i) => (
                <figure key={p.url} onClick={() => setLb(i)}>
                  <img src={thumbOf(p.url)} alt={p.caption || abierto.title} loading="lazy" />
                  {p.caption && <figcaption>{p.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox de una foto */}
      {foto && (
        <div className="lb open" onClick={(e) => e.target === e.currentTarget && setLb(null)}>
          <button className="lb-close" aria-label="Cerrar" onClick={() => setLb(null)}>
            ✕
          </button>
          <button className="lb-btn lb-prev" aria-label="Anterior" onClick={() => showAt(lb! - 1)}>
            ‹
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foto.url} alt={foto.caption || abierto!.title} />
          <button className="lb-btn lb-next" aria-label="Siguiente" onClick={() => showAt(lb! + 1)}>
            ›
          </button>
          <div className="lb-count">
            {lb! + 1} / {abierto!.images.length}
          </div>
          {foto.caption && <div className="lb-cap">{foto.caption}</div>}
        </div>
      )}
    </div>
  );
}
