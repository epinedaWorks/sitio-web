"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function AdminBar() {
  const pathname = usePathname();
  const enPanel = pathname === "/admin/dashboard";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        maxWidth: 1000,
        margin: "20px auto 0",
        padding: "10px 16px",
        fontFamily: "sans-serif",
        fontSize: 14,
        borderBottom: "1px solid #ddd",
      }}
    >
      {!enPanel && (
        <Link href="/admin/dashboard" style={{ fontWeight: 600 }}>
          ← Volver al panel
        </Link>
      )}
      <span style={{ flex: 1 }} />
      <a href="/" target="_blank" rel="noopener noreferrer">
        Ver sitio ↗
      </a>
      <button
        onClick={() => signOut({ callbackUrl: "/admin/login" })}
        style={{ cursor: "pointer" }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
