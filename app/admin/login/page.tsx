"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Correo o contraseña incorrectos");
      return;
    }

    router.push("/admin/dashboard");
  }

  return (
    <main style={{ maxWidth: 380, margin: "100px auto", padding: "0 16px" }}>
      <div className="pg-card" style={{ textAlign: "center" }}>
        <img
          src="/assets/img/brand/logo-badge.png"
          alt="Python Guatemala"
          width={48}
          height={48}
          style={{ borderRadius: "50%", border: "2px solid #ffc23c", margin: "0 auto 14px" }}
        />
        <h1 style={{ fontSize: "1.4rem", margin: "0 0 6px" }}>Panel de Python Guatemala</h1>
        <p style={{ opacity: 0.7, fontSize: 13.5, margin: "0 0 20px" }}>Inicia sesión con tu cuenta del equipo core.</p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="pg-notice pg-notice-err" style={{ margin: 0 }}>{error}</p>}
          <button type="submit" disabled={loading} className="pg-btn pg-btn-primary" style={{ justifyContent: "center" }}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </main>
  );
}
