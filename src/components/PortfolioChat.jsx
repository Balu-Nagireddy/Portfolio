import { useEffect, useRef, useState } from 'react';

const PROMPTS = [
  'What is his tech stack?',
  'What projects does he have on GitHub?',
  'What clouds does he use?',
  'What is his education?',
  'What certifications does he have?',
  'What is his contact info?',
  'Who is Bala?',
  'What is his AI experience?',
];

/* ─── helpers ─────────────────────────────────────────────── */

function isOutOfScope(q) {
  return /(search (google|bing|web)|browse|internet|news|weather|stock|translate|play music|tell me a joke|write code for|open url|access external|current time|today.s date)/i.test(q);
}

function tokens(str) {
  return str.toLowerCase().match(/[a-z0-9#+.-]+/g) || [];
}

function score(queryTokens, target) {
  const t = target.toLowerCase();
  return queryTokens.reduce((acc, tok) => acc + (t.includes(tok) ? 1 : 0), 0);
}

/* ─── answer engine ───────────────────────────────────────── */

function answerQuestion(rawQuestion, portfolio) {
  const q = rawQuestion.trim().toLowerCase();
  const qt = tokens(q);

  if (isOutOfScope(q)) {
    return "I can only answer through the portfolio details. I'm not able to access external resources or answer questions outside the portfolio.";
  }
  if (/(email|phone|number|contact|reach|call|mail|gmail)/i.test(q)) {
    return `You can reach Bala at:\n📧 ${portfolio.email}\n📞 ${portfolio.phone}\n🔗 LinkedIn: ${portfolio.linkedin}\n💻 GitHub: ${portfolio.github}`;
  }
  if (/(location|where|city|country|based|live|reside)/i.test(q)) {
    return `Bala is based in ${portfolio.location} and is available remotely.`;
  }
  if (/^who (is|are) (bala|he|this)/i.test(q) || /(who is bala|about bala|introduce)/i.test(q)) {
    return `${portfolio.name} is a ${portfolio.role}. ${portfolio.intro}`;
  }
  if (/(tech stack|technologies|technology|tools he use|what does he use|skills|programming language|language|framework)/i.test(q)) {
    const groups = portfolio.skills.map((g) => `• ${g.title}: ${g.items.join(', ')}`);
    return `Bala's full tech stack:\n\n${groups.join('\n')}`;
  }
  if (/(cloud|aws|azure|gcp|kubernetes|k8s|eks|aks|k3s|devops|infrastructure|terraform|helm|ci.?cd|pipeline|jenkins|argocd|fluxcd)/i.test(q)) {
    const devopsGroup = portfolio.skills.find((g) => /cloud|devops/i.test(g.title));
    const tools = devopsGroup ? devopsGroup.items.join(', ') : '';
    return `Bala has hands-on experience with the following cloud and DevOps tools:\n${tools}\n\nHe works on AWS (EKS, EC2, S3, IAM, ECR, CloudWatch) and Azure (AKS, ACR, Azure DevOps), provisions infrastructure with Terraform, and runs Kubernetes across K3s, AKS, and EKS clusters with Helm charts, ArgoCD/FluxCD GitOps, and Jenkins CI/CD pipelines.`;
  }
  if (/(github|repository|repositories|repo|git|project)/i.test(q)) {
    const lines = portfolio.projects.map((p) => {
      const link = p.repo ? ` → ${p.repo}` : ' (no public repo)';
      return `• ${p.title}${link}`;
    });
    return `Here are all of Bala's projects (with GitHub links where available):\n\n${lines.join('\n')}`;
  }
  if (/(experience|career|work|job|role|company|employer|impar|brainovision)/i.test(q)) {
    const roles = portfolio.experience.map((e) => `• ${e.title} at ${e.company} (${e.meta})`);
    return `Bala's career history:\n\n${roles.join('\n')}\n\nHe is currently a Software Engineer – Backend & DevOps Automation at IMPAR Fintech.`;
  }
  if (/(education|college|university|degree|b\.?tech|cgpa|percentage|study|academic|graduate)/i.test(q)) {
    return 'Bala completed a B.Tech in Computer Science and Engineering with a specialization in Artificial Intelligence at Prakasam Engineering College, Kandukur, India. He graduated in April 2025 with a cumulative score of 70.35% (CGPA 7.78).';
  }
  if (/(certificat|certification|achieve|award|ncet|ncc|training|course|udemy|b10x|outskill)/i.test(q)) {
    const certs = portfolio.achievements.map((a) => `• ${a.title}: ${a.text}`);
    return `Bala's certifications and achievements:\n\n${certs.join('\n\n')}`;
  }
  if (/(ai|artificial intelligence|machine learning|ml|openai|codex|chatgpt|claude|n8n|automation|llm)/i.test(q)) {
    return 'Bala specialises in AI-assisted engineering workflows. He has practical experience with OpenAI Codex, ChatGPT, Claude, and n8n for automation. He built a Sales Forecasting ML project and an AI-Powered Microservices Automation Platform using FastAPI, PostgreSQL, and generative AI integrations. He also holds AI engineering certifications through B10x and OutSkill.';
  }
  if (/(backend|back.end|api|rest|microservice|node|express|nestjs|fastapi|go|golang|java|python)/i.test(q)) {
    const be = portfolio.skills.find((g) => /backend/i.test(g.title));
    return `Bala's backend stack: ${be ? be.items.join(', ') : ''}.\n\nHe has built Go microservices for SEPA/SIC Instant payment orchestration, Python FastAPI services, Node.js/NestJS APIs, and Java REST endpoints.`;
  }
  if (/(frontend|front.end|react|next\.?js|javascript|typescript|html|css|ui|responsive)/i.test(q)) {
    const fe = portfolio.skills.find((g) => /frontend/i.test(g.title));
    return `Bala's frontend stack: ${fe ? fe.items.join(', ') : ''}.\n\nHe has built responsive React interfaces, TypeScript flows, and dynamic browser-side UX for enterprise portals.`;
  }
  if (/(database|data|postgres|mongodb|redis|mysql|sql|spark|databricks|dbt|kafka|grafana|prometheus|loki|observability|monitoring)/i.test(q)) {
    const data = portfolio.skills.find((g) => /data|observab/i.test(g.title));
    return `Bala's data and observability stack: ${data ? data.items.join(', ') : ''}.\n\nHe has designed PostgreSQL schemas, built Databricks ELT pipelines, and configured Grafana + Prometheus + Loki monitoring stacks.`;
  }
  if (/(availab|hire|freelance|open to|looking for|job|recruit|opportunit)/i.test(q)) {
    return `${portfolio.name} is currently open to full-time roles and meaningful collaborations. He is based in ${portfolio.location} and available remotely. You can reach him at ${portfolio.email} or ${portfolio.phone}.`;
  }

  if (qt.length > 0) {
    const candidates = [
      { key: 'intro',  text: portfolio.intro,           ans: portfolio.intro },
      { key: 'about',  text: portfolio.about.join(' '), ans: portfolio.about.join('\n\n') },
      ...portfolio.experience.map((e) => ({
        key: `exp-${e.title}`,
        text: `${e.title} ${e.company} ${e.points.join(' ')} ${e.tech.join(' ')}`,
        ans: `${e.title} at ${e.company} (${e.meta}):\n${e.points.map((p) => `• ${p}`).join('\n')}\nTools: ${e.tech.join(', ')}`,
      })),
      ...portfolio.projects.map((p) => ({
        key: `proj-${p.title}`,
        text: `${p.title} ${p.description} ${p.tech.join(' ')}`,
        ans: `${p.title}${p.repo ? ` (${p.repo})` : ''}: ${p.description}\nTech: ${p.tech.join(', ')}`,
      })),
      ...portfolio.achievements.map((a) => ({
        key: `ach-${a.title}`,
        text: `${a.title} ${a.text}`,
        ans: `${a.title}: ${a.text}`,
      })),
      ...portfolio.details.map(([label, val]) => ({
        key: `detail-${label}`,
        text: `${label} ${val}`,
        ans: `${label}: ${val}`,
      })),
    ];
    let best = null, bestScore = 0;
    for (const c of candidates) {
      const s = score(qt, c.text);
      if (s > bestScore) { bestScore = s; best = c; }
    }
    if (best && bestScore >= 1) return best.ans;
  }

  return "I couldn't find a proper match for this in the portfolio. Try asking about Bala's tech stack, cloud experience, projects, education, certifications, or contact information.";
}

/* ─── component ───────────────────────────────────────────── */

export default function PortfolioChat({ portfolio }) {
  const [open, setOpen]           = useState(false);
  const [question, setQuestion]   = useState('');
  const [hasAsked, setHasAsked]   = useState(false);      // hides prompts after first Q
  const [showTips, setShowTips]   = useState(false);      // suggestions tooltip
  const [messages, setMessages]   = useState([
    { from: 'bot', text: "Hi! Ask me anything about Bala's portfolio — tech stack, cloud experience, projects, education, contact info, and more." },
  ]);

  const messagesRef = useRef(null);
  const tipsRef     = useRef(null);

  /* auto-scroll to bottom on every new message */
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  /* close suggestions tooltip when clicking outside */
  useEffect(() => {
    if (!showTips) return;
    const handler = (e) => {
      if (tipsRef.current && !tipsRef.current.contains(e.target)) setShowTips(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showTips]);

  const ask = (value) => {
    const clean = value.trim();
    if (!clean) return;
    const answer = answerQuestion(clean, portfolio);
    setMessages((prev) => [...prev, { from: 'user', text: clean }, { from: 'bot', text: answer }]);
    setQuestion('');
    setHasAsked(true);
    setShowTips(false);
  };

  return (
    <aside className={open ? 'portfolio-chat is-open' : 'portfolio-chat'} aria-label="Portfolio assistant">
      <button className="chat-toggle" type="button" aria-expanded={open} onClick={() => setOpen((s) => !s)}>
        {open ? 'Close ✕' : '💬 Ask about Bala'}
      </button>

      {open && (
        <div className="chat-window">
          {/* ── header ── */}
          <header>
            <span>Portfolio assistant</span>
            <small>Answers from this portfolio</small>
          </header>

          {/* ── messages ── */}
          <div className="chat-messages" aria-live="polite" ref={messagesRef}>
            {messages.map((msg, i) => (
              <p
                className={msg.from}
                key={`${i}-${msg.from}`}
                style={{ whiteSpace: 'pre-wrap', textAlign: msg.from === 'bot' ? 'justify' : 'center' }}
              >
                {msg.text}
              </p>
            ))}
          </div>

          {/* ── bottom toolbar: suggestions button + form ── */}
          <div className="chat-footer">
            {/* suggestions pill — only show after first question */}
            {hasAsked && (
              <div className="chat-suggestions-wrap" ref={tipsRef}>
                <button
                  type="button"
                  className="chat-suggestions-btn"
                  onClick={() => setShowTips((v) => !v)}
                  aria-expanded={showTips}
                >
                  💡 Suggestions
                </button>

                {showTips && (
                  <div className="chat-suggestions-panel" role="menu">
                    {PROMPTS.map((prompt) => (
                      <button
                        type="button"
                        role="menuitem"
                        key={prompt}
                        onClick={() => ask(prompt)}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* initial prompt chips — visible before first question */}
            {!hasAsked && (
              <div className="chat-prompts">
                {PROMPTS.slice(0, 4).map((prompt) => (
                  <button type="button" onClick={() => ask(prompt)} key={prompt}>
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* input form */}
            <form onSubmit={(e) => { e.preventDefault(); ask(question); }}>
              <label className="sr-only" htmlFor="portfolio-question">Ask a question about Bala</label>
              <input
                id="portfolio-question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask anything about the portfolio…"
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
