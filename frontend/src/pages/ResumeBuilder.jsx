import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import API_URL from "../config/api";

export default function ResumeBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('resumeId');
  
  const [resumeTitle, setResumeTitle] = useState("");
  const [name, setName] = useState("");
  const [skills, setSkills] = useState("");
  
  // Contact details
  const [countryCode, setCountryCode] = useState("+91"); // India as default
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [github, setGithub] = useState("");
  
  // Dynamic arrays for each section
  const [educationList, setEducationList] = useState([
    { degree: "", institution: "", year: "" }
  ]);
  const [internships, setInternships] = useState([
    { role: "", company: "", duration: "", description: "" }
  ]);
  const [jobs, setJobs] = useState([
    { role: "", company: "", duration: "", description: "" }
  ]);
  const [projects, setProjects] = useState([
    { title: "", techStack: "", description: "" }
  ]);

  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingResume, setLoadingResume] = useState(false);
  const [message, setMessage] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  // Ref for capturing the resume preview area
  const resumeRef = useRef(null);

  // Load existing resume if resumeId is present
  useEffect(() => {
    if (resumeId) {
      loadResumeData(resumeId);
    }
  }, [resumeId]);

  const loadResumeData = async (id) => {
    setLoadingResume(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/portfolio/resume/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const resume = response.data;
      setIsEditMode(true);
      
      // Parse summary for contact details
      // Backend now returns parsed objects, but handle both string and object cases
      let summary = null;
      if (resume.summary) {
        if (typeof resume.summary === 'string') {
          try {
            summary = JSON.parse(resume.summary);
          } catch (e) {
            console.error("Error parsing summary:", e);
            summary = null;
          }
        } else if (typeof resume.summary === 'object') {
          summary = resume.summary;
        }
      }
      
      // Set resume title
      setResumeTitle(resume.title || "");
      
      // Set basic info - handle null/undefined summary
      setName(summary?.name || "");
      setEmail(summary?.email || "");
      
      // Parse mobile to extract country code and number
      if (summary?.mobile) {
        const mobileMatch = summary.mobile.match(/^(\+\d+)\s(.+)$/);
        if (mobileMatch) {
          setCountryCode(mobileMatch[1]);
          setMobile(mobileMatch[2]);
        } else {
          setMobile(summary.mobile);
        }
      } else {
        setCountryCode("+91");
        setMobile("");
      }
      
      setLinkedin(summary?.linkedin || "");
      setGithub(summary?.github || "");
      setPortfolio(summary?.portfolio || "");
      
      // Parse and set skills - handle both string and already-parsed cases
      let skillsData = [];
      if (resume.skills) {
        if (typeof resume.skills === 'string') {
          try {
            skillsData = JSON.parse(resume.skills);
          } catch (e) {
            skillsData = [];
          }
        } else if (Array.isArray(resume.skills)) {
          skillsData = resume.skills;
        }
      }
      setSkills(Array.isArray(skillsData) ? skillsData.join(", ") : "");
      
      // Parse and set education - handle both string and already-parsed cases
      let educationData = [];
      if (resume.education) {
        if (typeof resume.education === 'string') {
          try {
            educationData = JSON.parse(resume.education);
          } catch (e) {
            educationData = [];
          }
        } else if (Array.isArray(resume.education)) {
          educationData = resume.education;
        }
      }
      setEducationList(Array.isArray(educationData) && educationData.length > 0 
        ? educationData 
        : [{ degree: "", institution: "", year: "" }]);
      
      // Parse and set internships - handle both string and already-parsed cases
      let internshipData = [];
      if (resume.internship) {
        if (typeof resume.internship === 'string') {
          try {
            internshipData = JSON.parse(resume.internship);
          } catch (e) {
            internshipData = [];
          }
        } else if (Array.isArray(resume.internship)) {
          internshipData = resume.internship;
        }
      }
      setInternships(Array.isArray(internshipData) && internshipData.length > 0 
        ? internshipData 
        : [{ role: "", company: "", duration: "", description: "" }]);
      
      // Parse and set jobs - handle both string and already-parsed cases
      let jobData = [];
      if (resume.job_experience) {
        if (typeof resume.job_experience === 'string') {
          try {
            jobData = JSON.parse(resume.job_experience);
          } catch (e) {
            jobData = [];
          }
        } else if (Array.isArray(resume.job_experience)) {
          jobData = resume.job_experience;
        }
      }
      setJobs(Array.isArray(jobData) && jobData.length > 0 
        ? jobData 
        : [{ role: "", company: "", duration: "", description: "" }]);
      
      // Parse and set projects - handle both string and already-parsed cases
      let projectData = [];
      if (resume.projects) {
        if (typeof resume.projects === 'string') {
          try {
            projectData = JSON.parse(resume.projects);
          } catch (e) {
            projectData = [];
          }
        } else if (Array.isArray(resume.projects)) {
          projectData = resume.projects;
        }
      }
      setProjects(Array.isArray(projectData) && projectData.length > 0 
        ? projectData 
        : [{ title: "", techStack: "", description: "" }]);
      
      // Set the generated resume data if summary exists
      if (summary && summary.summary) {
        setResumeData({
          summary: summary.summary,
          skills: skillsData,
          education: educationData,
          internship: internshipData,
          jobExperience: jobData,
          projects: projectData,
          name: summary.name || "",
          email: summary.email || "",
          mobile: summary.mobile || "",
          linkedin: summary.linkedin || "",
          github: summary.github || "",
          portfolio: summary.portfolio || ""
        });
      }
      
    } catch (error) {
      console.error("Error loading resume:", error);
      setMessage("Error loading resume data. Please try again.");
    } finally {
      setLoadingResume(false);
    }
  };

  // Add new entry functions
  const addEducation = () => {
    setEducationList([...educationList, { degree: "", institution: "", year: "" }]);
  };

  const addInternship = () => {
    setInternships([...internships, { role: "", company: "", duration: "", description: "" }]);
  };

  const addJob = () => {
    setJobs([...jobs, { role: "", company: "", duration: "", description: "" }]);
  };

  const addProject = () => {
    setProjects([...projects, { title: "", techStack: "", description: "" }]);
  };

  // Remove entry functions
  const removeEducation = (index) => {
    if (educationList.length > 1) {
      setEducationList(educationList.filter((_, i) => i !== index));
    }
  };

  const removeInternship = (index) => {
    if (internships.length > 1) {
      setInternships(internships.filter((_, i) => i !== index));
    }
  };

  const removeJob = (index) => {
    if (jobs.length > 1) {
      setJobs(jobs.filter((_, i) => i !== index));
    }
  };

  const removeProject = (index) => {
    if (projects.length > 1) {
      setProjects(projects.filter((_, i) => i !== index));
    }
  };

  // Update entry functions
  const updateEducation = (index, field, value) => {
    const updated = [...educationList];
    updated[index][field] = value;
    setEducationList(updated);
  };

  const updateInternship = (index, field, value) => {
    const updated = [...internships];
    updated[index][field] = value;
    setInternships(updated);
  };

  const updateJob = (index, field, value) => {
    const updated = [...jobs];
    updated[index][field] = value;
    setJobs(updated);
  };

  const updateProject = (index, field, value) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      
      // Combine internships and jobs for backward compatibility with AI controller
      const allExperience = [
        ...internships.map(int => ({ ...int, type: "Internship" })),
        ...jobs.map(job => ({ ...job, type: "Full-time" }))
      ];

      const payload = {
        name,
        mobile: mobile ? `${countryCode} ${mobile}` : "",
        email,
        linkedin,
        portfolio,
        github,
        skills: skills.split(",").map(s => s.trim()).filter(s => s),
        education: educationList.filter(ed => ed.degree || ed.institution),
        experience: allExperience.filter(exp => exp.role || exp.company),
        internship: internships.filter(int => int.role || int.company),
        jobExperience: jobs.filter(job => job.role || job.company),
        projects: projects.filter(proj => proj.title || proj.techStack)
      };

      const res = await axios.post(`${API_URL}/api/ai/generate`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Merge contact details with AI-generated content
      // Ensure skills are included as an array
      const skillsArray = skills.split(",").map(s => s.trim()).filter(s => s);
      const completeResumeData = {
        ...res.data,
        name,
        email,
        mobile: mobile ? `${countryCode} ${mobile}` : "",
        linkedin,
        github,
        portfolio,
        // Ensure skills is always an array
        skills: res.data.skills && Array.isArray(res.data.skills) 
          ? res.data.skills 
          : (res.data.skills ? [res.data.skills] : skillsArray)
      };
      
      setResumeData(completeResumeData);
    } catch (err) {
      setMessage(err.response?.data?.error || "Error generating resume. Try again!");
    } finally {
      setLoading(false);
    }
  };

  // Save resume to database
  const saveResume = async () => {
    setSaving(true);
    setSaveMessage("");
    try {
      const token = localStorage.getItem("token");
      
      // Prepare skills array
      const skillsArray = skills.split(",").map(s => s.trim()).filter(s => s);
      
      // Combine internships and jobs for experience
      const allExperience = [
        ...internships.map(int => ({ ...int, type: "Internship" })),
        ...jobs.map(job => ({ ...job, type: "Full-time" }))
      ];
      
      // Build complete resume data structure
      // Ensure all fields are properly formatted for backend
      const dataToSave = {
        title: resumeTitle || "",
        name: name || "",
        email: email || "",
        mobile: mobile ? `${countryCode} ${mobile}` : "",
        linkedin: linkedin || "",
        github: github || "",
        portfolio: portfolio || "",
        summary: resumeData?.summary || "", // AI-generated summary if available
        skills: skillsArray,
        education: educationList.filter(ed => ed.degree || ed.institution),
        experience: allExperience.filter(exp => exp.role || exp.company),
        internship: internships.filter(int => int.role || int.company),
        jobExperience: jobs.filter(job => job.role || job.company),
        projects: projects.filter(proj => proj.title || proj.techStack)
      };
      
      console.log("Saving resume data:", dataToSave);
      
      if (isEditMode && resumeId) {
        // Update existing resume
        await axios.put(
          `${API_URL}/api/portfolio/update/${resumeId}`,
          { resumeData: dataToSave },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSaveMessage("✅ Resume updated successfully! View it in your Dashboard.");
      } else {
        // Create new resume
        await axios.post(
          `${API_URL}/api/portfolio/save`,
          { resumeData: dataToSave },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSaveMessage("✅ Resume saved successfully! You can now view it in your Dashboard.");
      }
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      console.error("Error saving resume:", error);
      console.error("Error response:", error.response?.data);
      setSaveMessage(`❌ Error saving resume: ${error.response?.data?.message || error.message || "Please try again."}`);
    } finally {
      setSaving(false);
    }
  };

  // Download PDF function
  const downloadPDF = async () => {
    if (!resumeRef.current) return;
    
    setDownloading(true);
    try {
      // Capture the resume preview area as canvas
      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });

      // Convert canvas to image
      const imgData = canvas.toDataURL("image/png");
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Calculate dimensions to fit the page
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Download the PDF
      pdf.save(`${name.replace(/\s+/g, "_")}_Resume.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setMessage("Error downloading PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="container-center" style={{ padding: "2rem 1rem" }}>
      <div style={{ 
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(10px)",
        padding: "2.5rem",
        borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)",
        width: "100%",
        maxWidth: "1400px",
        border: "1px solid rgba(255, 255, 255, 0.8)"
      }}>
        <h2 className="title-medium" style={{ textAlign: "center", marginBottom: "2rem" }}>
          {isEditMode ? "Edit Resume" : "AI Resume Builder"}
        </h2>
        
        {loadingResume ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#6B7280" }}>
            <p>Loading resume data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Resume Title */}
            <div style={{ marginBottom: "2rem" }}>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem", fontSize: "1rem", color: "#264653" }}>
              Enter your Role / Domain {isEditMode}
              </label>
              <input
                type="text"
                placeholder="e.g., Full Stack Developer, UI Designer, Data Analyst"
                className="form-input"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                style={{ 
                  fontSize: "1rem",
                  padding: "0.75rem",
                  backgroundColor: "#F3F4F6"
                }}
              />
              <small style={{ color: "#6B7280", fontSize: "0.85rem" }}>
                Give your resume a name to easily identify it later
              </small>
            </div>

            {/* Two Column Grid for Basic Info and Contact */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(2, 1fr)", 
              gap: "2rem",
              marginBottom: "2rem"
            }}>
            {/* Left Column - Basic Info */}
            <div>
              <h3 style={{ fontWeight: "600", marginBottom: "1rem", fontSize: "1.2rem", color: "#264653" }}>Basic Information</h3>
              
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                  Skills (comma-separated) *
                </label>
                <input
                  type="text"
                  placeholder="JavaScript, React, Node.js, Python"
                  className="form-input"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Right Column - Contact Details */}
            <div>
              <h3 style={{ fontWeight: "600", marginBottom: "1rem", fontSize: "1.2rem", color: "#264653" }}>Contact Details</h3>
            
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                  Mobile Number *
                </label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <select
                    className="form-input"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    style={{ width: "140px", flexShrink: 0 }}
                  >
                    <option value="+91">🇮🇳 +91 (India)</option>
                  <option value="+1">🇺🇸 +1 (USA/Canada)</option>
                  <option value="+44">🇬🇧 +44 (UK)</option>
                  <option value="+61">🇦🇺 +61 (Australia)</option>
                  <option value="+81">🇯🇵 +81 (Japan)</option>
                  <option value="+49">🇩🇪 +49 (Germany)</option>
                  <option value="+33">🇫🇷 +33 (France)</option>
                  <option value="+86">🇨🇳 +86 (China)</option>
                  <option value="+82">🇰🇷 +82 (South Korea)</option>
                  <option value="+65">🇸🇬 +65 (Singapore)</option>
                  <option value="+971">🇦🇪 +971 (UAE)</option>
                  <option value="+966">🇸🇦 +966 (Saudi Arabia)</option>
                  <option value="+60">🇲🇾 +60 (Malaysia)</option>
                  <option value="+92">🇵🇰 +92 (Pakistan)</option>
                  <option value="+880">🇧🇩 +880 (Bangladesh)</option>
                  <option value="+94">🇱🇰 +94 (Sri Lanka)</option>
                  <option value="+977">🇳🇵 +977 (Nepal)</option>
                  <option value="+64">🇳🇿 +64 (New Zealand)</option>
                  <option value="+39">🇮🇹 +39 (Italy)</option>
                  <option value="+34">🇪🇸 +34 (Spain)</option>
                  <option value="+31">🇳🇱 +31 (Netherlands)</option>
                  <option value="+46">🇸🇪 +46 (Sweden)</option>
                  <option value="+41">🇨🇭 +41 (Switzerland)</option>
                  <option value="+47">🇳🇴 +47 (Norway)</option>
                  <option value="+45">🇩🇰 +45 (Denmark)</option>
                  <option value="+48">🇵🇱 +48 (Poland)</option>
                  <option value="+7">🇷🇺 +7 (Russia)</option>
                  <option value="+27">🇿🇦 +27 (South Africa)</option>
                  <option value="+234">🇳🇬 +234 (Nigeria)</option>
                  <option value="+254">🇰🇪 +254 (Kenya)</option>
                  <option value="+55">🇧🇷 +55 (Brazil)</option>
                  <option value="+52">🇲🇽 +52 (Mexico)</option>
                  <option value="+54">🇦🇷 +54 (Argentina)</option>
                  <option value="+56">🇨🇱 +56 (Chile)</option>
                  <option value="+20">🇪🇬 +20 (Egypt)</option>
                  <option value="+90">🇹🇷 +90 (Turkey)</option>
                  <option value="+62">🇮🇩 +62 (Indonesia)</option>
                  <option value="+63">🇵🇭 +63 (Philippines)</option>
                  <option value="+66">🇹🇭 +66 (Thailand)</option>
                  <option value="+84">🇻🇳 +84 (Vietnam)</option>
                  <option value="+351">🇵🇹 +351 (Portugal)</option>
                  <option value="+353">🇮🇪 +353 (Ireland)</option>
                  <option value="+32">🇧🇪 +32 (Belgium)</option>
                  <option value="+43">🇦🇹 +43 (Austria)</option>
                  <option value="+30">🇬🇷 +30 (Greece)</option>
                  <option value="+36">🇭🇺 +36 (Hungary)</option>
                  <option value="+420">🇨🇿 +420 (Czech Republic)</option>
                  <option value="+358">🇫🇮 +358 (Finland)</option>
                </select>
                <input
                  type="tel"
                  placeholder="1234567890"
                  className="form-input"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>
                Email Address *
              </label>
              <input
                type="email"
                placeholder="john.doe@example.com"
            className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            required
          />
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>
                LinkedIn URL
              </label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/johndoe"
                className="form-input"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>
                Portfolio URL
              </label>
              <input
                type="url"
                placeholder="https://johndoe.com"
                className="form-input"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>
                GitHub URL
              </label>
              <input
                type="url"
                placeholder="https://github.com/johndoe"
                className="form-input"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
              />
              </div>
            </div>
          </div>

          {/* Education Section */}
          <div style={{ marginBottom: "2rem", borderTop: "2px solid #e5e7eb", paddingTop: "1.5rem" }}>
            <h3 style={{ fontWeight: "600", marginBottom: "1rem", fontSize: "1.2rem", color: "#264653" }}>Education</h3>
            {educationList.map((edu, index) => (
              <div key={index} style={{ 
                marginBottom: "1rem", 
                padding: "1.25rem", 
                border: "2px solid rgba(145, 196, 195, 0.2)", 
                borderRadius: "12px",
                position: "relative",
                backgroundColor: "rgba(255, 255, 255, 0.5)"
              }}>
                {educationList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    style={{
                      position: "absolute",
                      top: "0.75rem",
                      right: "0.75rem",
                      background: "#fee2e2",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.1rem",
                      padding: "0.4rem 0.6rem",
                      borderRadius: "6px",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#fca5a5"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#fee2e2"}
                    title="Remove"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </button>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr", gap: "1rem" }}>
                  <input
                    type="text"
                    placeholder="Degree (e.g., B.Tech in CS)"
                    className="form-input"
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, "degree", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Institution"
                    className="form-input"
                    value={edu.institution}
                    onChange={(e) => updateEducation(index, "institution", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Year"
                    className="form-input"
                    value={edu.year}
                    onChange={(e) => updateEducation(index, "year", e.target.value)}
                  />
                </div>
              </div>
            ))}
            <button type="button" onClick={addEducation} className="btn btn-success" style={{ width: "auto", minWidth: "200px" }}>
              + Add More Education
            </button>
          </div>

          {/* Internship Experience Section */}
          <div style={{ marginBottom: "2rem", borderTop: "2px solid #e5e7eb", paddingTop: "1.5rem" }}>
            <h3 style={{ fontWeight: "600", marginBottom: "1rem", fontSize: "1.2rem", color: "#264653" }}>Internship Experience</h3>
            {internships.map((intern, index) => (
              <div key={index} style={{ 
                marginBottom: "1rem", 
                padding: "1.25rem", 
                border: "2px solid rgba(145, 196, 195, 0.2)", 
                borderRadius: "12px",
                position: "relative",
                backgroundColor: "rgba(255, 255, 255, 0.5)"
              }}>
                {internships.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInternship(index)}
                    style={{
                      position: "absolute",
                      top: "0.75rem",
                      right: "0.75rem",
                      background: "#fee2e2",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.1rem",
                      padding: "0.4rem 0.6rem",
                      borderRadius: "6px",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#fca5a5"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#fee2e2"}
                    title="Remove"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </button>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <input
                    type="text"
                    placeholder="Role"
                    className="form-input"
                    value={intern.role}
                    onChange={(e) => updateInternship(index, "role", e.target.value)}
                    style={{ marginBottom: 0 }}
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    className="form-input"
                    value={intern.company}
                    onChange={(e) => updateInternship(index, "company", e.target.value)}
                    style={{ marginBottom: 0 }}
                  />
                  <input
                    type="text"
                    placeholder="Duration"
                    className="form-input"
                    value={intern.duration}
                    onChange={(e) => updateInternship(index, "duration", e.target.value)}
                    style={{ marginBottom: 0 }}
                  />
                </div>
                <textarea
                  placeholder="Description (Enter each point on a new line)"
                  className="form-input"
                  value={intern.description}
                  onChange={(e) => updateInternship(index, "description", e.target.value)}
                  rows="4"
                  style={{ marginBottom: 0 }}
                />
              </div>
            ))}
            <button type="button" onClick={addInternship} className="btn btn-success" style={{ width: "auto", minWidth: "200px" }}>
              + Add More Internship
            </button>
          </div>

          {/* Job Experience Section */}
          <div style={{ marginBottom: "2rem", borderTop: "2px solid #e5e7eb", paddingTop: "1.5rem" }}>
            <h3 style={{ fontWeight: "600", marginBottom: "1rem", fontSize: "1.2rem", color: "#264653" }}>Job Experience</h3>
            {jobs.map((job, index) => (
              <div key={index} style={{ 
                marginBottom: "1rem", 
                padding: "1.25rem", 
                border: "2px solid rgba(145, 196, 195, 0.2)", 
                borderRadius: "12px",
                position: "relative",
                backgroundColor: "rgba(255, 255, 255, 0.5)"
              }}>
                {jobs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeJob(index)}
                    style={{
                      position: "absolute",
                      top: "0.75rem",
                      right: "0.75rem",
                      background: "#fee2e2",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.1rem",
                      padding: "0.4rem 0.6rem",
                      borderRadius: "6px",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#fca5a5"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#fee2e2"}
                    title="Remove"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </button>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <input
                    type="text"
                    placeholder="Role"
                    className="form-input"
                    value={job.role}
                    onChange={(e) => updateJob(index, "role", e.target.value)}
                    style={{ marginBottom: 0 }}
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    className="form-input"
                    value={job.company}
                    onChange={(e) => updateJob(index, "company", e.target.value)}
                    style={{ marginBottom: 0 }}
                  />
                  <input
                    type="text"
                    placeholder="Duration"
                    className="form-input"
                    value={job.duration}
                    onChange={(e) => updateJob(index, "duration", e.target.value)}
                    style={{ marginBottom: 0 }}
                  />
                </div>
                <textarea
                  placeholder="Description (Enter each point on a new line)"
                  className="form-input"
                  value={job.description}
                  onChange={(e) => updateJob(index, "description", e.target.value)}
                  rows="4"
                  style={{ marginBottom: 0 }}
                />
              </div>
            ))}
            <button type="button" onClick={addJob} className="btn btn-success" style={{ width: "auto", minWidth: "200px" }}>
              + Add More Job Experience
            </button>
          </div>

          {/* Projects Section */}
          <div style={{ marginBottom: "2rem", borderTop: "2px solid #e5e7eb", paddingTop: "1.5rem" }}>
            <h3 style={{ fontWeight: "600", marginBottom: "1rem", fontSize: "1.2rem", color: "#264653" }}>Projects</h3>
            {projects.map((project, index) => (
              <div key={index} style={{ 
                marginBottom: "1rem", 
                padding: "1.25rem", 
                border: "2px solid rgba(145, 196, 195, 0.2)", 
                borderRadius: "12px",
                position: "relative",
                backgroundColor: "rgba(255, 255, 255, 0.5)"
              }}>
                {projects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProject(index)}
                    style={{
                      position: "absolute",
                      top: "0.75rem",
                      right: "0.75rem",
                      background: "#fee2e2",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.1rem",
                      padding: "0.4rem 0.6rem",
                      borderRadius: "6px",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#fca5a5"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#fee2e2"}
                    title="Remove"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </button>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <input
                    type="text"
                    placeholder="Project Title"
                    className="form-input"
                    value={project.title}
                    onChange={(e) => updateProject(index, "title", e.target.value)}
                    style={{ marginBottom: 0 }}
                  />
                  <input
                    type="text"
                    placeholder="Tech Stack (e.g., React, Node.js, MongoDB)"
                    className="form-input"
                    value={project.techStack}
                    onChange={(e) => updateProject(index, "techStack", e.target.value)}
                    style={{ marginBottom: 0 }}
                  />
                </div>
                <textarea
                  placeholder="Description (Enter each point on a new line)"
                  className="form-input"
                  value={project.description}
                  onChange={(e) => updateProject(index, "description", e.target.value)}
                  rows="4"
                  style={{ marginBottom: 0 }}
                />
              </div>
            ))}
            <button type="button" onClick={addProject} className="btn btn-success" style={{ width: "auto", minWidth: "200px" }}>
              + Add More Project
            </button>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Generating..." : isEditMode ? "Regenerate Resume" : "Generate Resume"}
          </button>
        </form>
        )}

        {message && <p className="message" style={{ color: "#ef4444", marginTop: "1rem" }}>{message}</p>}
      </div>

      {/* AI Generated Resume Preview - Jake's Resume Format */}
      {resumeData && (
        <div style={{ marginTop: "2rem", maxWidth: "850px", width: "100%" }}>
          {/* Action Buttons */}
          <div style={{ marginBottom: "1rem", textAlign: "center", display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button 
              onClick={saveResume} 
              className="btn btn-primary"
              disabled={saving}
              style={{ minWidth: "200px" }}
            >
              {saving ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: "18px" }}>
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: "18px" }}>
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Save Resume
                </>
              )}
            </button>
            <button 
              onClick={downloadPDF} 
              className="btn btn-success"
              disabled={downloading}
              style={{ minWidth: "200px" }}
            >
              {downloading ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: "18px" }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: "18px" }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download PDF
                </>
              )}
            </button>
          </div>
          
          {/* Save Message */}
          {saveMessage && (
            <div style={{ 
              textAlign: "center", 
              marginBottom: "1rem", 
              padding: "0.75rem",
              backgroundColor: saveMessage.includes("✅") ? "#d1fae5" : "#fee2e2",
              color: saveMessage.includes("✅") ? "#065f46" : "#991b1b",
              borderRadius: "0.5rem",
              fontWeight: "500"
            }}>
              <div>{saveMessage}</div>
              {saveMessage.includes("✅") && (
                <button 
                  onClick={() => navigate("/dashboard")} 
                  className="btn btn-primary"
                  style={{ marginTop: "0.5rem", fontSize: "0.9rem", padding: "0.5rem 1rem" }}
                >
                  View Dashboard →
                </button>
              )}
            </div>
          )}

          {/* Resume Preview Card with Ref - Jake's Format */}
          <div 
            ref={resumeRef} 
            style={{ 
              backgroundColor: "white",
              padding: "3rem 2.5rem",
              fontFamily: "'Times New Roman', Times, serif",
              fontSize: "11pt",
              lineHeight: "1.15",
              color: "#000",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}
          >
            {/* Header - Name */}
            <div style={{ textAlign: "center", marginBottom: "0.3rem" }}>
              <h1 style={{ 
                fontSize: "24pt", 
                fontWeight: "bold", 
                margin: 0,
                letterSpacing: "0.5px"
              }}>
                {name.toUpperCase()}
              </h1>
            </div>

            {/* Contact Details */}
            <div style={{ 
              textAlign: "center", 
              fontSize: "9pt", 
              marginBottom: "0.5rem",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0.5rem"
            }}>
              {mobile && <span>{countryCode} {mobile}</span>}
              {email && <span>{mobile && " | "}{email}</span>}
              {linkedin && <span>{(mobile || email) && " | "}<a href={linkedin} style={{ color: "#000", textDecoration: "none" }}>LinkedIn</a></span>}
              {github && <span>{(mobile || email || linkedin) && " | "}<a href={github} style={{ color: "#000", textDecoration: "none" }}>GitHub</a></span>}
              {portfolio && <span>{(mobile || email || linkedin || github) && " | "}<a href={portfolio} style={{ color: "#000", textDecoration: "none" }}>Portfolio</a></span>}
            </div>

            {/* Summary */}
            {resumeData.summary && (
              <div style={{ textAlign: "center", marginBottom: "0.8rem", fontSize: "10pt", fontStyle: "italic" }}>
                {resumeData.summary}
              </div>
            )}

            {/* Horizontal line */}
            <hr style={{ border: "none", borderTop: "1px solid #000", margin: "0.5rem 0 1rem 0" }} />

            {/* Education Section */}
            {resumeData.education && resumeData.education.length > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                <h2 style={{ 
                  fontSize: "11pt", 
                  fontWeight: "bold", 
                  textTransform: "uppercase",
                  marginBottom: "0.3rem",
                  borderBottom: "0.5pt solid #000",
                  paddingBottom: "0.1rem"
                }}>
                  Education
                </h2>
                {resumeData.education.map((ed, i) => (
                  <div key={i} style={{ marginBottom: "0.6rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div>
                        <strong style={{ fontWeight: "bold" }}>{ed.institution}</strong>
                      </div>
                      <div style={{ fontStyle: "italic", fontSize: "10pt" }}>
                        {ed.year}
                      </div>
                    </div>
                    <div style={{ fontSize: "10pt" }}>
                      {ed.degree}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Internship Experience Section */}
            {resumeData.internship && resumeData.internship.length > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                <h2 style={{ 
                  fontSize: "11pt", 
                  fontWeight: "bold", 
                  textTransform: "uppercase",
                  marginBottom: "0.3rem",
                  borderBottom: "0.5pt solid #000",
                  paddingBottom: "0.1rem"
                }}>
                  Internship Experience
                </h2>
                {resumeData.internship.map((intern, i) => (
                  <div key={`intern-${i}`} style={{ marginBottom: "0.7rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div>
                        <strong style={{ fontWeight: "bold" }}>{intern.role}</strong>
                        {intern.company && <span> | {intern.company}</span>}
                      </div>
                      <div style={{ fontStyle: "italic", fontSize: "10pt" }}>
                        {intern.duration}
                      </div>
                    </div>
                    {intern.description && (
                      <div style={{ fontSize: "10pt", marginTop: "0.2rem" }}>
                        {intern.description.split(/[•\n]/).filter(line => line.trim()).map((line, idx) => (
                          <div key={idx} style={{ marginLeft: "1rem", textIndent: "-1rem", paddingLeft: "1rem", marginBottom: "0.1rem" }}>
                            • {line.trim()}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Professional Experience Section */}
            {resumeData.jobExperience && resumeData.jobExperience.length > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                <h2 style={{ 
                  fontSize: "11pt", 
                  fontWeight: "bold", 
                  textTransform: "uppercase",
                  marginBottom: "0.3rem",
                  borderBottom: "0.5pt solid #000",
                  paddingBottom: "0.1rem"
                }}>
                  Professional Experience
                </h2>
                {resumeData.jobExperience.map((job, i) => (
                  <div key={`job-${i}`} style={{ marginBottom: "0.7rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div>
                        <strong style={{ fontWeight: "bold" }}>{job.role}</strong>
                        {job.company && <span> | {job.company}</span>}
                      </div>
                      <div style={{ fontStyle: "italic", fontSize: "10pt" }}>
                        {job.duration}
                      </div>
                    </div>
                    {job.description && (
                      <div style={{ fontSize: "10pt", marginTop: "0.2rem" }}>
                        {job.description.split(/[•\n]/).filter(line => line.trim()).map((line, idx) => (
                          <div key={idx} style={{ marginLeft: "1rem", textIndent: "-1rem", paddingLeft: "1rem", marginBottom: "0.1rem" }}>
                            • {line.trim()}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Combined Experience (fallback for backward compatibility) */}
            {resumeData.experience && resumeData.experience.length > 0 && 
             !resumeData.internship && !resumeData.jobExperience && (
              <div style={{ marginBottom: "1rem" }}>
                <h2 style={{ 
                  fontSize: "11pt", 
                  fontWeight: "bold", 
                  textTransform: "uppercase",
                  marginBottom: "0.3rem",
                  borderBottom: "0.5pt solid #000",
                  paddingBottom: "0.1rem"
                }}>
                  Experience
                </h2>
                {resumeData.experience.map((exp, i) => (
                  <div key={`exp-${i}`} style={{ marginBottom: "0.7rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div>
                        <strong style={{ fontWeight: "bold" }}>{exp.role}</strong>
                        {exp.company && <span> | {exp.company}</span>}
                      </div>
                      <div style={{ fontStyle: "italic", fontSize: "10pt" }}>
                        {exp.duration}
                      </div>
                    </div>
                    {exp.description && (
                      <div style={{ fontSize: "10pt", marginTop: "0.2rem" }}>
                        {exp.description.split(/[•\n]/).filter(line => line.trim()).map((line, idx) => (
                          <div key={idx} style={{ marginLeft: "1rem", textIndent: "-1rem", paddingLeft: "1rem", marginBottom: "0.1rem" }}>
                            • {line.trim()}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Projects Section */}
            {resumeData.projects && resumeData.projects.length > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                <h2 style={{ 
                  fontSize: "11pt", 
                  fontWeight: "bold", 
                  textTransform: "uppercase",
                  marginBottom: "0.3rem",
                  borderBottom: "0.5pt solid #000",
                  paddingBottom: "0.1rem"
                }}>
                  Projects
                </h2>
                {resumeData.projects.map((proj, i) => (
                  <div key={i} style={{ marginBottom: "0.7rem" }}>
                    <div>
                      <strong style={{ fontWeight: "bold" }}>{proj.title || proj.projectTitle}</strong>
                      {proj.techStack && <span style={{ fontSize: "10pt" }}> | {proj.techStack}</span>}
                    </div>
                    {proj.description && (
                      <div style={{ fontSize: "10pt", marginTop: "0.2rem" }}>
                        {proj.description.split(/[•\n]/).filter(line => line.trim()).map((line, idx) => (
                          <div key={idx} style={{ marginLeft: "1rem", textIndent: "-1rem", paddingLeft: "1rem", marginBottom: "0.1rem" }}>
                            • {line.trim()}
                          </div>
                        ))}
                      </div>
                    )}
            </div>
          ))}
              </div>
            )}

            {/* Technical Skills Section */}
            {resumeData.skills && (
              (() => {
                // Ensure skills is an array
                let skillsArray = resumeData.skills;
                if (typeof skillsArray === 'string') {
                  try {
                    skillsArray = JSON.parse(skillsArray);
                  } catch (e) {
                    skillsArray = skillsArray.split(',').map(s => s.trim()).filter(s => s);
                  }
                }
                if (!Array.isArray(skillsArray)) {
                  skillsArray = [];
                }
                
                return skillsArray.length > 0 ? (
                  <div style={{ marginBottom: "1rem" }}>
                    <h2 style={{ 
                      fontSize: "11pt", 
                      fontWeight: "bold", 
                      textTransform: "uppercase",
                      marginBottom: "0.3rem",
                      borderBottom: "0.5pt solid #000",
                      paddingBottom: "0.1rem"
                    }}>
                      Technical Skills
                    </h2>
                    <div style={{ fontSize: "10pt" }}>
                      <strong>Languages & Technologies:</strong> {skillsArray.join(", ")}
                    </div>
                  </div>
                ) : null;
              })()
            )}
          </div>
          {/* End of Resume Preview Card with Ref */}
        </div>
      )}
    </div>
  );
}
