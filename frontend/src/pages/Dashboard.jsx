import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import ResumePreviewModal from "../components/ResumePreviewModal";
import ImageUploader from "../components/ImageUploader";
import API_URL from "../config/api";

export default function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [stats, setStats] = useState({
    totalResumes: 0,
    lastUpdated: null,
    portfolioViews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePublicId, setProfilePicturePublicId] = useState(null);
  const [previewResume, setPreviewResume] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token || !userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Dashboard: Fetching data...");
        
        const [resumesRes, statsRes, profileRes] = await Promise.all([
          axios.get(`${API_URL}/api/portfolio/user`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/api/portfolio/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        
        console.log("Dashboard: Data received", {
          resumes: resumesRes.data,
          stats: statsRes.data,
          profile: profileRes.data
        });
        
        setResumes(resumesRes.data || []);
        setStats(statsRes.data || {
          totalResumes: 0,
          lastUpdated: null,
          portfolioViews: 0,
        });
        
        // Set profile picture if available
        if (profileRes.data && profileRes.data.success) {
          const user = profileRes.data.user;
          setProfilePicture(user.profile_picture || null);
          setProfilePicturePublicId(user.profile_picture_public_id || null);
          
          // Update user in localStorage if name/profile changed
          if (user.name || user.email) {
            const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
            const updatedUser = {
              ...currentUser,
              ...user
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            window.dispatchEvent(new Event('userUpdated'));
          }
        }
      } catch (err) {
        console.error("Dashboard: Error fetching data:", err);
        console.error("Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          statusText: err.response?.statusText
        });
        
        // If token is invalid or expired, redirect to login
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.log("Dashboard: Token invalid, redirecting to login");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          // Set empty state on error to prevent showing stale data
          setResumes([]);
          setStats({
            totalResumes: 0,
            lastUpdated: null,
            portfolioViews: 0,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, location]);

  // Handle profile picture upload
  const handleImageUploaded = async (imageUrl, publicId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/api/auth/profile-picture`,
        {
          profilePictureUrl: imageUrl,
          publicId: publicId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setProfilePicture(imageUrl);
        setProfilePicturePublicId(publicId);
        // Update user in localStorage
        const updatedUser = response.data.user;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        // Notify Navbar to refresh
        window.dispatchEvent(new Event('userUpdated'));
      }
    } catch (error) {
      console.error("Error saving profile picture:", error);
    }
  };

  // Handle profile picture deletion
  const handleImageDeleted = () => {
    setProfilePicture(null);
    setProfilePicturePublicId(null);
    // Update user in localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const updatedUser = JSON.parse(userData);
      updatedUser.profile_picture = null;
      updatedUser.profile_picture_public_id = null;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getResumeTitle = (resume) => {
    if (resume.title) return resume.title;
    
    // Try to parse experience to get a title
    try {
      const experience = JSON.parse(resume.experience || "[]");
      if (experience.length > 0 && experience[0].position) {
        return `${experience[0].position} Resume`;
      }
    } catch (e) {
      // Fallback
    }
    
    return `Resume ${resume.id}`;
  };

  return (
    <div style={{ 
      backgroundColor: "#F8F9FA", 
      minHeight: "100vh",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      {/* Main Content */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2.5rem 2rem" }}>
        {/* Welcome Banner */}
        <div style={{
          background: "linear-gradient(135deg, #91C4C3 0%, #6B9E9D 100%)",
          borderRadius: "16px",
          padding: "3rem",
          marginBottom: "2.5rem",
          color: "white",
          boxShadow: "0 4px 20px rgba(145, 196, 195, 0.3)"
        }}>
          <h1 style={{ 
            fontSize: "2.5rem", 
            fontWeight: "700", 
            marginBottom: "0.5rem",
            margin: 0
          }}>
            Welcome, {user?.name || "User"}
          </h1>
          <p style={{ 
            fontSize: "1.1rem", 
            opacity: 0.95,
            margin: "0.5rem 0 0 0"
          }}>
            Let's build something amazing today!
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2.5rem"
        }}>
          {/* Total Resumes */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "2rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            border: "1px solid #E5E7EB",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{ 
              position: "absolute", 
              top: "1.5rem", 
              right: "1.5rem",
              fontSize: "2rem",
              opacity: 0.2
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <p style={{ 
              fontSize: "0.875rem", 
              color: "#6B7280",
              fontWeight: "500",
              margin: "0 0 0.5rem 0",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              Total Resumes
            </p>
            <h2 style={{ 
              fontSize: "2.5rem", 
              fontWeight: "700",
              color: "#1F2937",
              margin: "0 0 0.5rem 0"
            }}>
              {stats.totalResumes}
            </h2>
            <p style={{ 
              fontSize: "0.875rem",
              color: "#10B981",
              margin: 0,
              fontWeight: "500"
            }}>
              {stats.newThisMonth > 0 ? `+${stats.newThisMonth} from last month` : "Start creating your first resume"}
            </p>
          </div>

          {/* Last Updated */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "2rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            border: "1px solid #E5E7EB",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{ 
              position: "absolute", 
              top: "1.5rem", 
              right: "1.5rem",
              fontSize: "2rem",
              opacity: 0.2
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <p style={{ 
              fontSize: "0.875rem", 
              color: "#6B7280",
              fontWeight: "500",
              margin: "0 0 0.5rem 0",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              Last Updated
            </p>
            <h2 style={{ 
              fontSize: "2.5rem", 
              fontWeight: "700",
              color: "#1F2937",
              margin: "0 0 0.5rem 0"
            }}>
              {formatDate(stats.lastUpdated)}
            </h2>
            <p style={{ 
              fontSize: "0.875rem",
              color: "#6B7280",
              margin: 0,
              fontWeight: "500"
            }}>
              {stats.lastResumeTitle || "No resumes yet"}
            </p>
          </div>

          {/* Portfolio Views */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "2rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            border: "1px solid #E5E7EB",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{ 
              position: "absolute", 
              top: "1.5rem", 
              right: "1.5rem",
              fontSize: "2rem",
              opacity: 0.2
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <p style={{ 
              fontSize: "0.875rem", 
              color: "#6B7280",
              fontWeight: "500",
              margin: "0 0 0.5rem 0",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              Portfolio Views
            </p>
            <h2 style={{ 
              fontSize: "2.5rem", 
              fontWeight: "700",
              color: "#1F2937",
              margin: "0 0 0.5rem 0"
            }}>
              {stats.portfolioViews}
            </h2>
            <p style={{ 
              fontSize: "0.875rem",
              color: "#10B981",
              margin: 0,
              fontWeight: "500"
            }}>
              {stats.viewsThisWeek > 0 ? `+${stats.viewsThisWeek} this week` : "Share your portfolio to get views"}
            </p>
          </div>
        </div>

        {/* Profile Picture Section */}
        <div style={{ marginBottom: "2.5rem" }}>
          <ImageUploader 
            onImageUploaded={handleImageUploaded}
            onImageDeleted={handleImageDeleted}
            currentImageUrl={profilePicture}
            currentPublicId={profilePicturePublicId}
          />
        </div>

        {/* Action Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2.5rem"
        }}>
          {/* Create New Resume */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "2rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            border: "1px solid #E5E7EB"
          }}>
            <h3 style={{ 
              fontSize: "1.5rem", 
              fontWeight: "700",
              color: "#1F2937",
              margin: "0 0 0.5rem 0"
            }}>
              Create New Resume
            </h3>
            <p style={{ 
              fontSize: "1rem", 
              color: "#6B7280",
              margin: "0 0 1.5rem 0",
              lineHeight: "1.6"
            }}>
              Start building your professional resume with AI assistance
            </p>
            <button
              onClick={() => navigate("/builder")}
              style={{
                backgroundColor: "#10B981",
                color: "white",
                border: "none",
                padding: "0.875rem 2rem",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "all 0.2s",
                boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#059669";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#10B981";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(16, 185, 129, 0.3)";
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: "20px" }}>
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Create New Resume
            </button>
          </div>

          {/* Your Portfolio */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "2rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            border: "1px solid #E5E7EB"
          }}>
            <h3 style={{ 
              fontSize: "1.5rem", 
              fontWeight: "700",
              color: "#1F2937",
              margin: "0 0 0.5rem 0"
            }}>
              Your Portfolio
            </h3>
            <p style={{ 
              fontSize: "1rem", 
              color: "#6B7280",
              margin: "0 0 1.5rem 0",
              lineHeight: "1.6"
            }}>
              View and manage your public portfolio page
            </p>
            <button
              onClick={() => {
                window.open(`/portfolio/${user?.id}`, '_blank');
              }}
              style={{
                backgroundColor: "transparent",
                color: "#91C4C3",
                border: "2px solid #91C4C3",
                padding: "0.875rem 2rem",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#91C4C3";
                e.currentTarget.style.color = "white";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#91C4C3";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: "20px" }}>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              View Portfolio
            </button>
          </div>
        </div>

        {/* Recent Resumes */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "2rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          border: "1px solid #E5E7EB"
        }}>
          <h3 style={{ 
            fontSize: "1.75rem", 
            fontWeight: "700",
            color: "#10B981",
            margin: "0 0 1.5rem 0",
            padding: "0 0 1rem 0",
            borderBottom: "3px solid #D1FAE5"
          }}>
            Recent Resumes
          </h3>

          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#6B7280" }}>
              <p>Loading your resumes...</p>
            </div>
          ) : resumes.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "3rem",
              color: "#6B7280"
            }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem", opacity: 0.5 }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <p style={{ fontSize: "1.1rem", fontWeight: "500", margin: "0 0 0.5rem 0" }}>
                No resumes yet
              </p>
              <p style={{ margin: 0 }}>
                Click "Create New Resume" to get started!
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  style={{
                    backgroundColor: "#F9FAFB",
                    border: "1px solid #E5E7EB",
                    borderRadius: "10px",
                    padding: "1.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.2s",
                    cursor: "pointer"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#F3F4F6";
                    e.currentTarget.style.borderColor = "#91C4C3";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#F9FAFB";
                    e.currentTarget.style.borderColor = "#E5E7EB";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
          <div>
                    <h4 style={{ 
                      fontSize: "1.25rem", 
                      fontWeight: "600",
                      color: "#1F2937",
                      margin: "0 0 0.25rem 0"
                    }}>
                      {getResumeTitle(resume)}
                    </h4>
                    <p style={{ 
                      fontSize: "0.875rem",
                      color: "#6B7280",
                      margin: 0
                    }}>
                      Last edited {formatDate(resume.updated_at)}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewResume(resume);
                      }}
                      style={{
                        backgroundColor: "#2D5F5D",
                        color: "white",
                        border: "none",
                        padding: "0.5rem 1.5rem",
                        borderRadius: "6px",
                        fontSize: "0.95rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        letterSpacing: "0.02em",
                        boxShadow: "0 2px 8px rgba(45, 95, 93, 0.3)"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#1F4544";
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(45, 95, 93, 0.4)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "#2D5F5D";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(45, 95, 93, 0.3)";
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      Preview
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/builder?resumeId=${resume.id}`);
                      }}
                      style={{
                        backgroundColor: "#4B5563",
                        color: "white",
                        border: "none",
                        padding: "0.5rem 1.5rem",
                        borderRadius: "6px",
                        fontSize: "0.95rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        letterSpacing: "0.02em",
                        boxShadow: "0 2px 8px rgba(75, 85, 99, 0.3)"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#374151";
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(75, 85, 99, 0.4)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "#4B5563";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(75, 85, 99, 0.3)";
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewResume && (
        <ResumePreviewModal 
          resume={previewResume} 
          onClose={() => setPreviewResume(null)} 
        />
      )}
    </div>
  );
}
