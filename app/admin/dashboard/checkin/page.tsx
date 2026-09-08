import Link from "next/link";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import Scanner from "./Scanner";

export const dynamic = "force-dynamic";

export default async function CheckinPage() {
  await requireAdminSession();

  const [total, ingresaron] = await Promise.all([
    prisma.attendeeRegistration.count(),
    prisma.attendeeRegistration.count({ where: { checkedInAt: { not: null } } }),
  ]);

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <h1>Tomar asistencia</h1>
      <p style={{ opacity: 0.8 }}>
        Apunta la cámara al QR de la persona. También puedes buscar por correo si no lo tiene.
      </p>

      <p
        style={{
          display: "inline-block",
          background: "#eef7f1",
          border: "1px solid #cde6d9",
          borderRadius: 10,
          padding: "8px 14px",
          fontWeight: 600,
        }}
      >
        Ingresaron: {ingresaron} de {total}
      </p>{" "}
      <Link href="/admin/dashboard/checkin" style={{ fontSize: 13 }}>
        actualizar
      </Link>

      <div style={{ marginTop: 18 }}>
        <Scanner />
      </div>

      <p style={{ marginTop: 24, fontSize: 13 }}>
        <Link href="/admin/dashboard/inscritos">Ver la lista completa de inscritos →</Link>
      </p>
    </main>
  );
}
