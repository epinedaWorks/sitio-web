// Todo se guarda en UTC (estándar). Al mostrar, siempre en hora de Guatemala.
const TZ = "America/Guatemala";

export function fechaHora(d: Date): string {
  return d.toLocaleString("es-GT", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function soloFecha(d: Date, style: "long" | "full" | "medium" = "long"): string {
  return d.toLocaleDateString("es-GT", { timeZone: TZ, dateStyle: style });
}

export function soloHora(d: Date): string {
  return d.toLocaleTimeString("es-GT", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
}

// "YYYY-MM-DDTHH:mm" en hora de Guatemala, para prellenar un
// <input type="datetime-local">. El truco: el locale "sv-SE" formatea
// como ISO ("2026-05-15 12:00:00").
export function paraInputDateTime(d: Date): string {
  return d.toLocaleString("sv-SE", { timeZone: TZ }).replace(" ", "T").slice(0, 16);
}

// Interpreta el valor de un <input type="datetime-local"> ("YYYY-MM-DDTHH:mm")
// como hora de Guatemala (UTC-6 todo el año, sin horario de verano).
export function fechaDesdeInput(s: string): Date {
  return new Date(`${s}:00-06:00`);
}
