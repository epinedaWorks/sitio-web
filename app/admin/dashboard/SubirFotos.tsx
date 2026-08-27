"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Redimensiona en el navegador antes de subir: fotos de teléfono de 4-8 MB
// quedan en ~200-400 KB, así cada subida es rápida y ligera.
async function comprimir(file: File, max = 1800, quality = 0.82): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const escala = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * escala);
    const h = Math.round(bitmap.height * escala);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob: Blob | null = await new Promise((res) =>
      canvas.toBlob((b) => res(b), "image/jpeg", quality)
    );
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export default function SubirFotos({ albumId }: { albumId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [seleccion, setSeleccion] = useState<File[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [estado, setEstado] = useState("");
  const [arrastrando, setArrastrando] = useState(false);

  function agregar(lista: FileList | File[]) {
    const nuevas = Array.from(lista).filter((f) => f.type.startsWith("image/"));
    if (nuevas.length) setSeleccion((prev) => [...prev, ...nuevas]);
  }

  async function subir() {
    if (seleccion.length === 0) return;
    setSubiendo(true);
    let ok = 0;
    for (let i = 0; i < seleccion.length; i++) {
      setEstado(`Subiendo ${i + 1} de ${seleccion.length}…`);
      try {
        const blob = await comprimir(seleccion[i]);
        const nombre =
          seleccion[i].name.replace(/\.[^.]+$/, "") + (blob.type === "image/jpeg" ? ".jpg" : "");
        const fd = new FormData();
        fd.append("albumId", albumId);
        fd.append("foto", blob, nombre);
        const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (r.ok) ok++;
        else {
          const d = await r.json().catch(() => ({}));
          setEstado(`Error en "${seleccion[i].name}": ${d.error || r.status}`);
        }
      } catch {
        setEstado(`Error subiendo "${seleccion[i].name}"`);
      }
    }
    const total = seleccion.length;
    setSeleccion([]);
    if (inputRef.current) inputRef.current.value = "";
    setSubiendo(false);
    setEstado(`Listo: ${ok} de ${total} foto${total === 1 ? "" : "s"} subida${ok === 1 ? "" : "s"}.`);
    router.refresh();
  }

  return (
    <div style={{ marginBottom: 8 }}>
      <div
        onClick={() => !subiendo && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastrando(false);
          if (!subiendo) agregar(e.dataTransfer.files);
        }}
        style={{
          padding: "18px 16px",
          textAlign: "center",
          background: arrastrando ? "#fff0cc" : "#fff8e8",
          border: `2px dashed ${arrastrando ? "#c99a2e" : "#d9b657"}`,
          borderRadius: 10,
          cursor: subiendo ? "default" : "pointer",
        }}
      >
        <strong style={{ display: "block", fontSize: 14 }}>📤 Subir fotos</strong>
        <span style={{ fontSize: 13, opacity: 0.8 }}>
          Haz clic para elegir <b>varias fotos</b> (mantén <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> o{" "}
          <kbd>Shift</kbd> en el selector), o arrástralas aquí.
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          multiple
          hidden
          disabled={subiendo}
          onChange={(e) => {
            if (e.target.files) agregar(e.target.files);
          }}
        />
      </div>

      {seleccion.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 13 }}>
          <b>{seleccion.length}</b> foto{seleccion.length === 1 ? "" : "s"} seleccionada
          {seleccion.length === 1 ? "" : "s"}:{" "}
          <span style={{ opacity: 0.7 }}>
            {seleccion.slice(0, 4).map((f) => f.name).join(", ")}
            {seleccion.length > 4 ? ` y ${seleccion.length - 4} más` : ""}
          </span>
          <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
            <button type="button" onClick={subir} disabled={subiendo}>
              {subiendo ? "Subiendo…" : `Subir ${seleccion.length} foto${seleccion.length === 1 ? "" : "s"}`}
            </button>
            {!subiendo && (
              <button type="button" onClick={() => setSeleccion([])}>
                Quitar selección
              </button>
            )}
          </div>
        </div>
      )}

      {estado && <p style={{ fontSize: 13, marginTop: 6 }}>{estado}</p>}
      <p style={{ fontSize: 12, opacity: 0.65, marginTop: 4 }}>
        Se reducen de tamaño automáticamente antes de subir. Formatos: JPG, PNG, WebP, GIF, AVIF.
      </p>
    </div>
  );
}
