import ExcelJS from "exceljs";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { fechaHora } from "@/lib/fecha";

// Exporta inscritos o ponentes.
//   /api/admin/export?tipo=inscritos            -> Excel (.xlsx)
//   /api/admin/export?tipo=ponentes&formato=csv -> CSV
export async function GET(req: Request) {
  await requireAdminSession(); // redirige al login si no hay sesión

  const url = new URL(req.url);
  const tipo = url.searchParams.get("tipo");
  const formato = url.searchParams.get("formato") === "csv" ? "csv" : "xlsx";

  if (tipo !== "inscritos" && tipo !== "ponentes" && tipo !== "contacto") {
    return new Response("Parámetro 'tipo' inválido", { status: 400 });
  }

  const fmt = (d: Date) => fechaHora(d);
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
      "Autoriza compartir datos", "Ingresó", "Hora de ingreso", "Evento", "Fecha de inscripción",
    ];
    rows = data.map((r) => [
      r.nombre, r.correo, r.telefono, r.asistira, r.rol, r.universidad, r.semestre,
      r.experiencia, r.comoSeEntero, r.comentarios,
      r.compartirDatos ? "Sí" : "No",
      r.checkedInAt ? "Sí" : "No",
      r.checkedInAt ? fmt(r.checkedInAt) : "",
      r.event.title, fmt(r.createdAt),
    ]);
  } else if (tipo === "contacto") {
    const data = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
    headers = ["Nombre", "Correo", "Organización", "Asunto", "Mensaje", "Atendido", "Fecha"];
    rows = data.map((m) => [
      m.nombre, m.correo, m.organizacion, m.asunto, m.mensaje,
      m.atendido ? "Sí" : "No", fmt(m.createdAt),
    ]);
  } else {
    const data = await prisma.speakerSubmission.findMany({
      orderBy: { createdAt: "desc" },
      include: { event: true },
    });
    // Orden pedido: Contactado, Estado, Modalidad, Nombre, Teléfono, Tema y
    // luego el resto en el orden que ya tenían (headers y rows alineados).
    headers = [
      "Contactado", "Estado", "Modalidad", "Nombre", "Teléfono", "Tema",
      "Correo", "Descripción", "Nivel", "Bio",
      "Integrantes del equipo", "Necesidades / logística",
      "¿Sigue a la comunidad?", "LinkedIn", "Instagram", "Empresa", "Cargo", "Edad",
      "Foto (URL)", "¿De otro país?", "¿Cómo se enteró?", "Comentarios",
      "Autoriza compartir datos", "Evento", "Fecha",
    ];
    rows = data.map((s) => [
      s.contactado ? "Sí" : "No", s.status, s.modalidad, s.nombre, s.telefono, s.tema,
      s.correo, s.descripcion, s.nivel, s.bio,
      s.integrantes, s.necesidades,
      s.sigueComunidad == null ? "" : s.sigueComunidad ? "Sí" : "No",
      s.linkedin, s.instagram, s.empresa, s.cargo, s.edad,
      s.fotoUrl, s.pais, s.comoSeEntero, s.comentarios,
      s.compartirDatos ? "Sí" : "No", s.event.title, fmt(s.createdAt),
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
  const hoja =
    tipo === "inscritos" ? "Inscritos" : tipo === "contacto" ? "Contacto" : "Ponentes";
  const ws = wb.addWorksheet(hoja, { views: [{ state: "frozen", ySplit: 1 }] });

  ws.addRow(headers);
  const head = ws.getRow(1);
  head.font = { bold: true, color: { argb: "FFFFFFFF" } };
  head.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0A1310" } };
  head.alignment = { vertical: "middle" };
  head.height = 20;

  rows.forEach((r) => ws.addRow(r.map((v) => (v == null ? "" : v))));

  // Ponentes: colorea las celdas de Contactado (col. 1), Estado (col. 2) y
  // Modalidad (col. 3) según su valor, así se distinguen de un vistazo y en
  // Excel también se puede "Filtrar por color".
  if (tipo === "ponentes") {
    const COLORES: Record<string, { bg: string; fg: string }> = {
      Sí: { bg: "FFC6EFCE", fg: "FF006100" }, // verde (Contactado: Sí)
      No: { bg: "FFE7E6E6", fg: "FF595959" }, // gris (Contactado: No)
      ACEPTADA: { bg: "FFC6EFCE", fg: "FF006100" }, // verde
      PENDIENTE: { bg: "FFFFEB9C", fg: "FF9C5700" }, // amarillo
      RECHAZADA: { bg: "FFFFC7CE", fg: "FF9C0006" }, // rojo
      CHARLA: { bg: "FFBDD7EE", fg: "FF1F4E79" }, // azul
      TALLER: { bg: "FFE4CCF5", fg: "FF5B2C83" }, // morado
      PROYECTO: { bg: "FFF8CBAD", fg: "FF843C0C" }, // naranja
    };
    ws.eachRow((row, n) => {
      if (n === 1) return;
      for (const col of [1, 2, 3]) {
        const cell = row.getCell(col);
        const c = COLORES[String(cell.value ?? "")];
        if (!c) continue;
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: c.bg } };
        cell.font = { bold: true, color: { argb: c.fg } };
        cell.alignment = { horizontal: "center" };
      }
    });
  }

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
