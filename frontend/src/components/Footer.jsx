export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      background: "linear-gradient(180deg, #1f2937 0%, #111827 100%)",
      color: "#d1d5db",
      padding: "3rem 2rem 2rem",
      marginTop: "auto",
      borderTop: "1px solid #374151",
      boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.2)"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem"
      }}>
        {/* Brand with Logo */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          fontSize: "1.3rem",
          fontWeight: "bold",
          color: "white"
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#91C4C3" stroke="white"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          AI Resume Builder
        </div>

        {/* Description */}
        <p style={{
          textAlign: "center",
          fontSize: "0.95rem",
          maxWidth: "600px",
          margin: 0,
          lineHeight: "1.6",
          color: "#9ca3af"
        }}>
          Create professional, ATS-friendly resumes with AI-powered assistance. 
          Built with React, Node.js, and OpenAI.
        </p>

        {/* Social Links or Quick Links */}
        <div style={{
          display: "flex",
          gap: "2rem",
          fontSize: "0.9rem",
          flexWrap: "wrap",
          justifyContent: "center"
        }}>
          <a href="/privacy" style={{
            color: "#93c5fd",
            textDecoration: "none",
            transition: "all 0.3s ease",
            padding: "0.5rem 0",
            borderBottom: "2px solid transparent"
          }}
          onMouseEnter={(e) => {
            e.target.style.color = "#60a5fa";
            e.target.style.borderBottomColor = "#60a5fa";
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.color = "#93c5fd";
            e.target.style.borderBottomColor = "transparent";
            e.target.style.transform = "translateY(0)";
          }}
          >
            Privacy Policy
          </a>
          <a href="/terms" style={{
            color: "#93c5fd",
            textDecoration: "none",
            transition: "all 0.3s ease",
            padding: "0.5rem 0",
            borderBottom: "2px solid transparent"
          }}
          onMouseEnter={(e) => {
            e.target.style.color = "#60a5fa";
            e.target.style.borderBottomColor = "#60a5fa";
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.color = "#93c5fd";
            e.target.style.borderBottomColor = "transparent";
            e.target.style.transform = "translateY(0)";
          }}
          >
            Terms of Service
          </a>
          <a href="/contact" style={{
            color: "#93c5fd",
            textDecoration: "none",
            transition: "all 0.3s ease",
            padding: "0.5rem 0",
            borderBottom: "2px solid transparent"
          }}
          onMouseEnter={(e) => {
            e.target.style.color = "#60a5fa";
            e.target.style.borderBottomColor = "#60a5fa";
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.color = "#93c5fd";
            e.target.style.borderBottomColor = "transparent";
            e.target.style.transform = "translateY(0)";
          }}
          >
            Contact
          </a>
        </div>

        {/* Copyright */}
        <div style={{
          fontSize: "0.85rem",
          color: "#6b7280",
          borderTop: "1px solid #374151",
          paddingTop: "1.5rem",
          width: "100%",
          textAlign: "center",
          marginTop: "1rem"
        }}>
          <div style={{ marginBottom: "0.5rem" }}>
            © {currentYear} AI Resume Builder. All rights reserved.
          </div>
          <div style={{ fontSize: "0.8rem", color: "#4b5563" }}>
            Empowering careers with AI technology
          </div>
        </div>
      </div>
    </footer>
  );
}



