export default function Marquee({ eventoTitulo }: { eventoTitulo: string | null }) {
  const text = `Python Guatemala ✦ ${
    eventoTitulo ? `${eventoTitulo} ✦ ` : ""
  }Charlas ✦ Talleres ✦ Exposición de proyectos ✦ Comunidad ✦ Inteligencia Artificial ✦ Ciencia de datos ✦ Automatización ✦ `;
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        <span>{text}</span>
        <span>{text}</span>
      </div>
    </div>
  );
}
