import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      setError("Incorrect email or password.");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 6,
          padding: 40,
          width: 360,
        }}
      >
        <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 18, marginBottom: 24 }}>
          InfraAI
        </div>
        <label style={{ fontSize: 13, color: "var(--color-ink-muted)" }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: 10, marginTop: 4, marginBottom: 16, border: "1px solid var(--color-border)", borderRadius: 4 }}
        />
        <label style={{ fontSize: 13, color: "var(--color-ink-muted)" }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: 10, marginTop: 4, marginBottom: 20, border: "1px solid var(--color-border)", borderRadius: 4 }}
        />
        {error && <div style={{ color: "var(--risk-critical)", fontSize: 13, marginBottom: 16 }}>{error}</div>}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: 10,
            background: "var(--color-accent)",
            color: "white",
            border: "none",
            borderRadius: 4,
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Sign in
        </button>
      </form>
    </div>
  );
}