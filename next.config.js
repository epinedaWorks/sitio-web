/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Netlify sirve el sitio detrás de un proxy: sin esto, la verificación de
    // origen de los Server Actions falla y los botones del panel "no hacen nada".
    serverActions: {
      allowedOrigins: [
        "pythonguatemala.dev",
        "www.pythonguatemala.dev",
        "admirable-dasik-afa3f0.netlify.app",
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
        value: "camera=(), microphone=(), geolocation=(), payment=()",
      },
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
