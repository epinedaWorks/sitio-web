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
