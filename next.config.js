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
    },
  },
};

module.exports = nextConfig;
