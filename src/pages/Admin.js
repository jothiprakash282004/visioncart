import React from "react";

function Admin() {
  return (
    <div style={{
      minHeight: "100vh",
      padding: "50px",
      background: "linear-gradient(135deg,#0f0f1a,#1a1a2e)",
      color: "white"
    }}>
      <h1 style={{
        background: "linear-gradient(90deg,#00f5ff,#ff00ff)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
      }}>
        Admin Dashboard
      </h1>
      <div style={{
        display: "flex",
        gap: "30px",
        marginTop: "40px"
      }}>
        <Card title="Total Orders" value="124" />
        <Card title="Revenue" value="₹4,50,000" />
        <Card title="Users" value="89" />
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={{
      padding: "30px",
      background: "rgba(255,255,255,0.05)",
      borderRadius: "20px",
      width: "200px",
      textAlign: "center",
      boxShadow: "0 0 30px rgba(0,255,255,0.2)"
    }}>
      <h3>{title}</h3>
      <h2>{value}</h2>
    </div>
  );
}

export default Admin;