import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://pythonguatemala.dev"),
  title: {
    default: "Comunidad Python Guatemala",
    template: "%s · Python Guatemala",
  },
  description:
    "Comunidad Python Guatemala — registrada en la Python Software Foundation. Conferencias, talleres y exposición de proyectos. Inscríbete al Python eXposition Day 2026 en la UVG.",
  keywords: ["Python", "Guatemala", "comunidad", "Python eXposition Day", "XPDay", "PyCon", "talleres", "conferencias"],
  authors: [{ name: "Comunidad Python Guatemala" }],
  icons: { icon: "/assets/img/brand/favicon.png" },
  openGraph: {
    title: "Comunidad Python Guatemala",
    description:
      "Aprendemos, construimos y compartimos con Python. Inscríbete al Python eXposition Day 2026 · sábado 3 de octubre · UVG.",
    type: "website",
    locale: "es_GT",
    images: ["/assets/img/eventos/2025/full/ped2025-42.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Comunidad Python Guatemala",
    description: "Aprendemos, construimos y compartimos con Python. Inscríbete al Python eXposition Day 2026.",
    images: ["/assets/img/eventos/2025/full/ped2025-42.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
