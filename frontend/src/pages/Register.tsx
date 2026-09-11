import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          "Registration failed. Please try a different email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: "var(--background)",
      }}
    >
      {/* LEFT BRAND PANEL */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: "100vh",
          background: "var(--primary-foreground)",
          color: "white",
          padding: "56px 64px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            border: "1px solid rgba(245,181,47,0.20)",
            borderRadius: "50%",
            right: -180,
            top: -140,
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 280,
            height: 280,
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "50%",
            left: -150,
            bottom: 80,
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            Infra<span style={{ color: "var(--primary)" }}>AI</span>
          </div>

          <div
            style={{
              marginTop: 90,
              maxWidth: 500,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.16em",
                color: "var(--primary)",
                marginBottom: 18,
              }}
            >
              BUILT FOR SMARTER INSPECTIONS
            </div>

            <h1
              style={{
                margin: 0,
                fontFamily: "var(--font-display)",
                fontSize: "clamp(42px, 5vw, 68px)",
                lineHeight: 1.02,
                letterSpacing: "-0.045em",
                fontWeight: 600,
              }}
            >
              Inspect.
              <br />
              Assess.
              <br />
              <span style={{ color: "var(--primary)" }}>Prevent.</span>
            </h1>

            <p
              style={{
                marginTop: 28,
                maxWidth: 430,
                fontSize: 16,
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.68)",
              }}
            >
              Create your InfraAI inspector account and bring
              infrastructure monitoring into one intelligent workspace.
            </p>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            fontSize: 12,
            color: "rgba(255,255,255,0.42)",
          }}
        >
          Infrastructure intelligence platform
        </div>
      </section>

      {/* RIGHT REGISTER PANEL */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 32px",
          background: "var(--background)",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ marginBottom: 30 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.14em",
                color: "var(--accent-foreground)",
                marginBottom: 12,
              }}
            >
              GET STARTED
            </div>

            <h2
              style={{
                margin: 0,
                fontFamily: "var(--font-display)",
                fontSize: 38,
                lineHeight: 1.1,
                letterSpacing: "-0.035em",
                color: "var(--foreground)",
              }}
            >
              Create your account.
            </h2>

            <p
              style={{
                margin: "12px 0 0",
                color: "var(--muted-foreground)",
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              Set up your inspector account to start managing infrastructure.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 17 }}>
              <label
                htmlFor="register-name"
                style={{
                  display: "block",
                  marginBottom: 7,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Full name
              </label>

              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Your full name"
                style={{
                  width: "100%",
                  padding: "13px 14px",
                  border: "1px solid var(--input)",
                  borderRadius: 7,
                  background: "var(--card)",
                  color: "var(--foreground)",
                  outline: "none",
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ marginBottom: 17 }}>
              <label
                htmlFor="register-email"
                style={{
                  display: "block",
                  marginBottom: 7,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Email
              </label>

              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  padding: "13px 14px",
                  border: "1px solid var(--input)",
                  borderRadius: 7,
                  background: "var(--card)",
                  color: "var(--foreground)",
                  outline: "none",
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ marginBottom: 17 }}>
              <label
                htmlFor="register-password"
                style={{
                  display: "block",
                  marginBottom: 7,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Password
              </label>

              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="At least 6 characters"
                style={{
                  width: "100%",
                  padding: "13px 14px",
                  border: "1px solid var(--input)",
                  borderRadius: 7,
                  background: "var(--card)",
                  color: "var(--foreground)",
                  outline: "none",
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label
                htmlFor="register-confirm-password"
                style={{
                  display: "block",
                  marginBottom: 7,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Confirm password
              </label>

              <input
                id="register-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Repeat your password"
                style={{
                  width: "100%",
                  padding: "13px 14px",
                  border: "1px solid var(--input)",
                  borderRadius: 7,
                  background: "var(--card)",
                  color: "var(--foreground)",
                  outline: "none",
                  fontSize: 14,
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  marginTop: 12,
                  marginBottom: 16,
                  padding: "10px 12px",
                  borderRadius: 6,
                  background: "rgba(224,82,109,0.08)",
                  color: "var(--destructive)",
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                marginTop: 16,
                padding: "13px 16px",
                border: "none",
                borderRadius: 7,
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>

            <div
              style={{
                textAlign: "center",
                marginTop: 22,
                fontSize: 13,
                color: "var(--muted-foreground)",
              }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "var(--foreground)",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}