import { useEffect, useMemo, useState } from 'react';
import { portfolio } from './data/portfolio.js';
import PortfolioChat from './components/PortfolioChat.jsx';
import { downloadPdfResume, downloadWordResume } from './utils/resumeExport.js';

function Arrow() {
  return <span aria-hidden="true" className="arrow">↗</span>;
}
function LinkedInIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" height="1.1em" width="1.1em"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>; }
function GitHubIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" height="1.2em" width="1.2em"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>; }
function EmailIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" height="1.2em" width="1.2em"><path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-5.141-5.929h21.035l-10.517 8.524-10.518-8.524zm5.727 6.643l5.067 4.106 5.067-4.106 4.624 5.713h-19.382l4.624-5.713zm8.397-2.897l4.394-3.56v9.273l-4.394-5.713z"/></svg>; }

function TagCloud({ items }) {
  return <div className="tag-cloud">{items.map((item) => <span className="tag" key={item}>{item}</span>)}</div>;
}

function SectionHeading({ eyebrow, title, copy }) {
  return <div className="section-heading reveal" data-reveal>
    <span className="section-kicker">{eyebrow}</span>
    <h2>{title}</h2>
    {copy && <p>{copy}</p>}
  </div>;
}

function RoleRotator() {
  const roles = portfolio.roles;
  const [roleIndex, setRoleIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) { setTyped(roles[roleIndex]); return undefined; }
    const activeRole = roles[roleIndex];
    const completed = typed === activeRole;
    const cleared = typed === '';
    const delay = completed && !deleting ? 1500 : deleting ? 38 : 74;
    const timer = window.setTimeout(() => {
      if (completed && !deleting) setDeleting(true);
      else if (deleting && cleared) { setDeleting(false); setRoleIndex((index) => (index + 1) % roles.length); }
      else setTyped((current) => deleting ? current.slice(0, -1) : activeRole.slice(0, current.length + 1));
    }, delay);
    return () => window.clearTimeout(timer);
  }, [typed, deleting, roleIndex]);
  return <p className="role-rotator" aria-label={`Roles include ${roles.join(', ')}`}><span className="typed-role">{typed}</span><span className="typing-cursor" aria-hidden="true" /></p>;
}

function ProjectCard({ project }) {
  return (
    <article className={`project-card project-enter surface-${project.surface}`}>
      <div className="project-art" aria-hidden="true">
        <span className="orb orb-one" /><span className="orb orb-two" /><span className="orbit orbit-one" /><span className="orbit orbit-two" />
        <span className="project-index">{project.type}</span>
      </div>
      <div className="project-copy">
        <div className="project-top"><span className="project-category">{project.badge}</span><span className="project-signal">Selected project</span></div>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <ul className="project-outcomes">{project.metrics.map((metric) => <li key={metric}>{metric}</li>)}</ul>
        <TagCloud items={project.tech} />
        {project.repo && <a className="text-link" href={project.repo} target="_blank" rel="noreferrer">Explore repository <Arrow /></a>}
      </div>
    </article>
  );
}

