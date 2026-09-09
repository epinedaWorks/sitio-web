"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Reproduce los efectos de scroll del sitio original:
//  - .reveal  -> aparece al entrar en viewport
//  - [data-count] -> conteo animado de estadísticas
//
// Se vuelve a ejecutar en cada cambio de ruta (usePathname): en una navegación
// del lado del cliente el DOM de la página nueva se monta pero este efecto no
// se remonta, así que sin esto los .reveal de la página nueva se quedaban
// invisibles (opacity:0) y la página parecía vacía.
export default function ClientEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Solo los que aún no se han revelado (los de la página nueva).
    const reveals = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.in)"));

    let io: IntersectionObserver | null = null;
    if (prefersReduced) {
      reveals.forEach((el) => el.classList.add("in"));
    } else {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              en.target.classList.add("in");
              io?.unobserve(en.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      reveals.forEach((el) => io!.observe(el));

      // por si algo ya está en pantalla al montar / al llegar de otra página
      requestAnimationFrame(() => {
        reveals.forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top < window.innerHeight * 0.9) el.classList.add("in");
        });
      });
    }

    let counted = false;
    const statsEl = document.querySelector(".stats");
    let statsIo: IntersectionObserver | null = null;

    if (statsEl) {
      statsIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting && !counted) {
              counted = true;
              document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
                const target = parseInt(el.getAttribute("data-count") || "0", 10);
                const suffix = el.getAttribute("data-suffix") || "";
                if (prefersReduced) {
                  el.textContent = target + suffix;
                  return;
                }
                let start: number | null = null;
                const dur = 1400;
                const step = (ts: number) => {
                  if (start === null) start = ts;
                  const prog = Math.min((ts - start) / dur, 1);
                  const eased = 1 - Math.pow(1 - prog, 3);
                  el.textContent = Math.round(target * eased) + suffix;
                  if (prog < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
              });
            }
          });
        },
        { threshold: 0.4 }
      );
      statsIo.observe(statsEl);
    }

    return () => {
      io?.disconnect();
      statsIo?.disconnect();
    };
  }, [pathname]);

  return null;
}
