// El sitio público usa tema oscuro (globals.css pinta el body oscuro).
// El panel admin tiene fondo claro, con un toque de la identidad de la comunidad,
// y sin la nav/footer del sitio público.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="pg-admin"
      style={{ background: "#faf8f4", color: "#1b1b1b", minHeight: "100vh", paddingBottom: 40 }}
    >
      <style>{`
        .pg-admin { font-family: "Inter", system-ui, -apple-system, sans-serif; }
        .pg-admin h1, .pg-admin h2, .pg-admin h3, .pg-admin h4 {
          font-family: "Bricolage Grotesque", "Inter", system-ui, sans-serif;
          letter-spacing: -0.01em;
        }
        .pg-admin main a { color: #159d68; text-decoration: underline; }
        .pg-admin main a:hover { color: #0f7350; }
        .pg-admin main button {
          font: inherit; padding: 7px 14px; border: 2px solid #04100b;
          border-radius: 8px; background: #fff; cursor: pointer; font-weight: 600;
        }
        .pg-admin main button:hover { background: #fff6e0; }
        .pg-admin input, .pg-admin select, .pg-admin textarea {
          font: inherit; border: 1px solid #ccc; border-radius: 8px; padding: 9px 11px;
        }
        .pg-admin summary { list-style: revert; }
      `}</style>
      {children}
    </div>
  );
}
