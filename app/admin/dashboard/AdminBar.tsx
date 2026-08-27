"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function AdminBar() {
  const pathname = usePathname();
  const enPanel = pathname === "/admin/dashboard";

  const linkDark: React.CSSProperties = {
    color: "#c6c9ba",
    textDecoration: "none",
    fontSize: 13,
  };

  return (
    <header style={{ background: "#0a1310", color: "#f4eee1", borderBottom: "3px solid #ffc23c" }}>
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <img
          src="/assets/img/brand/logo-badge.png"
          alt="Python Guatemala"
          width={30}
          height={30}
          style={{ borderRadius: "50%", border: "2px solid #ffc23c" }}
        />
        <strong style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 15 }}>
          Panel <span style={{ color: "#ffc23c" }}>Python Guatemala</span>
        </strong>
        {!enPanel && (
          <Link href="/admin/dashboard" style={{ ...linkDark, color: "#f4eee1", marginLeft: 6 }}>
            ← Volver al panel
          </Link>
        )}
        <span style={{ flex: 1 }} />
        <a href="/" target="_blank" rel="noopener noreferrer" style={linkDark}>
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
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
