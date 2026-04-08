import React from "react";

function Loader() {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-dark">

      <div className="text-center text-info">

        <div className="spinner-border text-info mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>

        <h4>Loading...</h4>

      </div>

    </div>
  );
}

export default Loader;