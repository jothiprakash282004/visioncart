import React, { useState, useEffect } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  :root { --orange: #ff6a00; --orange-light: #ff8c38; --orange-glow: rgba(255,106,0,0.12); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes countUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cardReveal {
    from { opacity: 0; transform: translateY(32px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes barGrow {
    from { height: 0; }
    to   { height: var(--h); }
  }
  @keyframes pulse {
    0%,100% { opacity: 1; } 50% { opacity: 0.5; }
  }
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }

  .admin-page { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #fafafa; padding: 48px 0; }

  .admin-header {
    margin-bottom: 40px; animation: fadeUp 0.5s ease both;
  }
  .admin-title {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: clamp(2rem, 5vw, 3rem); color: #1a1a1a; letter-spacing: -1px;
  }
  .admin-sub { color: #aaa; font-size: 0.95rem; margin-top: 6px; }
  .live-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(39,174,96,0.1); color: #27ae60;
    border: 1px solid rgba(39,174,96,0.2); border-radius: 100px;
    padding: 5px 14px; font-size: 0.78rem; font-weight: 700;
    margin-bottom: 12px;
  }
  .live-dot { width: 7px; height: 7px; border-radius: 50%; background: #27ae60; animation: pulse 1.5s ease-in-out infinite; }

  /* Stat cards */
  .stat-card {
    background: #fff; border-radius: 24px; border: 1.5px solid #f0f0f0;
    padding: 28px 28px 24px; position: relative; overflow: hidden;
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s, border-color 0.3s;
    animation: cardReveal 0.55s cubic-bezier(0.22,1,0.36,1) both;
    cursor: default;
  }
  .stat-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 48px rgba(0,0,0,0.07);
  }
  .stat-card::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, var(--accent-bg) 0%, transparent 60%);
    opacity: 0; transition: opacity 0.3s;
  }
  .stat-card:hover::before { opacity: 1; }

  .stat-icon {
    width: 52px; height: 52px; border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.4rem; margin-bottom: 20px;
  }
  .stat-label {
    font-size: 0.78rem; font-weight: 600; color: #aaa;
    text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;
  }
  .stat-value {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 2.2rem; color: #1a1a1a; line-height: 1;
    animation: countUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }
  .stat-change {
    font-size: 0.78rem; font-weight: 600; margin-top: 8px;
    display: flex; align-items: center; gap: 4px;
  }
  .stat-change.up { color: #27ae60; }
  .stat-change.warn { color: var(--orange); }

  .stat-sparkline {
    position: absolute; bottom: 0; right: 0; left: 0;
    height: 40px; display: flex; align-items: flex-end; gap: 3px; padding: 0 16px;
    opacity: 0.18;
  }
  .spark-bar {
    flex: 1; border-radius: 4px 4px 0 0;
    animation: barGrow 0.8s cubic-bezier(0.22,1,0.36,1) both;
  }

  /* Table */
  .table-card {
    background: #fff; border-radius: 24px; border: 1.5px solid #f0f0f0;
    overflow: hidden;
    animation: cardReveal 0.55s cubic-bezier(0.22,1,0.36,1) 0.3s both;
  }
  .table-header {
    padding: 24px 28px; border-bottom: 1px solid #f5f5f5;
    display: flex; align-items: center; justify-content: space-between;
  }
  .table-title {
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.05rem; color: #1a1a1a;
  }
  .admin-table { width: 100%; border-collapse: collapse; }
  .admin-table th {
    padding: 12px 28px; text-align: left;
    font-family: 'DM Sans', sans-serif; font-size: 0.75rem;
    font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 1px;
    border-bottom: 1px solid #f5f5f5;
  }
  .admin-table td {
    padding: 16px 28px; border-bottom: 1px solid #f5f5f5;
    font-size: 0.9rem; color: #333;
    transition: background 0.15s;
  }
  .admin-table tr:last-child td { border-bottom: none; }
  .admin-table tbody tr {
    animation: fadeUp 0.4s ease both;
    transition: background 0.2s;
  }
  .admin-table tbody tr:hover td { background: #fafafa; }

  .status-badge {
    padding: 4px 12px; border-radius: 100px;
    font-size: 0.75rem; font-weight: 700;
  }
  .status-badge.paid { background: rgba(39,174,96,0.1); color: #27ae60; }
  .status-badge.pending { background: rgba(243,156,18,0.1); color: #c8930a; }
  .status-badge.failed { background: rgba(231,76,60,0.1); color: #e74c3c; }

  /* Chart bars */
  .chart-section {
    background: #fff; border-radius: 24px; border: 1.5px solid #f0f0f0; padding: 28px;
    animation: cardReveal 0.55s cubic-bezier(0.22,1,0.36,1) 0.2s both;
  }
  .chart-bar-wrap { display: flex; align-items: flex-end; gap: 12px; height: 140px; padding-top: 8px; }
  .chart-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .chart-bar {
    width: 100%; border-radius: 8px 8px 0 0;
    background: linear-gradient(180deg, var(--orange-light), var(--orange));
    animation: barGrow 0.8s cubic-bezier(0.22,1,0.36,1) both;
    transition: filter 0.2s;
  }
  .chart-bar:hover { filter: brightness(1.1); }
  .chart-bar-label { font-size: 0.72rem; color: #aaa; font-weight: 600; }
  .chart-bar-val { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.78rem; color: var(--orange); }
`;

const STATS = [
  {
    label: "Total Orders",
    value: "124",
    numericValue: 124,
    icon: "📦",
    iconBg: "rgba(255,106,0,0.1)",
    accentBg: "rgba(255,106,0,0.03)",
    change: "+12% this week",
    changeType: "up",
    sparks: [40, 55, 48, 70, 65, 82, 90],
    sparkColor: "#ff6a00",
  },
  {
    label: "Revenue",
    value: "₹4,50,000",
    numericValue: 450000,
    icon: "💰",
    iconBg: "rgba(39,174,96,0.1)",
    accentBg: "rgba(39,174,96,0.03)",
    change: "+8.2% this month",
    changeType: "up",
    sparks: [30, 50, 42, 68, 72, 85, 95],
    sparkColor: "#27ae60",
  },
  {
    label: "Active Users",
    value: "89",
    numericValue: 89,
    icon: "👥",
    iconBg: "rgba(52,152,219,0.1)",
    accentBg: "rgba(52,152,219,0.03)",
    change: "+5 new today",
    changeType: "up",
    sparks: [60, 65, 58, 72, 70, 80, 78],
    sparkColor: "#3498db",
  },
];

const CHART_DATA = [
  { label: "Mon", val: 32 },
  { label: "Tue", val: 56 },
  { label: "Wed", val: 44 },
  { label: "Thu", val: 78 },
  { label: "Fri", val: 65 },
  { label: "Sat", val: 90 },
  { label: "Sun", val: 55 },
];

const RECENT_ORDERS = [
  { id: "#1042", customer: "Ravi Kumar", amount: "₹2,400", status: "Paid", time: "2 min ago" },
  { id: "#1041", customer: "Priya S.", amount: "₹1,180", status: "Paid", time: "15 min ago" },
  { id: "#1040", customer: "Arjun M.", amount: "₹3,750", status: "Pending", time: "42 min ago" },
  { id: "#1039", customer: "Divya R.", amount: "₹890", status: "Paid", time: "1 hr ago" },
  { id: "#1038", customer: "Karthik P.", amount: "₹5,200", status: "Failed", time: "2 hr ago" },
];

const maxVal = Math.max(...CHART_DATA.map(d => d.val));

function StatCard({ stat, delay }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const target = stat.numericValue;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setDisplayed(target); clearInterval(timer); }
      else setDisplayed(Math.floor(current));
    }, 30);
    return () => clearInterval(timer);
  }, [stat.numericValue]);

  const displayValue = stat.label === "Revenue"
    ? `₹${displayed.toLocaleString("en-IN")}`
    : displayed.toString();

  return (
    <div
      className="col-md-4"
      style={{ animationDelay: delay }}
    >
      <div
        className="stat-card"
        style={{ "--accent-bg": stat.accentBg }}
      >
        <div className="stat-icon" style={{ background: stat.iconBg, fontSize: "1.6rem" }}>
          {stat.icon}
        </div>
        <div className="stat-label">{stat.label}</div>
        <div className="stat-value" style={{ animationDelay: delay }}>
          {displayValue}
        </div>
        <div className={`stat-change ${stat.changeType}`}>
          <i className={`bi bi-arrow-${stat.changeType === "up" ? "up" : "down"}-right`}></i>
          {stat.change}
        </div>

        {/* Sparkline */}
        <div className="stat-sparkline">
          {stat.sparks.map((h, i) => (
            <div
              key={i}
              className="spark-bar"
              style={{
                "--h": `${h}%`, height: `${h}%`,
                background: stat.sparkColor,
                animationDelay: `${i * 50}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Admin() {
  return (
    <>
      <style>{STYLES}</style>
      <div className="admin-page">
        <div className="container">

          {/* Header */}
          <div className="admin-header">
            <div className="live-badge">
              <div className="live-dot" /> Live Dashboard
            </div>
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-sub">SmartCart · {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>

          {/* Stats */}
          <div className="row g-4 mb-4">
            {STATS.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} delay={`${i * 80}ms`} />
            ))}
          </div>

          {/* Chart + Table */}
          <div className="row g-4">

            {/* Weekly chart */}
            <div className="col-lg-5">
              <div className="chart-section h-100">
                <div style={{ fontFamily: "'Syne'", fontWeight: 700, fontSize: "1rem", color: "#1a1a1a", marginBottom: "4px" }}>
                  Weekly Orders
                </div>
                <div style={{ fontSize: "0.78rem", color: "#aaa", marginBottom: "20px" }}>
                  Orders placed each day this week
                </div>

                <div className="chart-bar-wrap">
                  {CHART_DATA.map((d, i) => (
                    <div className="chart-bar-col" key={d.label}>
                      <div className="chart-bar-val">{d.val}</div>
                      <div
                        className="chart-bar"
                        style={{ "--h": `${(d.val / maxVal) * 100}%`, height: `${(d.val / maxVal) * 100}%`, animationDelay: `${i * 60}ms` }}
                      />
                      <div className="chart-bar-label">{d.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent orders */}
            <div className="col-lg-7">
              <div className="table-card">
                <div className="table-header">
                  <div className="table-title">Recent Orders</div>
                  <div style={{ fontSize: "0.78rem", color: "#aaa" }}>Last 5 transactions</div>
                </div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECENT_ORDERS.map((order, i) => (
                      <tr key={order.id} style={{ animationDelay: `${0.3 + i * 0.05}s` }}>
                        <td style={{ fontFamily: "'Syne'", fontWeight: 700, color: "#1a1a1a" }}>{order.id}</td>
                        <td>{order.customer}</td>
                        <td style={{ fontFamily: "'Syne'", fontWeight: 700 }}>{order.amount}</td>
                        <td>
                          <span className={`status-badge ${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ color: "#aaa", fontSize: "0.82rem" }}>{order.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default Admin;