/* ─────────────────────────────────────────────────────────────
   resumeExport.js — Word (.doc) + PDF (print-CSS) resume export
   PDF approach: opens a styled HTML page → browser prints to PDF
   Formatting mirrors New_Full_Stack_Resume_Bala.pdf exactly
───────────────────────────────────────────────────────────── */

/* ── shared blob download helper ─────────────────────────── */
function downloadBlob(content, type, filename) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/* ── Word (.doc) resume ───────────────────────────────────── */
export function downloadWordResume(portfolio) {
  const h1 = (t) => `<h1>${t}</h1>`;
  const h2 = (t) => `<h2>${t}</h2>`;
  const bold = (t) => `<strong>${t}</strong>`;
  const link = (url, label) => `<a href="${url}">${label}</a>`;
  const br = '<br>';

  /* Contact header */
  const header = `
    <div class="resume-header">
      ${h1(portfolio.name)}
      <p class="role">DevOps Engineer &nbsp;|&nbsp; Full Stack Developer &nbsp;|&nbsp; Backend Developer</p>
      <p class="contact">
        ${link(`mailto:${portfolio.email}`, portfolio.email)} &nbsp;·&nbsp;
        ${link(`tel:${portfolio.phone.replace(/\s/g, '')}`, portfolio.phone)} &nbsp;·&nbsp;
        ${link(portfolio.linkedin, 'LinkedIn')} &nbsp;·&nbsp;
        ${link(portfolio.github, 'GitHub')} &nbsp;·&nbsp;
        Hyderabad, Telangana, India
      </p>
    </div>
  `;

  /* Summary */
  const summary = `
    ${h2('PROFESSIONAL SUMMARY')}
    <p>DevOps Engineer, Full Stack Developer, and Backend Developer with experience across Kubernetes, cloud infrastructure (AWS &amp; Azure), CI/CD automation, Go microservices, Python APIs, observability, React, and data platforms. Currently at IMPAR Fintech Software Solutions.</p>
  `;

  /* Experience */
  const experience = `
    ${h2('PROFESSIONAL EXPERIENCE')}
    ${portfolio.experience.map((role) => `
      <p>${bold(role.title)}</p>
      <p class="company-meta">${role.company} &nbsp;|&nbsp; ${role.meta}</p>
      <ul>${role.points.map((pt) => `<li>${pt}</li>`).join('')}</ul>
      <p class="tech-label">Core tools: <span class="tech">${role.tech.join(' · ')}</span></p>
    `).join('')}
  `;

  /* Projects — links embedded inline */
  const projects = `
    ${h2('SELECTED PROJECTS')}
    ${portfolio.projects.map((p) => `
      <p>
        ${bold(p.title)}
        ${p.repo ? ` &nbsp; ${link(p.repo, 'View on GitHub ↗')}` : ''}
      </p>
      <p class="proj-desc">${p.description}</p>
      <p class="tech-label">Technologies: <span class="tech">${p.tech.join(' · ')}</span></p>
    `).join('')}
  `;

  /* Education */
  const education = `
    ${h2('EDUCATION')}
    <p>${bold('Bachelor of Technology in Computer Science and Engineering')}<br>
    Specialization in Artificial Intelligence<br>
    Prakasam Engineering College, Kandukur, India &nbsp;|&nbsp; Dec 2021 – Apr 2025<br>
    Cumulative Score: 70.35% &nbsp;|&nbsp; CGPA: 7.78</p>
  `;

  /* Certifications */
  const certifications = `
    ${h2('CERTIFICATIONS &amp; LEADERSHIP')}
    ${portfolio.achievements.map((a) => `<p>${bold(a.title)}<br>${a.text}</p>`).join('')}
  `;

  const css = `
    body { font-family: Arial, sans-serif; color: #1a1a2e; margin: 48px 52px; line-height: 1.45; font-size: 11pt; }
    .resume-header { border-bottom: 2px solid #143f8f; padding-bottom: 8px; margin-bottom: 12px; }
    .resume-header, .resume-header p, h1 { text-align: center; }
    p, li { text-align: justify; }
    h1 { font-size: 22pt; color: #143f8f; margin: 0 0 4px; letter-spacing: -0.02em; }
    h2 { font-size: 11pt; color: #143f8f; text-transform: uppercase; letter-spacing: 0.08em;
         border-bottom: 1.5px solid #c9d7ee; padding-bottom: 3px; margin: 22px 0 8px; }
    p { margin: 4px 0; font-size: 10.5pt; }
    ul { margin: 6px 0 8px 18px; padding: 0; }
    li { margin-bottom: 4px; font-size: 10pt; }
    a { color: #165db7; text-decoration: none; }
    .role { font-size: 10.5pt; font-weight: bold; color: #374151; margin: 2px 0 6px; }
    .contact { font-size: 9.5pt; color: #374151; margin-bottom: 6px; }
    .company-meta { font-size: 9.5pt; color: #555; font-style: italic; margin: 1px 0 5px; }
    .tech-label { font-size: 9pt; color: #555; margin: 4px 0 14px; }
    .tech { color: #165db7; }
    .proj-desc { font-size: 9.5pt; color: #444; margin: 2px 0 3px; }
  `;

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
    ${header}${summary}${experience}${projects}${education}${certifications}
  </body></html>`;

  downloadBlob(html, 'application/msword', 'Bala_Brahmareddy_Nagireddy_Resume.doc');
}

/* ── PDF resume via print-CSS ─────────────────────────────── */
export function downloadPdfResume(portfolio) {
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* Contact header */
  const header = `
    <div class="resume-header">
      <h1>${esc(portfolio.name)}</h1>
      <p class="role">DevOps Engineer &nbsp;|&nbsp; Full Stack Developer &nbsp;|&nbsp; Backend Developer</p>
      <p class="contact-line">
        <a href="mailto:${esc(portfolio.email)}">${esc(portfolio.email)}</a>
        &nbsp;·&nbsp;
        <a href="tel:${esc(portfolio.phone.replace(/\s/g, ''))}">${esc(portfolio.phone)}</a>
        &nbsp;·&nbsp;
        <a href="${esc(portfolio.linkedin)}">LinkedIn</a>
        &nbsp;·&nbsp;
        <a href="${esc(portfolio.github)}">GitHub</a>
        &nbsp;·&nbsp;
        Hyderabad, Telangana, India
      </p>
    </div>
  `;

  /* Summary */
  const summary = `
    <section>
      <h2>Professional Summary</h2>
      <p>DevOps Engineer, Full Stack Developer, and Backend Developer with hands-on experience in Kubernetes (K3s, AKS, EKS), cloud infrastructure (AWS &amp; Azure), CI/CD automation (Jenkins, ArgoCD, FluxCD), Go microservices, Python FastAPI, observability (Grafana, Prometheus, Loki), React, and data platforms (Databricks, PostgreSQL). Currently delivering backend and DevOps automation at IMPAR Fintech Software Solutions.</p>
    </section>
  `;

  /* Experience */
  const experience = `
    <section>
      <h2>Professional Experience</h2>
      ${portfolio.experience.map((role) => `
        <div class="exp-block">
          <div class="exp-header">
            <span class="exp-title">${esc(role.title)}</span>
            <span class="exp-date">${esc(role.meta)}</span>
          </div>
          <div class="exp-company">${esc(role.company)}</div>
          <ul>
            ${role.points.map((pt) => `<li>${esc(pt)}</li>`).join('')}
          </ul>
          <p class="tech-line"><strong>Core tools:</strong> ${esc(role.tech.join(' · '))}</p>
        </div>
      `).join('')}
    </section>
  `;

  /* Projects — with inline GitHub links */
  const projects = `
    <section>
      <h2>Selected Projects</h2>
      ${portfolio.projects.map((p) => `
        <div class="proj-block">
          <div class="proj-header">
            <span class="proj-title">${esc(p.title)}</span>
            ${p.repo ? `<a class="proj-link" href="${esc(p.repo)}">GitHub ↗</a>` : ''}
          </div>
          <p class="proj-desc">${esc(p.description)}</p>
          <p class="tech-line"><strong>Technologies:</strong> ${esc(p.tech.join(', '))}</p>
        </div>
      `).join('')}
    </section>
  `;

  /* Education */
  const education = `
    <section>
      <h2>Education</h2>
      <div class="exp-block">
        <div class="exp-header">
          <span class="exp-title">Bachelor of Technology — Computer Science &amp; Engineering</span>
          <span class="exp-date">Dec 2021 – Apr 2025</span>
        </div>
        <div class="exp-company">Specialization in Artificial Intelligence &nbsp;·&nbsp; Prakasam Engineering College, Kandukur, India</div>
        <p style="margin:4px 0 0;">Cumulative Score: <strong>70.35%</strong> &nbsp;|&nbsp; CGPA: <strong>7.78</strong></p>
      </div>
    </section>
  `;

  /* Certifications */
  const certifications = `
    <section>
      <h2>Certifications &amp; Achievements</h2>
      ${portfolio.achievements.map((a) => `
        <div class="cert-block">
          <strong>${esc(a.title)}</strong>
          <p>${esc(a.text)}</p>
        </div>
      `).join('')}
    </section>
  `;

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', Arial, sans-serif;
      font-size: 9.5pt;
      color: #1a1a2e;
      background: #fff;
      line-height: 1.5;
      padding: 0;
      margin: 0;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 16mm 18mm 14mm;
      background: #fff;
    }

    /* ── Text Alignment ─────── */
    p, li { text-align: justify; }

    /* ── Header ─────────────── */
    .resume-header { border-bottom: 2px solid #143f8f; padding-bottom: 8px; margin-bottom: 12px; text-align: center; }
    .resume-header p, .resume-header h1 { text-align: center; }

    h1 {
      font-size: 22pt;
      font-weight: 700;
      color: #143f8f;
      letter-spacing: -0.03em;
      margin-bottom: 2px;
    }

    .role {
      font-size: 10pt;
      font-weight: 600;
      color: #374151;
      margin-bottom: 4px;
    }

    .contact-line {
      font-size: 8.5pt;
      color: #555;
    }
    .contact-line a { color: #165db7; text-decoration: none; }

    /* ── Section headings ────── */
    h2 {
      font-size: 9.5pt;
      font-weight: 700;
      color: #143f8f;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      border-bottom: 1px solid #c9d7ee;
      padding-bottom: 2px;
      margin: 12px 0 7px;
    }

    /* ── Experience ──────────── */
    .exp-block { margin-bottom: 9px; }

    .exp-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 8px;
    }

    .exp-title {
      font-size: 9.5pt;
      font-weight: 700;
      color: #1a1a2e;
    }

    .exp-date {
      font-size: 8pt;
      color: #555;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .exp-company {
      font-size: 8.5pt;
      color: #165db7;
      font-style: italic;
      margin: 1px 0 4px;
    }

    ul {
      padding-left: 14px;
      margin: 3px 0 4px;
    }

    li {
      font-size: 9pt;
      color: #333;
      margin-bottom: 2px;
    }

    li::marker { color: #143f8f; }

    .tech-line {
      font-size: 8.5pt;
      color: #555;
      margin-top: 3px;
    }

    /* ── Projects ────────────── */
    .proj-block { margin-bottom: 8px; }

    .proj-header {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 2px;
    }

    .proj-title {
      font-size: 9.5pt;
      font-weight: 700;
      color: #1a1a2e;
    }

    .proj-link {
      font-size: 8pt;
      color: #165db7;
      text-decoration: none;
    }

    .proj-desc {
      font-size: 9pt;
      color: #444;
      margin-bottom: 2px;
    }

    /* ── Certifications ──────── */
    .cert-block {
      margin-bottom: 7px;
    }
    .cert-block strong {
      font-size: 9pt;
      color: #1a1a2e;
      display: block;
      margin-bottom: 1px;
    }
    .cert-block p {
      font-size: 8.5pt;
      color: #555;
      margin: 0;
    }

    /* ── Print rules ─────────── */
    @media print {
      body { background: #fff !important; }
      .page { padding: 10mm 14mm; width: 100%; box-shadow: none; }
      .no-print { display: none !important; }
      a { color: #165db7 !important; text-decoration: none !important; }
      @page { margin: 0; size: A4; }
    }

    /* ── Print button (screen only) ─────── */
    .print-bar {
      position: fixed;
      top: 0; left: 0; right: 0;
      background: #143f8f;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 10px 20px;
      font-family: 'Inter', Arial, sans-serif;
      font-size: 13px;
      z-index: 1000;
    }
    .print-bar button {
      background: #fff;
      color: #143f8f;
      border: none;
      border-radius: 6px;
      padding: 7px 20px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
    }
    .print-bar button:hover { background: #e8f0fe; }

    @media screen {
      body { background: #e9ecef; }
      .page { margin: 60px auto 40px; box-shadow: 0 4px 20px rgba(0,0,0,.18); }
    }
  `;

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Bala Brahmareddy Nagireddy — Resume</title>
  <style>${css}</style>
</head>
<body>
  <div class="print-bar no-print">
    <span>Your resume is ready — click Save as PDF in the print dialog</span>
    <button onclick="window.print()">⬇ Save as PDF</button>
    <button onclick="window.close()" style="background:#c8d9ff;">Close</button>
  </div>
  <div class="page">
    ${header}
    ${summary}
    ${experience}
    ${projects}
    ${education}
    ${certifications}
  </div>
</body>
</html>`;

  /* Open in new tab → user prints to PDF */
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    /* If popup blocked, fall back to direct download */
    downloadBlob(html, 'text/html', 'Bala_Resume.html');
  }
  /* Revoke after a generous delay */
  setTimeout(() => URL.revokeObjectURL(url), 120_000);
}
