import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

// Exporta inscritos o ponentes como CSV (se abre en Excel y en Google Sheets).
// Uso:  /api/admin/export?tipo=inscritos   |   ?tipo=ponentes
export async function GET(req: Request) {
  await requireAdminSession(); // redirige al login si no hay sesión

  const tipo = new URL(req.url).searchParams.get("tipo");
  if (tipo !== "inscritos" && tipo !== "ponentes") {
    return new Response("Parámetro 'tipo' debe ser 'inscritos' o 'ponentes'", { status: 400 });
  }

  const fmt = (d: Date) => d.toLocaleString("es-GT");
  let headers: string[];
  let rows: (string | number | boolean | null)[][];

  if (tipo === "inscritos") {
    const data = await prisma.attendeeRegistration.findMany({
      orderBy: { createdAt: "desc" },
      include: { event: true },
    });
    headers = [
      "Nombre", "Correo", "Teléfono", "¿Asistirá?", "Rol", "Universidad", "Semestre",
      "Experiencia con Python", "¿Cómo se enteró?", "Comentarios",
      "Autoriza compartir datos", "Evento", "Fecha de inscripción",
    ];
    rows = data.map((r) => [
      r.nombre, r.correo, r.telefono, r.asistira, r.rol, r.universidad, r.semestre,
      r.experiencia, r.comoSeEntero, r.comentarios,
      r.compartirDatos ? "Sí" : "No", r.event.title, fmt(r.createdAt),
    ]);
  } else {
    const data = await prisma.speakerSubmission.findMany({
      orderBy: { createdAt: "desc" },
      include: { event: true },
    });
    headers = [
      "Nombre", "Correo", "Teléfono", "Modalidad", "Tema", "Descripción", "Nivel", "Bio",
      "Integrantes del equipo", "Necesidades / logística",
      "¿Sigue a la comunidad?", "LinkedIn", "Instagram", "Empresa", "Cargo", "Edad",
      "Foto (URL)", "¿De otro país?", "¿Cómo se enteró?", "Comentarios",
      "Autoriza compartir datos", "Estado", "Evento", "Fecha",
    ];
    rows = data.map((s) => [
      s.nombre, s.correo, s.telefono, s.modalidad, s.tema, s.descripcion, s.nivel, s.bio,
      s.integrantes, s.necesidades,
      s.sigueComunidad == null ? "" : s.sigueComunidad ? "Sí" : "No",
      s.linkedin, s.instagram, s.empresa, s.cargo, s.edad,
      s.fotoUrl, s.pais, s.comoSeEntero, s.comentarios,
      s.compartirDatos ? "Sí" : "No", s.status, s.event.title, fmt(s.createdAt),
    ]);
  }

  const cell = (v: string | number | boolean | null) => {
    const s = v == null ? "" : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv =
    "﻿" + // BOM: para que Excel lea bien los acentos
    [headers, ...rows].map((fila) => fila.map(cell).join(",")).join("\r\n");

  const fecha = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${tipo}-${fecha}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
