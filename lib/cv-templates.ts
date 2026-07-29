/**
 * Premium CV template generators — CareerIntel SA
 * Each function returns a complete, print-ready HTML string.
 * Users save as PDF via the browser print dialog.
 */

export interface CVTemplateData {
  improvedSummary: string;
  extractedSkills: string[];
  missingKeywords: string[];
  suggestions: string[];
}

// ─── Shared print CSS ─────────────────────────────────────────────────────────

const PRINT_BASE = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: A4; margin: 0; }
  body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  @media print { .page { margin: 0 !important; box-shadow: none !important; } }
`;

// ─── 1. Modern Pro ────────────────────────────────────────────────────────────
// Two-column layout. Deep indigo sidebar, clean white main. SA corporate staple.

export function generateModernPro(data: CVTemplateData, showWatermark = true): string {
  const initials = "YN";
  const skills = data.extractedSkills.slice(0, 8);
  const keywords = data.missingKeywords.slice(0, 6);

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>CV — Modern Pro</title>
<style>
${PRINT_BASE}
body { font-family: 'Segoe UI', Arial, sans-serif; background: #f3f4f6; }
.page { display: grid; grid-template-columns: 240px 1fr; min-height: 297mm; max-width: 210mm; margin: 0 auto; background: white; box-shadow: 0 4px 40px rgba(0,0,0,0.15); }

/* ── Sidebar ── */
.sidebar { background: #1e1b4b; padding: 36px 24px; color: #e0e7ff; }
.avatar-wrap { text-align: center; margin-bottom: 22px; }
.avatar { display: inline-flex; align-items: center; justify-content: center; width: 72px; height: 72px; border-radius: 50%; background: #6366f1; color: white; font-size: 24px; font-weight: 700; border: 3px solid rgba(165,180,252,0.4); }
.s-name { font-size: 16px; font-weight: 700; color: #fff; text-align: center; line-height: 1.3; margin-bottom: 4px; }
.s-role { font-size: 10.5px; color: #a5b4fc; text-align: center; margin-bottom: 26px; }
.s-heading { font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: #818cf8; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 5px; margin: 18px 0 10px; }
.contact-row { display: flex; align-items: flex-start; gap: 7px; font-size: 10.5px; color: #c7d2fe; margin-bottom: 7px; line-height: 1.4; }
.contact-icon { font-size: 11px; flex-shrink: 0; margin-top: 1px; }
.skill-item { margin-bottom: 9px; }
.skill-label { font-size: 10.5px; color: #e0e7ff; margin-bottom: 3px; }
.skill-track { background: rgba(255,255,255,0.12); height: 4px; border-radius: 2px; }
.skill-fill { background: linear-gradient(90deg,#818cf8,#a5b4fc); height: 4px; border-radius: 2px; }
.kw-pill { display: inline-block; background: rgba(252,211,77,0.15); color: #fcd34d; font-size: 9.5px; padding: 3px 8px; border-radius: 20px; margin: 2px 2px 2px 0; border: 1px solid rgba(252,211,77,0.3); }

/* ── Main ── */
.main { padding: 38px 34px; }
.main-header { border-bottom: 2.5px solid #6366f1; padding-bottom: 12px; margin-bottom: 24px; }
.main-name { font-size: 28px; font-weight: 700; color: #1e1b4b; letter-spacing: -0.5px; }
.main-role { font-size: 13px; color: #6366f1; font-weight: 500; margin-top: 2px; }
.section { margin-bottom: 22px; }
.section-title { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: #1e1b4b; border-left: 3px solid #6366f1; padding-left: 8px; margin-bottom: 10px; }
.summary { font-size: 11.5px; color: #374151; line-height: 1.75; }
.exp-block { margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid #f3f4f6; }
.exp-block:last-child { border-bottom: none; }
.exp-row { display: flex; justify-content: space-between; align-items: flex-start; }
.exp-title { font-size: 12.5px; font-weight: 600; color: #1e1b4b; }
.exp-company { font-size: 11px; color: #6366f1; margin-top: 1px; }
.exp-date { font-size: 10px; color: #9ca3af; background: #f3f4f6; padding: 2px 8px; border-radius: 20px; white-space: nowrap; }
.exp-bullets { font-size: 11px; color: #4b5563; margin-top: 6px; line-height: 1.65; }
.exp-bullets li { margin-bottom: 3px; padding-left: 2px; }
.edu-block { margin-bottom: 12px; }
.edu-qual { font-size: 12.5px; font-weight: 600; color: #1e1b4b; }
.edu-inst { font-size: 11px; color: #6366f1; margin-top: 1px; }
.edu-meta { font-size: 10px; color: #9ca3af; margin-top: 2px; }
.skills-wrap { display: flex; flex-wrap: wrap; gap: 5px; }
.skill-tag { background: #ede9fe; color: #4338ca; font-size: 10.5px; padding: 4px 10px; border-radius: 20px; font-weight: 500; }
.placeholder { color: #9ca3af; font-style: italic; font-size: 11px; }
.note-box { background: #fefce8; border: 1px solid #fde68a; border-radius: 6px; padding: 8px 12px; margin-top: 16px; font-size: 10px; color: #92400e; }
</style></head><body>
<div class="page">
  <div class="sidebar">
    <div class="avatar-wrap"><div class="avatar">${initials}</div></div>
    <div class="s-name">[Your Full Name]</div>
    <div class="s-role">[Target Role, e.g. Data Analyst]</div>

    <div class="s-heading">Contact</div>
    <div class="contact-row"><span class="contact-icon">✉</span>[your.email@gmail.com]</div>
    <div class="contact-row"><span class="contact-icon">📱</span>[071 234 5678]</div>
    <div class="contact-row"><span class="contact-icon">📍</span>[City, Province]</div>
    <div class="contact-row"><span class="contact-icon">🔗</span>[linkedin.com/in/yourprofile]</div>

    <div class="s-heading">Core Skills</div>
    ${skills.map((s, i) => {
      const pct = [90, 85, 80, 88, 75, 82, 78, 85][i % 8];
      return `<div class="skill-item"><div class="skill-label">${s}</div><div class="skill-track"><div class="skill-fill" style="width:${pct}%"></div></div></div>`;
    }).join("")}

    <div class="s-heading">Add These Keywords</div>
    <div>${keywords.map(k => `<span class="kw-pill">+ ${k}</span>`).join("")}</div>
  </div>

  <div class="main">
    <div class="main-header">
      <div class="main-name">[Your Full Name]</div>
      <div class="main-role">[Target Role] · [Province, South Africa]</div>
    </div>

    <div class="section">
      <div class="section-title">Professional Summary</div>
      <p class="summary">${data.improvedSummary}</p>
    </div>

    <div class="section">
      <div class="section-title">Work Experience</div>
      <div class="exp-block">
        <div class="exp-row">
          <div><div class="exp-title">[Most Recent Job Title]</div><div class="exp-company">[Company Name]</div></div>
          <div class="exp-date">[Month Year] – Present</div>
        </div>
        <ul class="exp-bullets">
          <li>[Describe your key achievement with a number, e.g. "Managed X to achieve Y, saving R200k"]</li>
          <li>[Second key responsibility or achievement]</li>
        </ul>
      </div>
      <div class="exp-block">
        <div class="exp-row">
          <div><div class="exp-title">[Previous Job Title]</div><div class="exp-company">[Previous Company]</div></div>
          <div class="exp-date">[Month Year] – [Month Year]</div>
        </div>
        <ul class="exp-bullets">
          <li>[Key responsibility or achievement]</li>
          <li>[Another achievement with measurable result]</li>
        </ul>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Education & Qualifications</div>
      <div class="edu-block">
        <div class="edu-qual">[Qualification Name, e.g. B.Com Accounting / N6 Electrical]</div>
        <div class="edu-inst">[Institution — e.g. University of Johannesburg / Tshwane TVET]</div>
        <div class="edu-meta">NQF Level [7] · Completed [Year]</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Skills & Technologies</div>
      <div class="skills-wrap">${data.extractedSkills.map(s => `<span class="skill-tag">${s}</span>`).join("")}${data.missingKeywords.map(k => `<span class="skill-tag" style="background:#fef3c7;color:#92400e;">${k}</span>`).join("")}</div>
    </div>

    ${showWatermark ? `<div class="note-box">⚡ Created with <strong>CareerIntel SA</strong> · careerintelsa.co.za</div>` : ""}
  </div>
</div>
</body></html>`;
}

