import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";
import "./App.css";

// =====================================================
// CONFIG
// ─────────────────────────────────────────────────────
// The main cricket application sets REACT_APP_USER_ID
// in the environment when launching this chatbot.
// This is the authenticated user's UUID from the main
// app's session — never created or managed here.
// =====================================================

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://cricket-scorer-api-zztcl7ejrq-uc.a.run.app";

// User identity passed from the main application.
// In production, the main app injects this via:
//   - URL param:    ?userId=<uuid>
//   - env var:      REACT_APP_USER_ID
//   - postMessage:  window.addEventListener('message', ...)
const USER_ID =
  new URLSearchParams(window.location.search).get("userId") ||
  process.env.REACT_APP_USER_ID ||
  "";

// =====================================================
// CHART COLORS
// =====================================================

const CHART_COLORS = [
  "#ff4d4d", "#ff8c00", "#ffd700", "#00c8a0",
  "#4da6ff", "#b266ff", "#ff66b2", "#66ffcc",
];

// =====================================================
// HELPERS
// =====================================================

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "X-User-Id": USER_ID,
  };
}

function formatTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)  return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
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
// CRICKET CHART COMPONENT  (unchanged from original)
// =====================================================

function CricketChart({ chartConfig, darkMode }) {
  if (!chartConfig || !chartConfig.data || chartConfig.data.length === 0) return null;

  const { chart_type, title, x_key, y_keys, data } = chartConfig;
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
              <Bar key={key} dataKey={key} name={key.replace(/_/g, " ")}
                fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[6, 6, 0, 0]} />
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
              <Line key={key} type="monotone" dataKey={key} name={key.replace(/_/g, " ")}
                stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2.5}
                dot={{ r: 4, fill: CHART_COLORS[i % CHART_COLORS.length] }} activeDot={{ r: 6 }} />
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
              <Radar key={key} name={key.replace(/_/g, " ")} dataKey={key}
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.25} />
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
              {data.map((_, i) => (
                <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
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
              <Area key={key} type="monotone" dataKey={key} name={key.replace(/_/g, " ")}
                stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2.5}
                fill={`url(#areaGrad${i})`}
                dot={{ r: 3, fill: CHART_COLORS[i % CHART_COLORS.length] }} activeDot={{ r: 6 }} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chart_type === "pie") {
    const RADIAN = Math.PI / 180;
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
      if (percent < 0.04) return null;
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);
      return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="600">
          {`${(percent * 100).toFixed(1)}%`}
        </text>
      );
    };
    return (
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} dataKey={y_keys[0]} nameKey={x_key}
              cx="50%" cy="50%" outerRadius={120} innerRadius={50}
              paddingAngle={3} labelLine={false} label={renderCustomLabel}>
              {data.map((_, i) => (
                <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [value, name]} contentStyle={{
              background: darkMode ? "#1f1f1f" : "#fff",
              border: "1px solid #8b0000", borderRadius: 10, color: darkMode ? "white" : "black"
            }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="chart-legend" style={{ justifyContent: "center", marginTop: 8 }}>
          {data.map((entry, i) => (
            <div key={i} className="chart-legend-item">
              <div className="chart-legend-dot"
                style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length], borderRadius: 3 }} />
              <span style={{ fontSize: 13 }}>
                {entry[x_key]}
                <strong style={{ marginLeft: 6, color: CHART_COLORS[i % CHART_COLORS.length] }}>
                  ({entry[y_keys[0]]})
                </strong>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

// =====================================================
// MESSAGE BUBBLE
// Renders a single Q&A exchange in the chat thread
// =====================================================

function MessageBubble({ message, darkMode, isStreaming }) {
  const [sqlExpanded, setSqlExpanded] = useState(false);
  const [resultsExpanded, setResultsExpanded] = useState(false);

  return (
    <div className="message-group">

      {/* USER QUESTION */}
      <div className="user-bubble-row">
        <div className={`user-bubble ${darkMode ? "dark" : "light"}`}>
          <span className="user-bubble-icon">🏏</span>
          <p>{message.question}</p>
        </div>
      </div>

      {/* AI RESPONSE */}
      {isStreaming ? (
        <div className="ai-bubble-row">
          <div className={`ai-bubble thinking ${darkMode ? "dark" : "light"}`}>
            <div className="thinking-dots">
              <span /><span /><span />
            </div>
            <span style={{ marginLeft: 10, opacity: 0.7, fontSize: 13 }}>
              Analysing cricket data...
            </span>
          </div>
        </div>
      ) : (
        <div className="ai-bubble-row">
          <div className={`ai-bubble ${darkMode ? "dark" : "light"}`}>

            {/* COLLAPSIBLE SQL */}
            {message.sql_queries && message.sql_queries.length > 0 && (
              <div className="collapsible-section">
                <button
                  className="collapsible-toggle"
                  onClick={() => setSqlExpanded(!sqlExpanded)}
                >
                  <span>🔍 Generated SQL ({message.sql_queries.length} {message.sql_queries.length === 1 ? "query" : "queries"})</span>
                  <span className="toggle-icon">{sqlExpanded ? "▲" : "▼"}</span>
                </button>
                {sqlExpanded && (
                  <pre className="sql-pre">
                    {Array.isArray(message.sql_queries)
                      ? message.sql_queries.join("\n\n---\n\n")
                      : message.sql_queries}
                  </pre>
                )}
              </div>
            )}

            {/* COLLAPSIBLE RAW RESULTS */}
            {message.results && message.results.length > 0 && (
              <div className="collapsible-section">
                <button
                  className="collapsible-toggle"
                  onClick={() => setResultsExpanded(!resultsExpanded)}
                >
                  <span>📦 Raw Data ({message.results.length} result set{message.results.length > 1 ? "s" : ""})</span>
                  <span className="toggle-icon">{resultsExpanded ? "▲" : "▼"}</span>
                </button>
                {resultsExpanded && (
                  <pre className="results-pre">
                    {JSON.stringify(message.results, null, 2)}
                  </pre>
                )}
              </div>
            )}

            {/* CHART */}
            {message.chart_config && (
              <div className="inline-chart">
                <div className="inline-chart-title">
                  📊 {message.chart_config.title || "Visual Analysis"}
                </div>
                {message.chart_config.subtitle && (
                  <p className="chart-subtitle">{message.chart_config.subtitle}</p>
                )}
                <CricketChart chartConfig={message.chart_config} darkMode={darkMode} />
              </div>
            )}

            {/* MAIN INSIGHT */}
            {message.answer || message.insight ? (
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.answer || message.insight}
                </ReactMarkdown>
              </div>
            ) : null}

            {/* TIMESTAMP */}
            {message.created_at && (
              <div className="message-time">{formatTime(message.created_at)}</div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// SIDEBAR
// =====================================================

function Sidebar({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  darkMode,
  isOpen,
  onClose,
  loadingConversations,
}) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleDelete = (e, convId) => {
    e.stopPropagation();
    if (deleteConfirm === convId) {
      onDeleteConversation(convId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(convId);
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${darkMode ? "dark" : "light"} ${isOpen ? "open" : ""}`}>

        {/* Sidebar header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="sidebar-logo-icon">🏏</span>
            <span className="sidebar-logo-text">Cricket AI</span>
          </div>
          <button className="sidebar-close-btn" onClick={onClose} title="Close sidebar">✕</button>
        </div>

        {/* New Chat button */}
        <button className="new-chat-btn" onClick={onNewChat}>
          <span className="new-chat-icon">＋</span>
          New Chat
        </button>

        {/* Conversation list */}
        <div className="conv-list-label">Recent Conversations</div>

        <div className="conv-list">
          {loadingConversations ? (
            <div className="conv-list-loading">
              <div className="loading-spinner-small" />
              <span>Loading chats...</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="conv-list-empty">
              <p>No conversations yet.</p>
              <p>Start a new chat to begin!</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.conversation_id}
                className={`conv-item ${activeConversationId === conv.conversation_id ? "active" : ""} ${darkMode ? "dark" : "light"}`}
                onClick={() => onSelectConversation(conv.conversation_id)}
              >
                <div className="conv-item-body">
                  <div className="conv-item-title" title={conv.title}>
                    {conv.title}
                  </div>
                  <div className="conv-item-time">
                    {formatTime(conv.updated_at)}
                  </div>
                </div>
                <button
                  className={`conv-delete-btn ${deleteConfirm === conv.conversation_id ? "confirm" : ""}`}
                  onClick={(e) => handleDelete(e, conv.conversation_id)}
                  title={deleteConfirm === conv.conversation_id ? "Click again to confirm" : "Delete"}
                >
                  {deleteConfirm === conv.conversation_id ? "✓?" : "🗑"}
                </button>
              </div>
            ))
          )}
        </div>

      </aside>
    </>
  );
}

// =====================================================
// EMPTY STATE
// =====================================================

function EmptyState({ onNewChat }) {
  const suggestions = [
    "Who scored the most runs in IPL 2024?",
    "Compare Virat Kohli vs Rohit Sharma in T20s",
    "Top wicket-takers this season",
    "Jasprit Bumrah's powerplay economy rate",
  ];

  return (
    <div className="empty-state">
      <div className="empty-state-icon">🏏</div>
      <h2 className="empty-state-title">Cricket_Scorer_AI</h2>
      <p className="empty-state-subtitle">
        Ask any cricket analytics question. Get AI-powered insights backed by real ball-by-ball data.
      </p>
      <div className="suggestion-grid">
        {suggestions.map((s, i) => (
          <button key={i} className="suggestion-chip" onClick={() => onNewChat(s)}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// MAIN APP
// =====================================================

function App() {

  // ── Theme ───────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(true);

  // ── Sidebar ─────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Conversations (sidebar list) ────────────────────
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);

  // ── Active conversation ──────────────────────────────
  const [activeConversationId, setActiveConversationId] = useState(null);

  // ── Messages in current conversation ────────────────
  // Each item: { question, sql_queries, results, chart_config, answer|insight, created_at }
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // ── Input ────────────────────────────────────────────
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);   // true while /ask is in-flight

  // ── Refs ─────────────────────────────────────────────
  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);

  // ── Auth guard ───────────────────────────────────────
  const isAuthed = Boolean(USER_ID);

  // ─────────────────────────────────────────────────────
  // SCROLL TO BOTTOM on new messages
  // ─────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ─────────────────────────────────────────────────────
  // LOAD CONVERSATIONS on mount
  // ─────────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    if (!isAuthed) return;
    setLoadingConversations(true);
    try {
      const res = await fetch(`${API_URL}/conversations`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  }, [isAuthed]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ─────────────────────────────────────────────────────
  // LOAD MESSAGES for selected conversation
  // ─────────────────────────────────────────────────────
  const loadMessages = useCallback(async (convId) => {
    if (!convId || !isAuthed) return;
    setLoadingMessages(true);
    setMessages([]);
    try {
      const res = await fetch(`${API_URL}/conversations/${convId}/messages`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.messages) {
        // Map DB message shape to local message shape
        setMessages(data.messages.map((m) => ({
          question:    m.question,
          sql_queries: m.generated_sql ? [m.generated_sql] : [],
          results:     m.sql_result || [],
          chart_config: null,   // not stored in DB — re-rendered fresh
          answer:      m.answer,
          created_at:  m.created_at,
        })));
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, [isAuthed]);

  // ─────────────────────────────────────────────────────
  // NEW CHAT
  // Creates conversation on backend, sets it as active
  // ─────────────────────────────────────────────────────
  const handleNewChat = async (prefillQuestion = "") => {
    if (!isAuthed) return;
    try {
      const res = await fetch(`${API_URL}/conversations`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ title: "New Chat" }),
      });
      const conv = await res.json();
      if (conv.conversation_id) {
        // Prepend to sidebar list
        setConversations((prev) => [conv, ...prev]);
        setActiveConversationId(conv.conversation_id);
        setMessages([]);
        // Optionally pre-fill the input
        if (prefillQuestion) {
          setQuestion(prefillQuestion);
          setTimeout(() => textareaRef.current?.focus(), 100);
        } else {
          textareaRef.current?.focus();
        }
      }
    } catch (err) {
      console.error("Failed to create conversation:", err);
    }
  };

  // ─────────────────────────────────────────────────────
  // SELECT CONVERSATION
  // ─────────────────────────────────────────────────────
  const handleSelectConversation = async (convId) => {
    if (convId === activeConversationId) return;
    setActiveConversationId(convId);
    await loadMessages(convId);
    // Close sidebar on mobile
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  // ─────────────────────────────────────────────────────
  // DELETE CONVERSATION
  // ─────────────────────────────────────────────────────
  const handleDeleteConversation = async (convId) => {
    if (!isAuthed) return;
    try {
      await fetch(`${API_URL}/conversations/${convId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      setConversations((prev) => prev.filter((c) => c.conversation_id !== convId));
      if (activeConversationId === convId) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  // ─────────────────────────────────────────────────────
  // ASK QUESTION
  // Core chat flow — calls /ask, saves to message thread
  // ─────────────────────────────────────────────────────
  const handleAsk = async () => {
    if (!question.trim() || !isAuthed) return;

    // If no conversation is active, create one first
    let convId = activeConversationId;
    if (!convId) {
      try {
        const res = await fetch(`${API_URL}/conversations`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ title: "New Chat" }),
        });
        const conv = await res.json();
        if (!conv.conversation_id) return;
        convId = conv.conversation_id;
        setConversations((prev) => [conv, ...prev]);
        setActiveConversationId(convId);
      } catch (err) {
        console.error("Failed to auto-create conversation:", err);
        return;
      }
    }

    const q = question.trim();
    setQuestion("");
    setLoading(true);

    // Optimistically add the question (with streaming indicator)
    const optimisticMsg = {
      question:    q,
      sql_queries: [],
      results:     [],
      chart_config: null,
      answer:      null,
      created_at:  new Date().toISOString(),
      _streaming:  true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch(`${API_URL}/ask`, {
        method:  "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          question:        q,
          conversation_id: convId,
        }),
      });
      const data = await res.json();

      // Replace the optimistic message with the real response
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          question:    q,
          sql_queries: data.sql_queries || [],
          results:     data.results     || [],
          chart_config: data.chart_config || null,
          answer:      data.insight     || "",
          created_at:  new Date().toISOString(),
          _streaming:  false,
        };
        return updated;
      });

      // Update conversation title in sidebar (backend auto-sets on first message)
      if (data.conversation_id) {
        setConversations((prev) =>
          prev.map((c) =>
            c.conversation_id === data.conversation_id
              ? { ...c, title: q.slice(0, 60) + (q.length > 60 ? "..." : ""), updated_at: new Date().toISOString() }
              : c
          )
        );
      }

    } catch (err) {
      console.error("Ask failed:", err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          answer: "⚠️ Something went wrong. Please try again.",
          _streaming: false,
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  // Enter key to submit (Shift+Enter for newline)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  // ─────────────────────────────────────────────────────
  // AUTH GUARD UI
  // ─────────────────────────────────────────────────────
  if (!isAuthed) {
    return (
      <div className={`app ${darkMode ? "dark" : "light"}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", padding: 40, maxWidth: 500 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏏</div>
          <h2 style={{ color: "#ff4d4d", marginBottom: 12 }}>Authentication Required</h2>
          <p style={{ opacity: 0.7, lineHeight: 1.6 }}>
            This chatbot must be launched from the main Cricket application.
            Please log in to the main app and open the AI assistant from there.
          </p>
          <p style={{ opacity: 0.5, fontSize: 12, marginTop: 20 }}>
            Missing: X-User-Id / REACT_APP_USER_ID
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────
  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>

      {/* ──────────────────────────────────────────────── */}
      {/* SIDEBAR                                          */}
      {/* ──────────────────────────────────────────────── */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        darkMode={darkMode}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        loadingConversations={loadingConversations}
      />

      {/* ──────────────────────────────────────────────── */}
      {/* MAIN CONTENT                                     */}
      {/* ──────────────────────────────────────────────── */}
      <div className={`main-content ${sidebarOpen ? "sidebar-open" : ""}`}>

        {/* TOPBAR */}
        <div className={`topbar ${darkMode ? "dark" : "light"}`}>
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle sidebar"
          >
            ☰
          </button>

          <h1 className="topbar-title">
            Cricket_Scorer_Pro
          </h1>

          <div className="topbar-right">
            <button className="theme-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="chat-area">

          {/* Empty state or message thread */}
          {!activeConversationId && messages.length === 0 ? (
            <EmptyState onNewChat={handleNewChat} />
          ) : loadingMessages ? (
            <div className="chat-loading">
              <div className="loading-spinner" />
              <p>Loading conversation...</p>
            </div>
          ) : (
            <div className="message-thread">
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={idx}
                  message={msg}
                  darkMode={darkMode}
                  isStreaming={msg._streaming}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

        </div>

        {/* INPUT BAR */}
        <div className={`input-bar ${darkMode ? "dark" : "light"}`}>
          <div className="input-bar-inner">
            <textarea
              ref={textareaRef}
              className={`chat-input ${darkMode ? "dark" : "light"}`}
              placeholder={
                activeConversationId
                  ? "Ask a follow-up question... (Shift+Enter for new line)"
                  : "Ask a cricket analytics question to start a new chat..."
              }
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            <button
              className="send-btn"
              onClick={handleAsk}
              disabled={loading || !question.trim()}
              title="Send (Enter)"
            >
              {loading ? (
                <div className="loading-spinner-btn" />
              ) : (
                <span className="send-icon">➤</span>
              )}
            </button>
          </div>
          <p className="input-hint">
            Press <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line
          </p>
        </div>

      </div>
    </div>
  );
}

export default App;