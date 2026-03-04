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
      setTimeout(() => setCurrentQ(c => c + 1), 220);
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
    page: { minHeight:"100vh", background:"#f8fafc", color:"#1e293b", fontFamily:"'Segoe UI',system-ui,sans-serif", padding:"32px 24px" },
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
      <div style={{ maxWidth:520, margin:"0 auto" }}>
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
        <p style={{ textAlign:"center", fontSize:11, color:"#cbd5e1", marginTop:16 }}>
          Chau et al. (2025) | Taylor &amp; Francis Int'l Journal of Construction Management
        </p>
      </div>
    </div>
  );

  // ── SURVEY ─────────────────────────────────────────────────────────────────
  if (step === "survey") {
    const q = QUESTIONS[currentQ];
    const theme = THEMES.find(t => t.key === q.key);
    const allAnswered = Object.keys(answers).length === QUESTIONS.length;

    return (
      <div style={{ ...S.page, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
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

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", gap:8 }}>
              {currentQ > 0 && <button onClick={() => setCurrentQ(c=>c-1)} style={S.btnOutline}>Back</button>}
              {currentQ < QUESTIONS.length - 1 && <button onClick={() => setCurrentQ(c=>c+1)} style={S.btnOutline}>Skip</button>}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={reset} style={S.btnOutline}>Start Over</button>
              {allAnswered && <button onClick={handleSubmit} style={S.btn}>View Results</button>}
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

  // Parse recommendation into sections for clean display
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

        {/* Footer actions */}
        <div style={{ display:"flex", justifyContent:"center", gap:12, marginTop:8 }}>
          <button onClick={reset} style={{ ...S.btn, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:16 }}>↺</span> Start New Assessment
          </button>
        </div>

        <p style={{ textAlign:"center", fontSize:11, color:"#cbd5e1", marginTop:20 }}>
          Chau et al. (2025) · CAARA v1.0 · Int'l Journal of Construction Management
        </p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
