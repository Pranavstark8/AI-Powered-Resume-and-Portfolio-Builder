import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Home() {
  const navigate = useNavigate();
  
  const handleGetStarted = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    // Check both token and user data exist
    if (token && user) {
      navigate("/dashboard");
    } else {
      // Clear any stale data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/register");
    }
  };
  useEffect(() => {
    // Load Alata font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Alata&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div style={{ backgroundColor: "#F8EDED", minHeight: "100vh", fontFamily: "'Alata', sans-serif" }}>
      {/* Hero Section */}
      <section style={{ 
        backgroundColor: "#91C4C3", 
        padding: "80px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "600px"
      }}>
        <div style={{ 
          maxWidth: "1200px", 
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "60px",
          alignItems: "center"
        }}>
          {/* Left Content */}
          <div style={{ color: "white" }}>
            <h1 style={{ 
              fontSize: "4rem", 
              fontWeight: "bold", 
              marginBottom: "1.5rem",
              lineHeight: "1.1",
              letterSpacing: "-1px"
            }}>
              Build Your Resume with AI in Minutes
            </h1>
            <p style={{ 
              fontSize: "1.5rem", 
              marginBottom: "1rem",
              fontWeight: "300"
            }}>
              Smart. Simple. Professional.
            </p>
            <p style={{ 
              fontSize: "1.1rem", 
              marginBottom: "2.5rem",
              opacity: "0.95",
              lineHeight: "1.6"
            }}>
              Create stunning resumes and portfolios powered by AI. Stand out from the crowd with professionally designed templates.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link 
                to="/register"
                onClick={handleGetStarted}
                style={{
                  backgroundColor: "#264653",
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  fontSize: "16px",
              borderRadius: "8px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 12px rgba(38, 70, 83, 0.3)"
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#1f3a43";
              e.target.style.transform = "translateY(-3px) scale(1.02)";
              e.target.style.boxShadow = "0 8px 20px rgba(38, 70, 83, 0.4)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#264653";
              e.target.style.transform = "translateY(0) scale(1)";
              e.target.style.boxShadow = "0 4px 12px rgba(38, 70, 83, 0.3)";
            }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: "18px" }}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Get Started
              </Link>
              <Link 
                to="/login" 
                style={{
                  background: "transparent",
                  border: "2px solid #264653",
                  color: "#264653",
                padding: "10px 20px",
                borderRadius: "8px",
                fontSize: "16px",
                textDecoration: "none",
                transition: "all 0.3s ease",
                boxShadow: "0 0 0 rgba(38, 70, 83, 0)"
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#264653";
                e.target.style.color = "#fff";
                e.target.style.boxShadow = "0 4px 12px rgba(38, 70, 83, 0.3)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "#264653";
                e.target.style.boxShadow = "0 0 0 rgba(38, 70, 83, 0)";
                e.target.style.transform = "translateY(0)";
              }}
              >
                Login
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div style={{ 
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <img 
              src="/ResumeIllustration.png" 
              alt="Resume Illustration" 
              style={{ 
                maxWidth: "100%", 
                height: "auto",
                maxHeight: "450px",
                objectFit: "contain"
              }} 
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ 
        padding: "80px 20px",
        backgroundColor: "#F8EDED"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ 
            fontSize: "2.5rem", 
            fontWeight: "bold", 
            textAlign: "center",
            marginBottom: "60px",
            color: "#2D3748"
          }}>
            Everything You Need to Succeed
          </h2>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
            gap: "30px" 
          }}>
            {/* AI-Powered Card */}
            <div style={{ 
              backgroundColor: "white",
              padding: "40px",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              border: "1px solid transparent"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 16px 48px rgba(145, 196, 195, 0.2)";
              e.currentTarget.style.borderColor = "#91C4C3";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)";
              e.currentTarget.style.borderColor = "transparent";
            }}>
              <div style={{ 
                width: "60px", 
                height: "60px", 
                backgroundColor: "#E6F7F7", 
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
                fontSize: "28px"
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#91C4C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 style={{ 
                fontSize: "1.5rem", 
                fontWeight: "bold", 
                marginBottom: "12px",
                color: "#2D3748"
              }}>
                AI-Powered
              </h3>
              <p style={{ 
                fontSize: "1rem", 
                color: "#718096",
                lineHeight: "1.6"
              }}>
                Let AI help you craft compelling resume content that highlights your skills and achievements.
              </p>
            </div>

            {/* Professional Templates Card */}
            <div style={{ 
              backgroundColor: "white",
              padding: "40px",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              border: "1px solid transparent"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 16px 48px rgba(145, 196, 195, 0.2)";
              e.currentTarget.style.borderColor = "#91C4C3";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)";
              e.currentTarget.style.borderColor = "transparent";
            }}>
              <div style={{ 
                width: "60px", 
                height: "60px", 
                backgroundColor: "#E6F7F7", 
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
                fontSize: "28px"
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#91C4C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <h3 style={{ 
                fontSize: "1.5rem", 
                fontWeight: "bold", 
                marginBottom: "12px",
                color: "#2D3748"
              }}>
                Professional Templates
              </h3>
              <p style={{ 
                fontSize: "1rem", 
                color: "#718096",
                lineHeight: "1.6"
              }}>
                Choose from beautifully designed templates that make your resume stand out to employers.
              </p>
            </div>

            {/* Portfolio Builder Card */}
            <div style={{ 
              backgroundColor: "white",
              padding: "40px",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              border: "1px solid transparent"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 16px 48px rgba(145, 196, 195, 0.2)";
              e.currentTarget.style.borderColor = "#91C4C3";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)";
              e.currentTarget.style.borderColor = "transparent";
            }}>
              <div style={{ 
                width: "60px", 
                height: "60px", 
                backgroundColor: "#E6F7F7", 
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
                fontSize: "28px"
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#91C4C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <h3 style={{ 
                fontSize: "1.5rem", 
                fontWeight: "bold", 
                marginBottom: "12px",
                color: "#2D3748"
              }}>
                Portfolio Builder
              </h3>
              <p style={{ 
                fontSize: "1rem", 
                color: "#718096",
                lineHeight: "1.6"
              }}>
                Create a stunning online portfolio to showcase your work and share with potential employers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: "100px 20px",
        backgroundColor: "#F8EDED",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ 
            fontSize: "3rem", 
            fontWeight: "bold", 
            marginBottom: "20px",
            color: "#2D3748"
          }}>
            Ready to Land Your Dream Job?
          </h2>
          <p style={{ 
            fontSize: "1.25rem", 
            color: "#718096",
            marginBottom: "40px",
            lineHeight: "1.6"
          }}>
            Join thousands of professionals who have successfully built their careers with our AI-powered tools.
          </p>
          <Link 
            to="/register"
            onClick={handleGetStarted}
            style={{
              backgroundColor: "#264653",
              color: "#fff",
              border: "none",
              padding: "18px 48px",
              fontSize: "1.2rem",
              borderRadius: "8px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 16px rgba(38, 70, 83, 0.3)"
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#1f3a43";
              e.target.style.transform = "translateY(-3px) scale(1.05)";
              e.target.style.boxShadow = "0 8px 24px rgba(38, 70, 83, 0.4)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#264653";
              e.target.style.transform = "translateY(0) scale(1)";
              e.target.style.boxShadow = "0 4px 16px rgba(38, 70, 83, 0.3)";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: "20px" }}>
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            Start Building Now
          </Link>
        </div>
      </section>
    </div>
  );
}

