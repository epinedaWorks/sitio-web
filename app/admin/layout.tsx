// El sitio público usa tema oscuro (globals.css pinta el body oscuro).
// El panel admin tiene fondo claro, con un toque de la identidad de la comunidad,
// y sin la nav/footer del sitio público.
//
// Este archivo define el sistema de diseño compartido de TODO el panel
// (tarjetas, tablas, botones, badges, grid, sidebar) vía clases "pg-*", para
// que cada página solo tenga que usar las clases en vez de reinventar sus
// propios estilos en línea.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="pg-admin"
      style={{ background: "#f6f4ef", color: "#1b1b1b", minHeight: "100vh", display: "flow-root" }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .pg-admin { font-family: "Inter", system-ui, -apple-system, sans-serif; }
        .pg-admin h1, .pg-admin h2, .pg-admin h3, .pg-admin h4 {
          font-family: "Bricolage Grotesque", "Inter", system-ui, sans-serif;
          letter-spacing: -0.01em;
        }
        .pg-admin main a { color: #159d68; text-decoration: underline; }
        .pg-admin main a:hover { color: #0f7350; }
        .pg-admin input, .pg-admin select, .pg-admin textarea {
          font: inherit; border: 1px solid #d8d4c8; border-radius: 8px; padding: 9px 11px;
          background: #fff;
        }
        .pg-admin input:focus, .pg-admin select:focus, .pg-admin textarea:focus {
          outline: 2px solid #159d68; outline-offset: 1px;
        }
        .pg-admin summary { list-style: revert; }

        /* ---- Layout shell: sidebar + content ---- */
        .pg-shell { display: flex; align-items: flex-start; max-width: 1280px; margin: 0 auto; }
        .pg-content { flex: 1; min-width: 0; padding: 28px 24px 60px; }
        .pg-content-narrow { max-width: 880px; }

        /* ---- Page header ---- */
        .pg-head { margin-bottom: 22px; }
        .pg-head h1 { font-size: 1.7rem; margin: 0 0 6px; }
        .pg-head p { opacity: 0.68; font-size: 13.5px; margin: 0; max-width: 640px; line-height: 1.5; }
        .pg-head-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }

        /* ---- Buttons ---- */
        .pg-btn {
          font: inherit; display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border: 2px solid #04100b; border-radius: 9px;
          background: #fff; cursor: pointer; font-weight: 600; font-size: 13.5px;
          color: #04100b !important; text-decoration: none !important; line-height: 1.2;
        }
        .pg-btn:hover { background: #fff6e0; }
        .pg-btn-sm { padding: 5px 11px; font-size: 12.5px; border-radius: 7px; }
        .pg-btn-primary { background: #159d68; border-color: #0f7350; color: #fff !important; }
        .pg-btn-primary:hover { background: #128a5a; }
        .pg-btn-danger { background: #c0392b; border-color: #8e2a22; color: #fff !important; }
        .pg-btn-danger:hover { background: #a63124; }
        .pg-btn-ghost { border-color: #d8d4c8; font-weight: 500; }
        .pg-btn-ghost:hover { background: #f0ede4; }
        .pg-admin main button:not([class*="pg-"]) {
          font: inherit; padding: 7px 14px; border: 2px solid #04100b;
          border-radius: 8px; background: #fff; cursor: pointer; font-weight: 600;
        }
        .pg-admin main button:not([class*="pg-"]):hover { background: #fff6e0; }

        /* ---- Cards ---- */
        .pg-card {
          background: #fff; border: 1px solid #e7e3d8; border-radius: 14px;
          padding: 18px 20px; box-shadow: 0 1px 2px rgba(10,19,16,0.04);
        }
        .pg-card + .pg-card { margin-top: 12px; }

        /* ---- Stat tiles ---- */
        .pg-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
        .pg-stat {
          background: #fff; border: 1px solid #e7e3d8; border-radius: 14px;
          padding: 16px 18px; display: flex; flex-direction: column; gap: 4px;
          color: inherit !important; text-decoration: none !important; transition: transform .12s, box-shadow .12s;
        }
        a.pg-stat:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(10,19,16,0.08); }
        .pg-stat .n { font-size: 1.9rem; font-weight: 800; font-family: "Bricolage Grotesque", sans-serif; line-height: 1; }
        .pg-stat .l { font-size: 12.5px; opacity: 0.68; font-weight: 600; }
        .pg-stat .ic { font-size: 1.3rem; }
        .pg-stat.accent { background: #0a1310; border-color: #0a1310; }
        .pg-stat.accent .n, .pg-stat.accent .l { color: #f4eee1; }
        .pg-stat.accent .l { opacity: 0.75; }

        /* ---- Grid of link cards (home) ---- */
        .pg-linkgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
        .pg-linkcard {
          display: block; border: 1px solid #e7e3d8; border-radius: 14px; padding: 16px 18px;
          text-decoration: none !important; color: inherit !important; background: #fff; transition: transform .12s, box-shadow .12s;
        }
        .pg-linkcard:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(10,19,16,0.08); }
        .pg-linkcard .row { display: flex; align-items: baseline; gap: 10px; }
        .pg-linkcard .ic { font-size: 20px; }
        .pg-linkcard .n { font-size: 26px; font-weight: 700; line-height: 1; }
        .pg-linkcard .t { font-weight: 600; margin-top: 8px; }
        .pg-linkcard .d { font-size: 12.5px; opacity: 0.65; margin-top: 2px; }

        /* ---- Badges ---- */
        .pg-badge {
          display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600;
          padding: 2px 9px; border-radius: 999px; white-space: nowrap;
        }
        .pg-badge-neutral { background: #eee; color: #555; }
        .pg-badge-success { background: #d5f5e3; color: #1b5e20; }
        .pg-badge-warn { background: #fdebd0; color: #8a5a00; }
        .pg-badge-danger { background: #fadbd8; color: #8e2a22; }
        .pg-badge-info { background: #d6eaf8; color: #1b5e8a; }
        .pg-badge-gold { background: #fff3cd; color: #8a6500; }

        /* ---- Banners / notices ---- */
        .pg-notice { padding: 10px 14px; border-radius: 10px; font-size: 13.5px; margin: 0 0 16px; }
        .pg-notice-info { background: #eee; color: #555; }
        .pg-notice-warn { background: #fdebd0; color: #8a5a00; }
        .pg-notice-ok { background: #d5f5e3; color: #1b5e20; }
        .pg-notice-err { background: #fadbd8; color: #8e2a22; }

        /* ---- Dashboard 2-col layout (se apila en pantallas angostas) ---- */
        .pg-dash-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 20px; }
        @media (max-width: 760px) { .pg-dash-grid { grid-template-columns: 1fr; } }

        /* ---- Tables ---- */
        .pg-table-wrap { overflow-x: auto; border: 1px solid #e7e3d8; border-radius: 14px; background: #fff; }
        table.pg-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
        table.pg-table th {
          text-align: left; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.03em;
          color: #f4eee1; background: #0a1310; padding: 10px 14px; white-space: nowrap;
          position: sticky; top: 0;
        }
        table.pg-table td { padding: 10px 14px; border-top: 1px solid #efece3; vertical-align: top; }
        table.pg-table tbody tr:hover { background: #fbfaf6; }
        table.pg-table tr.is-done td { background: #f3faf6; }

        /* ---- Sidebar ---- */
        .pg-sidebar {
          width: 216px; flex-shrink: 0; min-height: calc(100vh - 56px);
          background: #0a1310; color: #c6c9ba; padding: 18px 12px 24px;
          position: sticky; top: 56px; align-self: flex-start;
        }
        .pg-sidebar .grupo { margin-bottom: 18px; }
        .pg-sidebar .grupo h6 {
          font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.06em;
          opacity: 0.55; margin: 0 0 6px; padding: 0 10px; font-weight: 700;
        }
        .pg-sidebar a {
          display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: 9px;
          color: #e4e1d4; text-decoration: none !important; font-size: 13.5px; font-weight: 500;
        }
        .pg-sidebar a:hover { background: rgba(255,255,255,0.06); }
        .pg-sidebar a.activo { background: #ffc23c; color: #0a1310; font-weight: 700; }
        .pg-sidebar a .ic { font-size: 15px; width: 18px; text-align: center; }
        .pg-sidebar a .badge {
          margin-left: auto; font-size: 11px; background: rgba(255,255,255,0.12); padding: 1px 7px;
          border-radius: 999px; font-weight: 700;
        }
        .pg-sidebar a.activo .badge { background: rgba(10,19,16,0.18); color: #0a1310; }

        /* Botón de menú (solo se ve en pantallas angostas) */
        .pg-sidebar-toggle { display: none; }
        .pg-sidebar-scrim { display: none; }

        @media (max-width: 860px) {
          .pg-sidebar {
            position: fixed; inset: 56px 0 0 0; top: 0; z-index: 60; width: 76vw; max-width: 280px;
            min-height: 100vh; transform: translateX(-100%); transition: transform .18s ease;
            box-shadow: 8px 0 24px rgba(0,0,0,0.25);
          }
          .pg-sidebar.abierto { transform: translateX(0); }
          .pg-sidebar-toggle { display: inline-flex; }
          .pg-sidebar.abierto ~ .pg-sidebar-scrim, .pg-sidebar-scrim.abierto {
            display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 55;
          }
          .pg-content { padding: 20px 14px 50px; }
        }
      `,
        }}
      />
      {children}
    </div>
  );
}
