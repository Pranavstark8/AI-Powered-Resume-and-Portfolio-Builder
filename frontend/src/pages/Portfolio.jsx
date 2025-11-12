import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import API_URL from "../config/api";

export default function PortfolioPage() {
  const { userId } = useParams();
  const [resume, setResume] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // Get current logged-in user data for fallback (if viewing own portfolio)
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
  const isOwnPortfolio = loggedInUser && loggedInUser.id?.toString() === userId;

  // Safe parse function - handles already parsed data or JSON strings
  const safeParse = (data) => {
    if (!data) return null;
    if (typeof data === 'object') return data;
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  };

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/portfolio/${userId}`);
        setResume(res.data);
        setNotFound(false);
      } catch (err) {
        console.error("Portfolio not found");
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [userId]);

  const handleSharePortfolio = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setShowShareModal(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        backgroundColor: "#F3F4F6"
      }}>
        <p style={{ fontSize: "1.2rem", color: "#6B7280" }}>Loading portfolio...</p>
      </div>
    );
  }

  // No portfolio found state
  if (notFound || !resume) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        backgroundColor: "#F3F4F6",
        padding: "2rem",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}>
        <img 
          src="/No_Portfolio.svg" 
          alt="No Portfolio Found" 
          style={{ 
            maxWidth: "400px", 
            width: "100%",
            marginBottom: "2rem"
          }} 
        />
        <h1 style={{ 
          fontSize: "2rem", 
          fontWeight: "700",
          color: "#1F2937",
          margin: "0 0 1rem 0",
          textAlign: "center"
        }}>
          No Portfolio Found
        </h1>
        <p style={{ 
          fontSize: "1.1rem", 
          color: "#6B7280",
          textAlign: "center",
          maxWidth: "500px",
          lineHeight: "1.6",
          margin: "0 0 2rem 0"
        }}>
          This user hasn't created a portfolio yet. Create your own resume and portfolio to showcase your skills!
        </p>
        <a
          href="/"
          style={{
            backgroundColor: "#91C4C3",
            color: "white",
            padding: "0.875rem 2rem",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "1rem",
            fontWeight: "600",
            transition: "all 0.3s ease",
            boxShadow: "0 2px 8px rgba(145, 196, 195, 0.3)"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#7AB3B2";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(145, 196, 195, 0.4)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "#91C4C3";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(145, 196, 195, 0.3)";
          }}
        >
          Go to Home
        </a>
      </div>
    );
  }

  const summary = safeParse(resume.summary);
  const skills = safeParse(resume.skills);
  const experience = safeParse(resume.experience);
  const internship = safeParse(resume.internship);
  const jobExperience = safeParse(resume.job_experience);
  const education = safeParse(resume.education);
  const projects = safeParse(resume.projects);

  // Combine all experience (moved up to use in profession extraction)
  const allExperience = [
    ...(jobExperience || []),
    ...(internship || []),
    ...(experience || [])
  ].filter(exp => exp && (exp.position || exp.role || exp.title));

  // Handle both old and new data structures
  // Old structure: summary is a string (AI-generated text)
  // New structure: summary is an object {name, email, mobile, linkedin, github, portfolio, summary}
  
  let userName = "";
  let userBio = "";
  let userEmail = "";
  let userGithub = "";
  let userLinkedin = "";
  let userPortfolio = "";
  let userProfilePicture = resume?.profilePicture || null;
  
  console.log("=== PORTFOLIO DATA PROCESSING ===");
  console.log("Summary type:", typeof summary);
  console.log("Summary value:", summary);
  console.log("Resume accountName:", resume?.accountName);
  console.log("Logged in user:", loggedInUser);
  console.log("Is own portfolio:", isOwnPortfolio);
  console.log("Fallback name from localStorage:", loggedInUser?.name);
  
  if (typeof summary === 'string') {
    // Old structure: summary is just the AI-generated text
    userBio = summary;
    // Try to get name from resume, account, or logged-in user (if own portfolio)
    userName = resume?.name || resume?.accountName || (isOwnPortfolio ? loggedInUser?.name : "") || "";
    console.log("Using old structure - userBio:", userBio?.substring(0, 50) + "...");
    console.log("Using old structure - userName:", userName);
  } else if (summary && typeof summary === 'object') {
    // New structure: summary is an object with contact details
    userName = summary.name || resume?.accountName || (isOwnPortfolio ? loggedInUser?.name : "") || "";
    userEmail = summary.email || "";
    userGithub = summary.github || "";
    userLinkedin = summary.linkedin || "";
    userPortfolio = summary.portfolio || "";
    userBio = summary.summary || "";
    console.log("Using new structure - userName:", userName);
    console.log("Using new structure - userBio:", userBio?.substring(0, 50) + "...");
  }
  
  console.log("Final values - userName:", userName);
  console.log("Final values - userBio:", userBio?.substring(0, 50) + "...");
  console.log("Final values - userProfession will be:", resume?.title || allExperience[0]?.role);
  
  // Get profession/title - try multiple sources
  let userProfession = resume?.title || "";
  
  // If no title, try to generate from experience
  if (!userProfession && allExperience && allExperience.length > 0) {
    const firstExp = allExperience[0];
    userProfession = firstExp.position || firstExp.role || firstExp.title || "";
  }

  // Group skills by category
  const groupedSkills = {
    frontend: [],
    backend: [],
    tools: [],
    aiml: []
  };

  if (skills && Array.isArray(skills)) {
    skills.forEach(skill => {
      const skillLower = skill.toLowerCase();
      if (skillLower.includes('react') || skillLower.includes('vue') || 
          skillLower.includes('angular') || skillLower.includes('typescript') ||
          skillLower.includes('javascript') || skillLower.includes('html') || 
          skillLower.includes('css') || skillLower.includes('tailwind') || 
          skillLower.includes('next')) {
        groupedSkills.frontend.push(skill);
      } else if (skillLower.includes('node') || skillLower.includes('python') || 
                 skillLower.includes('django') || skillLower.includes('flask') ||
                 skillLower.includes('express') || skillLower.includes('sql') || 
                 skillLower.includes('mongo') || skillLower.includes('postgres') ||
                 skillLower.includes('java') || skillLower.includes('spring')) {
        groupedSkills.backend.push(skill);
      } else if (skillLower.includes('git') || skillLower.includes('docker') || 
                 skillLower.includes('aws') || skillLower.includes('azure') ||
                 skillLower.includes('ci/cd') || skillLower.includes('kubernetes') ||
                 skillLower.includes('jenkins')) {
        groupedSkills.tools.push(skill);
      } else if (skillLower.includes('ai') || skillLower.includes('ml') || 
                 skillLower.includes('tensor') || skillLower.includes('pytorch') ||
                 skillLower.includes('openai') || skillLower.includes('hugging') ||
                 skillLower.includes('machine learning')) {
        groupedSkills.aiml.push(skill);
      } else {
        // Default to tools
        groupedSkills.tools.push(skill);
      }
    });
  }

  return (
    <div style={{ 
      backgroundColor: "#F3F4F6", 
      minHeight: "100vh",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      {/* Hero Section */}
      <section style={{
        background: "linear-gradient(135deg, #264653 0%, #2A9D8F 50%, #91C4C3 100%)",
        padding: "5rem 2rem",
        color: "white",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decorative Background Elements */}
        <div style={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
          filter: "blur(80px)"
        }}></div>
        <div style={{
          position: "absolute",
          bottom: "-10%",
          left: "-5%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.08)",
          filter: "blur(60px)"
        }}></div>

        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          {/* Share Portfolio Button */}
          <button
            onClick={handleSharePortfolio}
            style={{
              position: "absolute",
              top: "-2rem",
              right: "0",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              color: "white",
              padding: "0.75rem 1.5rem",
              borderRadius: "10px",
              fontSize: "0.95rem",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.color = "#264653";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.15)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.color = "white";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: "18px" }}>
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            Share Portfolio
          </button>

          {/* Hero Content - Profile Picture + Text */}
          <div style={{ 
            display: "flex", 
            flexDirection: "row",
            alignItems: "center",
            gap: "3rem",
            marginTop: "2rem",
            flexWrap: "wrap"
          }}>
            {/* Profile Picture - Left Side */}
            {userProfilePicture && (
              <div style={{
                flexShrink: 0
              }}>
                <div style={{
                  width: "280px",
                  height: "280px",
                  borderRadius: "50%",
                  border: "8px solid white",
                  overflow: "hidden",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
                  backgroundColor: "#F3F4F6"
                }}>
                  <img
                    src={userProfilePicture}
                    alt={userName || "Profile"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />
                </div>
              </div>
            )}

            {/* Text Content - Right Side */}
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: "1.5rem",
              flex: 1,
              minWidth: "300px"
            }}>
              {/* Name */}
              {userName ? (
                <h1 style={{ 
                  fontSize: "4.5rem", 
                  fontWeight: "800", 
                  margin: "0",
                  lineHeight: "1.1",
                  letterSpacing: "-0.02em",
                  textShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
                }}>
                  {userName}
                </h1>
              ) : (
                <h1 style={{ 
                  fontSize: "4.5rem", 
                  fontWeight: "800", 
                  margin: "0",
                  lineHeight: "1.1",
                  letterSpacing: "-0.02em",
                  textShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
                }}>
                  Professional Portfolio
                </h1>
              )}

              {/* Profession/Title */}
              {userProfession && (
                <div style={{
                  display: "inline-block",
                  alignSelf: "flex-start"
                }}>
                  <p style={{ 
                    fontSize: "1.75rem", 
                    fontWeight: "600",
                    margin: "0",
                    padding: "0.5rem 1.5rem",
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "50px",
                    border: "2px solid rgba(255, 255, 255, 0.2)",
                    letterSpacing: "0.02em"
                  }}>
                    {userProfession}
                  </p>
                </div>
              )}

              {/* Summary/Bio */}
              {userBio && (
                <p style={{ 
                  fontSize: "1.15rem", 
                  maxWidth: "700px",
                  lineHeight: "1.8",
                  margin: "0.5rem 0 0 0",
                  opacity: "0.95",
                  fontWeight: "400",
                  textShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
                }}>
                  {userBio}
                </p>
              )}

              {/* Contact Buttons */}
              <div style={{ 
                display: "flex", 
                gap: "1rem", 
                flexWrap: "wrap",
                marginTop: "1rem"
              }}>
              {userEmail && (
                <a
                  href={`mailto:${userEmail}`}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    color: "white",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "10px",
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                    e.currentTarget.style.color = "#264653";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
                    e.currentTarget.style.color = "white";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: "18px" }}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  Email
                </a>
              )}
              {userGithub && (
                <a
                  href={userGithub.startsWith('http') ? userGithub : `https://${userGithub}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    color: "white",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "10px",
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                    e.currentTarget.style.color = "#264653";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
                    e.currentTarget.style.color = "white";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: "18px" }}>
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                  </svg>
                  GitHub
                </a>
              )}
              {userLinkedin && (
                <a
                  href={userLinkedin.startsWith('http') ? userLinkedin : `https://${userLinkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    color: "white",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "10px",
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                    e.currentTarget.style.color = "#264653";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
                    e.currentTarget.style.color = "white";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: "18px" }}>
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                  LinkedIn
                </a>
              )}
              {userPortfolio && (
                <a
                  href={userPortfolio.startsWith('http') ? userPortfolio : `https://${userPortfolio}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    color: "white",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "10px",
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                    e.currentTarget.style.color = "#264653";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
                    e.currentTarget.style.color = "white";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: "18px" }}>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  Website
                </a>
              )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 2rem" }}>
        
        {/* Education Section - Now ABOVE Skills */}
        {education && education.length > 0 && (
          <section style={{ marginBottom: "3rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
              <div style={{
                width: "50px",
                height: "50px",
                backgroundColor: "#D1FAE5",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem"
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <h2 style={{ 
                fontSize: "2rem", 
                fontWeight: "700",
                color: "#1F2937",
                margin: 0
              }}>
                Education
              </h2>
                  </div>

            {education.map((edu, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "2rem",
                  marginBottom: "1rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  border: "1px solid #E5E7EB"
                }}
              >
                <h3 style={{ 
                  fontSize: "1.5rem", 
                  fontWeight: "600",
                  color: "#1F2937",
                  margin: "0 0 0.5rem 0"
                }}>
                  {edu.degree}
                </h3>
                <p style={{ 
                  fontSize: "1rem",
                  color: "#6B7280",
                  margin: "0 0 1rem 0"
                }}>
                  {edu.institution} | {edu.year}
                </p>
                {edu.details && (
                  <p style={{ 
                    fontSize: "0.95rem",
                    color: "#4B5563",
                    margin: 0,
                    lineHeight: "1.6"
                  }}>
                    {edu.details}
                  </p>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Skills Section - Tech Stack */}
        {skills && skills.length > 0 && (
          <section style={{ marginBottom: "3rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
              <div style={{
                width: "50px",
                height: "50px",
                backgroundColor: "#DBEAFE",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem"
              }}>
                {'</>'}
              </div>
              <h2 style={{ 
                fontSize: "2rem", 
                fontWeight: "700",
                color: "#1F2937",
                margin: 0
              }}>
                Tech Stack
              </h2>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.5rem"
            }}>
              {/* Frontend */}
              {groupedSkills.frontend.length > 0 && (
                <div style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "2rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  border: "1px solid #E5E7EB",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(145, 196, 195, 0.2)";
                  e.currentTarget.style.borderColor = "#91C4C3";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                  e.currentTarget.style.borderColor = "#E5E7EB";
                }}>
                  <h3 style={{ 
                    fontSize: "1.25rem", 
                    fontWeight: "700",
                    color: "#1F2937",
                    margin: "0 0 1.25rem 0"
                  }}>
                    Frontend
                  </h3>
                  <div style={{ 
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.75rem"
                  }}>
                    {groupedSkills.frontend.map((skill, idx) => (
                      <span key={idx} style={{
                        backgroundColor: "#E6F7F7",
                        color: "#264653",
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        transition: "all 0.2s ease",
                        border: "1px solid transparent"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#91C4C3";
                        e.currentTarget.style.color = "white";
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "#E6F7F7";
                        e.currentTarget.style.color = "#264653";
                        e.currentTarget.style.transform = "scale(1)";
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Backend */}
              {groupedSkills.backend.length > 0 && (
                <div style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "2rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  border: "1px solid #E5E7EB",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(145, 196, 195, 0.2)";
                  e.currentTarget.style.borderColor = "#91C4C3";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                  e.currentTarget.style.borderColor = "#E5E7EB";
                }}>
                  <h3 style={{ 
                    fontSize: "1.25rem", 
                    fontWeight: "700",
                    color: "#1F2937",
                    margin: "0 0 1.25rem 0"
                  }}>
                    Backend
                  </h3>
                  <div style={{ 
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.75rem"
                  }}>
                    {groupedSkills.backend.map((skill, idx) => (
                      <span key={idx} style={{
                        backgroundColor: "#E6F7F7",
                        color: "#264653",
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        transition: "all 0.2s ease",
                        border: "1px solid transparent"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#91C4C3";
                        e.currentTarget.style.color = "white";
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "#E6F7F7";
                        e.currentTarget.style.color = "#264653";
                        e.currentTarget.style.transform = "scale(1)";
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools & DevOps */}
              {groupedSkills.tools.length > 0 && (
                <div style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "2rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  border: "1px solid #E5E7EB",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(145, 196, 195, 0.2)";
                  e.currentTarget.style.borderColor = "#91C4C3";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                  e.currentTarget.style.borderColor = "#E5E7EB";
                }}>
                  <h3 style={{ 
                    fontSize: "1.25rem", 
                    fontWeight: "700",
                    color: "#1F2937",
                    margin: "0 0 1.25rem 0"
                  }}>
                    DevOps & Tools
                  </h3>
                  <div style={{ 
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.75rem"
                  }}>
                    {groupedSkills.tools.map((skill, idx) => (
                      <span key={idx} style={{
                        backgroundColor: "#E6F7F7",
                        color: "#264653",
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        transition: "all 0.2s ease",
                        border: "1px solid transparent"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#91C4C3";
                        e.currentTarget.style.color = "white";
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "#E6F7F7";
                        e.currentTarget.style.color = "#264653";
                        e.currentTarget.style.transform = "scale(1)";
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI/ML & Databases */}
              {groupedSkills.aiml.length > 0 && (
                <div style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "2rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  border: "1px solid #E5E7EB",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(145, 196, 195, 0.2)";
                  e.currentTarget.style.borderColor = "#91C4C3";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                  e.currentTarget.style.borderColor = "#E5E7EB";
                }}>
                  <h3 style={{ 
                    fontSize: "1.25rem", 
                    fontWeight: "700",
                    color: "#1F2937",
                    margin: "0 0 1.25rem 0"
                  }}>
                    AI/ML & Databases
                  </h3>
                  <div style={{ 
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.75rem"
                  }}>
                    {groupedSkills.aiml.map((skill, idx) => (
                      <span key={idx} style={{
                        backgroundColor: "#E6F7F7",
                        color: "#264653",
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        transition: "all 0.2s ease",
                        border: "1px solid transparent"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#91C4C3";
                        e.currentTarget.style.color = "white";
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "#E6F7F7";
                        e.currentTarget.style.color = "#264653";
                        e.currentTarget.style.transform = "scale(1)";
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Experience Section */}
        {allExperience.length > 0 && (
          <section style={{ marginBottom: "3rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
              <div style={{
                width: "50px",
                height: "50px",
                backgroundColor: "#E0F2FE",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem"
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <h2 style={{ 
                fontSize: "2rem", 
                fontWeight: "700",
                color: "#1F2937",
                margin: 0
              }}>
                Experience
              </h2>
            </div>

            {allExperience.map((exp, i) => {
              const position = exp.position || exp.role || exp.title;
              const company = exp.company || exp.organization;
              const duration = exp.duration || exp.period || exp.year;
              const description = exp.description || exp.responsibilities || '';
              const responsibilities = exp.responsibilities || [];

              // Parse bullet points from description
              let bulletPoints = [];
              if (Array.isArray(responsibilities) && responsibilities.length > 0) {
                bulletPoints = responsibilities;
              } else if (description) {
                bulletPoints = description.split('\n').filter(line => line.trim());
              }

              return (
                <div
                  key={i}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "2rem",
                    marginBottom: "1rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    border: "1px solid #E5E7EB"
                  }}
                >
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "flex-start",
                    marginBottom: "1rem",
                    flexWrap: "wrap",
                    gap: "0.5rem"
                  }}>
                    <h3 style={{ 
                      fontSize: "1.5rem", 
                      fontWeight: "600",
                      color: "#1F2937",
                      margin: 0
                    }}>
                      {position}
                    </h3>
                    <span style={{
                      fontSize: "1rem",
                      color: "#6B7280",
                      fontWeight: "500"
                    }}>
                      {duration}
                    </span>
                  </div>
                  <p style={{ 
                    fontSize: "1rem",
                    color: "#6B7280",
                    margin: "0 0 1rem 0"
                  }}>
                    {company}
                  </p>
                  
                  {bulletPoints.length > 0 && (
                    <ul style={{ 
                      fontSize: "0.95rem",
                      color: "#4B5563",
                      lineHeight: "1.8",
                      margin: 0,
                      paddingLeft: "1.5rem"
                    }}>
                      {bulletPoints.map((point, idx) => (
                        <li key={idx} style={{ marginBottom: "0.5rem" }}>
                          {point.replace(/^[•\-*]\s*/, '')}
                        </li>
                      ))}
                    </ul>
                )}
              </div>
              );
            })}
          </section>
        )}

        {/* Featured Projects Section */}
        {projects && projects.length > 0 && (
          <section style={{ marginBottom: "3rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
              <div style={{
                width: "50px",
                height: "50px",
                backgroundColor: "#FEF3C7",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem"
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </div>
              <h2 style={{ 
                fontSize: "2rem", 
                fontWeight: "700",
                color: "#1F2937",
                margin: 0
              }}>
                Featured Projects
              </h2>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
              gap: "1.5rem"
            }}>
              {projects.map((project, i) => {
                const techStack = project.techStack || project.technologies || project.tech || '';
                const techArray = typeof techStack === 'string' 
                  ? techStack.split(',').map(t => t.trim()).filter(t => t)
                  : Array.isArray(techStack) ? techStack : [];

                return (
                  <div
                    key={i}
                    onClick={() => setSelectedProject(project)}
                    style={{
                      backgroundColor: "white",
                      borderRadius: "12px",
                      padding: "2rem",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      border: "1px solid #E5E7EB",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
                      e.currentTarget.style.borderColor = "#91C4C3";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                      e.currentTarget.style.borderColor = "#E5E7EB";
                    }}
                  >
                    <h3 style={{ 
                      fontSize: "1.5rem", 
                      fontWeight: "600",
                      color: "#1F2937",
                      margin: "0 0 1rem 0"
                    }}>
                      {project.title || project.name}
                    </h3>
                    <p style={{ 
                      fontSize: "0.95rem",
                      color: "#6B7280",
                      lineHeight: "1.6",
                      margin: "0 0 1.5rem 0",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}>
                      {project.description || project.summary || 'Click to view details'}
                    </p>

                    {techArray.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {techArray.slice(0, 4).map((tech, idx) => (
                          <span
                            key={idx}
                            style={{
                              backgroundColor: tech.toLowerCase().includes('react') ? "#E0F2FE" :
                                             tech.toLowerCase().includes('node') || tech.toLowerCase().includes('next') ? "#D1FAE5" :
                                             tech.toLowerCase().includes('postgres') || tech.toLowerCase().includes('stripe') ? "#DBEAFE" :
                                             "#F3F4F6",
                              color: tech.toLowerCase().includes('react') ? "#0284C7" :
                                     tech.toLowerCase().includes('node') || tech.toLowerCase().includes('next') ? "#059669" :
                                     tech.toLowerCase().includes('postgres') || tech.toLowerCase().includes('stripe') ? "#2563EB" :
                                     "#4B5563",
                              padding: "0.375rem 0.75rem",
                              borderRadius: "6px",
                              fontSize: "0.875rem",
                              fontWeight: "500"
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                        {techArray.length > 4 && (
                          <span style={{
                            color: "#6B7280",
                            padding: "0.375rem 0.75rem",
                            fontSize: "0.875rem",
                            fontWeight: "500"
                          }}>
                            +{techArray.length - 4} more
                          </span>
                        )}
                  </div>
                )}
              </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "2rem"
          }}
          onClick={() => setSelectedProject(null)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              maxWidth: "700px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedProject(null)}
              style={{
                position: "absolute",
                top: "1.5rem",
                right: "1.5rem",
                backgroundColor: "transparent",
                border: "none",
                fontSize: "2rem",
                cursor: "pointer",
                color: "#6B7280",
                padding: "0.5rem",
                lineHeight: "1",
                transition: "color 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.color = "#1F2937"}
              onMouseOut={(e) => e.currentTarget.style.color = "#6B7280"}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <div style={{ padding: "2.5rem" }}>
              <h2 style={{ 
                fontSize: "2rem", 
                fontWeight: "700",
                color: "#1F2937",
                margin: "0 0 1.5rem 0",
                paddingRight: "2rem"
              }}>
                {selectedProject.title || selectedProject.name}
              </h2>

              <div style={{ marginBottom: "2rem" }}>
                <h3 style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: "600",
                  color: "#1F2937",
                  margin: "0 0 0.75rem 0"
                }}>
                  About the Project
                </h3>
                <p style={{ 
                  fontSize: "1rem",
                  color: "#4B5563",
                  lineHeight: "1.8",
                  margin: 0
                }}>
                  {selectedProject.description || selectedProject.summary || 'No description available.'}
                </p>
              </div>

              {(selectedProject.techStack || selectedProject.technologies || selectedProject.tech) && (
                <div style={{ marginBottom: "2rem" }}>
                  <h3 style={{ 
                    fontSize: "1.25rem", 
                    fontWeight: "600",
                    color: "#1F2937",
                    margin: "0 0 0.75rem 0"
                  }}>
                    Technologies Used
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {(() => {
                      const techStack = selectedProject.techStack || selectedProject.technologies || selectedProject.tech || '';
                      const techArray = typeof techStack === 'string' 
                        ? techStack.split(',').map(t => t.trim()).filter(t => t)
                        : Array.isArray(techStack) ? techStack : [];
                      
                      return techArray.map((tech, idx) => (
                        <span
                          key={idx}
                          style={{
                            backgroundColor: tech.toLowerCase().includes('react') ? "#E0F2FE" :
                                           tech.toLowerCase().includes('node') || tech.toLowerCase().includes('next') ? "#D1FAE5" :
                                           tech.toLowerCase().includes('postgres') || tech.toLowerCase().includes('stripe') ? "#DBEAFE" :
                                           tech.toLowerCase().includes('openai') || tech.toLowerCase().includes('typescript') ? "#FCE7F3" :
                                           "#F3F4F6",
                            color: tech.toLowerCase().includes('react') ? "#0284C7" :
                                   tech.toLowerCase().includes('node') || tech.toLowerCase().includes('next') ? "#059669" :
                                   tech.toLowerCase().includes('postgres') || tech.toLowerCase().includes('stripe') ? "#2563EB" :
                                   tech.toLowerCase().includes('openai') || tech.toLowerCase().includes('typescript') ? "#BE185D" :
                                   "#4B5563",
                            padding: "0.5rem 1rem",
                            borderRadius: "8px",
                            fontSize: "0.95rem",
                            fontWeight: "500"
                          }}
                        >
                          {tech}
                        </span>
                      ));
                    })()}
                  </div>
                </div>
              )}

              {selectedProject.features && (
                <div style={{ marginBottom: "2rem" }}>
                  <h3 style={{ 
                    fontSize: "1.25rem", 
                    fontWeight: "600",
                    color: "#1F2937",
                    margin: "0 0 0.75rem 0"
                  }}>
                    Key Features
                  </h3>
                  <ul style={{ 
                    fontSize: "1rem",
                    color: "#4B5563",
                    lineHeight: "1.8",
                    margin: 0,
                    paddingLeft: "1.5rem"
                  }}>
                    {(Array.isArray(selectedProject.features) 
                      ? selectedProject.features 
                      : selectedProject.features.split('\n')
                    ).map((feature, idx) => (
                      <li key={idx} style={{ marginBottom: "0.5rem" }}>
                        {feature.replace(/^[•\-*]\s*/, '')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(selectedProject.link || selectedProject.github || selectedProject.demo) && (
                <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                  {selectedProject.link && (
                    <a
                      href={selectedProject.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: "#91C4C3",
                        color: "white",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontSize: "1rem",
                        fontWeight: "600",
                        transition: "all 0.3s ease"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#7AB3B2"}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#91C4C3"}
                    >
                      View Project
                    </a>
                  )}
                  {selectedProject.github && (
                    <a
                      href={selectedProject.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: "transparent",
                        border: "2px solid #91C4C3",
                        color: "#91C4C3",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontSize: "1rem",
                        fontWeight: "600",
                        transition: "all 0.3s ease"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#91C4C3";
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#91C4C3";
                      }}
                    >
                      View Code
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            backgroundColor: copied ? "#10B981" : "#1F2937",
            color: "white",
            padding: "1rem 1.5rem",
            borderRadius: "8px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            zIndex: 1001,
            fontSize: "1rem",
            fontWeight: "500",
            animation: "slideIn 0.3s ease"
          }}
        >
          {copied ? "✓ Portfolio link copied!" : "Portfolio link copied to clipboard"}
        </div>
      )}
    </div>
  );
}
