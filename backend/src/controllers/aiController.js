import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateResume = async (req, res) => {
  const { name, skills, experience, education, internship, jobExperience, projects } = req.body;

  // Build dynamic prompt sections
  let promptSections = [
    `- Name: ${name}`,
    `- Skills: ${skills.join(", ")}`
  ];

  // Add education section
  if (education && education.length > 0) {
    const eduText = education.map(e => `${e.degree} from ${e.institution} (${e.year})`).join("; ");
    promptSections.push(`- Education: ${eduText}`);
  }

  // Add internship section
  if (internship && internship.length > 0) {
    const internText = internship.map(i => {
      const base = `${i.role} at ${i.company} (${i.duration})`;
      return i.description ? `${base}: ${i.description}` : base;
    }).join("; ");
    promptSections.push(`- Internship Experience: ${internText}`);
  }

  // Add job experience section
  if (jobExperience && jobExperience.length > 0) {
    const jobText = jobExperience.map(j => {
      const base = `${j.role} at ${j.company} (${j.duration})`;
      return j.description ? `${base}: ${j.description}` : base;
    }).join("; ");
    promptSections.push(`- Job Experience: ${jobText}`);
  }

  // Add legacy experience section (for backward compatibility)
  if (experience && experience.length > 0 && !internship && !jobExperience) {
    const expText = experience.map(e => {
      const base = `${e.role} at ${e.company} (${e.duration})`;
      return e.description ? `${base}: ${e.description}` : base;
    }).join("; ");
    promptSections.push(`- Experience: ${expText}`);
  }

  // Add projects section
  if (projects && projects.length > 0) {
    const projText = projects.map(p => {
      const base = `${p.title} (Tech: ${p.techStack})`;
      return p.description ? `${base}: ${p.description}` : base;
    }).join("; ");
    promptSections.push(`- Projects: ${projText}`);
  }

  const prompt = `
  You are an expert resume writer. Create a professional and detailed resume summary and sections for:
  ${promptSections.join("\n  ")}

  IMPORTANT INSTRUCTIONS:
  - Write a compelling professional summary (2-3 sentences)
  - For EVERY internship, job, and project: Create AT LEAST 3 detailed bullet points in the description
  - DO NOT condense multiple bullet points into a single line
  - Each bullet point should start with a strong action verb and include quantifiable achievements when possible
  - If the user provided multiple responsibilities/achievements, expand on each one separately
  - Organize skills effectively into categories if applicable
  - Make each description impactful with specific details and results
  - Keep individual bullet points clear and focused, but DO NOT reduce the number of points

  Output JSON format with all provided sections:
  {
    "summary": "Professional summary highlighting key strengths and experience",
    "skills": ["skill1", "skill2", ...],
    ${education && education.length > 0 ? '"education": [{"degree": "...", "institution": "...", "year": "..."}],' : ''}
    ${internship && internship.length > 0 ? '"internship": [{"role": "...", "company": "...", "duration": "...", "description": "• First achievement/responsibility\\n• Second achievement/responsibility\\n• Third achievement/responsibility"}],' : ''}
    ${jobExperience && jobExperience.length > 0 ? '"jobExperience": [{"role": "...", "company": "...", "duration": "...", "description": "• First achievement/responsibility\\n• Second achievement/responsibility\\n• Third achievement/responsibility"}],' : ''}
    ${experience && experience.length > 0 && !internship && !jobExperience ? '"experience": [{"role": "...", "company": "...", "duration": "...", "description": "• First achievement/responsibility\\n• Second achievement/responsibility\\n• Third achievement/responsibility"}],' : ''}
    ${projects && projects.length > 0 ? '"projects": [{"title": "...", "techStack": "...", "description": "• First key feature/accomplishment\\n• Second key feature/accomplishment\\n• Third key feature/accomplishment"}]' : ''}
  }
  
  CRITICAL: The description field MUST contain multiple bullet points separated by \\n (newline). Each bullet point must start with •. Minimum 3 bullet points per item.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);
  } catch (err) {
    console.error("OpenAI Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
