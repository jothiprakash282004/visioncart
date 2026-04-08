import React from "react";

function Admin() {
  return (
    <div
      className="container-fluid text-white py-5"
      style={{ minHeight: "100vh" }}
    >
      <div className="container">

        <h1
          className="mb-5 text-gradient fw-bold display-4 text-center"
        >
          Admin Dashboard
        </h1>

        <div className="row g-4">

          <div className="col-md-4">
            <Card title="Total Orders" value="124" />
          </div>

          <div className="col-md-4">
            <Card title="Revenue" value="₹4,50,000" />
          </div>

          <div className="col-md-4">
            <Card title="Users" value="89" />
          </div>

        </div>

      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div
      className="premium-card text-center text-white p-4"
    >
      <div className="card-body py-4">

        <h5 className="card-title">{title}</h5>

        <h2 className="fw-bold">{value}</h2>

      </div>
    </div>
  );
}

export default Admin;