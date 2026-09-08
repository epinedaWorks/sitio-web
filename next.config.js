/** @type {import('next').NextConfig} */
const dev = process.env.NODE_ENV !== "production";

// Content-Security-Policy: red de seguridad ante XSS. Next (App Router) inyecta
// <script> en línea para la hidratación y no usamos nonce, así que 'unsafe-inline'
// en script-src es necesario; en desarrollo además hace falta 'unsafe-eval' (HMR).
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig = {
  experimental: {
    // Netlify sirve el sitio detrás de un proxy: sin esto, la verificación de
    // origen de los Server Actions falla y los botones del panel "no hacen nada".
    serverActions: {
      allowedOrigins: [
        "pythonguatemala.dev",
        "www.pythonguatemala.dev",
        "localhost:3000",
      ],
      // Subida de varias fotos a la galería desde el panel.
      bodySizeLimit: "40mb",
    },
  },
  poweredByHeader: false,
  async headers() {
    const base = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      {
        key: "Permissions-Policy",
        // camera=(self): lo usa el escáner de asistencia del panel; el resto del
        // sitio no llama a la cámara, así que dejarlo en "self" no expone nada.
        value: "camera=(self), microphone=(), geolocation=(), payment=()",
      },
      // Fuerza HTTPS durante 2 años (con subdominios). El sitio ya solo va por https.
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      { key: "Content-Security-Policy", value: csp },
    ];
    return [
      { source: "/:path*", headers: base },
      // El panel nunca debe poder incrustarse en un iframe (anti-clickjacking).
      {
        source: "/admin/:path*",
        headers: [...base, { key: "X-Frame-Options", value: "DENY" }],
      },
    ];
  },
};

module.exports = nextConfig;
