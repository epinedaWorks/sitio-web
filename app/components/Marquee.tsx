const TEXT =
  "Python Guatemala ✦ XPDay 2026 ✦ Charlas ✦ Talleres ✦ Exposición de proyectos ✦ Comunidad ✦ Inteligencia Artificial ✦ Ciencia de datos ✦ Automatización ✦ ";

export default function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        <span>{TEXT}</span>
        <span>{TEXT}</span>
      </div>
    </div>
  );
}
