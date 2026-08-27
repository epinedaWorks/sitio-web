import { TEAM } from "../site-data";

export default function Equipo() {
  return (
    <section className="section-pad" id="equipo" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="section-head center reveal">
          <span className="eyebrow">Core Team</span>
          <h2>Las personas detrás de la comunidad</h2>
          <p>
            Un equipo de voluntarios apasionados por fortalecer el talento y la comunidad tech de
            Guatemala.
          </p>
        </div>
        <div className="team-grid">
          {TEAM.map((m, i) => (
            <div className={`team-card reveal${i ? ` d${i}` : ""}`} key={m.name}>
              <div className="avatar">
                <img src={m.img} alt={m.name} loading="lazy" />
              </div>
              <b>{m.name}</b>
              <span className="role">{m.role}</span>
              <p>{m.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
