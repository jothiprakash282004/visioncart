import React from "react";

function Loader() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#0f0f1a",
      color: "#00f5ff",
      fontSize: "30px"
    }}>
      Loading...
    </div>
  );
}

export default Loader;