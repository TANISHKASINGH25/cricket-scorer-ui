import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";
import "./App.css";

// =====================================================
// CHART COLORS
// =====================================================

const CHART_COLORS = [
  "#ff4d4d", "#ff8c00", "#ffd700", "#00c8a0",
  "#4da6ff", "#b266ff", "#ff66b2", "#66ffcc",
];

// =====================================================
// SKELETON LOADER — refined, premium
// =====================================================

const LOADING_MESSAGES = {
  db: [
    { title: "Reading the pitch", sub: "Parsing your cricket question" },
    { title: "Consulting the scorebook", sub: "Building the query plan" },
    { title: "Running the analysis", sub: "Aggregating ball-by-ball data" },
    { title: "Crunching the numbers", sub: "Computing averages and rates" },
    { title: "Preparing insights", sub: "Turning data into a scorecard" },
  ],
  nvplay: [
    { title: "Loading your NV-Play file", sub: "Parsing ball-by-ball rows" },
    { title: "Profiling the columns", sub: "Understanding your data" },
    { title: "Running in-memory SQL", sub: "Executing the query plan" },
    { title: "Crunching your stats", sub: "Building the scorecard" },
    { title: "Preparing insights", sub: "Almost there" },
  ],
  generic: [
    { title: "Reading your spreadsheet", sub: "Parsing rows and columns" },
    { title: "Profiling the schema", sub: "Understanding your data shape" },
    { title: "Running the analysis", sub: "Executing SQL on your file" },
    { title: "Extracting patterns", sub: "Finding the key numbers" },
    { title: "Preparing insights", sub: "Almost there" },
  ],
};

function LoadingSkeleton({ mode }) {
  const messages = LOADING_MESSAGES[mode] || LOADING_MESSAGES.db;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx(prev => (prev + 1) % messages.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [messages]);

  const current = messages[idx];

  return (
    <div className="skeleton-loader">
      <div className="skeleton-status-row">
        <div className="skeleton-pulse-dot" />
        <div>
          <div className="skeleton-status">{current.title}</div>
          <div className="skeleton-status-sub">{current.sub}</div>
        </div>
      </div>

      <div className="skeleton-scorecard">
        <div className="skeleton-row skeleton-row-xl" />
        <div className="skeleton-row skeleton-row-lg" />
        <div className="skeleton-cells">
          <div className="skeleton-cell" />
          <div className="skeleton-cell" />
          <div className="skeleton-cell" />
          <div className="skeleton-cell" />
        </div>
        <div className="skeleton-row skeleton-row-md" />
        <div className="skeleton-row skeleton-row-sm" />
      </div>
    </div>
  );
}

// =====================================================
// QUICK ANSWER CARD (TL;DR)
// =====================================================

// =====================================================
// QUICK ANSWER CARD (TL;DR)
// =====================================================

function buildClientFallbackAnswer(response) {
  // Last-resort, client-side fallback if backend returns no quick_answer.
  // Builds a real data-driven sentence from the densest result set.
  try {
    const results = response?.results || [];
    let best = null;
    for (const r of results) {
      const rows = r?.results || [];
      if (!best || rows.length > (best.results?.length || 0)) best = r;
    }
    const rows = best?.results || [];
    if (rows.length === 0) {
      return "**No matching records were found** for your question. Try broadening the filters or rephrasing the question to use different metrics or entity names.";
    }
    const first = rows[0];
    const keys = Object.keys(first);
    const numericKeys = keys.filter(k => typeof first[k] === "number");
    const textKeys = keys.filter(k => typeof first[k] !== "number");
    const entityKey = textKeys[0];
    if (rows.length === 1 && numericKeys.length) {
      const parts = numericKeys.slice(0, 3).map(k => `**${k.replace(/_/g, " ")}** = **${first[k]}**`);
      const label = entityKey ? `For **${first[entityKey]}**, ` : "";
      return `${label}${parts.join(", ")}.`;
    }
    if (entityKey && numericKeys.length) {
      const metric = numericKeys[0];
      const top = rows[0], second = rows[1], third = rows[2];
      let text = `**${top[entityKey]}** leads with **${top[metric]} ${metric.replace(/_/g, " ")}**`;
      if (second) text += `, followed by **${second[entityKey]}** at **${second[metric]}**`;
      if (third) text += ` and **${third[entityKey]}** at **${third[metric]}**`;
      text += `. Total of **${rows.length} records** returned.`;
      return text;
    }
    return `Query returned **${rows.length} rows** with columns **${keys.slice(0, 6).join(", ")}**.`;
  } catch (e) {
    return "**Results were returned.** See the table below for full details.";
  }
}

