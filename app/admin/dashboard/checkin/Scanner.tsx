"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fechaHora } from "@/lib/fecha";
import { ETIQUETA_TIPO, type TipoEscaneo } from "@/lib/scan";

type Resultado = {
  status: "ok" | "repetido" | "noexiste" | "sin_permiso" | "falta_requisito";
  nombre?: string;
  correo?: string;
  rol?: string;
  asistira?: string;
  evento?: string;
  tipo?: TipoEscaneo;
  checkedInAt?: string | null;
  checkedInBy?: string | null;
  motivo?: string;
};

const COLORES: Record<Resultado["status"], { bg: string; fg: string; icono: string; titulo: string }> = {
  ok: { bg: "#159d68", fg: "#fff", icono: "✅", titulo: "Asistencia registrada" },
  repetido: { bg: "#e8a33d", fg: "#241700", icono: "⚠️", titulo: "Ya estaba registrado en este puesto" },
  noexiste: { bg: "#c0392b", fg: "#fff", icono: "❌", titulo: "Código no reconocido" },
  falta_requisito: { bg: "#c0392b", fg: "#fff", icono: "🚫", titulo: "Todavía no puede pasar" },
  sin_permiso: { bg: "#c0392b", fg: "#fff", icono: "🔒", titulo: "No tienes permiso para este puesto" },
};

function beep(ok: boolean) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = ok ? 880 : 220;
    g.gain.value = 0.05;
    o.start();
    o.stop(ctx.currentTime + 0.12);
    o.onended = () => ctx.close();
  } catch {
    /* sin sonido, no importa */
  }
}

export default function Scanner({ tipos }: { tipos: TipoEscaneo[] }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const ultimoRef = useRef<{ txt: string; t: number }>({ txt: "", t: 0 });

  const [tipo, setTipo] = useState<TipoEscaneo>(tipos[0]);
  const [escaneando, setEscaneando] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [manual, setManual] = useState("");
  const [enviando, setEnviando] = useState(false);

  const registrar = useCallback(
    async (payload: { codigo?: string; correo?: string }, sonar = true) => {
      setEnviando(true);
      try {
        const res = await fetch("/api/admin/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, tipo }),
        });
        const data: Resultado = await res.json();
        setResultado(data);
        if (sonar) beep(data.status === "ok");
        try {
          navigator.vibrate?.(data.status === "ok" ? 60 : [40, 40, 40]);
        } catch {}
        router.refresh();
      } catch {
        setError("No se pudo conectar. Intenta de nuevo.");
      } finally {
        setEnviando(false);
      }
    },
    [router, tipo]
  );

  const iniciar = useCallback(async () => {
    setError("");
    setResultado(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Este navegador no permite usar la cámara. Prueba con Chrome o Safari actualizado.");
      return;
    }

    const onResult = (result?: { getText: () => string }) => {
      if (!result) return;
      const txt = result.getText();
      const ahora = Date.now();
      if (txt === ultimoRef.current.txt && ahora - ultimoRef.current.t < 3500) return;
      ultimoRef.current = { txt, t: ahora };
      registrar({ codigo: txt });
    };

    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader();
      // Pedimos explícitamente la cámara trasera; esto dispara el permiso.
      let controls;
      try {
        controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: "environment" } } },
          videoRef.current ?? undefined,
          onResult
        );
      } catch {
        // fallback: cualquier cámara disponible
        controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current ?? undefined,
          onResult
        );
      }
      controlsRef.current = controls;
      setEscaneando(true);
    } catch (e) {
      const name = e instanceof DOMException ? e.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setError(
          "Diste 'bloquear' al permiso de cámara. Ábrelo en el candado de la barra de direcciones → Permisos → Cámara → Permitir, y recarga."
        );
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setError("No se encontró una cámara en este dispositivo.");
      } else if (name === "NotReadableError") {
        setError("La cámara está en uso por otra app. Ciérrala y vuelve a intentar.");
      } else {
        setError(
          "No se pudo abrir la cámara. Usa el sitio con https, en Chrome o Safari, y da el permiso cuando lo pida."
        );
      }
    }
  }, [registrar]);

  const detener = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setEscaneando(false);
  }, []);

  useEffect(() => () => controlsRef.current?.stop(), []);

  const c = resultado ? COLORES[resultado.status] : null;

  return (
    <div style={{ maxWidth: 480 }}>
      {tipos.length > 1 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {tipos.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTipo(t);
                setResultado(null);
              }}
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                border: "1px solid #ccc",
                fontWeight: t === tipo ? 700 : 400,
                background: t === tipo ? "#0a1310" : "#fff",
                color: t === tipo ? "#fff" : "#111",
                cursor: "pointer",
              }}
            >
              {ETIQUETA_TIPO[t]}
            </button>
          ))}
        </div>
      )}
      {tipos.length === 1 && (
        <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 10 }}>
          Puesto: <b>{ETIQUETA_TIPO[tipo]}</b>
        </p>
      )}

      <div
        style={{
          position: "relative",
          background: "#000",
          borderRadius: 14,
          overflow: "hidden",
          aspectRatio: "3 / 4",
        }}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {!escaneando && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              color: "#fff",
              fontSize: 14,
              textAlign: "center",
              padding: 20,
            }}
          >
            Cámara apagada
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        {escaneando ? (
          <button onClick={detener}>Detener cámara</button>
        ) : (
          <button onClick={iniciar} style={{ fontWeight: 700 }}>
            📷 Iniciar cámara
          </button>
        )}
      </div>

      {error && <p style={{ color: "crimson", fontSize: 14 }}>{error}</p>}

      {c && resultado && (
        <div
          style={{
            marginTop: 14,
            background: c.bg,
            color: c.fg,
            borderRadius: 14,
            padding: "18px 20px",
          }}
        >
          <div style={{ fontSize: 28 }}>{c.icono}</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{c.titulo}</div>
          {resultado.status !== "noexiste" && resultado.status !== "sin_permiso" ? (
            <>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>{resultado.nombre}</div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>
                {resultado.rol ? `${resultado.rol} · ` : ""}
                {resultado.evento}
              </div>
              {resultado.status === "repetido" && resultado.checkedInAt && (
                <div style={{ fontSize: 13, marginTop: 6, opacity: 0.95 }}>
                  Registrado el {fechaHora(new Date(resultado.checkedInAt))}
                </div>
              )}
              {resultado.status === "falta_requisito" && resultado.motivo && (
                <div style={{ fontSize: 13, marginTop: 6 }}>Para darle almuerzo: {resultado.motivo}.</div>
              )}
              {resultado.status === "ok" && resultado.asistira && resultado.asistira !== "Sí" && (
                <div style={{ fontSize: 13, marginTop: 6 }}>
                  Nota: al inscribirse marcó “{resultado.asistira}”.
                </div>
              )}
            </>
          ) : (
            <div style={{ fontSize: 13, marginTop: 6 }}>
              {resultado.status === "sin_permiso"
                ? "Pide a un Admin que te habilite este puesto de escaneo."
                : "El código no corresponde a ninguna inscripción."}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>
          ¿Sin QR? Busca por correo o pega el código:
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!manual.trim()) return;
            const v = manual.trim();
            registrar(v.includes("@") ? { correo: v } : { codigo: v }, false);
            setManual("");
          }}
          style={{ display: "flex", gap: 8 }}
        >
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="correo@ejemplo.com"
            style={{ flex: 1 }}
          />
          <button type="submit" disabled={enviando}>
            Registrar
          </button>
        </form>
      </div>
    </div>
  );
}
