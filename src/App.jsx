import { useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

const THEMES = [
  { key: "reliability", label: "Reliability & Uncertainty Signaling", phase: 1, color: "#6366f1" },
  { key: "human",       label: "Human-Centered Automation",           phase: 1, color: "#7c3aed" },
  { key: "workflow",    label: "Workflow Integration",                 phase: 2, color: "#0284c7" },
  { key: "pricing",     label: "Market-Linked Pricing",               phase: 2, color: "#d97706" },
  { key: "coverage",    label: "Systems Coverage (MEP/Assemblies)",   phase: 3, color: "#059669" },
  { key: "document",    label: "Document & Scope Intelligence",       phase: 3, color: "#0891b2" },
];

const QUESTIONS = [
  { id:1,  key:"reliability", text:"My current AI takeoff tools produce accurate results on typical project drawings.",     reversed:false },
  { id:2,  key:"reliability", text:"My AI tools visibly flag areas of low confidence or uncertain output.",                 reversed:false },
  { id:3,  key:"reliability", text:"I spend significant time re-doing takeoffs manually to verify AI results.",             reversed:true  },
  { id:4,  key:"workflow",    text:"My AI tool connects seamlessly with pricing and project management software.",          reversed:false },
  { id:5,  key:"workflow",    text:"Manual data transfer steps between platforms slow down my estimation workflow.",        reversed:true  },
  { id:6,  key:"workflow",    text:"My current software stack handles cross-platform data exchange effectively.",           reversed:false },
  { id:7,  key:"coverage",    text:"My AI tools handle mechanical, electrical, and plumbing (MEP) takeoffs well.",         reversed:false },
  { id:8,  key:"coverage",    text:"My AI tools can interpret spatial relationships and assemblies from 2D drawings.",     reversed:false },
  { id:9,  key:"coverage",    text:"AI-assisted coverage extends across all major trade divisions in my workflow.",        reversed:false },
  { id:10, key:"pricing",     text:"Pricing data in my estimating tools is current and does not require constant updates.", reversed:false },
  { id:11, key:"pricing",     text:"My tools automatically link quantities to live or near-real-time market pricing.",     reversed:false },
  { id:12, key:"pricing",     text:"My tools provide historical cost benchmarking and trend visualization.",                reversed:false },
  { id:13, key:"document",    text:"My AI tools can parse and extract requirements from full specification documents.",     reversed:false },
  { id:14, key:"document",    text:"My tools can compare multiple subcontractor proposals against project scope.",         reversed:false },
  { id:15, key:"document",    text:"My tools proactively flag scope gaps or omissions during estimation.",                 reversed:false },
  { id:16, key:"human",       text:"My AI tool adapts to my firm's specific estimating standards and workflows.",          reversed:false },
  { id:17, key:"human",       text:"AI is positioned in my organization as an assistant to estimators, not a replacement.",reversed:false },
  { id:18, key:"human",       text:"AI tools in my firm are accessible across different experience levels.",               reversed:false },
];

const LABELS = ["Strongly Disagree","Disagree","Neutral","Agree","Strongly Agree"];
const PHASE_DESC = {
  1: "Foundation: Architectural takeoff with reliability signaling and human-centered automation",
  2: "Integration: Seamless platform connections and market-linked pricing",
  3: "Expansion: MEP/assemblies coverage and document/scope intelligence",
};

function scoreAnswers(answers) {
  const sums = {}, counts = {};
  THEMES.forEach(t => { sums[t.key] = 0; counts[t.key] = 0; });
  QUESTIONS.forEach(q => {
    if (answers[q.id] === undefined) return;
    let v = answers[q.id];
    if (q.reversed) v = 4 - v;
    sums[q.key] += v;
    counts[q.key]++;
  });
  const scores = {};
  THEMES.forEach(t => {
    scores[t.key] = counts[t.key] ? Math.round((sums[t.key] / (counts[t.key] * 4)) * 100) : 0;
  });
  return scores;
}

function getPriority(scores) {
  return [...THEMES].sort((a,b) => scores[a.key] - scores[b.key]);
}

function getScoreLabel(score) {
  if (score >= 75) return { label: "Strong", color: "#059669" };
  if (score >= 50) return { label: "Moderate", color: "#d97706" };
  return { label: "Needs Work", color: "#dc2626" };
}

// ── HEADER COMPONENT (ElectriAI branding, matches electriai.com) ──────────────
const NAV_LINKS = [
  { label: "Home",          url: "https://www.electriai.com/home" },
  { label: "Apps",          url: "https://www.electriai.com/apps", active: true },
  { label: "Teaching",      url: "https://www.electriai.com/teaching" },
  { label: "Bio",           url: "https://www.electriai.com/bio" },
  { label: "Publications",  url: "https://www.electriai.com/publications" },
  { label: "ElectriAI Lab", url: "https://www.electriai.com/electriai-lab" },
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
        }
        .electriai-nav {
          background: #0a1a3a;
          padding: 10px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: sans-serif;
          position: relative;
          z-index: 10;
        }
        .electriai-nav .logo {
          display: flex;
          align-items: center;
          text-decoration: none;
        }
        .electriai-nav .logo img {
          height: 36px;
          display: block;
        }
        .electriai-nav .nav-links {
          display: flex;
          gap: 30px;
          align-items: center;
        }
        .electriai-nav .nav-links a {
          color: #ffffff;
          font-size: 16px;
          text-decoration: none;
          font-weight: 400;
          transition: opacity 0.15s ease;
          letter-spacing: 0.2px;
        }
        .electriai-nav .nav-links a:hover {
          opacity: 0.75;
        }
        .electriai-nav .nav-links a.active {
          font-weight: 700;
        }
        .electriai-nav .menu-toggle {
          display: none;
          background: none;
          border: none;
          color: #ffffff;
          font-size: 24px;
          cursor: pointer;
          padding: 4px 8px;
          line-height: 1;
        }
        .electriai-mobile-menu {
          background: #0a1a3a;
          padding: 4px 20px 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          border-top: 1px solid rgba(255,255,255,0.08);
          font-family: sans-serif;
        }
        .electriai-mobile-menu a {
          color: #ffffff;
          font-size: 16px;
          text-decoration: none;
          font-weight: 400;
          padding: 8px 0;
        }
        .electriai-mobile-menu a.active {
          font-weight: 700;
        }
        @media (max-width: 820px) {
          .electriai-nav { padding: 8px 16px; }
          .electriai-nav .nav-links { display: none; }
          .electriai-nav .menu-toggle { display: block; }
          .electriai-nav .logo img { height: 30px; }
        }
        @media (min-width: 821px) {
          .electriai-mobile-menu { display: none; }
        }
      `}</style>

      <nav className="electriai-nav">
        <a href="https://www.electriai.com" className="logo">
          <img src="/logo.png" alt="ElectriAI" />
        </a>

        <div className="nav-links">
          {NAV_LINKS.map(link => (
            <a key={link.label} href={link.url} className={link.active ? "active" : ""}>
              {link.label}
            </a>
          ))}
        </div>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? "\u2715" : "\u2630"}
        </button>
      </nav>

      {menuOpen && (
        <div className="electriai-mobile-menu">
          {NAV_LINKS.map(link => (
            <a key={link.label} href={link.url} className={link.active ? "active" : ""}>
              {link.label}
            </a>
          ))}
        </div>
      )}
    </>
  );
}

// ── ABOUT THIS RESEARCH (bottom of intro page) ────────────────────────────────
const PAPER_TITLE = "AI Integration in Construction Cost Estimation: Workflow Frictions and Practitioner Priorities from Professional Estimators";
const DOI_URL = "https://doi.org/10.1080/15623599.2026.2669831";
const ABSTRACT_TEXT = "Cost estimation is a critical preconstruction function increasingly targeted for artificial intelligence (AI)-enabled improvement, yet empirical evidence on how professional estimators integrate these tools into daily practice remains limited. This exploratory qualitative study examines AI adoption in construction cost estimation through semi-structured interviews with 12 professional estimators from eight U.S.-based cost consultancies and general contractors, supplemented by a corroborating interview with a senior technology executive. Drawing on the Technology Acceptance Model (TAM) and Diffusion of Innovations (DOI) theory as complementary frameworks, the analysis operationalizes seven theoretical constructs at the coding level and identifies six practitioner-validated priority themes: reliability and uncertainty signaling, workflow integration, systems coverage for mechanical, electrical, and plumbing (MEP) assemblies, market-linked pricing, document and scope intelligence, and human-centered automation. The study introduces and formally defines the verification paradox, a previously unnamed mechanism in which estimators must re-perform manual takeoffs to validate AI outputs, neutralizing efficiency gains. The six themes are operationalized into the Construction AI Adoption Readiness Assessment (CAARA), an 18-item diagnostic instrument mapped to a three-phase implementation roadmap, presented as a conceptual framework pending psychometric validation. This study contributes practitioner-grounded empirical evidence and a structured diagnostic tool to support phased AI integration in professional estimation contexts.";

function AboutResearch() {
  const sectionHeadingStyle = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#0f172a",
    margin: "20px 0 8px",
    display: "block"
  };

  return (
    <div style={{
      background: "#ffffff",
      borderRadius: 12,
      padding: "24px 28px",
      marginTop: 24,
      marginBottom: 20,
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      border: "1px solid #e2e8f0",
      borderLeft: "4px solid #10b981"
    }}>
      <span style={{
        fontSize: 11, fontWeight: 700, letterSpacing: 2,
        textTransform: "uppercase", color: "#10b981",
        marginBottom: 10, display: "block"
      }}>About This Research</span>

      <h3 style={{
        fontSize: 15, fontWeight: 700, color: "#0f172a",
        margin: "0 0 6px", lineHeight: 1.45
      }}>
        {PAPER_TITLE}
      </h3>

      <p style={{
        fontSize: 12, color: "#475569", margin: "0 0 4px", lineHeight: 1.5
      }}>
        Anh D. Chau, Lufan Wang, and Michael Seni
      </p>

      <p style={{
        fontSize: 12, color: "#64748b", margin: 0,
        fontStyle: "italic", lineHeight: 1.5
      }}>
        <em>International Journal of Construction Management</em> · Published 13 May 2026
      </p>

      <span style={sectionHeadingStyle}>Abstract</span>
      <p style={{
        fontSize: 13, color: "#334155", lineHeight: 1.75,
        margin: 0, textAlign: "justify"
      }}>
        {ABSTRACT_TEXT}
      </p>

      <span style={sectionHeadingStyle}>Reference</span>
      <p style={{
        fontSize: 12.5, lineHeight: 1.7,
        margin: "0 0 16px",
        fontFamily: "Georgia, 'Times New Roman', serif",
        color: "#334155"
      }}>
        <a href={DOI_URL} target="_blank" rel="noopener noreferrer"
           style={{ color: "#334155", textDecoration: "none" }}
           onMouseEnter={e => e.currentTarget.style.color = "#6366f1"}
           onMouseLeave={e => e.currentTarget.style.color = "#334155"}>
          Chau, A. D., Wang, L., &amp; Seni, M. (2026). AI integration in construction cost estimation: Workflow frictions and practitioner priorities from professional estimators. <em>International Journal of Construction Management</em>. {DOI_URL}
        </a>
      </p>

      <a href={DOI_URL} target="_blank" rel="noopener noreferrer" style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "9px 18px",
        background: "#6366f1", color: "#ffffff",
        border: "1px solid #6366f1",
        borderRadius: 6, fontSize: 13, fontWeight: 600,
        textDecoration: "none"
      }}>
        View Full Paper →
      </a>
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState("intro");
  const [answers, setAnswers] = useState({});
  const [org, setOrg] = useState({ type: "", size: "" });
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  const progress = Math.round((Object.keys(answers).length / QUESTIONS.length) * 100);

  function reset() {
    setStep("intro");
    setAnswers({});
    setOrg({ type: "", size: "" });
    setRecommendation("");
    setLoading(false);
    setCurrentQ(0);
  }

  function handleAnswer(qId, val) {
    const updated = { ...answers, [qId]: val };
    setAnswers(updated);
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(c => c + 1);
    }
  }

  async function handleSubmit() {
    const scores = scoreAnswers(answers);
    const priority = getPriority(scores);
    setStep("results");
    setLoading(true);

    const scoreText = THEMES.map(t => `${t.label}: ${scores[t.key]}%`).join(", ");
    const weakest = priority.slice(0, 2).map(t => t.label).join(" and ");
    const strongest = priority.slice(-2).map(t => t.label).join(" and ");
    const startPhase = THEMES.find(t => t.key === priority[0].key)?.phase || 1;

    const prompt = `You are an expert advisor on AI adoption in construction cost estimation. A ${org.type || "construction"} firm (${org.size || "mid-size"}) completed a readiness assessment. Scores: ${scoreText}. Weakest: ${weakest}. Strongest: ${strongest}. Recommended starting phase: Phase ${startPhase}.

Write a practical implementation recommendation using this EXACT format, no preamble:

**Your Starting Point**
One sentence: which phase to start and why based on their weakest scores.

**Top 3 Immediate Actions**
- [Specific action for weakest area #1]
- [Specific action for weakest area #2]  
- [One quick win they can do this month]

**What to Avoid**
- [One common mistake given their profile]
- [One thing they should not invest in yet]

**6-Month Goal**
One sentence describing a concrete, measurable outcome they should aim for.

Keep every bullet under 20 words. Be direct. No fluff.`;

    try {
      const res = await fetch("https://caara-proxy.chauducanh.workers.dev/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setRecommendation(data.text || "Unable to generate recommendation.");
    } catch {
      setRecommendation("Unable to generate recommendation at this time.");
    }
    setLoading(false);
  }

  const S = {
    page: { minHeight:"100vh", background:"#f8fafc", color:"#1e293b", fontFamily:"sans-serif" },
    contentWrap: { padding:"32px 24px" },
    card: { background:"#ffffff", borderRadius:12, padding:"24px 28px", marginBottom:20, boxShadow:"0 1px 4px rgba(0,0,0,0.08)", border:"1px solid #e2e8f0" },
    label: { fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:"#94a3b8", marginBottom:8, display:"block" },
    h1: { margin:"0 0 6px", fontSize:26, fontWeight:800, color:"#0f172a", lineHeight:1.2 },
    subtitle: { fontSize:13, color:"#64748b" },
    btn: { padding:"13px 28px", background:"#6366f1", border:"none", borderRadius:8, color:"#fff", fontSize:15, fontWeight:600, cursor:"pointer" },
    btnOutline: { padding:"11px 22px", background:"#fff", border:"2px solid #e2e8f0", borderRadius:8, color:"#64748b", fontSize:13, fontWeight:600, cursor:"pointer" },
    select: { width:"100%", padding:"10px 12px", background:"#fff", border:"1px solid #e2e8f0", borderRadius:8, color:"#1e293b", fontSize:13 },
  };

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (step === "intro") return (
    <div style={S.page}>
      <Header />
      <div style={S.contentWrap}>
        <div style={{ maxWidth:560, margin:"0 auto" }}>
          <div style={{ ...S.card, borderTop:`4px solid #6366f1` }}>
            <span style={S.label}>Research Instrument</span>
            <h1 style={S.h1}>Construction AI Adoption<br/>Readiness Assessment</h1>
            <div style={{ ...S.subtitle, marginBottom:20 }}>CAARA v1.0</div>
            <p style={{ color:"#475569", lineHeight:1.75, margin:"0 0 16px", fontSize:14 }}>
              This 18-question instrument measures organizational readiness across six dimensions of AI integration in construction cost estimation, grounded in the Technology Acceptance Model and Diffusion of Innovations theory.
            </p>
            <p style={{ color:"#94a3b8", fontSize:12, margin:0 }}>Takes approximately 4 minutes. Responses are anonymous.</p>
          </div>

          <div style={{ ...S.card }}>
            <span style={S.label}>About Your Organization (Optional)</span>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <div style={{ fontSize:12, color:"#64748b", marginBottom:6 }}>Organization Type</div>
                <select style={S.select} onChange={e => setOrg(p => ({ ...p, type: e.target.value }))}>
                  <option value="">Select...</option>
                  <option>Cost Consultant</option>
                  <option>General Contractor (Commercial)</option>
                  <option>General Contractor (Heavy)</option>
                  <option>Specialty Contractor</option>
                  <option>Owner/Developer</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize:12, color:"#64748b", marginBottom:6 }}>Organization Size</div>
                <select style={S.select} onChange={e => setOrg(p => ({ ...p, size: e.target.value }))}>
                  <option value="">Select...</option>
                  <option>Small (&lt;25 employees)</option>
                  <option>Mid-size (25-200)</option>
                  <option>Large (&gt;200)</option>
                </select>
              </div>
            </div>
          </div>

          <button style={{ ...S.btn, width:"100%" }} onClick={() => setStep("survey")}>Begin Assessment</button>

          <AboutResearch />
        </div>
      </div>
    </div>
  );

  // ── SURVEY ─────────────────────────────────────────────────────────────────
  if (step === "survey") {
    const q = QUESTIONS[currentQ];
    const theme = THEMES.find(t => t.key === q.key);
    const allAnswered = Object.keys(answers).length === QUESTIONS.length;

    return (
      <div style={S.page}>
        <Header />
        <div style={{ ...S.contentWrap, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"calc(100vh - 80px)" }}>
          <div style={{ maxWidth:560, width:"100%" }}>
            <div style={{ marginBottom:28 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#94a3b8", marginBottom:8 }}>
                <span>Question {currentQ + 1} of {QUESTIONS.length}</span>
                <span>{progress}% complete</span>
              </div>
              <div style={{ height:5, background:"#e2e8f0", borderRadius:4 }}>
                <div style={{ height:"100%", width:`${progress}%`, background:`linear-gradient(90deg,#6366f1,#0284c7)`, borderRadius:4, transition:"width 0.3s" }} />
              </div>
            </div>

            <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:20, background:`${theme.color}15`, border:`1px solid ${theme.color}40`, marginBottom:16 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:theme.color }} />
              <span style={{ fontSize:11, fontWeight:700, color:theme.color, letterSpacing:1, textTransform:"uppercase" }}>{theme.label}</span>
            </div>

            <div style={{ ...S.card, borderLeft:`4px solid ${theme.color}` }}>
              <p style={{ fontSize:17, lineHeight:1.7, margin:0, color:"#1e293b" }}>{q.text}</p>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8, marginBottom:28 }}>
              {LABELS.map((lbl, i) => {
                const selected = answers[q.id] === i;
                return (
                  <button key={i} onClick={() => handleAnswer(q.id, i)}
                    style={{ padding:"12px 4px", background: selected ? theme.color : "#fff", border:`2px solid ${selected ? theme.color : "#e2e8f0"}`, borderRadius:8, color: selected ? "#fff" : "#64748b", fontSize:10, cursor:"pointer", textAlign:"center", lineHeight:1.4, fontWeight: selected ? 700 : 400, transition:"all 0.15s" }}>
                    {lbl}
                  </button>
                );
              })}
            </div>

            {allAnswered && (
              <div style={{ background:"#eef2ff", border:"2px solid #6366f1", borderRadius:10, padding:"14px 18px", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:13, color:"#4338ca", fontWeight:600 }}>All questions answered!</span>
                <button onClick={handleSubmit} style={{ ...S.btn, padding:"10px 22px" }}>View Results</button>
              </div>
            )}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", gap:8 }}>
                {currentQ > 0 && <button onClick={() => setCurrentQ(c=>c-1)} style={S.btnOutline}>Back</button>}
                {currentQ < QUESTIONS.length - 1 && <button onClick={() => setCurrentQ(c=>c+1)} style={S.btnOutline}>Skip</button>}
              </div>
              <button onClick={reset} style={S.btnOutline}>Start Over</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS ────────────────────────────────────────────────────────────────
  const scores = scoreAnswers(answers);
  const radarData = THEMES.map(t => ({ subject: t.label.replace(" (MEP/Assemblies)","").replace("Document & Scope Intelligence","Doc & Scope Intel"), score: scores[t.key] }));
  const priority = getPriority(scores);
  const startPhase = THEMES.find(t => t.key === priority[0].key)?.phase || 1;

  function renderRecommendation(text) {
    if (!text) return null;
    const lines = text.split("\n").filter(l => l.trim());
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
        return <div key={i} style={{ fontSize:12, fontWeight:700, color:"#0284c7", textTransform:"uppercase", letterSpacing:1, marginTop: i > 0 ? 16 : 0, marginBottom:6 }}>{trimmed.replace(/\*\*/g,"")}</div>;
      }
      if (trimmed.startsWith("- ")) {
        return <div key={i} style={{ display:"flex", gap:8, marginBottom:6 }}><span style={{ color:"#6366f1", fontWeight:700, marginTop:1 }}>›</span><span style={{ fontSize:13, color:"#334155", lineHeight:1.6 }}>{trimmed.slice(2)}</span></div>;
      }
      return <p key={i} style={{ fontSize:13, color:"#334155", lineHeight:1.65, margin:"0 0 8px" }}>{trimmed.replace(/\*\*/g,"")}</p>;
    });
  }

  return (
    <div style={S.page}>
      <Header />
      <div style={S.contentWrap}>
        <div style={{ maxWidth:700, margin:"0 auto" }}>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
            <div>
              <span style={S.label}>Assessment Complete</span>
              <h2 style={{ ...S.h1, fontSize:22 }}>Your AI Readiness Profile</h2>
              {org.type && <div style={{ fontSize:12, color:"#94a3b8", marginTop:4 }}>{org.type} {org.size ? `· ${org.size}` : ""}</div>}
            </div>
            <button onClick={reset} style={{ ...S.btnOutline, display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:16 }}>↺</span> New Assessment
            </button>
          </div>

          {/* Radar */}
          <div style={S.card}>
            <span style={S.label}>Readiness Radar</span>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} margin={{ top:10, right:40, bottom:10, left:40 }}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill:"#64748b", fontSize:10 }} />
                <PolarRadiusAxis angle={30} domain={[0,100]} tick={{ fill:"#94a3b8", fontSize:9 }} tickCount={4} />
                <Radar name="Readiness" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} dot={{ fill:"#6366f1", r:3 }} />
                <Tooltip formatter={v => [`${v}%`,"Score"]} contentStyle={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:8, fontSize:12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Score grid */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
            {THEMES.map(t => {
              const sl = getScoreLabel(scores[t.key]);
              return (
                <div key={t.key} style={{ ...S.card, marginBottom:0, borderLeft:`4px solid ${t.color}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <span style={{ fontSize:12, color:"#475569", lineHeight:1.4, flex:1 }}>{t.label}</span>
                    <span style={{ fontSize:20, fontWeight:800, color:t.color, marginLeft:8 }}>{scores[t.key]}%</span>
                  </div>
                  <div style={{ height:4, background:"#f1f5f9", borderRadius:4, marginBottom:8 }}>
                    <div style={{ height:"100%", width:`${scores[t.key]}%`, background:t.color, borderRadius:4 }} />
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:10, color:"#94a3b8" }}>Phase {t.phase}</span>
                    <span style={{ fontSize:10, fontWeight:700, color:sl.color }}>{sl.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Phase roadmap */}
          <div style={S.card}>
            <span style={S.label}>Recommended Implementation Phase</span>
            <div style={{ display:"flex", gap:10 }}>
              {[1,2,3].map(p => {
                const active = p === startPhase;
                return (
                  <div key={p} style={{ flex:1, padding:"14px", borderRadius:8, background: active ? "#eef2ff" : "#f8fafc", border:`2px solid ${active ? "#6366f1" : "#e2e8f0"}` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                      <div style={{ width:24, height:24, borderRadius:"50%", background: active ? "#6366f1" : "#e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color: active ? "#fff" : "#94a3b8" }}>{p}</div>
                      {active && <span style={{ fontSize:10, fontWeight:700, color:"#6366f1", textTransform:"uppercase", letterSpacing:1 }}>Start Here</span>}
                    </div>
                    <div style={{ fontSize:11, color: active ? "#334155" : "#94a3b8", lineHeight:1.5 }}>{PHASE_DESC[p]}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Recommendation */}
          <div style={{ ...S.card, borderTop:`3px solid #6366f1` }}>
            <span style={S.label}>AI-Generated Implementation Recommendation</span>
            {loading
              ? <div style={{ display:"flex", gap:10, alignItems:"center", color:"#94a3b8", fontSize:13, padding:"12px 0" }}>
                  <div style={{ width:16, height:16, border:"2px solid #6366f1", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
                  Generating your personalized recommendation...
                </div>
              : <div>{renderRecommendation(recommendation)}</div>
            }
          </div>

          {/* Footer */}
          <div style={{ display:"flex", justifyContent:"center", gap:12, marginTop:8 }}>
            <button onClick={reset} style={{ ...S.btn, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:16 }}>↺</span> Start New Assessment
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}