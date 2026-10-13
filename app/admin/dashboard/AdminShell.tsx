"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

type NavItem = { href: string; label: string; icon: string; badge?: number };
type NavGroup = { titulo?: string; items: NavItem[] };

// Qué ve cada rol en el menú — una cuenta ESCANEO solo necesita escanear y
// cambiar su contraseña; el resto de links no le sirven de nada (las
// páginas igual la redirigen si intenta entrar directo por URL).
function navPara(rol: string | undefined, pendientes: number, sinAtender: number): NavGroup[] {
  if (rol === "ESCANEO") {
    return [
      { items: [{ href: "/admin/dashboard/checkin", label: "Tomar asistencia", icon: "📷" }] },
      { items: [{ href: "/admin/dashboard/cuenta", label: "Mi cuenta", icon: "🔑" }] },
    ];
  }

  const esAdmin = rol === "ADMIN";

  const grupos: NavGroup[] = [
    { items: [{ href: "/admin/dashboard", label: "Evento en curso", icon: "🏠" }] },
    {
      titulo: "Gestión",
      items: [
        { href: "/admin/dashboard/inscritos", label: "Inscritos", icon: "🎟️" },
        { href: "/admin/dashboard/ponentes", label: "Ponentes", icon: "🎤", badge: pendientes || undefined },
        { href: "/admin/dashboard/voluntarios", label: "Voluntarios", icon: "🙋" },
        { href: "/admin/dashboard/checkin", label: "Check-in", icon: "📷" },
        { href: "/admin/dashboard/galeria", label: "Galería", icon: "🖼️" },
      ],
    },
    {
      titulo: "Comunicación",
      items: [
        ...(esAdmin ? [{ href: "/admin/dashboard/anuncios", label: "Anuncios", icon: "📣" }] : []),
        { href: "/admin/dashboard/contacto", label: "Contacto", icon: "✉️", badge: sinAtender || undefined },
      ],
    },
    {
      titulo: "Configuración",
      items: [
        { href: "/admin/dashboard/eventos", label: "Eventos", icon: "📅" },
        ...(esAdmin
          ? [
              { href: "/admin/dashboard/usuarios", label: "Usuarios", icon: "👥" },
              { href: "/admin/dashboard/ajustes", label: "Ajustes de correo", icon: "📨" },
              { href: "/admin/dashboard/cupos", label: "Cupos", icon: "🚦" },
            ]
          : []),
      ],
    },
    { items: [{ href: "/admin/dashboard/cuenta", label: "Mi cuenta", icon: "🔑" }] },
  ];

  return grupos;
}

export default function AdminShell({
  children,
  rol,
  eventoActivoTitulo,
  pendientes,
  sinAtender,
}: {
  children: React.ReactNode;
  rol: string | undefined;
  eventoActivoTitulo: string | null;
  pendientes: number;
  sinAtender: number;
}) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const grupos = navPara(rol, pendientes, sinAtender);

  // Cierra el menú lateral (en móvil) cada vez que se navega a otra página.
  useEffect(() => {
    setAbierto(false);
  }, [pathname]);

  return (
    <>
      <header style={{ background: "#0a1310", color: "#f4eee1", borderBottom: "3px solid #ffc23c" }}>
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <button
            className="pg-sidebar-toggle"
            onClick={() => setAbierto((v) => !v)}
            aria-label="Abrir menú"
            style={{
              background: "none",
              border: "1px solid rgba(244,238,225,0.3)",
              borderRadius: 8,
              color: "#f4eee1",
              width: 34,
              height: 34,
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            ☰
          </button>
          <img
            src="/assets/img/brand/logo-badge.png"
            alt="Python Guatemala"
            width={30}
            height={30}
            style={{ borderRadius: "50%", border: "2px solid #ffc23c" }}
          />
          <strong style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 15, whiteSpace: "nowrap" }}>
            Panel <span style={{ color: "#ffc23c" }}>Python Guatemala</span>
          </strong>
          {eventoActivoTitulo && (
            <span className="pg-badge pg-badge-gold" title="Evento activo">
              ★ {eventoActivoTitulo}
            </span>
          )}
          <span style={{ flex: 1 }} />
          <a href="/" target="_blank" rel="noopener noreferrer" style={{ color: "#c6c9ba", textDecoration: "none", fontSize: 13 }}>
            Ver sitio ↗
          </a>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            style={{
              background: "#ff6b45",
              color: "#240a02",
              border: 0,
              borderRadius: 8,
              padding: "6px 14px",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="pg-shell">
        {abierto && (
          <div
            className="pg-sidebar-scrim abierto"
            onClick={() => setAbierto(false)}
            aria-hidden="true"
          />
        )}
        <nav className={`pg-sidebar${abierto ? " abierto" : ""}`} aria-label="Navegación del panel">
          {grupos.map((g, i) => (
            <div className="grupo" key={g.titulo ?? i}>
              {g.titulo && <h6>{g.titulo}</h6>}
              {g.items.map((item) => {
                const activo = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={activo ? "activo" : undefined}>
                    <span className="ic">{item.icon}</span>
                    {item.label}
                    {!!item.badge && <span className="badge">{item.badge}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="pg-content">{children}</div>
      </div>
    </>
  );
}