export default function App() {
  const [filter, setFilter] = useState('All');
  const [menuOpen, setMenuOpen] = useState(false);
  const [resumeMenuOpen, setResumeMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const filters = ['All work', 'Professional projects', 'Technical content'];
  const filteredProjects = useMemo(() => portfolio.projects.filter((project) => filter === 'All work' || project.category === filter), [filter]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')), { threshold: 0.14 });
    document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));
    
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, { threshold: 0.4 });
    
    document.querySelectorAll('section[id]').forEach((element) => sectionObserver.observe(element));

    return () => {
      observer.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <div className="container nav-shell">
        <a className="brand" href="#top" aria-label={`${portfolio.name} home`}><span className="brand-mark">BN</span><span>Portfolio</span></a>
        <button className="nav-toggle" type="button" aria-expanded={menuOpen} aria-controls="site-nav" onClick={() => setMenuOpen(!menuOpen)}><span /><span /><span className="sr-only">Menu</span></button>
        <nav className={menuOpen ? 'nav-menu is-open' : 'nav-menu'} id="site-nav" aria-label="Primary navigation">
          {['About', 'Skills', 'Experience', 'Projects', 'Contact'].map((item) => {
            const lower = item.toLowerCase();
            return <a onClick={closeMenu} href={`#${lower}`} key={item} className={activeSection === lower ? 'active' : ''}>{item}</a>
          })}
        </nav>
        <div className="nav-actions"><div className="resume-menu"><button type="button" className="resume-trigger" aria-haspopup="menu" aria-expanded={resumeMenuOpen} onClick={() => setResumeMenuOpen((open) => !open)}>Download resume</button>{resumeMenuOpen && <div className="resume-options" role="menu"><button type="button" role="menuitem" onClick={() => { downloadPdfResume(portfolio); setResumeMenuOpen(false); }}>Download PDF</button><button type="button" role="menuitem" onClick={() => { downloadWordResume(portfolio); setResumeMenuOpen(false); }}>Download Word</button></div>}</div><a className="nav-contact" href="#contact">Let&apos;s talk <Arrow /></a></div>
      </div>
    </header>
    <main id="main">
      <section className="hero" id="top">
        <div className="hero-grid-lines" aria-hidden="true" />
        <div className="falling-stars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
        <div className="container hero-layout">
          <div className="hero-copy reveal is-visible" data-reveal>
            <p className="intro-line"><span className="status-pulse" /> Available for thoughtful engineering work</p>
            <p className="hero-overline">Hello, I&apos;m</p>
            <h1>Bala Brahmareddy <em>Nagireddy</em></h1>
            <RoleRotator />
            <p className="hero-lead">I build calm, reliable systems where product experience, backend logic, and cloud delivery work as one.</p>
            <div className="hero-actions"><a className="button primary" href="#projects">See selected work <Arrow /></a><a className="button secondary" href="#contact">Start a conversation</a></div>
            <div className="social-row"><a href={portfolio.github} target="_blank" rel="noreferrer">GitHub</a><a href={portfolio.linkedin} target="_blank" rel="noreferrer">LinkedIn</a><a href={`mailto:${portfolio.email}`}>Email</a></div>
          </div>
          <div className="hero-portrait reveal is-visible" data-reveal>
            <div className="profile-halo" aria-hidden="true"><i /><i /><i /></div>
            <div className="portrait-frame"><img src={portfolio.image} alt={`Portrait of ${portfolio.name}`} /></div>
            <div className="portrait-note"><span>2.5+ years</span><small>platform, cloud, and AI-oriented engineering</small></div>
          </div>
        </div>
        <a className="scroll-cue" href="#about">Scroll to explore <span aria-hidden="true">↓</span></a>
      </section>

      <section className="section about-section" id="about"><div className="falling-stars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div><div className="container narrow">
        <SectionHeading eyebrow="01 / About" title="Engineering with the whole system in mind." />
        <div className="about-copy reveal" data-reveal>{portfolio.about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        <div className="stat-grid reveal" data-reveal>{portfolio.impact.map((item) => <article key={item.title}><strong>{item.title}</strong><span>{item.text}</span></article>)}</div>
      </div></section>

      <section className="section skills-section" id="skills"><div className="falling-stars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div><div className="container narrow"><SectionHeading eyebrow="02 / Expertise" title={<>Technical <em>skills</em>, connected.</>} copy="A working toolkit shaped around delivery—not a list of technologies in isolation." />
        <div className="competency-list">{portfolio.skills.map((group, index) => <article className="competency-card reveal" data-reveal key={group.title}><span className="competency-number">0{index + 1}</span><div><h3>{group.title}</h3><TagCloud items={group.items} /></div></article>)}</div>
      </div></section>

      <section className="section experience-section" id="experience"><div className="falling-stars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div><div className="container narrow"><SectionHeading eyebrow="03 / Career" title={<>Work <em>experience</em></>} />
        <div className="timeline">{portfolio.experience.map((item, index) => <article className="timeline-entry reveal" data-reveal key={item.title}><div className="timeline-marker"><span>{index === 0 ? 'Now' : 'Then'}</span></div><div className="timeline-card"><header><div><p className="company">{item.company}</p><h3>{item.title}</h3></div><p className="meta">{item.meta}</p></header><ul>{item.points.map((point) => <li key={point}>{point}</li>)}</ul><div className="experience-tools"><span>Core tools</span><TagCloud items={item.tech} /></div></div></article>)}</div>
      </div></section>

      <section className="section projects-section" id="projects"><div className="falling-stars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div><div className="container"><SectionHeading eyebrow="04 / Selected work" title={<>Things I&apos;ve <em>made</em> and improved.</>} copy="Professional and college projects across data, automation, AI, security, and full-stack development." />
        <div className="project-filters" role="group" aria-label="Filter projects">{filters.map((item) => <button type="button" key={item} onClick={() => setFilter(item)} className={filter === item ? 'selected' : ''} aria-pressed={filter === item}>{item}</button>)}</div>
        <div className="projects-grid">{filteredProjects.map((project) => <ProjectCard project={project} key={project.title} />)}</div>
      </div></section>

      <section className="section credentials-section"><div className="falling-stars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div><div className="container narrow"><SectionHeading eyebrow="05 / AI & foundation" title="Learning that supports the work." />
        <div className="credentials-grid">{[...portfolio.education, ...portfolio.achievements].map((item) => <article className="credential-card reveal" data-reveal key={item.title}><span className="credential-mark">+</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
      </div></section>

      <section className="academic-section"><div className="falling-stars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div><div className="container narrow"><div className="academic-panel reveal" data-reveal><div><span className="section-kicker">Academic perspective</span><h2>Foundation, initiative, and <em>follow-through.</em></h2></div><div className="academic-copy">{portfolio.academicStory.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<div className="academic-signals"><span>Artificial Intelligence</span><span>NCC leadership</span><span>Independent learning</span></div></div></div><div className="academic-grid">{portfolio.academicPillars.map((item) => <article className="academic-card reveal" data-reveal key={item.title}><span>{item.index}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></div></section>

      <section className="contact-section" id="contact"><div className="falling-stars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div><div className="container contact-layout"><div className="contact-copy reveal" data-reveal><span className="section-kicker">06 / Contact</span><h2>Let&apos;s build something that <em>holds up.</em></h2><p>Have a product, platform, or engineering problem worth solving? I&apos;m open to full-time roles and meaningful collaborations.</p></div><div className="contact-card reveal" data-reveal><div className="contact-email-row"><a className="contact-email" href={`mailto:${portfolio.email}`}>{portfolio.email}<Arrow /></a></div><div className="contact-actions"><a className="contact-phone" href={`tel:${portfolio.phone.replace(/\s/g, '')}`}>{portfolio.phone}</a><a className="button primary" href={`mailto:${portfolio.email}`}>Write an email <Arrow /></a></div><div className="contact-links"><a href={portfolio.linkedin} target="_blank" rel="noreferrer">LinkedIn</a><a href={portfolio.github} target="_blank" rel="noreferrer">GitHub</a><span>Available remotely</span></div></div></div></section>
    </main>
    <PortfolioChat portfolio={portfolio} />
    <footer>
      <div className="container footer-layout">
        <div className="footer-left">
          <a className="brand" href="#top"><span className="brand-mark">BN</span></a>
          <p className="footer-role">{portfolio.roles.join(' | ')}</p>
        </div>
        
        <nav className="footer-nav">
          {['About', 'Skills', 'Experience', 'Projects', 'Contact'].map((item) => (
            <a href={`#${item.toLowerCase()}`} key={item}>{item}</a>
          ))}
        </nav>
        
        <div className="footer-social">
          <a href={portfolio.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><LinkedInIcon /></a>
          <a href={portfolio.github} target="_blank" rel="noreferrer" aria-label="GitHub"><GitHubIcon /></a>
          <a href={`mailto:${portfolio.email}`} aria-label="Email"><EmailIcon /></a>
        </div>
      </div>
      
      <div className="footer-bottom container">
        <p>© {new Date().getFullYear()} Bala Brahmareddy Nagireddy. All rights reserved. | Built with ❤️</p>
        <a className="back-to-top" href="#top" aria-label="Back to top">↑</a>
      </div>
    </footer>
  </>;
}
