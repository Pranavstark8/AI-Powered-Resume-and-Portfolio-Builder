import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      await axios.post("http://localhost:5000/api/auth/register", form);
      setMsg("Registration successful! Redirecting to login...");
      
      // Redirect to login after successful registration
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 200px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1rem",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "20px",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
        padding: "2rem 2rem",
        width: "100%",
        maxWidth: "420px",
        textAlign: "center",
        animation: "fadeIn 0.5s ease-out"
      }}>
        {/* Icon */}
        <div style={{
          width: "64px",
          height: "64px",
          backgroundColor: "#8BC4C3",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.5rem"
        }}>
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: "1.75rem",
          fontWeight: "700",
          color: "#1F2937",
          margin: "0 0 0.5rem 0"
        }}>
          Create Your Account
        </h1>
        
        <p style={{
          fontSize: "0.95rem",
          color: "#6B7280",
          margin: "0 0 2rem 0"
        }}>
          Your next opportunity starts here.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
          {/* Full Name */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{
              display: "block",
              fontSize: "0.9rem",
              fontWeight: "600",
              color: "#1F2937",
              marginBottom: "0.4rem"
            }}>
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                fontSize: "0.95rem",
                border: "none",
                borderRadius: "10px",
                backgroundColor: "#ffeedd",
                color: "#8B7355",
                outline: "none",
                boxSizing: "border-box",
                transition: "all 0.2s"
              }}
        onFocus={(e) => {
          e.target.style.backgroundColor = "#ffddc4";
          e.target.style.boxShadow = "0 0 0 3px rgba(145, 196, 195, 0.2)";
          e.target.style.transform = "scale(1.01)";
        }}
        onBlur={(e) => {
          e.target.style.backgroundColor = "#ffeedd";
          e.target.style.boxShadow = "none";
          e.target.style.transform = "scale(1)";
        }}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{
              display: "block",
              fontSize: "0.9rem",
              fontWeight: "600",
              color: "#1F2937",
              marginBottom: "0.4rem"
            }}>
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                fontSize: "0.95rem",
                border: "none",
                borderRadius: "10px",
                backgroundColor: "#ffeedd",
                color: "#8B7355",
                outline: "none",
                boxSizing: "border-box",
                transition: "all 0.2s"
              }}
        onFocus={(e) => {
          e.target.style.backgroundColor = "#ffddc4";
          e.target.style.boxShadow = "0 0 0 3px rgba(145, 196, 195, 0.2)";
          e.target.style.transform = "scale(1.01)";
        }}
        onBlur={(e) => {
          e.target.style.backgroundColor = "#ffeedd";
          e.target.style.boxShadow = "none";
          e.target.style.transform = "scale(1)";
        }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              fontSize: "0.9rem",
              fontWeight: "600",
              color: "#1F2937",
              marginBottom: "0.4rem"
            }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
              maxLength={128}
              autoComplete="new-password"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                fontSize: "0.95rem",
                border: "none",
                borderRadius: "10px",
                backgroundColor: "#ffeedd",
                color: "#1F2937",
                outline: "none",
                boxSizing: "border-box",
                transition: "all 0.2s"
              }}
        onFocus={(e) => {
          e.target.style.backgroundColor = "#ffddc4";
          e.target.style.boxShadow = "0 0 0 3px rgba(145, 196, 195, 0.2)";
          e.target.style.transform = "scale(1.01)";
        }}
        onBlur={(e) => {
          e.target.style.backgroundColor = "#ffeedd";
          e.target.style.boxShadow = "none";
          e.target.style.transform = "scale(1)";
        }}
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.875rem",
              fontSize: "0.95rem",
              fontWeight: "600",
              color: "white",
              backgroundColor: "#8BC4C3",
              border: "none",
              borderRadius: "10px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              opacity: loading ? 0.7 : 1,
              boxShadow: "0 4px 12px rgba(139, 196, 195, 0.3)"
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = "#7AB3B2";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 20px rgba(139, 196, 195, 0.4)";
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = "#8BC4C3";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(139, 196, 195, 0.3)";
              }
            }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          {/* Error/Success Message */}
          {msg && (
            <div style={{ 
              marginTop: "1rem",
              padding: "0.75rem",
              borderRadius: "8px",
              backgroundColor: msg.includes("successful") ? "#D1FAE5" : "#FEE2E2",
              color: msg.includes("successful") ? "#065F46" : "#991B1B",
              fontSize: "0.9rem",
              textAlign: "center"
            }}>
              {msg}
            </div>
          )}
        </form>

        {/* Login Link */}
        <p style={{ 
          marginTop: "1.5rem", 
          fontSize: "0.9rem",
          color: "#6B7280"
        }}>
          Already have an account?{" "}
          <Link 
            to="/login" 
            style={{ 
              color: "#8BC4C3",
              textDecoration: "none",
              fontWeight: "600"
            }}
            onMouseOver={(e) => e.target.style.textDecoration = "underline"}
            onMouseOut={(e) => e.target.style.textDecoration = "none"}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
