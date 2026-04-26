"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise(r => setTimeout(r, 500)); // small delay for UX

    // NOTE: For production, replace with a real API-based auth check
    const ADMIN_USER = process.env.NEXT_PUBLIC_ADMIN_USER || "admin";
    const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASS || "echitra2024";

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      localStorage.setItem("admin-auth", "true");
      router.push("/admin");
    } else {
      setError("Invalid username or password");
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background: #080808; font-family: 'DM Sans', sans-serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#080808", padding: 20,
        backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(229,9,20,0.08) 0%, transparent 60%)"
      }}>
        <div style={{
          width: "100%", maxWidth: 400,
          background: "#0d0d0d", border: "1px solid #1a1a1a",
          borderRadius: 16, padding: "36px 32px",
          animation: "fadeUp 0.5s ease",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6)"
        }}>
          {/* LOGO */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: "#e50914", letterSpacing: 3 }}>
              ECHITRA
            </div>
            <div style={{ fontSize: 12, color: "#444", letterSpacing: 2, marginTop: 4 }}>ADMIN PORTAL</div>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, color: "#555", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>USERNAME</label>
              <input
                value={user} onChange={e => setUser(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                style={{
                  width: "100%", background: "#080808", border: "1px solid #222",
                  borderRadius: 8, padding: "12px 14px", color: "#fff",
                  fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif",
                  transition: "border-color 0.2s"
                }}
                onFocus={e => e.target.style.borderColor = "#e50914"}
                onBlur={e => e.target.style.borderColor = "#222"}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, color: "#555", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>PASSWORD</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={pass} onChange={e => setPass(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  style={{
                    width: "100%", background: "#080808", border: "1px solid #222",
                    borderRadius: 8, padding: "12px 44px 12px 14px", color: "#fff",
                    fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif",
                    transition: "border-color 0.2s"
                  }}
                  onFocus={e => e.target.style.borderColor = "#e50914"}
                  onBlur={e => e.target.style.borderColor = "#222"}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16
                }}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: "#1a0808", border: "1px solid #3a1515",
                borderRadius: 8, padding: "10px 14px", marginBottom: 16,
                color: "#f87171", fontSize: 13, textAlign: "center"
              }}>
                ❌ {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", background: loading ? "#333" : "#e50914",
              color: "#fff", border: "none", borderRadius: 10,
              padding: "13px", cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14, fontWeight: 700, letterSpacing: 1,
              fontFamily: "'DM Sans', sans-serif", transition: "background 0.2s"
            }}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 24 }}>
            <a href="/" style={{ color: "#333", fontSize: 12, textDecoration: "none" }}>← Back to site</a>
          </div>
        </div>
      </div>
    </>
  );
}
