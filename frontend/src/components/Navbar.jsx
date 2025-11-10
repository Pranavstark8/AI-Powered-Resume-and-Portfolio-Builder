import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const isAuthenticated = !!user;

  return (
    <nav style={{
      backgroundColor: "rgba(246, 255, 248, 0.7)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
      padding: "1rem 2rem",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
      position: "sticky",
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {/* Logo/Brand */}
        <Link to="/" style={{
          color: "#264653",
          textDecoration: "none",
          fontSize: "1.5rem",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          transition: "transform 0.2s ease"
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: "28px" }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#91C4C3" stroke="#264653"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          AI Resume Builder
        </Link>

        {/* Navigation Links */}
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          {isAuthenticated ? (
            <>
              <Link to="/builder" style={{
                color: "#264653",
                textDecoration: "none",
                fontWeight: "500",
                transition: "all 0.3s ease",
                padding: "0.5rem 1rem",
                borderRadius: "8px"
              }}
              onMouseEnter={(e) => {
                e.target.style.color = "#91C4C3";
                e.target.style.backgroundColor = "rgba(145, 196, 195, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "#264653";
                e.target.style.backgroundColor = "transparent";
              }}
              >
                Build Resume
              </Link>
              <span style={{ color: "#718096", fontSize: "0.9rem" }}>
                Welcome, {user.name}!
              </span>
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: "transparent",
                  color: "#DC2626",
                  border: "2px solid #DC2626",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "all 0.3s ease",
                  fontSize: "0.95rem"
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#DC2626";
                  e.target.style.color = "white";
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 12px rgba(220, 38, 38, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#DC2626";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
              >
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ minWidth: "18px" }}
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{
                color: "#264653",
                textDecoration: "none",
                fontWeight: "500",
                transition: "all 0.3s ease",
                padding: "0.5rem 1rem",
                borderRadius: "8px"
              }}
              onMouseEnter={(e) => {
                e.target.style.color = "#91C4C3";
                e.target.style.backgroundColor = "rgba(145, 196, 195, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "#264653";
                e.target.style.backgroundColor = "transparent";
              }}
              >
                Login
              </Link>
              <Link to="/register" style={{
                backgroundColor: "#264653",
                color: "white",
                textDecoration: "none",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                fontWeight: "600",
                transition: "all 0.3s ease",
                boxShadow: "0 2px 8px rgba(38, 70, 83, 0.2)"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#1f3a43";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 12px rgba(38, 70, 83, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#264653";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 8px rgba(38, 70, 83, 0.2)";
              }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}


