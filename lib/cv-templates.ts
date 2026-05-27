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

export function generateModernPro(data: CVTemplateData): string {
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

    <div class="note-box">⚡ <strong>AI Optimised by CareerIntel SA</strong> — Replace all [placeholder text] with your actual details. Yellow-highlighted skills above are high-demand keywords that will boost your ATS score.</div>
  </div>
</div>
</body></html>`;
}

// ─── 2. Executive ─────────────────────────────────────────────────────────────
// Full-width dark header, elegant single-column. For senior/management roles.

export function generateExecutive(data: CVTemplateData): string {
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

    <div class="footer-note">⚡ AI-Optimised by CareerIntel SA · Replace all [placeholders] with your real details · Amber-bordered keywords are high-value additions for SA recruiters</div>
  </div>
</div>
</body></html>`;
}

// ─── 3. Tech Focus ────────────────────────────────────────────────────────────
// Split layout, skills front-and-centre, developer-optimised.

export function generateTechFocus(data: CVTemplateData): string {
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

      <div class="note">// Generated by CareerIntel SA · Replace [placeholders] with real data · Yellow skills = high-demand additions</div>
    </div>
  </div>
</div>
</body></html>`;
}

// ─── 4. Graduate ──────────────────────────────────────────────────────────────
// Clean, ATS-friendly, minimal. Perfect for first-time job seekers.

export function generateGraduate(data: CVTemplateData): string {
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

    <div class="note-bar">⚡ AI-Optimised by CareerIntel SA · Fill in all [brackets] with your real information · Yellow-highlighted skills are what SA recruiters want to see</div>
  </div>
</div>
</body></html>`;
}

// ─── Shared helpers for full-data templates ───────────────────────────────────

function buildExpSection(experience: CVBuiltData["experience"], cls: {
  block: string; row: string; title: string; company: string; date: string; bullets: string; lastBorderNone?: string;
}): string {
  return experience.map(exp => {
    const lines = exp.description ? exp.description.split("\\n").filter(l => l.trim()) : [];
    const bullets = lines.map(l => `<li>${l.trim()}</li>`).join("");
    const dateStr = [exp.startDate, exp.current ? "Present" : exp.endDate].filter(Boolean).join(" – ");
    return `<div class="${cls.block}">
      <div class="${cls.row}">
        <div><div class="${cls.title}">${exp.jobTitle || "Position"}</div>
        <div class="${cls.company}">${exp.company || "Company"}</div></div>
        <div class="${cls.date}">${dateStr}</div>
      </div>
      ${bullets ? `<ul class="${cls.bullets}">${bullets}</ul>` : ""}
    </div>`;
  }).join("");
}

function buildEduSection(education: CVBuiltData["education"], cls: {
  block: string; qual: string; inst: string; meta: string;
}): string {
  return education.map(edu => {
    const meta = [edu.nqfLevel ? `NQF Level ${edu.nqfLevel}` : "", edu.yearCompleted].filter(Boolean).join(" · ");
    return `<div class="${cls.block}">
      <div class="${cls.qual}">${edu.qualification || "Qualification"}</div>
      <div class="${cls.inst}">${edu.institution || "Institution"}${edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ""}</div>
      <div class="${cls.meta}">${meta}</div>
    </div>`;
  }).join("");
}

// ─── 2b. Executive — full data ────────────────────────────────────────────────

