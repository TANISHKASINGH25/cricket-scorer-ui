import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Legend,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";
import "./App.css";


// =====================================================
// CHART COLORS
// =====================================================


const CHART_COLORS = [
  "#ff4d4d",
  "#ff8c00",
  "#ffd700",
  "#00c8a0",
  "#4da6ff",
  "#b266ff",
  "#ff66b2",
  "#66ffcc",
];


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
        <p style={{ margin: "0 0 6px 0", fontWeight: "bold", color: "#ff4d4d" }}>
          {label}
        </p>
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
// CRICKET CHART COMPONENT
// =====================================================


function CricketChart({ chartConfig, darkMode }) {


  if (!chartConfig || !chartConfig.data || chartConfig.data.length === 0) {
    return null;
  }


  const {
    chart_type,
    title,
    x_key,
    y_keys,
    data
  } = chartConfig;


  const axisColor = darkMode ? "#aaaaaa" : "#555555";
  const gridColor = darkMode
    ? "rgba(255,255,255,0.07)"
    : "rgba(0,0,0,0.08)";


  // ===================================================
  // BAR CHART
  // ===================================================


  if (chart_type === "bar") {


    return (
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey={x_key}
              tick={{ fill: axisColor, fontSize: 12 }}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fill: axisColor, fontSize: 12 }} />
            <Tooltip
              content={
                <CustomTooltip darkMode={darkMode} />
              }
            />
            {y_keys.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                name={key.replace(/_/g, " ")}
                fill={CHART_COLORS[i % CHART_COLORS.length]}
                radius={[6, 6, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }


  // ===================================================
  // LINE CHART
  // ===================================================


  if (chart_type === "line") {


    return (
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey={x_key}
              tick={{ fill: axisColor, fontSize: 12 }}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fill: axisColor, fontSize: 12 }} />
            <Tooltip
              content={
                <CustomTooltip darkMode={darkMode} />
              }
            />
            {y_keys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={key.replace(/_/g, " ")}
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={2.5}
                dot={{ r: 4, fill: CHART_COLORS[i % CHART_COLORS.length] }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }


  // ===================================================
  // RADAR CHART (for multi-metric player comparison)
  // ===================================================


  if (chart_type === "radar") {


    return (
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={340}>
          <RadarChart data={data} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
            <PolarGrid stroke={gridColor} />
            <PolarAngleAxis
              dataKey={x_key}
              tick={{ fill: axisColor, fontSize: 12 }}
            />
            {y_keys.map((key, i) => (
              <Radar
                key={key}
                name={key.replace(/_/g, " ")}
                dataKey={key}
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                fill={CHART_COLORS[i % CHART_COLORS.length]}
                fillOpacity={0.25}
              />
            ))}
            <Tooltip
              content={
                <CustomTooltip darkMode={darkMode} />
              }
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  }


  // ===================================================
  // MULTI-COLOR BAR (single metric, each bar colored)
  // ===================================================


  if (chart_type === "bar_colored") {


    return (
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey={x_key}
              tick={{ fill: axisColor, fontSize: 12 }}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fill: axisColor, fontSize: 12 }} />
            <Tooltip
              content={
                <CustomTooltip darkMode={darkMode} />
              }
            />
            <Bar
              dataKey={y_keys[0]}
              name={y_keys[0].replace(/_/g, " ")}
              radius={[6, 6, 0, 0]}
            >
              {data.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>


        {/* Legend */}
        <div className="chart-legend">
          {data.map((entry, i) => (
            <div key={i} className="chart-legend-item">
              <div
                className="chart-legend-dot"
                style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
              />
              <span>{entry[x_key]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }


  // ===================================================
  // AREA CHART (cumulative / volume trends)
  // ===================================================


  if (chart_type === "area") {


    return (
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
          >
            <defs>
              {y_keys.map((key, i) => (
                <linearGradient
                  key={key}
                  id={`areaGrad${i}`}
                  x1="0" y1="0" x2="0" y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={CHART_COLORS[i % CHART_COLORS.length]}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor={CHART_COLORS[i % CHART_COLORS.length]}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey={x_key}
              tick={{ fill: axisColor, fontSize: 12 }}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fill: axisColor, fontSize: 12 }} />
            <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
            {y_keys.map((key, i) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={key.replace(/_/g, " ")}
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={2.5}
                fill={`url(#areaGrad${i})`}
                dot={{ r: 3, fill: CHART_COLORS[i % CHART_COLORS.length] }}
                activeDot={{ r: 6 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }


  // ===================================================
  // PIE CHART (distribution / share of whole)
  // ===================================================


  if (chart_type === "pie") {


    const RADIAN = Math.PI / 180;


    const renderCustomLabel = ({
      cx, cy, midAngle, innerRadius, outerRadius, percent
    }) => {
      if (percent < 0.04) return null;
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);
      return (
        <text
          x={x} y={y}
          fill="white"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fontWeight="600"
        >
          {`${(percent * 100).toFixed(1)}%`}
        </text>
      );
    };


    return (
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey={y_keys[0]}
              nameKey={x_key}
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={50}
              paddingAngle={3}
              labelLine={false}
              label={renderCustomLabel}
            >
              {data.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [value, name]}
              contentStyle={{
                background: darkMode ? "#1f1f1f" : "#fff",
                border: "1px solid #8b0000",
                borderRadius: 10,
                color: darkMode ? "white" : "black"
              }}
            />
          </PieChart>
        </ResponsiveContainer>


        {/* Pie Legend */}
        <div className="chart-legend" style={{ justifyContent: "center", marginTop: 8 }}>
          {data.map((entry, i) => (
            <div key={i} className="chart-legend-item">
              <div
                className="chart-legend-dot"
                style={{
                  backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                  borderRadius: 3
                }}
              />
              <span style={{ fontSize: 13 }}>
                {entry[x_key]}
                <strong style={{
                  marginLeft: 6,
                  color: CHART_COLORS[i % CHART_COLORS.length]
                }}>
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
// MAIN APP
// =====================================================


function App() {


  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);


  const API_URL =
    process.env.REACT_APP_API_URL ||
    "https://cricket-scorer-api-zztcl7ejrq-uc.a.run.app";


 
  // =====================================================
  // ASK QUESTION
  // =====================================================


  const askQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/ask`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question,
          }),
        }
      );
     
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  return (


    <div className={darkMode ? "app dark" : "app light"}>


      {/* ========================================== */}
      {/* HEADER */}
      {/* ========================================== */}


      <div className="header">


        <h1>
          Cricket_Scorer_Pro
        </h1>


        <button
          className="theme-btn"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>


      </div>


      {/* ========================================== */}
      {/* CHAT CONTAINER */}
      {/* ========================================== */}


      <div className="chat-container">


        {/* =============================== */}
        {/* QUESTION BOX */}
        {/* =============================== */}


        <div className="input-section">


          <textarea
            placeholder="Ask cricket analytics questions..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />


          <button
            onClick={askQuestion}
          >
            {loading ? "Analyzing..." : "Ask AI"}
          </button>


        </div>


        {/* =============================== */}
        {/* RESPONSE */}
        {/* =============================== */}


        {response && (


          <div className="response-section">


            {/* USER QUESTION */}


            <div className="card question-card">


              <h3>User Question</h3>


              <p>
                {response.question}
              </p>


            </div>


            {/* SQL */}


            <div className="card sql-card">


              <h3>Generated SQL</h3>


              <pre>
                {response.sql}
              </pre>


            </div>


            {/* RESULTS */}


            <div className="card result-card">


              <h3>Database Results</h3>


              <pre>
                {JSON.stringify(
                  response.results,
                  null,
                  2
                )}
              </pre>


            </div>


            {/* CHART */}


            {response.chart_config && (


              <div className="card chart-card">


                <h3>
                  📊 {response.chart_config.title || "Visual Analysis"}
                </h3>


                {response.chart_config.subtitle && (
                  <p className="chart-subtitle">
                    {response.chart_config.subtitle}
                  </p>
                )}


                <CricketChart
                  chartConfig={response.chart_config}
                  darkMode={darkMode}
                />


              </div>
            )}


            {/* INSIGHT */}


            <div className="card insight-card">


              <h3>AI Cricket Insight</h3>


              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {response.insight}
                </ReactMarkdown>
              </div>


            </div>


          </div>
        )}


      </div>


    </div>
  );
}


export default App;