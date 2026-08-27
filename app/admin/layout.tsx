// El sitio público usa tema oscuro (globals.css pinta el body oscuro).
// El panel admin necesita fondo claro y sin la nav/footer del sitio público.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="pg-admin"
      style={{ background: "#f4f5f7", color: "#1b1b1b", minHeight: "100vh", paddingBottom: 40 }}
    >
      <style>{`
        .pg-admin a { color: #1155cc; text-decoration: underline; }
        .pg-admin a:hover { color: #0b3ea8; }
        .pg-admin button { font: inherit; padding: 6px 12px; border: 1px solid #bbb;
          border-radius: 6px; background: #fff; cursor: pointer; }
        .pg-admin button:hover { background: #f0f0f0; }
        .pg-admin input, .pg-admin select, .pg-admin textarea { font: inherit; }
        .pg-admin summary { list-style: revert; }
      `}</style>
      {children}
    </div>
  );
}
