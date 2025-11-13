import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ResumePreviewModal({ resume, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const resumeRef = useRef(null);

  if (!resume) return null;

  // Safe parse function
  const safeParse = (data) => {
    if (!data) return null;
    if (typeof data === 'object') return data;
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  };

  const summary = safeParse(resume.summary);
  const skills = safeParse(resume.skills);
  const education = safeParse(resume.education);
  const internship = safeParse(resume.internship);
  const jobExperience = safeParse(resume.job_experience);
  const projects = safeParse(resume.projects);
  const experience = safeParse(resume.experience);

  // Get user info
  const name = summary?.name || "Professional";
  const mobile = summary?.mobile || "";
  const email = summary?.email || "";
  const linkedin = summary?.linkedin || "";
  const github = summary?.github || "";
  const portfolio = summary?.portfolio || "";
  const summaryText = summary?.summary || "";

  // Download PDF function
  const downloadPDF = async () => {
    if (!resumeRef.current) return;
    
    setDownloading(true);
    try {
      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${name.replace(/\s+/g, "_")}_Resume.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        padding: "2rem",
        overflowY: "auto"
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#F3F4F6",
          borderRadius: "16px",
          maxWidth: "900px",
          width: "100%",
          maxHeight: "95vh",
          overflow: "auto",
          position: "relative",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close Button */}
        <div style={{
          position: "sticky",
          top: 0,
          backgroundColor: "white",
          padding: "1.5rem 2rem",
          borderBottom: "2px solid #E5E7EB",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 10,
          borderRadius: "16px 16px 0 0"
        }}>
          <h2 style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            color: "#1F2937",
            margin: 0
          }}>
            Resume Preview
          </h2>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <button
              onClick={downloadPDF}
              disabled={downloading}
              className="btn btn-success"
              style={{ fontSize: "0.9rem", padding: "0.65rem 1.25rem" }}
            >
              {downloading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  Downloading...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download PDF
                </>
              )}
            </button>
            <button
              onClick={onClose}
              style={{
                backgroundColor: "transparent",
                border: "none",
                fontSize: "1.5rem",
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
          </div>
        </div>

        {/* Resume Preview Content */}
        <div style={{ padding: "2rem" }}>
          <div 
            ref={resumeRef} 
            style={{ 
              backgroundColor: "white",
              padding: "3rem 2.5rem",
              fontFamily: "'Times New Roman', Times, serif",
              fontSize: "11pt",
              lineHeight: "1.15",
              color: "#000",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              borderRadius: "8px"
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
              {mobile && <span>{mobile}</span>}
              {email && <span>{mobile && " | "}{email}</span>}
              {linkedin && <span>{(mobile || email) && " | "}<a href={linkedin} style={{ color: "#000", textDecoration: "none" }}>LinkedIn</a></span>}
              {github && <span>{(mobile || email || linkedin) && " | "}<a href={github} style={{ color: "#000", textDecoration: "none" }}>GitHub</a></span>}
              {portfolio && <span>{(mobile || email || linkedin || github) && " | "}<a href={portfolio} style={{ color: "#000", textDecoration: "none" }}>Portfolio</a></span>}
            </div>

            {/* Summary */}
            {summaryText && (
              <div style={{ textAlign: "center", marginBottom: "0.8rem", fontSize: "10pt", fontStyle: "italic" }}>
                {summaryText}
              </div>
            )}

            {/* Horizontal line */}
            <hr style={{ border: "none", borderTop: "1px solid #000", margin: "0.5rem 0 1rem 0" }} />

            {/* Education Section */}
            {education && education.length > 0 && (
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
                {education.map((ed, i) => (
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

            {/* Internship Experience */}
            {internship && internship.length > 0 && (
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
                {internship.map((intern, i) => (
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

            {/* Professional Experience */}
            {jobExperience && jobExperience.length > 0 && (
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
                {jobExperience.map((job, i) => (
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

            {/* Combined Experience (fallback) */}
            {experience && experience.length > 0 && !internship && !jobExperience && (
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
                {experience.map((exp, i) => (
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

            {/* Projects */}
            {projects && projects.length > 0 && (
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
                {projects.map((proj, i) => (
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

            {/* Technical Skills */}
            {skills && skills.length > 0 && (
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
                  <strong>Languages & Technologies:</strong> {skills.join(", ")}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}





