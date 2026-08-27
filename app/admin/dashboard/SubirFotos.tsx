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
  const [subiendo, setSubiendo] = useState(false);
  const [estado, setEstado] = useState("");

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSubiendo(true);
    let ok = 0;
    for (let i = 0; i < files.length; i++) {
      setEstado(`Subiendo ${i + 1} de ${files.length}…`);
      try {
        const blob = await comprimir(files[i]);
        const nombre = files[i].name.replace(/\.[^.]+$/, "") + (blob.type === "image/jpeg" ? ".jpg" : "");
        const fd = new FormData();
        fd.append("albumId", albumId);
        fd.append("foto", blob, nombre);
        const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (r.ok) ok++;
        else {
          const d = await r.json().catch(() => ({}));
          setEstado(`Error en "${files[i].name}": ${d.error || r.status}`);
        }
      } catch {
        setEstado(`Error subiendo "${files[i].name}"`);
      }
    }
    if (inputRef.current) inputRef.current.value = "";
    setSubiendo(false);
    setEstado(`Listo: ${ok} de ${files.length} fotos subidas.`);
    router.refresh();
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        alignItems: "center",
        padding: 12,
        background: "#fff8e8",
        border: "1px dashed #d9b657",
        borderRadius: 8,
        marginBottom: 8,
      }}
    >
      <strong style={{ fontSize: 14 }}>📤 Subir fotos</strong>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        disabled={subiendo}
        onChange={onChange}
      />
      {estado && <span style={{ fontSize: 13 }}>{estado}</span>}
      <span style={{ fontSize: 12, opacity: 0.7, flexBasis: "100%" }}>
        Elige varias a la vez. Se reducen de tamaño automáticamente antes de subir.
      </span>
    </div>
  );
}
