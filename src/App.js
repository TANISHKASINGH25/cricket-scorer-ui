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
// LOADING MESSAGES
// =====================================================

const LOADING_MESSAGES = [
  "🏏 Tossing the coin...",
  "📊 Reading the pitch conditions...",
  "🔍 Scanning match records...",
  "🧠 Crunching the numbers...",
  "🎯 Analysing player form...",
  "📡 Fetching live stats...",
  "⚡ Running the query...",
  "🏟️ Checking the scorecard...",
  "🧮 Computing batting averages...",
  "🌐 Consulting the scorebook...",
];

const EXCEL_LOADING_MESSAGES = [
  "📂 Reading your Excel file...",
  "🧮 Parsing ball-by-ball data...",
  "🔍 Scanning innings records...",
  "📊 Building the data model...",
  "🏏 Crunching your stats...",
  "⚡ Running in-memory SQL...",
  "🎯 Extracting key insights...",
  "📈 Preparing your analysis...",
];

const GENERIC_LOADING_MESSAGES = [
  "📂 Reading your spreadsheet...",
  "🧠 Understanding your columns...",
  "🔍 Profiling the data...",
  "⚡ Running SQL on your file...",
  "📊 Building the analysis...",
  "🎯 Extracting key insights...",
  "📈 Preparing your answer...",
];

// =====================================================
// LOADING OVERLAY
// =====================================================

function LoadingOverlay({ darkMode, mode }) {
  let messages = LOADING_MESSAGES;
  if (mode === "nvplay") messages = EXCEL_LOADING_MESSAGES;
  if (mode === "generic") messages = GENERIC_LOADING_MESSAGES;

  const [msgIndex, setMsgIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setMsgIndex(prev => (prev + 1) % messages.length);
        setFade(true);
      }, 300);
    }, 2200);
    return () => clearInterval(interval);
  }, [messages]);

  const ballClass = mode === "nvplay" ? " excel-ball"
                   : mode === "generic" ? " generic-ball" : "";

  return (
    <div className="loading-overlay">
      <div className="cricket-ball-wrapper">
        <div className={`cricket-ball${ballClass}`}>
          <div className="seam seam-h" />
          <div className="seam seam-v" />
        </div>
        <div className="ball-shadow" />
      </div>
      <p className={`loading-msg ${fade ? "fade-in" : "fade-out"}`}>
        {messages[msgIndex]}
      </p>
      <div className="loading-dots">
        <span /><span /><span /><span /><span />
      </div>
    </div>
  );
}

// =====================================================
// QUICK ANSWER CARD (TL;DR)
// =====================================================

function QuickAnswerCard({ quickAnswer }) {
  if (!quickAnswer) return null;
  return (
    <div className="card quick-answer-card">
      <h3>⚡ Quick Answer</h3>
      <div className="quick-answer-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {quickAnswer}
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
      {open && (
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
      )}
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
  const nvFileInputRef      = useRef(null);
  const genericFileInputRef = useRef(null);

  const API_URL =
    process.env.REACT_APP_API_URL ||
    "https://cricket-scorer-api-zztcl7ejrq-uc.a.run.app";

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
    processFile(e.dataTransfer.files[0], "nvplay");
  };
  const handleGenericDrop = (e) => {
    e.preventDefault();
    processFile(e.dataTransfer.files[0], "generic");
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
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) askQuestion();
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
          <h1>Cricket_Scorer_Pro</h1>
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

          {/* SOURCE TOGGLE — THREE TABS */}
          <div className="source-toggle">
            <button
              className={`source-tab${mode === "db" ? " active" : ""}`}
              onClick={() => switchTo("db")}
            >
              🗄️ Database
            </button>
            <button
              className={`source-tab${mode === "nvplay" ? " active" : ""}`}
              onClick={() => switchTo("nvplay")}
            >
              🏏 NV-Play Excel/CSV
              {nvFile && <span className="tab-file-dot" />}
            </button>
            <button
              className={`source-tab${mode === "generic" ? " active" : ""}`}
              onClick={() => switchTo("generic")}
            >
              📊 Excel/CSV
              {genericFile && <span className="tab-file-dot generic-dot" />}
            </button>
          </div>

          {/* NV-PLAY FILE ZONE */}
          {mode === "nvplay" && (
            <div className="file-zone">
              {!nvFile ? (
                <div
                  className="file-dropzone"
                  onClick={() => nvFileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleNvDrop}
                >
                  <span className="dropzone-icon">📤</span>
                  <p className="dropzone-text">Click or drag &amp; drop your NV-Play file here</p>
                  <p className="dropzone-hint">Supports .xlsx, .xls, .csv &nbsp;·&nbsp; Max 20 MB</p>
                  <p className="dropzone-hint">Columns must match the nv_play table schema</p>
                </div>
              ) : (
                <div className="file-pill">
                  <span className="file-pill-icon">📄</span>
                  <span className="file-pill-name">{nvFile.name}</span>
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
                  className="file-dropzone generic-dropzone"
                  onClick={() => genericFileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleGenericDrop}
                >
                  <span className="dropzone-icon">📤</span>
                  <p className="dropzone-text">Click or drag &amp; drop any Excel/CSV file here</p>
                  <p className="dropzone-hint">Supports .xlsx, .xls, .csv &nbsp;·&nbsp; Max 20 MB</p>
                  <p className="dropzone-hint">Any schema — AI will adapt to your columns</p>
                </div>
              ) : (
                <div className="file-pill generic-pill">
                  <span className="file-pill-icon">📊</span>
                  <span className="file-pill-name">{genericFile.name}</span>
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
            <span className="textarea-hint">Ctrl + Enter to submit</span>
          </div>

          <button
            onClick={() => askQuestion()}
            disabled={inputDisabled || !question.trim()}
            className={loading ? "btn-loading" : ""}
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
        {loading && <LoadingOverlay darkMode={darkMode} mode={mode} />}

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

            {/* QUICK ANSWER — appears BEFORE chart */}
            <QuickAnswerCard quickAnswer={response.quick_answer} />

            <CollapsibleResults
              results={response.results}
              darkMode={darkMode}
              label={
                response._source === "nvplay"  ? "NV-Play File Results" :
                response._source === "generic" ? "File Results" :
                "Database Results"
              }
            />

            {response.chart_config && (
              <div className="card chart-card">
                <h3>📊 {response.chart_config.title || "Visual Analysis"}</h3>
                {response.chart_config.subtitle && (
                  <p className="chart-subtitle">{response.chart_config.subtitle}</p>
                )}
                <CricketChart chartConfig={response.chart_config} darkMode={darkMode} />
              </div>
            )}

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