// ─── 2. Executive ─────────────────────────────────────────────────────────────
// Full-width dark header, elegant single-column. For senior/management roles.

export function generateExecutive(data: CVTemplateData, showWatermark = true): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>CV — Executive</title>
<style>
${PRINT_BASE}
body { font-family: Georgia, 'Times New Roman', serif; background: #f9fafb; }
.page { max-width: 210mm; min-height: 297mm; margin: 0 auto; background: white; box-shadow: 0 4px 40px rgba(0,0,0,0.12); }
.header { background: #0f172a; padding: 44px 52px 36px; }
.h-name { font-size: 34px; font-weight: 400; color: white; letter-spacing: 2px; text-transform: uppercase; }
.h-rule { width: 60px; height: 2px; background: #f59e0b; margin: 12px 0; }
.h-role { font-size: 13px; color: #94a3b8; letter-spacing: 0.1em; font-family: 'Segoe UI', Arial, sans-serif; text-transform: uppercase; }
.h-contacts { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 18px; }
.h-contact { font-size: 11px; color: #cbd5e1; font-family: 'Segoe UI', Arial, sans-serif; display: flex; align-items: center; gap: 5px; }
.body { padding: 40px 52px; }
.section { margin-bottom: 28px; }
.sec-title { font-size: 11px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.2em; color: #0f172a; border-bottom: 1.5px solid #f59e0b; padding-bottom: 5px; margin-bottom: 14px; font-family: 'Segoe UI', Arial, sans-serif; }
.summary { font-size: 12.5px; color: #1e293b; line-height: 1.8; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
.exp-block { margin-bottom: 18px; }
.exp-title { font-size: 13px; font-weight: 700; color: #0f172a; font-family: 'Segoe UI', Arial, sans-serif; }
.exp-meta { font-size: 11px; color: #f59e0b; font-family: 'Segoe UI', Arial, sans-serif; margin: 2px 0 6px; }
.exp-bullets { font-size: 11.5px; color: #334155; line-height: 1.7; }
.exp-bullets li { margin-bottom: 4px; padding-left: 2px; }
.edu-block { margin-bottom: 12px; }
.edu-qual { font-size: 13px; font-weight: 700; font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; }
.edu-meta { font-size: 11px; color: #64748b; font-family: 'Segoe UI', Arial, sans-serif; margin-top: 2px; }
.skills-list { display: flex; flex-wrap: wrap; gap: 6px; }
.skill-tag { border: 1px solid #cbd5e1; color: #0f172a; font-size: 10.5px; padding: 4px 12px; font-family: 'Segoe UI', Arial, sans-serif; letter-spacing: 0.03em; }
.kw-tag { border: 1px solid #f59e0b; color: #92400e; background: #fffbeb; font-size: 10.5px; padding: 4px 12px; font-family: 'Segoe UI', Arial, sans-serif; }
.footer-note { background: #fffbeb; border-left: 3px solid #f59e0b; padding: 8px 14px; font-size: 10px; color: #78350f; font-family: 'Segoe UI', Arial, sans-serif; margin-top: 20px; }
</style></head><body>
<div class="page">
  <div class="header">
    <div class="h-name">[Your Full Name]</div>
    <div class="h-rule"></div>
    <div class="h-role">[Target Role] · South Africa</div>
    <div class="h-contacts">
      <span class="h-contact">✉ [your.email@example.com]</span>
      <span class="h-contact">📱 [071 234 5678]</span>
      <span class="h-contact">📍 [City, Province]</span>
      <span class="h-contact">🔗 [linkedin.com/in/profile]</span>
    </div>
  </div>

  <div class="body">
    <div class="section">
      <div class="sec-title">Executive Profile</div>
      <p class="summary">${data.improvedSummary}</p>
    </div>

    <div class="section">
      <div class="sec-title">Professional Experience</div>
      <div class="exp-block">
        <div class="exp-title">[Most Recent Job Title]</div>
        <div class="exp-meta">[Company Name] · [Month Year] – Present · [City, Province]</div>
        <ul class="exp-bullets">
          <li>[Key achievement with measurable outcome, e.g. "Led cross-functional team of 12 to deliver R5M digital transformation project on time and 8% under budget"]</li>
          <li>[Second major achievement or responsibility]</li>
          <li>[Third achievement — include numbers wherever possible]</li>
        </ul>
      </div>
      <div class="exp-block">
        <div class="exp-title">[Previous Job Title]</div>
        <div class="exp-meta">[Previous Company] · [Month Year] – [Month Year]</div>
        <ul class="exp-bullets">
          <li>[Key achievement or responsibility]</li>
          <li>[Another measurable outcome]</li>
        </ul>
      </div>
    </div>

    <div class="two-col">
      <div class="section">
        <div class="sec-title">Education</div>
        <div class="edu-block">
          <div class="edu-qual">[Qualification, e.g. MBA / B.Com Honours]</div>
          <div class="edu-meta">[University] · NQF [Level] · [Year]</div>
        </div>
        <div class="edu-block">
          <div class="edu-qual">[Undergraduate Degree or Diploma]</div>
          <div class="edu-meta">[Institution] · NQF [Level] · [Year]</div>
        </div>
      </div>
      <div class="section">
        <div class="sec-title">Core Competencies</div>
        <div class="skills-list">
          ${data.extractedSkills.map(s => `<span class="skill-tag">${s}</span>`).join("")}
        </div>
      </div>
    </div>

    <div class="section">
      <div class="sec-title">High-Demand Keywords to Incorporate</div>
      <div class="skills-list">${data.missingKeywords.map(k => `<span class="kw-tag">+ ${k}</span>`).join("")}</div>
    </div>

    ${showWatermark ? `<div class="footer-note">⚡ Created with CareerIntel SA · careerintelsa.co.za</div>` : ""}
  </div>
</div>
</body></html>`;
}

// ─── 3. Tech Focus ────────────────────────────────────────────────────────────
// Split layout, skills front-and-centre, developer-optimised.

export function generateTechFocus(data: CVTemplateData, showWatermark = true): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>CV — Tech Focus</title>
<style>
${PRINT_BASE}
body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0f172a; }
.page { max-width: 210mm; min-height: 297mm; margin: 0 auto; background: white; box-shadow: 0 4px 40px rgba(0,0,0,0.3); }
.top-bar { background: #0f172a; padding: 30px 40px 24px; display: flex; justify-content: space-between; align-items: flex-end; }
.t-name { font-size: 26px; font-weight: 700; color: white; }
.t-role { font-size: 12px; color: #22d3ee; margin-top: 3px; font-family: 'Courier New', monospace; }
.t-contacts { text-align: right; }
.t-contact { font-size: 10.5px; color: #94a3b8; display: block; margin-bottom: 3px; }
.content { display: grid; grid-template-columns: 200px 1fr; }
.left-col { background: #f8fafc; padding: 24px 20px; border-right: 1px solid #e2e8f0; }
.right-col { padding: 26px 30px; }
.l-heading { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: #22d3ee; margin: 16px 0 8px; }
.l-heading:first-child { margin-top: 0; }
.tech-pill { display: inline-block; background: #0f172a; color: #22d3ee; font-size: 9.5px; padding: 3px 8px; border-radius: 3px; margin: 2px 2px 2px 0; font-family: 'Courier New', monospace; }
.add-pill { display: inline-block; background: #fef3c7; color: #92400e; font-size: 9.5px; padding: 3px 8px; border-radius: 3px; margin: 2px 2px 2px 0; border: 1px dashed #f59e0b; }
.r-heading { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #0f172a; border-bottom: 2px solid #22d3ee; padding-bottom: 4px; margin: 20px 0 10px; }
.r-heading:first-child { margin-top: 0; }
.summary { font-size: 11.5px; color: #334155; line-height: 1.7; }
.exp-item { margin-bottom: 14px; border-left: 2px solid #e2e8f0; padding-left: 12px; }
.exp-title { font-size: 12.5px; font-weight: 600; color: #0f172a; }
.exp-meta { font-size: 10px; color: #22d3ee; font-family: 'Courier New', monospace; margin: 2px 0 5px; }
.exp-desc { font-size: 11px; color: #4b5563; line-height: 1.65; }
.exp-desc li { margin-bottom: 3px; }
.edu-item { margin-bottom: 10px; }
.edu-qual { font-size: 12px; font-weight: 600; color: #0f172a; }
.edu-meta { font-size: 10px; color: #64748b; margin-top: 2px; }
.note { background: #f0fdff; border: 1px solid #a5f3fc; border-radius: 4px; padding: 7px 10px; font-size: 9.5px; color: #0e7490; margin-top: 16px; font-family: 'Courier New', monospace; }
</style></head><body>
<div class="page">
  <div class="top-bar">
    <div>
      <div class="t-name">[Your Full Name]</div>
      <div class="t-role">$ whoami → [Software Engineer | Data Scientist | DevOps | Cloud Architect]</div>
    </div>
    <div class="t-contacts">
      <span class="t-contact">✉ [your.email@gmail.com]</span>
      <span class="t-contact">📱 [071 234 5678]</span>
      <span class="t-contact">🔗 github.com/[yourhandle]</span>
      <span class="t-contact">🌍 [City, Province], SA</span>
    </div>
  </div>

  <div class="content">
    <div class="left-col">
      <div class="l-heading">Tech Stack</div>
      <div>${data.extractedSkills.map(s => `<span class="tech-pill">${s}</span>`).join("")}</div>

      <div class="l-heading">Add to Stack</div>
      <div>${data.missingKeywords.map(k => `<span class="add-pill">${k}</span>`).join("")}</div>

      <div class="l-heading">Certifications</div>
      <div style="font-size:10.5px;color:#475569;line-height:1.8;">
        [AWS Certified / Azure Fundamentals]<br/>
        [MICT SETA Certification]<br/>
        [Any trade or tech cert]
      </div>

      <div class="l-heading">Education</div>
      <div style="font-size:10.5px;color:#0f172a;font-weight:600;">[Degree / Diploma]</div>
      <div style="font-size:10px;color:#64748b;">[Institution]<br/>NQF [7] · [Year]</div>

      <div class="l-heading">Languages</div>
      <div style="font-size:10.5px;color:#475569;line-height:1.8;">[English — Fluent]<br/>[isiZulu — Native]<br/>[Afrikaans — Basic]</div>
    </div>

    <div class="right-col">
      <div class="r-heading">// Profile</div>
      <p class="summary">${data.improvedSummary}</p>

      <div class="r-heading">// Experience</div>
      <div class="exp-item">
        <div class="exp-title">[Senior / Mid-Level Job Title]</div>
        <div class="exp-meta">[Company Name] | [Month Year] → Present | [City]</div>
        <ul class="exp-desc">
          <li>[Built / Designed / Implemented X using Y technology, achieving Z result]</li>
          <li>[Led migration / optimisation / deployment of X, reducing cost/time by Y%]</li>
          <li>[Collaborated with cross-functional team to deliver X within [timeframe]]</li>
        </ul>
      </div>
      <div class="exp-item">
        <div class="exp-title">[Previous Title]</div>
        <div class="exp-meta">[Company] | [Month Year] → [Month Year]</div>
        <ul class="exp-desc">
          <li>[Key technical contribution]</li>
          <li>[Measurable outcome or scale, e.g. "Served 50k+ daily users"]</li>
        </ul>
      </div>

      <div class="r-heading">// Projects (Optional)</div>
      <div class="exp-item">
        <div class="exp-title">[Project Name] <span style="font-size:10px;color:#94a3b8;">— [github.com/link]</span></div>
        <div class="exp-meta">[Tech stack used]</div>
        <div class="exp-desc">[Brief description of what it does and why it's impressive]</div>
      </div>

      ${showWatermark ? `<div class="note">// Created with CareerIntel SA · careerintelsa.co.za</div>` : ""}
    </div>
  </div>
</div>
</body></html>`;
}

// ─── 4. Graduate ──────────────────────────────────────────────────────────────
// Clean, ATS-friendly, minimal. Perfect for first-time job seekers.

export function generateGraduate(data: CVTemplateData, showWatermark = true): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>CV — Graduate</title>
<style>
${PRINT_BASE}
body { font-family: 'Segoe UI', Arial, sans-serif; background: #f1f5f9; }
.page { max-width: 210mm; min-height: 297mm; margin: 0 auto; background: white; box-shadow: 0 4px 40px rgba(0,0,0,0.1); }
.header { background: linear-gradient(135deg,#1d4ed8 0%,#3b82f6 100%); padding: 36px 44px 28px; }
.g-name { font-size: 28px; font-weight: 700; color: white; letter-spacing: -0.3px; }
.g-role { font-size: 13px; color: #bfdbfe; margin-top: 4px; }
.g-contacts { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 14px; }
.g-contact { font-size: 11px; color: #dbeafe; display: flex; align-items: center; gap: 5px; }
.body { padding: 34px 44px; }
.section { margin-bottom: 24px; }
.sec-title { font-size: 12px; font-weight: 700; color: #1d4ed8; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
.sec-title::after { content:''; flex: 1; height: 1px; background: #bfdbfe; }
.summary { font-size: 12px; color: #1e293b; line-height: 1.8; background: #f0f9ff; border-left: 3px solid #3b82f6; padding: 10px 14px; border-radius: 0 6px 6px 0; }
.exp-item { margin-bottom: 14px; padding: 12px 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
.exp-title { font-size: 12.5px; font-weight: 600; color: #1e293b; }
.exp-meta { font-size: 10.5px; color: #3b82f6; margin: 2px 0 6px; font-weight: 500; }
.exp-desc { font-size: 11px; color: #475569; line-height: 1.65; }
.exp-desc li { margin-bottom: 3px; padding-left: 2px; }
.edu-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 10px 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 8px; }
.edu-left .qual { font-size: 12.5px; font-weight: 600; color: #1e293b; }
.edu-left .inst { font-size: 11px; color: #3b82f6; margin-top: 1px; }
.edu-left .nqf { font-size: 10px; color: #64748b; margin-top: 2px; }
.edu-right { text-align: right; }
.edu-year { font-size: 11px; font-weight: 600; color: #1d4ed8; background: #dbeafe; padding: 2px 10px; border-radius: 20px; }
.skills-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
.skill-pill { background: #dbeafe; color: #1d4ed8; font-size: 11px; padding: 4px 12px; border-radius: 20px; font-weight: 500; }
.kw-pill { background: #fef3c7; color: #92400e; font-size: 11px; padding: 4px 12px; border-radius: 20px; font-weight: 500; border: 1px dashed #fbbf24; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.ref-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; }
.ref-title { font-size: 11px; font-weight: 600; color: #1e293b; }
.ref-detail { font-size: 10.5px; color: #64748b; margin-top: 2px; }
.note-bar { background: #dbeafe; padding: 8px 14px; border-radius: 6px; font-size: 10px; color: #1d4ed8; margin-top: 18px; }
</style></head><body>
<div class="page">
  <div class="header">
    <div class="g-name">[Your Full Name]</div>
    <div class="g-role">[Target Role, e.g. Junior Data Analyst | Graduate Accountant | IT Technician]</div>
    <div class="g-contacts">
      <span class="g-contact">✉ [your.email@gmail.com]</span>
      <span class="g-contact">📱 [071 234 5678]</span>
      <span class="g-contact">📍 [City, Province]</span>
      <span class="g-contact">🔗 [LinkedIn URL]</span>
    </div>
  </div>

  <div class="body">
    <div class="section">
      <div class="sec-title">About Me</div>
      <div class="summary">${data.improvedSummary}</div>
    </div>

    <div class="section">
      <div class="sec-title">Work Experience</div>
      <div class="exp-item">
        <div class="exp-title">[Job Title / Learnership / Internship / Vacation Work]</div>
        <div class="exp-meta">[Company / Organisation] · [Month Year] – [Month Year / Present]</div>
        <ul class="exp-desc">
          <li>[What you did and what you learned or achieved — use a number if possible]</li>
          <li>[Another responsibility or outcome]</li>
        </ul>
      </div>
      <div class="exp-item">
        <div class="exp-title">[Part-time / Holiday / Community Work (all work counts!)]</div>
        <div class="exp-meta">[Employer] · [Year]</div>
        <ul class="exp-desc">
          <li>[Brief description — even informal work shows initiative]</li>
        </ul>
      </div>
    </div>

    <div class="section">
      <div class="sec-title">Education & Qualifications</div>
      <div class="edu-item">
        <div class="edu-left">
          <div class="qual">[Bachelor's Degree / National Diploma / N6 / Trade Certificate]</div>
          <div class="inst">[University / TVET College / Institution]</div>
          <div class="nqf">NQF Level [7] · [Field of Study]</div>
        </div>
        <div class="edu-right"><span class="edu-year">[2024]</span></div>
      </div>
      <div class="edu-item">
        <div class="edu-left">
          <div class="qual">National Senior Certificate (Matric)</div>
          <div class="inst">[High School Name]</div>
          <div class="nqf">NQF Level 4 · [Distinctions if any]</div>
        </div>
        <div class="edu-right"><span class="edu-year">[2021]</span></div>
      </div>
    </div>

    <div class="two-col">
      <div class="section">
        <div class="sec-title">My Skills</div>
        <div class="skills-wrap">${data.extractedSkills.map(s => `<span class="skill-pill">${s}</span>`).join("")}</div>
        <div style="margin-top:8px;font-size:10px;color:#64748b;">Add these to boost your CV:</div>
        <div class="skills-wrap" style="margin-top:4px;">${data.missingKeywords.map(k => `<span class="kw-pill">${k}</span>`).join("")}</div>
      </div>
      <div class="section">
        <div class="sec-title">References</div>
        <div class="ref-box">
          <div class="ref-title">[Reference Name]</div>
          <div class="ref-detail">[Job Title] · [Company]<br/>[Phone] · [Email]</div>
        </div>
        <div class="ref-box" style="margin-top:8px;">
          <div class="ref-title">[Second Reference]</div>
          <div class="ref-detail">[Job Title] · [Company]<br/>Available on request</div>
        </div>
      </div>
    </div>

    ${showWatermark ? `<div class="note-bar">⚡ Created with CareerIntel SA · careerintelsa.co.za</div>` : ""}
  </div>
</div>
</body></html>`;
}

// ─── Shared helpers for full-data templates ───────────────────────────────────

/**
 * Split a job description into clean bullet lines. Handles BOTH real newlines
 * and the literal "\n" that sometimes survives JSON, and strips any leading
 * bullet/dash characters so we never double up markers. This is the single
 * source of truth — templates must use it so the newline bug can't recur.
 */
function splitBullets(desc?: string): string[] {
  if (!desc) return [];
  return desc
    .replace(/\\n/g, "\n")            // literal backslash-n → real newline
    .split(/\r?\n|(?<=\.)\s*•|•/)     // newlines or bullet chars
    .map((l) => l.replace(/^[\s•\-–*·]+/, "").trim())
    .filter((l) => l.length > 1);
}

/** "Mar 2021 – Present" style date range. */
function dateRange(exp: CVBuiltData["experience"][number]): string {
  return [exp.startDate, exp.current ? "Present" : exp.endDate].filter(Boolean).map(esc).join(" – ");
}

/** Rendered <li> list of escaped, cleaned bullets (or "" if none). */
function bulletList(desc: string | undefined, ulClass: string): string {
  const items = splitBullets(desc);
  if (!items.length) return "";
  return `<ul class="${ulClass}">${items.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`;
}

function buildExpSection(experience: CVBuiltData["experience"], cls: {
  block: string; row: string; title: string; company: string; date: string; bullets: string; lastBorderNone?: string;
}): string {
  return experience.map(exp => {
    return `<div class="${cls.block}">
      <div class="${cls.row}">
        <div><div class="${cls.title}">${esc(exp.jobTitle || "Position")}</div>
        <div class="${cls.company}">${esc(exp.company || "Company")}</div></div>
        <div class="${cls.date}">${dateRange(exp)}</div>
      </div>
      ${bulletList(exp.description, cls.bullets)}
    </div>`;
  }).join("");
}

function buildEduSection(education: CVBuiltData["education"], cls: {
  block: string; qual: string; inst: string; meta: string;
}): string {
  return education.map(edu => {
    const meta = [edu.nqfLevel ? `NQF Level ${esc(edu.nqfLevel)}` : "", esc(edu.yearCompleted)].filter(Boolean).join(" · ");
    return `<div class="${cls.block}">
      <div class="${cls.qual}">${esc(edu.qualification || "Qualification")}</div>
      <div class="${cls.inst}">${esc(edu.institution || "Institution")}${edu.fieldOfStudy ? ` · ${esc(edu.fieldOfStudy)}` : ""}</div>
      <div class="${cls.meta}">${meta}</div>
    </div>`;
  }).join("");
}

// ─── 2b. Executive — full data ────────────────────────────────────────────────

export function generateExecutiveFull(data: CVBuiltData, showWatermark = true): string {
  const { personal, summary, experience, education, skills, certifications } = data;
  const fullName = personal.fullName.trim() || "Your Name";
  const latestTitle = experience[0]?.jobTitle ?? "";
  const location = [personal.location, personal.province].filter(Boolean).join(", ");

  const contacts = [personal.email, personal.phone, location, personal.linkedin, personal.website]
    .filter(Boolean).map(esc).join("&nbsp;&nbsp;·&nbsp;&nbsp;");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>CV — ${esc(fullName)}</title>
<style>
${PRINT_BASE}
body { font-family: Georgia, 'Times New Roman', serif; background: #eceef1; color: #1f2733; }
.page { max-width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff; box-shadow: 0 10px 50px rgba(15,23,42,0.14); }
.header { background: #10182b; padding: 52px 56px 30px; position: relative; }
.header::after { content: ''; position: absolute; left: 56px; bottom: 22px; width: 46px; height: 2px; background: #c8a44d; }
.h-name { font-size: 33px; font-weight: 400; color: #fff; letter-spacing: 4px; text-transform: uppercase; }
.h-role { font-size: 11.5px; color: #b7c0d0; letter-spacing: 0.24em; font-family: 'Segoe UI', Arial, sans-serif; text-transform: uppercase; margin-top: 12px; }
.h-contacts { font-size: 10.5px; color: #94a0b4; font-family: 'Segoe UI', Arial, sans-serif; margin-top: 30px; letter-spacing: .02em; }
.body { padding: 40px 56px 48px; }
.section { margin-bottom: 26px; }
.sec-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.24em; color: #10182b; margin-bottom: 14px; font-family: 'Segoe UI', Arial, sans-serif; position: relative; padding-bottom: 7px; }
.sec-title::after { content: ''; position: absolute; left: 0; bottom: 0; width: 100%; height: 1px; background: #e3e6ec; }
.sec-title::before { content: ''; position: absolute; left: 0; bottom: 0; width: 34px; height: 1px; background: #c8a44d; z-index: 1; }
.summary { font-size: 12.5px; color: #33404f; line-height: 1.85; }
.exp-block { margin-bottom: 20px; }
.exp-block:last-child { margin-bottom: 0; }
.exp-row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.exp-title { font-size: 13.5px; font-weight: 700; color: #10182b; font-family: 'Segoe UI', Arial, sans-serif; }
.exp-company { font-size: 11.5px; color: #a17d2e; font-style: italic; margin: 2px 0; }
.exp-date { font-size: 10.5px; color: #7a8698; font-family: 'Segoe UI', Arial, sans-serif; white-space: nowrap; flex-shrink: 0; letter-spacing: .03em; }
.exp-bullets { font-size: 11.5px; color: #3b4757; line-height: 1.7; margin-top: 8px; padding-left: 16px; list-style: none; }
.exp-bullets li { margin-bottom: 5px; position: relative; }
.exp-bullets li::before { content: ''; position: absolute; left: -14px; top: 7px; width: 4px; height: 4px; background: #c8a44d; border-radius: 50%; }
.edu-block { margin-bottom: 12px; }
.edu-qual { font-size: 12.5px; font-weight: 700; font-family: 'Segoe UI', Arial, sans-serif; color: #10182b; }
.edu-inst { font-size: 11px; color: #55637a; font-family: 'Segoe UI', Arial, sans-serif; font-style: italic; margin-top: 2px; }
.edu-meta { font-size: 10px; color: #8b95a7; font-family: 'Segoe UI', Arial, sans-serif; margin-top: 2px; }
.skills-list { display: flex; flex-wrap: wrap; gap: 7px; }
.skill-tag { border: 1px solid #d3c19a; color: #6a5320; font-size: 10.5px; padding: 5px 13px; font-family: 'Segoe UI', Arial, sans-serif; letter-spacing: .02em; }
.cert-line { font-size: 11px; color: #33404f; font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.7; }
.footer-note { font-size: 9.5px; color: #97a0ae; font-family: 'Segoe UI', Arial, sans-serif; margin-top: 26px; text-align: center; letter-spacing: .04em; }
@media print { .page { box-shadow: none !important; } }
</style></head><body>
<div class="page">
  <div class="header">
    <div class="h-name">${esc(fullName)}</div>
    <div class="h-role">${esc(latestTitle)}${location ? ` — ${esc(location)}` : " — South Africa"}</div>
    ${contacts ? `<div class="h-contacts">${contacts}</div>` : ""}
  </div>
  <div class="body">
    ${summary ? `<div class="section">
      <div class="sec-title">Executive Profile</div>
      <p class="summary">${esc(summary)}</p>
    </div>` : ""}

    ${experience.length > 0 ? `<div class="section">
      <div class="sec-title">Professional Experience</div>
      ${buildExpSection(experience, { block: "exp-block", row: "exp-row", title: "exp-title", company: "exp-company", date: "exp-date", bullets: "exp-bullets" })}
    </div>` : ""}

    ${education.length > 0 ? `<div class="section">
      <div class="sec-title">Education</div>
      ${buildEduSection(education, { block: "edu-block", qual: "edu-qual", inst: "edu-inst", meta: "edu-meta" })}
    </div>` : ""}

    ${skills.length > 0 ? `<div class="section">
      <div class="sec-title">Core Competencies</div>
      <div class="skills-list">${skills.map(s => `<span class="skill-tag">${esc(s)}</span>`).join("")}</div>
    </div>` : ""}

    ${certifications.length > 0 ? `<div class="section">
      <div class="sec-title">Certifications</div>
      <div class="cert-line">${certifications.map(esc).join("&nbsp;&nbsp;·&nbsp;&nbsp;")}</div>
    </div>` : ""}

    ${showWatermark ? `<div class="footer-note">Created with CareerIntel SA · careerintelsa.co.za</div>` : ""}
  </div>
</div>
<script>window.onload = function(){ window.print(); }<\/script>
</body></html>`;
}

// ─── 3b. Tech Focus — full data ───────────────────────────────────────────────

export function generateTechFull(data: CVBuiltData, showWatermark = true): string {
  const { personal, summary, experience, education, skills, certifications } = data;
  const fullName = personal.fullName.trim() || "Your Name";
  const latestTitle = experience[0]?.jobTitle ?? "Software Professional";
  const location = [personal.location, personal.province].filter(Boolean).join(", ");

  const contacts = [personal.email, personal.phone, location ? `${location}` : "", personal.linkedin, personal.website]
    .filter(Boolean).map(esc);

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>CV — ${esc(fullName)}</title>
<style>
${PRINT_BASE}
body { font-family: 'Segoe UI', system-ui, Arial, sans-serif; background: #e9edf2; color: #1e293b; }
.page { max-width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff; box-shadow: 0 10px 50px rgba(2,6,23,0.22); }
.top-bar { background: #0b1220; padding: 34px 40px 28px; display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; }
.t-name { font-size: 26px; font-weight: 700; color: #fff; letter-spacing: -.3px; }
.t-role { font-size: 12px; color: #2dd4bf; margin-top: 5px; font-weight: 500; }
.t-contacts { text-align: right; }
.t-contact { font-size: 10px; color: #93a2b8; display: block; margin-bottom: 3px; }
.mono { font-family: 'Cascadia Code', 'Courier New', monospace; }
.content { display: grid; grid-template-columns: 200px 1fr; }
.left-col { background: #f5f7fa; padding: 26px 20px; border-right: 1px solid #e4e9f0; }
.right-col { padding: 28px 30px; }
.l-heading { font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: #0d9488; margin: 18px 0 9px; }
.l-heading:first-child { margin-top: 0; }
.tech-pill { display: inline-block; background: #0b1220; color: #2dd4bf; font-size: 9.5px; padding: 4px 9px; border-radius: 5px; margin: 0 3px 4px 0; }
.cert-item { font-size: 10px; color: #475569; padding: 3px 0; line-height: 1.5; }
.r-heading { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: #0b1220; padding-bottom: 5px; margin: 20px 0 11px; position: relative; }
.r-heading:first-child { margin-top: 0; }
.r-heading::after { content: ''; position: absolute; left: 0; bottom: 0; width: 100%; height: 2px; background: #e4e9f0; }
.r-heading::before { content: ''; position: absolute; left: 0; bottom: 0; width: 30px; height: 2px; background: #14b8a6; z-index: 1; }
.summary { font-size: 11.5px; color: #33445a; line-height: 1.75; }
.exp-item { margin-bottom: 15px; }
.exp-title { font-size: 12.5px; font-weight: 700; color: #0b1220; }
.exp-company { font-size: 10.5px; color: #0d9488; margin: 2px 0 6px; font-weight: 500; }
.exp-bullets { font-size: 11px; color: #475569; line-height: 1.65; padding-left: 15px; list-style: none; }
.exp-bullets li { margin-bottom: 4px; position: relative; }
.exp-bullets li::before { content: '▸'; position: absolute; left: -14px; color: #14b8a6; font-size: 9px; top: 1px; }
.edu-block { margin-bottom: 11px; }
.edu-qual { font-size: 11px; font-weight: 600; color: #0b1220; }
.edu-inst { font-size: 10px; color: #64748b; margin-top: 2px; }
.edu-meta { font-size: 9.5px; color: #94a3b8; margin-top: 1px; }
.note { font-size: 9.5px; color: #94a3b8; margin-top: 18px; text-align: center; }
@media print { .page { box-shadow: none !important; } }
</style></head><body>
<div class="page">
  <div class="top-bar">
    <div>
      <div class="t-name">${esc(fullName)}</div>
      <div class="t-role">${esc(latestTitle)}</div>
    </div>
    <div class="t-contacts">
      ${contacts.map((c) => `<span class="t-contact mono">${c}</span>`).join("")}
    </div>
  </div>
  <div class="content">
    <div class="left-col">
      ${skills.length > 0 ? `<div class="l-heading">Tech Stack</div>
      <div>${skills.map(s => `<span class="tech-pill mono">${esc(s)}</span>`).join("")}</div>` : ""}

      ${education.length > 0 ? `<div class="l-heading">Education</div>
      ${education.map(edu => `<div class="edu-block">
        <div class="edu-qual">${esc(edu.qualification || "Qualification")}</div>
        <div class="edu-inst">${esc(edu.institution || "Institution")}</div>
        <div class="edu-meta">${edu.nqfLevel ? `NQF ${esc(edu.nqfLevel)}` : ""}${edu.nqfLevel && edu.yearCompleted ? " · " : ""}${esc(edu.yearCompleted || "")}</div>
      </div>`).join("")}` : ""}

      ${certifications.length > 0 ? `<div class="l-heading">Certifications</div>
      <div>${certifications.map(c => `<div class="cert-item">${esc(c)}</div>`).join("")}</div>` : ""}
    </div>
    <div class="right-col">
      ${summary ? `<div class="r-heading">Profile</div>
      <p class="summary">${esc(summary)}</p>` : ""}

      ${experience.length > 0 ? `<div class="r-heading">Experience</div>
      ${experience.map(exp => {
        return `<div class="exp-item">
          <div class="exp-title">${esc(exp.jobTitle || "Position")}</div>
          <div class="exp-company mono">${esc(exp.company || "Company")} · ${dateRange(exp)}</div>
          ${bulletList(exp.description, "exp-bullets")}
        </div>`;
      }).join("")}` : ""}

      ${showWatermark ? `<div class="note">Created with CareerIntel SA · careerintelsa.co.za</div>` : ""}
    </div>
  </div>
</div>
<script>window.onload = function(){ window.print(); }<\/script>
</body></html>`;
}

// ─── 4b. Graduate — full data ─────────────────────────────────────────────────

export function generateGraduateFull(data: CVBuiltData, showWatermark = true): string {
  const { personal, summary, experience, education, skills, certifications } = data;
  const fullName = personal.fullName.trim() || "Your Name";
  const latestTitle = experience[0]?.jobTitle ?? "Graduate";
  const location = [personal.location, personal.province].filter(Boolean).join(", ");

  const contacts = [personal.email, personal.phone, location, personal.linkedin]
    .filter(Boolean).map(esc).join("&nbsp;&nbsp;·&nbsp;&nbsp;");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>CV — ${esc(fullName)}</title>
<style>
${PRINT_BASE}
body { font-family: 'Segoe UI', Arial, sans-serif; background: #eaf0f6; color: #1e293b; }
.page { max-width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff; box-shadow: 0 10px 46px rgba(29,78,216,0.16); }
.header { background: linear-gradient(120deg,#1e3a8a 0%,#2563eb 100%); padding: 40px 46px 30px; }
.g-name { font-size: 29px; font-weight: 700; color: #fff; letter-spacing: -0.4px; }
.g-role { font-size: 12.5px; color: #c7dbff; margin-top: 5px; letter-spacing: .02em; }
.g-contacts { font-size: 10.5px; color: #d5e4ff; margin-top: 20px; }
.body { padding: 34px 46px 42px; }
.section { margin-bottom: 24px; }
.sec-title { font-size: 11.5px; font-weight: 700; color: #1d4ed8; text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 12px; display: flex; align-items: center; gap: 10px; }
.sec-title::after { content: ''; flex: 1; height: 1.5px; background: #dbe6fb; }
.summary { font-size: 12px; color: #334155; line-height: 1.8; }
.exp-item { margin-bottom: 16px; padding-left: 15px; border-left: 2px solid #dbe6fb; }
.exp-item:last-child { margin-bottom: 0; }
.exp-head { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
.exp-title { font-size: 12.5px; font-weight: 700; color: #10203f; }
.exp-company { font-size: 10.5px; color: #2563eb; margin: 2px 0 6px; font-weight: 500; }
.exp-date { font-size: 10px; color: #64748b; white-space: nowrap; flex-shrink: 0; }
.exp-bullets { font-size: 11px; color: #475569; line-height: 1.65; padding-left: 15px; list-style: none; }
.exp-bullets li { margin-bottom: 4px; position: relative; }
.exp-bullets li::before { content: ''; position: absolute; left: -13px; top: 6px; width: 4px; height: 4px; background: #2563eb; border-radius: 50%; }
.edu-item { display: flex; justify-content: space-between; align-items: baseline; padding: 11px 0; border-bottom: 1px solid #eef2f8; }
.edu-item:last-child { border-bottom: none; }
.edu-qual { font-size: 12px; font-weight: 700; color: #10203f; }
.edu-inst { font-size: 10.5px; color: #2563eb; margin-top: 1px; }
.edu-meta { font-size: 10px; color: #64748b; margin-top: 2px; }
.edu-year { font-size: 10.5px; font-weight: 600; color: #1d4ed8; white-space: nowrap; flex-shrink: 0; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
.skills-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
.skill-pill { background: #eaf1fe; color: #1d4ed8; font-size: 10.5px; padding: 5px 12px; border-radius: 6px; font-weight: 500; }
.cert-pill { background: #eafaf0; color: #157347; font-size: 10.5px; padding: 5px 12px; border-radius: 6px; font-weight: 500; }
.note-bar { font-size: 9.5px; color: #94a3b8; margin-top: 22px; text-align: center; }
@media print { .page { box-shadow: none !important; } }
</style></head><body>
<div class="page">
  <div class="header">
    <div class="g-name">${esc(fullName)}</div>
    <div class="g-role">${esc(latestTitle)}${location ? ` · ${esc(location)}` : ""}</div>
    ${contacts ? `<div class="g-contacts">${contacts}</div>` : ""}
  </div>
  <div class="body">
    ${summary ? `<div class="section">
      <div class="sec-title">Profile</div>
      <div class="summary">${esc(summary)}</div>
    </div>` : ""}

    ${experience.length > 0 ? `<div class="section">
      <div class="sec-title">Work Experience</div>
      ${experience.map(exp => {
        return `<div class="exp-item">
          <div class="exp-head">
            <div><div class="exp-title">${esc(exp.jobTitle || "Position")}</div>
            <div class="exp-company">${esc(exp.company || "Company")}</div></div>
            <div class="exp-date">${dateRange(exp)}</div>
          </div>
          ${bulletList(exp.description, "exp-bullets")}
        </div>`;
      }).join("")}
    </div>` : ""}

    ${education.length > 0 ? `<div class="section">
      <div class="sec-title">Education &amp; Qualifications</div>
      ${education.map(edu => `<div class="edu-item">
        <div>
          <div class="edu-qual">${esc(edu.qualification || "Qualification")}</div>
          <div class="edu-inst">${esc(edu.institution || "Institution")}${edu.fieldOfStudy ? ` · ${esc(edu.fieldOfStudy)}` : ""}</div>
          <div class="edu-meta">${edu.nqfLevel ? `NQF Level ${esc(edu.nqfLevel)}` : ""}</div>
        </div>
        ${edu.yearCompleted ? `<span class="edu-year">${esc(edu.yearCompleted)}</span>` : ""}
      </div>`).join("")}
    </div>` : ""}

    <div class="two-col">
      ${skills.length > 0 ? `<div class="section">
        <div class="sec-title">Skills</div>
        <div class="skills-wrap">${skills.map(s => `<span class="skill-pill">${esc(s)}</span>`).join("")}</div>
      </div>` : "<div></div>"}
      ${certifications.length > 0 ? `<div class="section">
        <div class="sec-title">Certifications</div>
        <div class="skills-wrap">${certifications.map(c => `<span class="cert-pill">${esc(c)}</span>`).join("")}</div>
      </div>` : "<div></div>"}
    </div>

    ${showWatermark ? `<div class="note-bar">Created with CareerIntel SA · careerintelsa.co.za</div>` : ""}
  </div>
</div>
<script>window.onload = function(){ window.print(); }<\/script>
</body></html>`;
}

// ─── Template dispatcher ──────────────────────────────────────────────────────

// ATS-safe render for the thin-data fallback path (no extracted personal /
// experience / education — e.g. analysis-only). Single column, standard headings.
function generateAtsSafeThin(data: CVTemplateData, showWatermark = true): string {
  const skills = (data.extractedSkills ?? []).filter(Boolean);
  const keywords = (data.missingKeywords ?? []).filter(Boolean);
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>CV — ATS-Safe</title>
<style>
${PRINT_BASE}
body { font-family: Arial, Calibri, Helvetica, sans-serif; background: #fff; color: #111; }
.page { max-width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff; padding: 22mm 20mm; }
.name { font-size: 22px; font-weight: 700; color: #000; margin-bottom: 4px; }
.contact { font-size: 11px; color: #222; margin-bottom: 18px; }
h2 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #000; border-bottom: 1px solid #000; padding-bottom: 3px; margin: 18px 0 9px; }
.summary, .plain { font-size: 11.5px; line-height: 1.6; color: #111; }
.foot { margin-top: 20px; font-size: 9.5px; color: #666; }
@media print { .page { padding: 16mm 18mm; } }
</style></head><body>
<div class="page">
  <div class="name">Your Name</div>
  <div class="contact">Email  |  Phone  |  City, Province  |  LinkedIn</div>
  ${data.improvedSummary ? `<h2>Professional Summary</h2><p class="summary">${esc(data.improvedSummary)}</p>` : ""}
  ${skills.length ? `<h2>Skills</h2><p class="plain">${skills.map(esc).join(", ")}</p>` : ""}
  ${keywords.length ? `<h2>Keywords to Add</h2><p class="plain">${keywords.map(esc).join(", ")}</p>` : ""}
  ${showWatermark ? `<div class="foot">Created with CareerIntel SA · careerintelsa.co.za</div>` : ""}
</div>
<script>window.onload = function(){ window.print(); }<\/script>
</body></html>`;
}

export function generateCV(templateId: string, data: CVTemplateData, showWatermark = true): string {
  switch (templateId) {
    case "ats":        return generateAtsSafeThin(data, showWatermark);
    case "executive":  return generateExecutive(data, showWatermark);
    case "tech":       return generateTechFocus(data, showWatermark);
    case "graduate":   return generateGraduate(data, showWatermark);
    default:           return generateModernPro(data, showWatermark);
  }
}

// ─── Build-from-Scratch types ─────────────────────────────────────────────────
// Mirrors the CVData shape in the cv-builder page so the template can use real data.

export interface CVBuiltData {
  personal: {
    fullName: string; email: string; phone: string;
    location: string; province: string; linkedin: string; website: string;
  };
  summary: string;
  experience: Array<{
    id: string; jobTitle: string; company: string;
    startDate: string; endDate: string; current: boolean; description: string;
  }>;
  education: Array<{
    id: string; institution: string; qualification: string;
    fieldOfStudy: string; yearCompleted: string; nqfLevel: string;
  }>;
  skills: string[];
  certifications: string[];
}

// ─── Build-from-Scratch generator (Modern Pro with real data) ─────────────────

export function generateBuiltCV(data: CVBuiltData, showWatermark = true): string {
  const { personal, summary, experience, education, skills, certifications } = data;
  const fullName = personal.fullName.trim() || "Your Name";
  const parts = fullName.split(" ");
  const initials = parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : (parts[0]?.[0] ?? "Y").toUpperCase();
  const latestTitle = experience[0]?.jobTitle ?? "";

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>CV — ${esc(fullName)}</title>
<style>
${PRINT_BASE}
body { font-family: 'Segoe UI', Arial, sans-serif; background: #eef0f4; color: #2b2f42; }
.page { display: grid; grid-template-columns: 232px 1fr; min-height: 297mm; max-width: 210mm; margin: 0 auto; background: white; box-shadow: 0 10px 48px rgba(30,27,75,0.16); }
.sidebar { background: #171436; padding: 40px 24px; color: #dcdcf5; }
.avatar-wrap { text-align: center; margin-bottom: 20px; }
.avatar { display: inline-flex; align-items: center; justify-content: center; width: 68px; height: 68px; border-radius: 50%; background: linear-gradient(135deg,#5b5bd6,#8b78e6); color: white; font-size: 23px; font-weight: 700; }
.s-name { font-size: 16px; font-weight: 700; color: #fff; text-align: center; line-height: 1.3; margin-bottom: 3px; }
.s-role { font-size: 10px; color: #a7a2e0; text-align: center; margin-bottom: 26px; }
.s-heading { font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: #9b93e8; padding-bottom: 5px; margin: 20px 0 10px; border-bottom: 1px solid rgba(255,255,255,0.12); }
.contact-row { font-size: 10px; color: #c3c0ea; margin-bottom: 6px; line-height: 1.45; word-break: break-word; }
.s-skill { display: inline-block; background: rgba(255,255,255,0.08); color: #d7d4f4; font-size: 9.5px; padding: 3px 9px; border-radius: 5px; margin: 0 3px 4px 0; }
.cert-item { font-size: 10px; color: #c3c0ea; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.07); line-height: 1.4; }
.cert-item:last-child { border-bottom: none; }
.main { padding: 40px 36px; }
.main-header { border-bottom: 2px solid #5b5bd6; padding-bottom: 13px; margin-bottom: 24px; }
.main-name { font-size: 27px; font-weight: 700; color: #171436; letter-spacing: -0.5px; }
.main-role { font-size: 12.5px; color: #5b5bd6; font-weight: 500; margin-top: 3px; }
.section { margin-bottom: 22px; }
.section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.16em; color: #171436; border-left: 3px solid #5b5bd6; padding-left: 9px; margin-bottom: 11px; }
.summary-p { font-size: 11.5px; color: #3f4459; line-height: 1.75; }
.exp-block { margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eef0f4; }
.exp-block:last-child { border-bottom: none; padding-bottom: 0; }
.exp-row { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
.exp-title { font-size: 12.5px; font-weight: 700; color: #171436; }
.exp-company { font-size: 11px; color: #5b5bd6; margin-top: 1px; }
.exp-date { font-size: 10px; color: #8b8fa3; white-space: nowrap; flex-shrink: 0; }
.exp-desc { font-size: 11px; color: #4b5061; margin-top: 7px; line-height: 1.65; padding-left: 15px; list-style: none; }
.exp-desc li { margin-bottom: 4px; position: relative; }
.exp-desc li::before { content: ''; position: absolute; left: -13px; top: 6px; width: 4px; height: 4px; background: #5b5bd6; border-radius: 50%; }
.edu-block { margin-bottom: 12px; }
.edu-qual { font-size: 12px; font-weight: 700; color: #171436; }
.edu-inst { font-size: 11px; color: #5b5bd6; margin-top: 1px; }
.edu-meta { font-size: 10px; color: #8b8fa3; margin-top: 2px; }
.skills-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
.skill-tag { background: #ecebfb; color: #3f3aa8; font-size: 10.5px; padding: 5px 11px; border-radius: 6px; font-weight: 500; }
.cert-tag { background: #e7f7ee; color: #157347; font-size: 10.5px; padding: 5px 11px; border-radius: 6px; font-weight: 500; }
.footer-note { font-size: 9.5px; color: #9b9fb0; margin-top: 22px; text-align: center; }
@media print { .page { box-shadow: none !important; } }
</style></head><body>
<div class="page">
  <div class="sidebar">
    <div class="avatar-wrap"><div class="avatar">${esc(initials)}</div></div>
    <div class="s-name">${esc(fullName)}</div>
    ${latestTitle ? `<div class="s-role">${esc(latestTitle)}</div>` : ""}

    <div class="s-heading">Contact</div>
    ${personal.email ? `<div class="contact-row">${esc(personal.email)}</div>` : ""}
    ${personal.phone ? `<div class="contact-row">${esc(personal.phone)}</div>` : ""}
    ${personal.location ? `<div class="contact-row">${esc(personal.location)}${personal.province ? `, ${esc(personal.province)}` : ""}</div>` : ""}
    ${personal.linkedin ? `<div class="contact-row">${esc(personal.linkedin)}</div>` : ""}
    ${personal.website ? `<div class="contact-row">${esc(personal.website)}</div>` : ""}

    ${skills.length > 0 ? `
    <div class="s-heading">Skills</div>
    <div>${skills.map(s => `<span class="s-skill">${esc(s)}</span>`).join("")}</div>` : ""}

    ${certifications.length > 0 ? `
    <div class="s-heading">Certifications</div>
    ${certifications.map(c => `<div class="cert-item">${esc(c)}</div>`).join("")}` : ""}
  </div>

  <div class="main">
    <div class="main-header">
      <div class="main-name">${esc(fullName)}</div>
      <div class="main-role">${latestTitle ? `${esc(latestTitle)} · ` : ""}${esc(personal.province || "South Africa")}</div>
    </div>

    ${summary ? `
    <div class="section">
      <div class="section-title">Professional Summary</div>
      <p class="summary-p">${esc(summary)}</p>
    </div>` : ""}

    ${experience.length > 0 ? `
    <div class="section">
      <div class="section-title">Work Experience</div>
      ${experience.map(exp => {
        return `<div class="exp-block">
        <div class="exp-row">
          <div>
            <div class="exp-title">${esc(exp.jobTitle || "Position")}</div>
            <div class="exp-company">${esc(exp.company || "Company")}</div>
          </div>
          <div class="exp-date">${dateRange(exp)}</div>
        </div>
        ${bulletList(exp.description, "exp-desc")}
      </div>`;
      }).join("")}
    </div>` : ""}

    ${education.length > 0 ? `
    <div class="section">
      <div class="section-title">Education &amp; Qualifications</div>
      ${education.map(edu => `<div class="edu-block">
        <div class="edu-qual">${esc(edu.qualification || "Qualification")}</div>
        <div class="edu-inst">${esc(edu.institution || "Institution")}${edu.fieldOfStudy ? ` · ${esc(edu.fieldOfStudy)}` : ""}</div>
        <div class="edu-meta">${edu.nqfLevel ? `NQF Level ${esc(edu.nqfLevel)}` : ""}${edu.nqfLevel && edu.yearCompleted ? " · " : ""}${esc(edu.yearCompleted || "")}</div>
      </div>`).join("")}
    </div>` : ""}

    ${skills.length > 0 ? `
    <div class="section">
      <div class="section-title">Skills &amp; Competencies</div>
      <div class="skills-wrap">${skills.map(s => `<span class="skill-tag">${esc(s)}</span>`).join("")}</div>
    </div>` : ""}

    ${certifications.length > 0 ? `
    <div class="section">
      <div class="section-title">Certifications &amp; Trade Papers</div>
      <div class="skills-wrap">${certifications.map(c => `<span class="cert-tag">${esc(c)}</span>`).join("")}</div>
    </div>` : ""}

    ${showWatermark ? `<div class="footer-note">Created with CareerIntel SA · careerintelsa.co.za</div>` : ""}
  </div>
</div>
<script>window.onload = function(){ window.print(); }<\/script>
</body></html>`;
}

// ─── ATS-Safe template (single column, machine-parseable) ─────────────────────
// Deliberately plain: one column, standard sans font, standard section headings,
// no tables / sidebars / columns / icons / graphics / background colours. This is
// what actually maximises the parse an ATS performs — the pretty templates score
// worse inside real applicant-tracking software regardless of content.

function esc(s: string): string {
  return (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function generateAtsSafe(data: CVBuiltData, showWatermark = true): string {
  const { personal, summary, experience, education, skills, certifications } = data;
  const fullName = personal.fullName.trim() || "Your Name";
  const contactLine = [
    personal.email, personal.phone,
    [personal.location, personal.province].filter(Boolean).join(", "),
    personal.linkedin, personal.website,
  ].filter(Boolean).map(esc).join("  |  ");

  const expHtml = experience.map((exp) => {
    const lines = exp.description ? exp.description.split("\n").map((l) => l.trim()).filter(Boolean) : [];
    const bullets = lines.map((l) => `<li>${esc(l.replace(/^[•\-–]\s*/, ""))}</li>`).join("");
    const dates = `${esc(exp.startDate || "")}${(exp.startDate || exp.endDate || exp.current) ? " – " : ""}${exp.current ? "Present" : esc(exp.endDate || "")}`;
    return `<div class="item">
      <div class="item-head"><span class="role">${esc(exp.jobTitle || "Position")}</span><span class="dates">${dates}</span></div>
      <div class="org">${esc(exp.company || "Company")}</div>
      ${bullets ? `<ul>${bullets}</ul>` : ""}
    </div>`;
  }).join("");

  const eduHtml = education.map((edu) => `<div class="item">
      <div class="item-head"><span class="role">${esc(edu.qualification || "Qualification")}</span><span class="dates">${esc(edu.yearCompleted || "")}</span></div>
      <div class="org">${esc(edu.institution || "Institution")}${edu.fieldOfStudy ? ` — ${esc(edu.fieldOfStudy)}` : ""}${edu.nqfLevel ? ` (NQF Level ${esc(edu.nqfLevel)})` : ""}</div>
    </div>`).join("");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>CV — ${esc(fullName)}</title>
<style>
${PRINT_BASE}
body { font-family: Arial, Calibri, Helvetica, sans-serif; background: #fff; color: #111; }
.page { max-width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff; padding: 22mm 20mm; }
.name { font-size: 22px; font-weight: 700; color: #000; margin-bottom: 4px; letter-spacing: .3px; }
.contact { font-size: 11px; color: #222; margin-bottom: 18px; }
h2 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #000; border-bottom: 1px solid #000; padding-bottom: 3px; margin: 18px 0 9px; }
.summary { font-size: 11.5px; line-height: 1.55; color: #111; }
.item { margin-bottom: 12px; }
.item-head { display: flex; justify-content: space-between; align-items: baseline; }
.role { font-size: 12px; font-weight: 700; color: #000; }
.dates { font-size: 10.5px; color: #333; white-space: nowrap; padding-left: 10px; }
.org { font-size: 11px; font-style: italic; color: #222; margin: 1px 0 4px; }
ul { margin: 4px 0 0 16px; padding: 0; }
li { font-size: 11px; line-height: 1.5; color: #111; margin-bottom: 2px; }
.plain { font-size: 11px; line-height: 1.7; color: #111; }
.foot { margin-top: 20px; font-size: 9.5px; color: #666; }
@media print { .page { padding: 16mm 18mm; } }
</style></head><body>
<div class="page">
  <div class="name">${esc(fullName)}</div>
  <div class="contact">${contactLine}</div>

  ${summary ? `<h2>Professional Summary</h2><p class="summary">${esc(summary)}</p>` : ""}

  ${experience.length > 0 ? `<h2>Work Experience</h2>${expHtml}` : ""}

  ${education.length > 0 ? `<h2>Education</h2>${eduHtml}` : ""}

  ${skills.length > 0 ? `<h2>Skills</h2><p class="plain">${skills.map(esc).join(", ")}</p>` : ""}

  ${certifications.length > 0 ? `<h2>Certifications</h2><p class="plain">${certifications.map(esc).join(", ")}</p>` : ""}

  ${showWatermark ? `<div class="foot">Created with CareerIntel SA · careerintelsa.co.za</div>` : ""}
</div>
<script>window.onload = function(){ window.print(); }<\/script>
</body></html>`;
}

// ─── Revamped CV dispatcher (all templates with real data) ────────────────────
// Used by the AI revamp flow where the user's actual data has been extracted.

export function generateRevampedCV(templateId: string, data: CVBuiltData, showWatermark = true): string {
  switch (templateId) {
    case "ats":       return generateAtsSafe(data, showWatermark);
    case "executive": return generateExecutiveFull(data, showWatermark);
    case "tech":      return generateTechFull(data, showWatermark);
    case "graduate":  return generateGraduateFull(data, showWatermark);
    default:          return generateBuiltCV(data, showWatermark);   // Modern Pro
  }
}