export function generateExecutiveFull(data: CVBuiltData): string {
  const { personal, summary, experience, education, skills, certifications } = data;
  const fullName = personal.fullName.trim() || "Your Name";
  const latestTitle = experience[0]?.jobTitle ?? "";
  const location = [personal.location, personal.province].filter(Boolean).join(", ");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>CV — ${fullName}</title>
<style>
${PRINT_BASE}
body { font-family: Georgia, 'Times New Roman', serif; background: #f9fafb; }
.page { max-width: 210mm; min-height: 297mm; margin: 0 auto; background: white; box-shadow: 0 4px 40px rgba(0,0,0,0.12); }
.header { background: #0f172a; padding: 44px 52px 36px; }
.h-name { font-size: 34px; font-weight: 400; color: white; letter-spacing: 2px; text-transform: uppercase; }
.h-rule { width: 60px; height: 2px; background: #f59e0b; margin: 12px 0; }
.h-role { font-size: 13px; color: #94a3b8; letter-spacing: 0.1em; font-family: 'Segoe UI', Arial, sans-serif; text-transform: uppercase; }
.h-contacts { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 18px; }
.h-contact { font-size: 11px; color: #cbd5e1; font-family: 'Segoe UI', Arial, sans-serif; display: flex; align-items: center; gap: 5px; }
.body { padding: 40px 52px; }
.section { margin-bottom: 28px; }
.sec-title { font-size: 11px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.2em; color: #0f172a; border-bottom: 1.5px solid #f59e0b; padding-bottom: 5px; margin-bottom: 14px; font-family: 'Segoe UI', Arial, sans-serif; }
.summary { font-size: 12.5px; color: #1e293b; line-height: 1.8; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
.exp-block { margin-bottom: 18px; }
.exp-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.exp-title { font-size: 13px; font-weight: 700; color: #0f172a; font-family: 'Segoe UI', Arial, sans-serif; }
.exp-company { font-size: 11px; color: #f59e0b; font-family: 'Segoe UI', Arial, sans-serif; margin: 2px 0; }
.exp-date { font-size: 10.5px; color: #64748b; font-family: 'Segoe UI', Arial, sans-serif; white-space: nowrap; flex-shrink: 0; }
.exp-bullets { font-size: 11.5px; color: #334155; line-height: 1.7; margin-top: 6px; padding-left: 14px; }
.exp-bullets li { margin-bottom: 4px; }
.edu-block { margin-bottom: 12px; }
.edu-qual { font-size: 13px; font-weight: 700; font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; }
.edu-inst { font-size: 11px; color: #64748b; font-family: 'Segoe UI', Arial, sans-serif; margin-top: 2px; }
.edu-meta { font-size: 10px; color: #94a3b8; font-family: 'Segoe UI', Arial, sans-serif; margin-top: 2px; }
.skills-list { display: flex; flex-wrap: wrap; gap: 6px; }
.skill-tag { border: 1px solid #cbd5e1; color: #0f172a; font-size: 10.5px; padding: 4px 12px; font-family: 'Segoe UI', Arial, sans-serif; }
.cert-tag { border: 1px solid #f59e0b; color: #92400e; background: #fffbeb; font-size: 10.5px; padding: 4px 12px; font-family: 'Segoe UI', Arial, sans-serif; }
.footer-note { background: #fffbeb; border-left: 3px solid #f59e0b; padding: 8px 14px; font-size: 10px; color: #78350f; font-family: 'Segoe UI', Arial, sans-serif; margin-top: 20px; }
@media print { .page { box-shadow: none !important; } }
</style></head><body>
<div class="page">
  <div class="header">
    <div class="h-name">${fullName}</div>
    <div class="h-rule"></div>
    <div class="h-role">${latestTitle}${location ? ` · ${location}` : " · South Africa"}</div>
    <div class="h-contacts">
      ${personal.email ? `<span class="h-contact">✉ ${personal.email}</span>` : ""}
      ${personal.phone ? `<span class="h-contact">📱 ${personal.phone}</span>` : ""}
      ${location ? `<span class="h-contact">📍 ${location}</span>` : ""}
      ${personal.linkedin ? `<span class="h-contact">🔗 ${personal.linkedin}</span>` : ""}
      ${personal.website ? `<span class="h-contact">🌐 ${personal.website}</span>` : ""}
    </div>
  </div>
  <div class="body">
    ${summary ? `<div class="section">
      <div class="sec-title">Executive Profile</div>
      <p class="summary">${summary}</p>
    </div>` : ""}

    ${experience.length > 0 ? `<div class="section">
      <div class="sec-title">Professional Experience</div>
      ${buildExpSection(experience, { block: "exp-block", row: "exp-row", title: "exp-title", company: "exp-company", date: "exp-date", bullets: "exp-bullets" })}
    </div>` : ""}

    <div class="two-col">
      ${education.length > 0 ? `<div class="section">
        <div class="sec-title">Education</div>
        ${buildEduSection(education, { block: "edu-block", qual: "edu-qual", inst: "edu-inst", meta: "edu-meta" })}
      </div>` : "<div></div>"}
      ${skills.length > 0 ? `<div class="section">
        <div class="sec-title">Core Competencies</div>
        <div class="skills-list">${skills.map(s => `<span class="skill-tag">${s}</span>`).join("")}</div>
        ${certifications.length > 0 ? `<div style="margin-top:12px;"><div class="sec-title" style="margin-top:10px;">Certifications</div><div class="skills-list">${certifications.map(c => `<span class="cert-tag">${c}</span>`).join("")}</div></div>` : ""}
      </div>` : "<div></div>"}
    </div>

    <div class="footer-note">📄 AI-Revamped by CareerIntel SA · Print (Ctrl+P / Cmd+P) and save as PDF</div>
  </div>
</div>
<script>window.onload = function(){ window.print(); }<\/script>
</body></html>`;
}

// ─── 3b. Tech Focus — full data ───────────────────────────────────────────────

export function generateTechFull(data: CVBuiltData): string {
  const { personal, summary, experience, education, skills, certifications } = data;
  const fullName = personal.fullName.trim() || "Your Name";
  const latestTitle = experience[0]?.jobTitle ?? "Software Professional";
  const location = [personal.location, personal.province].filter(Boolean).join(", ");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>CV — ${fullName}</title>
<style>
${PRINT_BASE}
body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0f172a; }
.page { max-width: 210mm; min-height: 297mm; margin: 0 auto; background: white; box-shadow: 0 4px 40px rgba(0,0,0,0.3); }
.top-bar { background: #0f172a; padding: 28px 40px 22px; display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; }
.t-name { font-size: 24px; font-weight: 700; color: white; }
.t-role { font-size: 11px; color: #22d3ee; margin-top: 3px; font-family: 'Courier New', monospace; }
.t-contacts { text-align: right; }
.t-contact { font-size: 10px; color: #94a3b8; display: block; margin-bottom: 2px; }
.content { display: grid; grid-template-columns: 190px 1fr; }
.left-col { background: #f8fafc; padding: 22px 18px; border-right: 1px solid #e2e8f0; }
.right-col { padding: 24px 28px; }
.l-heading { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: #22d3ee; margin: 14px 0 7px; }
.l-heading:first-child { margin-top: 0; }
.tech-pill { display: inline-block; background: #0f172a; color: #22d3ee; font-size: 9.5px; padding: 3px 8px; border-radius: 3px; margin: 2px 2px 2px 0; font-family: 'Courier New', monospace; }
.cert-item { font-size: 10px; color: #475569; padding: 2px 0; border-bottom: 1px solid #e2e8f0; line-height: 1.5; }
.cert-item:last-child { border-bottom: none; }
.r-heading { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #0f172a; border-bottom: 2px solid #22d3ee; padding-bottom: 4px; margin: 18px 0 10px; }
.r-heading:first-child { margin-top: 0; }
.summary { font-size: 11.5px; color: #334155; line-height: 1.7; }
.exp-item { margin-bottom: 14px; border-left: 2px solid #e2e8f0; padding-left: 12px; }
.exp-block { margin-bottom: 0; }
.exp-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
.exp-title { font-size: 12px; font-weight: 600; color: #0f172a; }
.exp-company { font-size: 10px; color: #22d3ee; font-family: 'Courier New', monospace; margin: 2px 0 5px; }
.exp-date { font-size: 10px; color: #94a3b8; font-family: 'Courier New', monospace; white-space: nowrap; flex-shrink: 0; }
.exp-bullets { font-size: 11px; color: #4b5563; line-height: 1.65; padding-left: 14px; }
.exp-bullets li { margin-bottom: 3px; }
.edu-block { margin-bottom: 10px; }
.edu-qual { font-size: 11.5px; font-weight: 600; color: #0f172a; }
.edu-inst { font-size: 10px; color: #64748b; margin-top: 2px; }
.edu-meta { font-size: 9.5px; color: #94a3b8; margin-top: 1px; }
.note { background: #f0fdff; border: 1px solid #a5f3fc; border-radius: 4px; padding: 7px 10px; font-size: 9.5px; color: #0e7490; margin-top: 16px; font-family: 'Courier New', monospace; }
@media print { .page { box-shadow: none !important; } }
</style></head><body>
<div class="page">
  <div class="top-bar">
    <div>
      <div class="t-name">${fullName}</div>
      <div class="t-role">$ whoami → ${latestTitle}</div>
    </div>
    <div class="t-contacts">
      ${personal.email ? `<span class="t-contact">✉ ${personal.email}</span>` : ""}
      ${personal.phone ? `<span class="t-contact">📱 ${personal.phone}</span>` : ""}
      ${location ? `<span class="t-contact">📍 ${location}, SA</span>` : ""}
      ${personal.linkedin ? `<span class="t-contact">🔗 ${personal.linkedin}</span>` : ""}
      ${personal.website ? `<span class="t-contact">🌐 ${personal.website}</span>` : ""}
    </div>
  </div>
  <div class="content">
    <div class="left-col">
      ${skills.length > 0 ? `<div class="l-heading">Tech Stack</div>
      <div>${skills.map(s => `<span class="tech-pill">${s}</span>`).join("")}</div>` : ""}

      ${education.length > 0 ? `<div class="l-heading">Education</div>
      ${education.map(edu => `<div class="edu-block">
        <div class="edu-qual">${edu.qualification || "Qualification"}</div>
        <div class="edu-inst">${edu.institution || "Institution"}</div>
        <div class="edu-meta">${edu.nqfLevel ? `NQF ${edu.nqfLevel}` : ""}${edu.nqfLevel && edu.yearCompleted ? " · " : ""}${edu.yearCompleted || ""}</div>
      </div>`).join("")}` : ""}

      ${certifications.length > 0 ? `<div class="l-heading">Certifications</div>
      <div>${certifications.map(c => `<div class="cert-item">${c}</div>`).join("")}</div>` : ""}
    </div>
    <div class="right-col">
      ${summary ? `<div class="r-heading">// Profile</div>
      <p class="summary">${summary}</p>` : ""}

      ${experience.length > 0 ? `<div class="r-heading">// Experience</div>
      ${experience.map(exp => {
        const lines = exp.description ? exp.description.split("\\n").filter(l => l.trim()) : [];
        const bullets = lines.map(l => `<li>${l.trim()}</li>`).join("");
        const dateStr = [exp.startDate, exp.current ? "Present" : exp.endDate].filter(Boolean).join(" → ");
        return `<div class="exp-item">
          <div class="exp-row">
            <div><div class="exp-title">${exp.jobTitle || "Position"}</div>
            <div class="exp-company">${exp.company || "Company"} | ${dateStr}</div></div>
          </div>
          ${bullets ? `<ul class="exp-bullets">${bullets}</ul>` : ""}
        </div>`;
      }).join("")}` : ""}

      <div class="note">// AI-Revamped by CareerIntel SA · Print (Ctrl+P) → Save as PDF</div>
    </div>
  </div>
</div>
<script>window.onload = function(){ window.print(); }<\/script>
</body></html>`;
}

// ─── 4b. Graduate — full data ─────────────────────────────────────────────────

export function generateGraduateFull(data: CVBuiltData): string {
  const { personal, summary, experience, education, skills, certifications } = data;
  const fullName = personal.fullName.trim() || "Your Name";
  const latestTitle = experience[0]?.jobTitle ?? "Graduate";
  const location = [personal.location, personal.province].filter(Boolean).join(", ");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>CV — ${fullName}</title>
<style>
${PRINT_BASE}
body { font-family: 'Segoe UI', Arial, sans-serif; background: #f1f5f9; }
.page { max-width: 210mm; min-height: 297mm; margin: 0 auto; background: white; box-shadow: 0 4px 40px rgba(0,0,0,0.1); }
.header { background: linear-gradient(135deg,#1d4ed8 0%,#3b82f6 100%); padding: 34px 44px 26px; }
.g-name { font-size: 28px; font-weight: 700; color: white; letter-spacing: -0.3px; }
.g-role { font-size: 13px; color: #bfdbfe; margin-top: 4px; }
.g-contacts { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 12px; }
.g-contact { font-size: 11px; color: #dbeafe; display: flex; align-items: center; gap: 5px; }
.body { padding: 32px 44px; }
.section { margin-bottom: 22px; }
.sec-title { font-size: 12px; font-weight: 700; color: #1d4ed8; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
.sec-title::after { content: ''; flex: 1; height: 1px; background: #bfdbfe; }
.summary { font-size: 12px; color: #1e293b; line-height: 1.8; background: #f0f9ff; border-left: 3px solid #3b82f6; padding: 10px 14px; border-radius: 0 6px 6px 0; }
.exp-item { margin-bottom: 10px; padding: 12px 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
.exp-block { margin-bottom: 0; }
.exp-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
.exp-title { font-size: 12.5px; font-weight: 600; color: #1e293b; }
.exp-company { font-size: 10.5px; color: #3b82f6; margin: 2px 0 5px; font-weight: 500; }
.exp-date { font-size: 10px; color: #64748b; white-space: nowrap; flex-shrink: 0; background: #e0f2fe; padding: 2px 8px; border-radius: 20px; }
.exp-bullets { font-size: 11px; color: #475569; line-height: 1.65; padding-left: 14px; }
.exp-bullets li { margin-bottom: 3px; }
.edu-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 10px 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 8px; }
.edu-block { margin-bottom: 0; }
.edu-qual { font-size: 12.5px; font-weight: 600; color: #1e293b; }
.edu-inst { font-size: 11px; color: #3b82f6; margin-top: 1px; }
.edu-meta { font-size: 10px; color: #64748b; margin-top: 2px; }
.edu-year { font-size: 11px; font-weight: 600; color: #1d4ed8; background: #dbeafe; padding: 2px 10px; border-radius: 20px; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.skills-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
.skill-pill { background: #dbeafe; color: #1d4ed8; font-size: 11px; padding: 4px 12px; border-radius: 20px; font-weight: 500; }
.cert-pill { background: #dcfce7; color: #166534; font-size: 11px; padding: 4px 12px; border-radius: 20px; font-weight: 500; }
.note-bar { background: #dbeafe; padding: 8px 14px; border-radius: 6px; font-size: 10px; color: #1d4ed8; margin-top: 16px; }
@media print { .page { box-shadow: none !important; } }
</style></head><body>
<div class="page">
  <div class="header">
    <div class="g-name">${fullName}</div>
    <div class="g-role">${latestTitle}${location ? ` · ${location}` : ""}</div>
    <div class="g-contacts">
      ${personal.email ? `<span class="g-contact">✉ ${personal.email}</span>` : ""}
      ${personal.phone ? `<span class="g-contact">📱 ${personal.phone}</span>` : ""}
      ${location ? `<span class="g-contact">📍 ${location}</span>` : ""}
      ${personal.linkedin ? `<span class="g-contact">🔗 ${personal.linkedin}</span>` : ""}
    </div>
  </div>
  <div class="body">
    ${summary ? `<div class="section">
      <div class="sec-title">About Me</div>
      <div class="summary">${summary}</div>
    </div>` : ""}

    ${experience.length > 0 ? `<div class="section">
      <div class="sec-title">Work Experience</div>
      ${experience.map(exp => {
        const lines = exp.description ? exp.description.split("\\n").filter(l => l.trim()) : [];
        const bullets = lines.map(l => `<li>${l.trim()}</li>`).join("");
        const dateStr = [exp.startDate, exp.current ? "Present" : exp.endDate].filter(Boolean).join(" – ");
        return `<div class="exp-item">
          <div class="exp-row">
            <div><div class="exp-title">${exp.jobTitle || "Position"}</div>
            <div class="exp-company">${exp.company || "Company"}</div></div>
            <div class="exp-date">${dateStr}</div>
          </div>
          ${bullets ? `<ul class="exp-bullets">${bullets}</ul>` : ""}
        </div>`;
      }).join("")}
    </div>` : ""}

    ${education.length > 0 ? `<div class="section">
      <div class="sec-title">Education &amp; Qualifications</div>
      ${education.map(edu => `<div class="edu-item">
        <div class="edu-block">
          <div class="edu-qual">${edu.qualification || "Qualification"}</div>
          <div class="edu-inst">${edu.institution || "Institution"}${edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ""}</div>
          <div class="edu-meta">${edu.nqfLevel ? `NQF Level ${edu.nqfLevel}` : ""}</div>
        </div>
        ${edu.yearCompleted ? `<span class="edu-year">${edu.yearCompleted}</span>` : ""}
      </div>`).join("")}
    </div>` : ""}

    <div class="two-col">
      ${skills.length > 0 ? `<div class="section">
        <div class="sec-title">Skills</div>
        <div class="skills-wrap">${skills.map(s => `<span class="skill-pill">${s}</span>`).join("")}</div>
      </div>` : "<div></div>"}
      ${certifications.length > 0 ? `<div class="section">
        <div class="sec-title">Certifications</div>
        <div class="skills-wrap">${certifications.map(c => `<span class="cert-pill">${c}</span>`).join("")}</div>
      </div>` : "<div></div>"}
    </div>

    <div class="note-bar">⚡ AI-Revamped by CareerIntel SA · Print (Ctrl+P / Cmd+P) → Save as PDF</div>
  </div>
</div>
<script>window.onload = function(){ window.print(); }<\/script>
</body></html>`;
}

// ─── Template dispatcher ──────────────────────────────────────────────────────

export function generateCV(templateId: string, data: CVTemplateData): string {
  switch (templateId) {
    case "executive":  return generateExecutive(data);
    case "tech":       return generateTechFocus(data);
    case "graduate":   return generateGraduate(data);
    default:           return generateModernPro(data);
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

export function generateBuiltCV(data: CVBuiltData): string {
  const { personal, summary, experience, education, skills, certifications } = data;
  const fullName = personal.fullName.trim() || "Your Name";
  const parts = fullName.split(" ");
  const initials = parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : (parts[0]?.[0] ?? "Y").toUpperCase();
  const latestTitle = experience[0]?.jobTitle ?? "";
  const skillsToShow = skills.slice(0, 8);
  const PCTS = [90, 85, 80, 88, 75, 82, 78, 85];

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>CV — ${fullName}</title>
<style>
${PRINT_BASE}
body { font-family: 'Segoe UI', Arial, sans-serif; background: #f3f4f6; }
.page { display: grid; grid-template-columns: 240px 1fr; min-height: 297mm; max-width: 210mm; margin: 0 auto; background: white; box-shadow: 0 4px 40px rgba(0,0,0,0.15); }
.sidebar { background: #1e1b4b; padding: 36px 24px; color: #e0e7ff; }
.avatar-wrap { text-align: center; margin-bottom: 22px; }
.avatar { display: inline-flex; align-items: center; justify-content: center; width: 72px; height: 72px; border-radius: 50%; background: #6366f1; color: white; font-size: 24px; font-weight: 700; border: 3px solid rgba(165,180,252,0.4); }
.s-name { font-size: 16px; font-weight: 700; color: #fff; text-align: center; line-height: 1.3; margin-bottom: 4px; }
.s-role { font-size: 10.5px; color: #a5b4fc; text-align: center; margin-bottom: 26px; }
.s-heading { font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: #818cf8; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 5px; margin: 18px 0 10px; }
.contact-row { display: flex; align-items: flex-start; gap: 7px; font-size: 10.5px; color: #c7d2fe; margin-bottom: 7px; line-height: 1.4; word-break: break-all; }
.contact-icon { flex-shrink: 0; margin-top: 1px; }
.skill-item { margin-bottom: 9px; }
.skill-label { font-size: 10.5px; color: #e0e7ff; margin-bottom: 3px; }
.skill-track { background: rgba(255,255,255,0.12); height: 4px; border-radius: 2px; }
.skill-fill { background: linear-gradient(90deg,#818cf8,#a5b4fc); height: 4px; border-radius: 2px; }
.cert-item { font-size: 10.5px; color: #c7d2fe; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
.cert-item:last-child { border-bottom: none; }
.main { padding: 38px 34px; }
.main-header { border-bottom: 2.5px solid #6366f1; padding-bottom: 12px; margin-bottom: 24px; }
.main-name { font-size: 28px; font-weight: 700; color: #1e1b4b; letter-spacing: -0.5px; }
.main-role { font-size: 13px; color: #6366f1; font-weight: 500; margin-top: 2px; }
.section { margin-bottom: 22px; }
.section-title { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: #1e1b4b; border-left: 3px solid #6366f1; padding-left: 8px; margin-bottom: 10px; }
.summary-p { font-size: 11.5px; color: #374151; line-height: 1.75; }
.exp-block { margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid #f3f4f6; }
.exp-block:last-child { border-bottom: none; }
.exp-row { display: flex; justify-content: space-between; align-items: flex-start; }
.exp-title { font-size: 12.5px; font-weight: 600; color: #1e1b4b; }
.exp-company { font-size: 11px; color: #6366f1; margin-top: 1px; }
.exp-date { font-size: 10px; color: #9ca3af; background: #f3f4f6; padding: 2px 8px; border-radius: 20px; white-space: nowrap; margin-left: 8px; flex-shrink: 0; }
.exp-desc { font-size: 11px; color: #4b5563; margin-top: 6px; line-height: 1.65; padding-left: 14px; }
.exp-desc li { margin-bottom: 3px; }
.edu-block { margin-bottom: 12px; }
.edu-qual { font-size: 12.5px; font-weight: 600; color: #1e1b4b; }
.edu-inst { font-size: 11px; color: #6366f1; margin-top: 1px; }
.edu-meta { font-size: 10px; color: #9ca3af; margin-top: 2px; }
.skills-wrap { display: flex; flex-wrap: wrap; gap: 5px; }
.skill-tag { background: #ede9fe; color: #4338ca; font-size: 10.5px; padding: 4px 10px; border-radius: 20px; font-weight: 500; }
.cert-tag { background: #d1fae5; color: #065f46; font-size: 10.5px; padding: 4px 10px; border-radius: 20px; font-weight: 500; }
.footer-note { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 8px 12px; margin-top: 16px; font-size: 10px; color: #1d4ed8; }
@media print { .page { box-shadow: none !important; } }
</style></head><body>
<div class="page">
  <div class="sidebar">
    <div class="avatar-wrap"><div class="avatar">${initials}</div></div>
    <div class="s-name">${fullName}</div>
    ${latestTitle ? `<div class="s-role">${latestTitle}</div>` : ""}

    <div class="s-heading">Contact</div>
    ${personal.email ? `<div class="contact-row"><span class="contact-icon">✉</span>${personal.email}</div>` : ""}
    ${personal.phone ? `<div class="contact-row"><span class="contact-icon">📱</span>${personal.phone}</div>` : ""}
    ${personal.location ? `<div class="contact-row"><span class="contact-icon">📍</span>${personal.location}${personal.province ? `, ${personal.province}` : ""}</div>` : ""}
    ${personal.linkedin ? `<div class="contact-row"><span class="contact-icon">🔗</span>${personal.linkedin}</div>` : ""}
    ${personal.website ? `<div class="contact-row"><span class="contact-icon">🌐</span>${personal.website}</div>` : ""}

    ${skillsToShow.length > 0 ? `
    <div class="s-heading">Skills</div>
    ${skillsToShow.map((s, i) => `<div class="skill-item"><div class="skill-label">${s}</div><div class="skill-track"><div class="skill-fill" style="width:${PCTS[i % 8]}%"></div></div></div>`).join("")}` : ""}

    ${certifications.length > 0 ? `
    <div class="s-heading">Certifications</div>
    ${certifications.map(c => `<div class="cert-item">✓ ${c}</div>`).join("")}` : ""}
  </div>

  <div class="main">
    <div class="main-header">
      <div class="main-name">${fullName}</div>
      <div class="main-role">${latestTitle ? `${latestTitle} · ` : ""}${personal.province || "South Africa"}</div>
    </div>

    ${summary ? `
    <div class="section">
      <div class="section-title">Professional Summary</div>
      <p class="summary-p">${summary}</p>
    </div>` : ""}

    ${experience.length > 0 ? `
    <div class="section">
      <div class="section-title">Work Experience</div>
      ${experience.map(exp => {
        const lines = exp.description ? exp.description.split("\n").filter(l => l.trim()) : [];
        const bullets = lines.map(l => `<li>${l.trim()}</li>`).join("");
        return `<div class="exp-block">
        <div class="exp-row">
          <div>
            <div class="exp-title">${exp.jobTitle || "Position"}</div>
            <div class="exp-company">${exp.company || "Company"}</div>
          </div>
          <div class="exp-date">${exp.startDate ? exp.startDate : ""} ${(exp.startDate || exp.endDate || exp.current) ? "–" : ""} ${exp.current ? "Present" : (exp.endDate || "")}</div>
        </div>
        ${bullets ? `<ul class="exp-desc">${bullets}</ul>` : ""}
      </div>`;
      }).join("")}
    </div>` : ""}

    ${education.length > 0 ? `
    <div class="section">
      <div class="section-title">Education &amp; Qualifications</div>
      ${education.map(edu => `<div class="edu-block">
        <div class="edu-qual">${edu.qualification || "Qualification"}</div>
        <div class="edu-inst">${edu.institution || "Institution"}${edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ""}</div>
        <div class="edu-meta">${edu.nqfLevel ? `NQF Level ${edu.nqfLevel}` : ""}${edu.nqfLevel && edu.yearCompleted ? " · " : ""}${edu.yearCompleted || ""}</div>
      </div>`).join("")}
    </div>` : ""}

    ${skills.length > 0 ? `
    <div class="section">
      <div class="section-title">Skills &amp; Competencies</div>
      <div class="skills-wrap">${skills.map(s => `<span class="skill-tag">${s}</span>`).join("")}</div>
    </div>` : ""}

    ${certifications.length > 0 ? `
    <div class="section">
      <div class="section-title">Certifications &amp; Trade Papers</div>
      <div class="skills-wrap">${certifications.map(c => `<span class="cert-tag">${c}</span>`).join("")}</div>
    </div>` : ""}

    <div class="footer-note">📄 Generated by CareerIntel SA &mdash; Save as PDF via Ctrl+P / Cmd+P → &ldquo;Save as PDF&rdquo;</div>
  </div>
</div>
<script>window.onload = function(){ window.print(); }<\/script>
</body></html>`;
}

// ─── Revamped CV dispatcher (all 4 templates with real data) ─────────────────
// Used by the AI revamp flow where the user's actual data has been extracted.

export function generateRevampedCV(templateId: string, data: CVBuiltData): string {
  switch (templateId) {
    case "executive": return generateExecutiveFull(data);
    case "tech":      return generateTechFull(data);
    case "graduate":  return generateGraduateFull(data);
    default:          return generateBuiltCV(data);   // Modern Pro
  }
}
