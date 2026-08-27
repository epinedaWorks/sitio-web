import ExcelJS from "exceljs";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

// Exporta inscritos o ponentes.
//   /api/admin/export?tipo=inscritos            -> Excel (.xlsx)
//   /api/admin/export?tipo=ponentes&formato=csv -> CSV
export async function GET(req: Request) {
  await requireAdminSession(); // redirige al login si no hay sesión

  const url = new URL(req.url);
  const tipo = url.searchParams.get("tipo");
  const formato = url.searchParams.get("formato") === "csv" ? "csv" : "xlsx";

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

  const fecha = new Date().toISOString().slice(0, 10);
  const base = `${tipo}-${fecha}`;

  if (formato === "csv") {
    const cell = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv =
      "﻿" + [headers, ...rows].map((f) => f.map(cell).join(",")).join("\r\n");
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${base}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  // ---- Excel (.xlsx) ----
  const wb = new ExcelJS.Workbook();
  wb.creator = "Python Guatemala";
  wb.created = new Date();
  const ws = wb.addWorksheet(tipo === "inscritos" ? "Inscritos" : "Ponentes", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  ws.addRow(headers);
  const head = ws.getRow(1);
  head.font = { bold: true, color: { argb: "FFFFFFFF" } };
  head.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0A1310" } };
  head.alignment = { vertical: "middle" };
  head.height = 20;

  rows.forEach((r) => ws.addRow(r.map((v) => (v == null ? "" : v))));

  ws.columns.forEach((col, i) => {
    let max = headers[i]?.length ?? 10;
    col.eachCell?.({ includeEmpty: false }, (c) => {
      const len = String(c.value ?? "").length;
      if (len > max) max = len;
    });
    col.width = Math.min(Math.max(max + 2, 12), 60);
  });
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: headers.length },
  };

  const buf = await wb.xlsx.writeBuffer();
  return new Response(buf, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${base}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
