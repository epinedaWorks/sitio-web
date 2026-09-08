// Base pública del sitio (para armar enlaces absolutos en correos, QR, etc.).
export const SITE_URL = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");

export const entradaUrl = (token: string) => `${SITE_URL}/entrada/${token}`;
export const qrUrl = (token: string) => `${SITE_URL}/api/qr/${token}`;

// El QR puede llevar la URL completa o solo el token: extrae el token de cualquiera.
export function tokenDeQR(texto: string): string {
  const t = (texto || "").trim();
  const m = t.match(/\/entrada\/([^/?#\s]+)/);
  return m ? m[1] : t;
}