function isVagueAnswer(text) {
  if (!text) return true;
  const t = text.toLowerCase();
  return (
    t.includes("detailed analysis is available") ||
    t.includes("see the data table") ||
    t.includes("see the full insight") ||
    t.trim().length < 20
  );
}

function QuickAnswerCard({ quickAnswer, response }) {
  // ALWAYS render — if backend gave nothing useful, build it client-side from results.
  const text = !isVagueAnswer(quickAnswer)
    ? quickAnswer
    : buildClientFallbackAnswer(response);
  return (
    <div className="card quick-answer-card">
      <h3>⚡ Quick Answer</h3>
      <div className="quick-answer-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {text}
        </ReactMarkdown>
      </div>
    </div>
  );
}

// =====================================================
// RELATED QUESTIONS (clickable chips)
// =====================================================

function RelatedQuestions({ questions, onAsk }) {
  if (!questions || questions.length === 0) return null;
  return (
    <div className="card related-card">
      <h3>🔗 Related Analyses</h3>
      <p className="related-hint">Click any question to run that analysis</p>
      <div className="related-chips">
        {questions.map((q, i) => (
          <button
            key={i}
            className="related-chip"
            onClick={() => onAsk(q)}
            title="Click to run this analysis"
          >
            <span className="related-chip-icon">▶</span>
            <span className="related-chip-text">{q}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// SCHEMA MISMATCH MODAL
// =====================================================

function SchemaMismatchModal({ info, onClose, onSwitchToGeneric }) {
  if (!info) return null;
  return (
    <div className="schema-modal-backdrop" onClick={onClose}>
      <div className="schema-modal" onClick={(e) => e.stopPropagation()}>
        <div className="schema-modal-header">
          <span className="schema-modal-icon">⚠️</span>
          <h3>Content type not match</h3>
          <button className="schema-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="schema-modal-body">
          <p className="schema-modal-lead">
            <strong>Use the Excel/CSV tab for the analysis.</strong>
          </p>
          <p className="schema-modal-sub">
            The file <strong>{info.fileName || "you uploaded"}</strong> doesn't look like an NV-Play
            ball-by-ball file. NV-Play files need at least{" "}
            <strong>{info.requiredCount}</strong> of the core cricket columns
            (found only <strong>{info.matchCount ?? 0}</strong>).
          </p>
          {info.missing && info.missing.length > 0 && (
            <div className="schema-modal-cols">
              <p className="schema-modal-col-label">Missing columns:</p>
              <div className="schema-chip-row">
                {info.missing.map((c) => (
                  <span key={c} className="schema-chip missing">{c}</span>
                ))}
              </div>
            </div>
          )}
          {info.matched && info.matched.length > 0 && (
            <div className="schema-modal-cols">
              <p className="schema-modal-col-label">Matched columns:</p>
              <div className="schema-chip-row">
                {info.matched.map((c) => (
                  <span key={c} className="schema-chip matched">{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="schema-modal-actions">
          <button className="schema-btn-primary" onClick={onSwitchToGeneric}>
            Switch to Excel/CSV tab
          </button>
          <button className="schema-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// COLLAPSIBLE DATABASE RESULTS
// =====================================================

function CollapsibleResults({ results, darkMode, label }) {
  const [open, setOpen] = useState(false);
  const totalRows = results?.reduce((acc, q) => acc + (q.results?.length || 0), 0) || 0;

  return (
    <div className="card result-card">
      <div
        className="collapsible-header"
        onClick={() => setOpen(o => !o)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === "Enter" && setOpen(o => !o)}
        aria-expanded={open}
      >
        <h3 style={{ margin: 0 }}>
          🗃️ {label || "Database Results"}
          <span className="result-badge">{totalRows} rows</span>
        </h3>
        <span className={`chevron ${open ? "open" : ""}`}>▾</span>
      </div>
      <div className={`collapsible-wrapper${open ? " open" : ""}`}>
        <div className="collapsible-inner">
          <div className="collapsible-body">
            {results?.map((q, i) => (
              <div key={i} className="query-result-block">
                <p className="query-result-label">
                  <strong>{q.query_name}</strong> — {q.purpose}
                </p>
                <pre>{JSON.stringify(q.results, null, 2)}</pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// SOURCE BADGE
// =====================================================

function SourceBadge({ source, fileName }) {
  if (source === "db") return null;
  const isGeneric = source === "generic";
  return (
    <div className={`source-badge ${isGeneric ? "generic-source" : "excel-source"}`}>
      <span className="source-icon">📂</span>
      <span>
        {isGeneric ? "Generic file" : "NV-Play file"}: <strong>{fileName}</strong>
      </span>
    </div>
  );
}

// =====================================================
// CUSTOM TOOLTIP
// =====================================================

const CustomTooltip = ({ active, payload, label, darkMode }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: darkMode ? "#1f1f1f" : "#fff",
        border: "1px solid #8b0000",
        borderRadius: "10px",
        padding: "10px 14px",
        fontSize: "13px",
        color: darkMode ? "white" : "black",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
      }}>
        <p style={{ margin: "0 0 6px 0", fontWeight: "bold", color: "#ff4d4d" }}>{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ margin: "2px 0", color: entry.color }}>
            {entry.name}: <strong>{entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// =====================================================
// CRICKET CHART
// =====================================================

function CricketChart({ chartConfig, darkMode }) {
  if (!chartConfig || !chartConfig.data || chartConfig.data.length === 0) return null;

  const { chart_type, x_key, y_keys, data } = chartConfig;
  const axisColor = darkMode ? "#aaaaaa" : "#555555";
  const gridColor = darkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";

  if (chart_type === "bar") {
    return (
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey={x_key} tick={{ fill: axisColor, fontSize: 12 }} angle={-35} textAnchor="end" interval={0} />
            <YAxis tick={{ fill: axisColor, fontSize: 12 }} />
            <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
            {y_keys.map((key, i) => (
              <Bar key={key} dataKey={key} name={key.replace(/_/g, " ")} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[6, 6, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chart_type === "line") {
    return (
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey={x_key} tick={{ fill: axisColor, fontSize: 12 }} angle={-35} textAnchor="end" interval={0} />
            <YAxis tick={{ fill: axisColor, fontSize: 12 }} />
            <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
            {y_keys.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} name={key.replace(/_/g, " ")} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chart_type === "radar") {
    return (
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={340}>
          <RadarChart data={data} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
            <PolarGrid stroke={gridColor} />
            <PolarAngleAxis dataKey={x_key} tick={{ fill: axisColor, fontSize: 12 }} />
            {y_keys.map((key, i) => (
              <Radar key={key} name={key.replace(/_/g, " ")} dataKey={key} stroke={CHART_COLORS[i % CHART_COLORS.length]} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.25} />
            ))}
            <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chart_type === "bar_colored") {
    return (
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey={x_key} tick={{ fill: axisColor, fontSize: 12 }} angle={-35} textAnchor="end" interval={0} />
            <YAxis tick={{ fill: axisColor, fontSize: 12 }} />
            <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
            <Bar dataKey={y_keys[0]} name={y_keys[0].replace(/_/g, " ")} radius={[6, 6, 0, 0]}>
              {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="chart-legend">
          {data.map((entry, i) => (
            <div key={i} className="chart-legend-item">
              <div className="chart-legend-dot" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
              <span>{entry[x_key]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (chart_type === "area") {
    return (
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
            <defs>
              {y_keys.map((key, i) => (
                <linearGradient key={key} id={`areaGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey={x_key} tick={{ fill: axisColor, fontSize: 12 }} angle={-35} textAnchor="end" interval={0} />
            <YAxis tick={{ fill: axisColor, fontSize: 12 }} />
            <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
            {y_keys.map((key, i) => (
              <Area key={key} type="monotone" dataKey={key} name={key.replace(/_/g, " ")} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2.5} fill={`url(#areaGrad${i})`} dot={{ r: 3 }} activeDot={{ r: 6 }} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chart_type === "pie") {
    const RADIAN = Math.PI / 180;
    const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
      if (percent < 0.04) return null;
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);
      return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="600">{`${(percent * 100).toFixed(1)}%`}</text>;
    };
    return (
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} dataKey={y_keys[0]} nameKey={x_key} cx="50%" cy="50%" outerRadius={120} innerRadius={50} paddingAngle={3} labelLine={false} label={renderLabel}>
              {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />)}
            </Pie>
            <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: darkMode ? "#1f1f1f" : "#fff", border: "1px solid #8b0000", borderRadius: 10, color: darkMode ? "white" : "black" }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="chart-legend" style={{ justifyContent: "center", marginTop: 8 }}>
          {data.map((entry, i) => (
            <div key={i} className="chart-legend-item">
              <div className="chart-legend-dot" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length], borderRadius: 3 }} />
              <span style={{ fontSize: 13 }}>{entry[x_key]} <strong style={{ marginLeft: 6, color: CHART_COLORS[i % CHART_COLORS.length] }}>({entry[y_keys[0]]})</strong></span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

// =====================================================
// STRIP "RELATED ANALYSES" FROM INSIGHT
// =====================================================
// Backend now returns related_questions as a separate field, so remove
// the duplicated section from the markdown insight before rendering.
function stripRelatedSection(insight) {
  if (!insight) return insight;
  // Remove any "Related Analyses" section header + the lines that follow it,
  // until the next "###" header, a horizontal rule, or end of string.
  return insight.replace(
    /(\*\*🔗\s*Related Analyses\*\*|###\s*🔗\s*Related Analyses)[\s\S]*?(?=(\n###\s|\n---|\n\*\*[^\n]+\*\*\n|$))/gi,
    ""
  ).trim();
}

// =====================================================
// MAIN APP
// =====================================================

function App() {
  const [question, setQuestion]   = useState("");
  const [response, setResponse]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [darkMode, setDarkMode]   = useState(true);

  // mode: "db" | "nvplay" | "generic"
  const [mode, setMode] = useState("db");

  // Separate file slots for the two file-based modes
  const [nvFile, setNvFile]           = useState(null); // { name, base64, ext }
  const [genericFile, setGenericFile] = useState(null);

  const [fileError, setFileError] = useState("");
  const [schemaMismatch, setSchemaMismatch] = useState(null); // {message, missing_columns, matched_columns}
  const [dragOverTarget, setDragOverTarget] = useState(null); // 'nvplay' | 'generic' | null
  const nvFileInputRef      = useRef(null);
  const genericFileInputRef = useRef(null);

  const API_URL =
    process.env.REACT_APP_API_URL ||
    "https://cricket-scorer-api-106171733624.europe-west2.run.app";

  // ── File handling ───────────────────────────────────
  const processFile = async (file, target) => {
    if (!file) return;
    setFileError("");

    const allowedExt = [".xlsx", ".xls", ".csv"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    if (!allowedExt.includes(ext)) {
      setFileError("Only .xlsx, .xls, or .csv files are supported.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setFileError("File too large. Maximum size is 20 MB.");
      return;
    }

    const base64 = await new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload  = () => res(reader.result.split(",")[1]);
      reader.onerror = () => rej(new Error("File read failed"));
      reader.readAsDataURL(file);
    });

    const payload = { name: file.name, base64, ext };
    if (target === "nvplay") {
      setNvFile(payload);
      setMode("nvplay");
    } else {
      setGenericFile(payload);
      setMode("generic");
    }
  };

  const handleNvFileChange = (e)      => processFile(e.target.files[0], "nvplay");
  const handleGenericFileChange = (e) => processFile(e.target.files[0], "generic");

  const handleNvDrop = (e) => {
    e.preventDefault();
    setDragOverTarget(null);
    processFile(e.dataTransfer.files[0], "nvplay");
  };
  const handleGenericDrop = (e) => {
    e.preventDefault();
    setDragOverTarget(null);
    processFile(e.dataTransfer.files[0], "generic");
  };
  const handleDragOver = (e, target) => {
    e.preventDefault();
    if (dragOverTarget !== target) setDragOverTarget(target);
  };
  const handleDragLeave = (e, target) => {
    // Only clear when actually leaving the dropzone (not children)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      if (dragOverTarget === target) setDragOverTarget(null);
    }
  };

  const removeNvFile = () => {
    setNvFile(null);
    setFileError("");
    if (nvFileInputRef.current) nvFileInputRef.current.value = "";
  };
  const removeGenericFile = () => {
    setGenericFile(null);
    setFileError("");
    if (genericFileInputRef.current) genericFileInputRef.current.value = "";
  };

  // ── Submit ──────────────────────────────────────────
  const askQuestion = async (overrideQ) => {
    const q = (overrideQ ?? question).trim();
    if (!q) return;

    if (overrideQ) setQuestion(overrideQ);

    setLoading(true);
    setResponse(null);

    try {
      let endpoint, body;

      if (mode === "nvplay" && nvFile) {
        endpoint = `${API_URL}/ask-excel`;
        body = JSON.stringify({
          question: q,
          file_base64: nvFile.base64,
          file_name:   nvFile.name,
          file_ext:    nvFile.ext,
        });
      } else if (mode === "generic" && genericFile) {
        endpoint = `${API_URL}/ask-generic-excel`;
        body = JSON.stringify({
          question: q,
          file_base64: genericFile.base64,
          file_name:   genericFile.name,
          file_ext:    genericFile.ext,
        });
      } else {
        endpoint = `${API_URL}/ask`;
        body = JSON.stringify({ question: q, session_context: [] });
      }

      const res  = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body });
      const data = await res.json();

      // ── NV-Play schema-mismatch handling ──
      if (data && data.schema_mismatch) {
        setSchemaMismatch({
          message: data.message || "Content type not match. Use the Excel/CSV tab for analysis.",
          matched: data.matched_columns || [],
          missing: data.missing_columns || [],
          expected: data.expected_columns || [],
          matchCount: data.match_count,
          requiredCount: data.required_count,
          fileName: nvFile?.name,
        });
        setResponse(null);
        setLoading(false);
        return;
      }

      const fileName = mode === "nvplay" ? nvFile?.name
                     : mode === "generic" ? genericFile?.name : undefined;

      setResponse({ ...data, _source: mode, _fileName: fileName });

      // Scroll the response into view smoothly after a tick
      setTimeout(() => {
        const el = document.querySelector(".response-section");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);

    } catch (err) {
      console.error(err);
      setResponse({ _error: "Failed to reach the server. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    // Enter alone submits; Shift+Enter inserts a newline.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  // Tab switching — block switching to file modes if file not loaded
  const switchTo = (target) => {
    setFileError("");
    if (target === "db") { setMode("db"); return; }
    if (target === "nvplay") {
      if (nvFile) setMode("nvplay");
      else nvFileInputRef.current?.click();
      return;
    }
    if (target === "generic") {
      if (genericFile) setMode("generic");
      else genericFileInputRef.current?.click();
      return;
    }
  };

  // Computed: is the input disabled?
  const inputDisabled = loading
    || (mode === "nvplay"  && !nvFile)
    || (mode === "generic" && !genericFile);

  // Placeholder
  let placeholder = "e.g. Who scored the most runs? Which team has the best win rate?";
  if (mode === "nvplay" && !nvFile)
    placeholder = "Upload an NV-Play file first, then ask your question...";
  if (mode === "generic" && !genericFile)
    placeholder = "Upload an Excel/CSV file first, then ask your question...";
  if (mode === "generic" && genericFile)
    placeholder = "Ask anything about your data: 'Top 5 by revenue', 'Trend by month', etc.";

  // Submit button label
  let submitLabel = "Ask AI ✦";
  if (loading) submitLabel = "Analysing…";
  else if (mode === "nvplay")  submitLabel = "Ask AI (NV-Play) ✦";
  else if (mode === "generic") submitLabel = "Ask AI (File) ✦";

  // ── Render ──────────────────────────────────────────
  return (
    <div className={darkMode ? "app dark" : "app light"}>

      {/* HEADER */}
      <div className="header">
        <div className="header-brand">
          <span className="header-icon">🏏</span>
          <h1>Cricket_Scorer<span className="brand-accent">_Pro</span></h1>
        </div>
        <button className="theme-btn" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      {/* MAIN */}
      <div className="chat-container">

        {/* INPUT SECTION */}
        <div className="input-section">
          <label className="input-label">Ask a cricket analytics question</label>

          {/* SOURCE TOGGLE — segmented control with sliding indicator */}
          <div
            className="source-toggle"
            data-active={mode === "db" ? 0 : mode === "nvplay" ? 1 : 2}
            role="tablist"
          >
            <div className="source-toggle-indicator" aria-hidden="true" />
            <button
              className={`source-tab${mode === "db" ? " active" : ""}`}
              onClick={() => switchTo("db")}
              role="tab"
              aria-selected={mode === "db"}
            >
              🗄️ Database
            </button>
            <button
              className={`source-tab${mode === "nvplay" ? " active" : ""}`}
              onClick={() => switchTo("nvplay")}
              role="tab"
              aria-selected={mode === "nvplay"}
            >
              🏏 NV-Play File
              {nvFile && <span className="tab-file-dot" />}
            </button>
            <button
              className={`source-tab${mode === "generic" ? " active" : ""}`}
              onClick={() => switchTo("generic")}
              role="tab"
              aria-selected={mode === "generic"}
            >
              📊 Excel / CSV
              {genericFile && <span className="tab-file-dot" />}
            </button>
          </div>

          {/* NV-PLAY FILE ZONE */}
          {mode === "nvplay" && (
            <div className="file-zone">
              {!nvFile ? (
                <div
                  className={`file-dropzone${dragOverTarget === "nvplay" ? " dragging" : ""}`}
                  onClick={() => nvFileInputRef.current?.click()}
                  onDragOver={(e) => handleDragOver(e, "nvplay")}
                  onDragLeave={(e) => handleDragLeave(e, "nvplay")}
                  onDrop={handleNvDrop}
                >
                  <span className="dropzone-icon">
                    {dragOverTarget === "nvplay" ? "📥" : "📤"}
                  </span>
                  <p className="dropzone-text">
                    {dragOverTarget === "nvplay"
                      ? "Drop to upload"
                      : "Click or drag your NV-Play file here"}
                  </p>
                  <p className="dropzone-hint">.xlsx · .xls · .csv &nbsp;·&nbsp; Max 20 MB</p>
                  <p className="dropzone-hint">Must match the nv_play ball-by-ball schema</p>
                </div>
              ) : (
                <div className="file-pill">
                  <span className="file-pill-icon">🏏</span>
                  <span className="file-pill-name">{nvFile.name}</span>
                  <span className="file-pill-meta">NV-Play</span>
                  <button className="file-pill-remove" onClick={removeNvFile} title="Remove file">✕</button>
                </div>
              )}
              {fileError && <p className="file-error">⚠️ {fileError}</p>}
            </div>
          )}

          {/* GENERIC FILE ZONE */}
          {mode === "generic" && (
            <div className="file-zone">
              {!genericFile ? (
                <div
                  className={`file-dropzone${dragOverTarget === "generic" ? " dragging" : ""}`}
                  onClick={() => genericFileInputRef.current?.click()}
                  onDragOver={(e) => handleDragOver(e, "generic")}
                  onDragLeave={(e) => handleDragLeave(e, "generic")}
                  onDrop={handleGenericDrop}
                >
                  <span className="dropzone-icon">
                    {dragOverTarget === "generic" ? "📥" : "📤"}
                  </span>
                  <p className="dropzone-text">
                    {dragOverTarget === "generic"
                      ? "Drop to upload"
                      : "Click or drag any Excel/CSV file here"}
                  </p>
                  <p className="dropzone-hint">.xlsx · .xls · .csv &nbsp;·&nbsp; Max 20 MB</p>
                  <p className="dropzone-hint">Any schema — AI adapts to your columns</p>
                </div>
              ) : (
                <div className="file-pill">
                  <span className="file-pill-icon">📊</span>
                  <span className="file-pill-name">{genericFile.name}</span>
                  <span className="file-pill-meta">Excel/CSV</span>
                  <button className="file-pill-remove" onClick={removeGenericFile} title="Remove file">✕</button>
                </div>
              )}
              {fileError && <p className="file-error">⚠️ {fileError}</p>}
            </div>
          )}

          {/* TEXTAREA */}
          <div className="textarea-wrapper">
            <textarea
              placeholder={placeholder}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={inputDisabled}
            />
            <span className="textarea-hint">Enter to submit · Shift+Enter for newline</span>
          </div>

          {/* Inline helper — explains disabled state clearly */}
          {inputDisabled && !loading && (
            <p className="input-helper">
              <span className="input-helper-icon">💡</span>
              {mode === "nvplay"
                ? "Upload an NV-Play ball-by-ball file above before asking a question."
                : mode === "generic"
                ? "Upload any Excel or CSV file above before asking a question."
                : "The input is currently unavailable."}
            </p>
          )}

          <button
            onClick={() => askQuestion()}
            disabled={inputDisabled || !question.trim()}
            className={`ask-btn${loading ? " btn-loading" : ""}`}
          >
            {submitLabel}
          </button>
        </div>

        {/* HIDDEN INPUTS */}
        <input
          ref={nvFileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: "none" }}
          onChange={handleNvFileChange}
        />
        <input
          ref={genericFileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: "none" }}
          onChange={handleGenericFileChange}
        />

        {/* LOADING */}
        {/* SCHEMA MISMATCH MODAL */}
        <SchemaMismatchModal
          info={schemaMismatch}
          onClose={() => setSchemaMismatch(null)}
          onSwitchToGeneric={() => {
            // Reuse the same file in the Generic tab
            if (nvFile) {
              setGenericFile(nvFile);
              setNvFile(null);
              if (nvFileInputRef.current) nvFileInputRef.current.value = "";
            }
            setMode("generic");
            setSchemaMismatch(null);
          }}
        />

        {loading && <LoadingSkeleton mode={mode} />}

        {/* ERROR */}
        {!loading && response?._error && (
          <div className="card error-card">
            <h3>⚠️ Error</h3>
            <p>{response._error}</p>
          </div>
        )}

        {/* RESPONSE */}
        {!loading && response && !response._error && (
          <div className="response-section">

            <SourceBadge source={response._source} fileName={response._fileName} />

            <div className="card question-card">
              <h3>Your Question</h3>
              <p>{response.question}</p>
              {response.intent_summary && (
                <p className="intent-summary">
                  <span className="intent-label">Analysis type:</span> {response.intent_summary}
                </p>
              )}
            </div>

            {/* QUICK ANSWER — appears BEFORE chart, ALWAYS rendered */}
            <QuickAnswerCard quickAnswer={response.quick_answer} response={response} />

            <CollapsibleResults
              results={response.results}
              darkMode={darkMode}
              label={
                response._source === "nvplay"  ? "NV-Play File Results" :
                response._source === "generic" ? "File Results" :
                "Database Results"
              }
            />

            {(() => {
              const cc = response.chart_config;
              if (!cc || !Array.isArray(cc.data) || cc.data.length === 0) return null;
              const yk = Array.isArray(cc.y_keys) ? cc.y_keys : (cc.y_keys ? [cc.y_keys] : []);
              if (!cc.x_key || yk.length === 0) return null;
              // Require at least one row with a real numeric value on any y_key
              const hasRealNumber = cc.data.some(row =>
                yk.some(k => typeof row[k] === "number" && !isNaN(row[k]))
              );
              if (!hasRealNumber) return null;
              return (
                <div className="card chart-card">
                  <h3>📊 {cc.title || "Visual Analysis"}</h3>
                  {cc.subtitle && <p className="chart-subtitle">{cc.subtitle}</p>}
                  <CricketChart chartConfig={cc} darkMode={darkMode} />
                </div>
              );
            })()}

            <div className="card insight-card">
              <h3>AI {response._source === "generic" ? "Data" : "Cricket"} Insight</h3>
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {stripRelatedSection(response.insight)}
                </ReactMarkdown>
              </div>
            </div>

            {/* CLICKABLE RELATED QUESTIONS */}
            <RelatedQuestions
              questions={response.related_questions}
              onAsk={(q) => askQuestion(q)}
            />

          </div>
        )}

      </div>
    </div>
  );
}

export default App;