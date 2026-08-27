"use client";

import { useEffect } from "react";

// Reproduce los efectos de scroll del sitio original:
//  - .reveal  -> aparece al entrar en viewport
//  - [data-count] -> conteo animado de estadísticas
export default function ClientEffects() {
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const reveals = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (prefersReduced) {
      reveals.forEach((el) => el.classList.add("in"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              en.target.classList.add("in");
              io.unobserve(en.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      reveals.forEach((el) => io.observe(el));

      // por si algo ya está en pantalla al montar
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

    return () => statsIo?.disconnect();
  }, []);

  return null;
}
