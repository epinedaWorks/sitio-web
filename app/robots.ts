import type { MetadataRoute } from "next";

// Las páginas privadas (/patrocinio, /entrada/*) no se listan aquí a propósito:
// ya llevan `noindex` en su metadata y no están enlazadas. Nombrarlas en
// robots.txt solo serviría para anunciar que existen.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
  };
}
