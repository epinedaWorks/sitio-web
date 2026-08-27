"use client";

import { useEffect, useState } from "react";
import { NAV_LINKS } from "../site-data";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}`} id="nav">
      <div className="container nav-inner">
        <a className="brand" href="#inicio" aria-label="Inicio">
          <img
            className="logo"
            src="/assets/img/brand/logo-badge.png"
            alt="Logo Python Guatemala"
            width={40}
            height={40}
          />
          <span>
            Python Guatemala<small>Comunidad</small>
          </span>
        </a>

        <nav className={`nav-links${open ? " open" : ""}`} id="navLinks">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a
            className="btn btn-primary js-inscribir"
            href="#eventos"
            onClick={() => setOpen(false)}
          >
            Inscríbete al Python XPDay
          </a>
        </nav>

        <button
          className={`nav-toggle${open ? " open" : ""}`}
          aria-label="Menú"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
