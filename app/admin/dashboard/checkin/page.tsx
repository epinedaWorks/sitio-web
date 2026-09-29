import Link from "next/link";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { TIPOS_ESCANEO, ETIQUETA_TIPO, CAMPOS_ESCANEO, tiposPermitidos } from "@/lib/scan";
import Scanner from "./Scanner";

export const dynamic = "force-dynamic";

export default async function CheckinPage() {
  const session = await requireAdminSession({ permiteSoloEscaneo: true });
  const rol = (session.user as { role?: string } | undefined)?.role;
  const soloLectura = rol === "VIEWER";
  const soloEscaneo = rol === "ESCANEO";
  const permitidos = tiposPermitidos(session);

  const [total, ...conteos] = await Promise.all([
    prisma.attendeeRegistration.count(),
    ...TIPOS_ESCANEO.map((t) =>
      prisma.attendeeRegistration.count({ where: { [CAMPOS_ESCANEO[t].at]: { not: null } } as any })
    ),
  ]);
  const conteo: Record<string, number> = Object.fromEntries(TIPOS_ESCANEO.map((t, i) => [t, conteos[i]]));

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <h1>Tomar asistencia</h1>
      <p style={{ opacity: 0.8 }}>
        Apunta la cámara al QR de la persona. También puedes buscar por correo si no lo tiene. El
        mismo QR sirve para los cinco puestos: entrada, exposición de proyectos, coffee break,
        almuerzo (requiere ya tener entrada y proyectos) y jornada de la tarde (para quienes se
        quedan después de almuerzo).
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {TIPOS_ESCANEO.map((t) => (
          <p
            key={t}
            style={{
              display: "inline-block",
              background: "#eef7f1",
              border: "1px solid #cde6d9",
              borderRadius: 10,
              padding: "8px 14px",
              fontWeight: 600,
              margin: 0,
            }}
          >
            {ETIQUETA_TIPO[t]}: {conteo[t]} de {total}
          </p>
        ))}
      </div>
      <p style={{ marginTop: 6 }}>
        <Link href="/admin/dashboard/checkin" style={{ fontSize: 13 }}>
          actualizar
        </Link>
      </p>

      <div style={{ marginTop: 18 }}>
        {soloLectura ? (
          <p style={{ padding: "10px 14px", borderRadius: 8, fontSize: 14, background: "#eee", color: "#555" }}>
            Estás en modo solo lectura: no puedes registrar asistencia. Pide a un Admin o Editor que
            escanee, o consulta la lista de inscritos.
          </p>
        ) : permitidos.length === 0 ? (
          <p style={{ padding: "10px 14px", borderRadius: 8, fontSize: 14, background: "#fdebd0", color: "#8a5a00" }}>
            Tu cuenta no tiene ningún puesto de escaneo habilitado. Pide a un Admin que te lo asigne
            en Usuarios.
          </p>
        ) : (
          <Scanner tipos={permitidos} />
        )}
      </div>

      <p style={{ marginTop: 24, fontSize: 13 }}>
        {soloEscaneo ? (
          <Link href="/admin/dashboard/cuenta">Cambiar mi contraseña →</Link>
        ) : (
          <Link href="/admin/dashboard/inscritos">Ver la lista completa de inscritos →</Link>
        )}
      </p>
    </main>
  );
}
