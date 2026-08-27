// El sitio público usa tema oscuro (globals.css pinta el body oscuro).
// El panel admin necesita fondo claro para que se lea bien.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#f4f5f7", color: "#1b1b1b", minHeight: "100vh", paddingBottom: 40 }}>
      {children}
    </div>
  );
}
