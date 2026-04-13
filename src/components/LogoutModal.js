import React, { useEffect, useState } from "react";

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setClosing(false);
      setVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      onClose();
    }, 280);
  };

  if (!isOpen && !visible) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{
        backgroundColor: closing ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.6)",
        backdropFilter: closing ? "blur(0px)" : "blur(5px)",
        zIndex: 1060,
        transition: "background-color 0.28s ease, backdrop-filter 0.28s ease",
      }}
      onClick={handleClose}
    >
      <style>{`
        @keyframes modalBounceIn {
          0%   { opacity: 0; transform: scale(0.75) translateY(-20px); }
          60%  { opacity: 1; transform: scale(1.04) translateY(4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes modalBounceOut {
          from { opacity: 1; transform: scale(1); }
          to   { opacity: 0; transform: scale(0.88) translateY(-12px); }
        }
        @keyframes iconWobble {
          0%,100% { transform: rotate(0deg) scale(1); }
          25%      { transform: rotate(-8deg) scale(1.1); }
          75%      { transform: rotate(6deg) scale(0.95); }
        }
        @keyframes btnShimmer {
          0%,100% { box-shadow: 0 4px 14px rgba(220,53,69,0.3); }
          50%      { box-shadow: 0 8px 28px rgba(220,53,69,0.5); }
        }

        .modal-card-bounce {
          animation: modalBounceIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .modal-card-out {
          animation: modalBounceOut 0.28s ease forwards;
        }
        .modal-icon-wrap {
          animation: iconWobble 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both;
          display: inline-block;
        }
        .modal-cancel-btn {
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1),
                      background 0.2s, border-color 0.2s !important;
        }
        .modal-cancel-btn:hover {
          transform: scale(1.04) !important;
          background: #f5f5f5 !important;
        }
        .modal-cancel-btn:active { transform: scale(0.96) !important; }

        .modal-logout-btn {
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1) !important;
          animation: btnShimmer 2.5s ease-in-out infinite;
        }
        .modal-logout-btn:hover { transform: scale(1.04) !important; }
        .modal-logout-btn:active { transform: scale(0.95) !important; }
      `}</style>

      <div
        className={`card text-white shadow-lg border-0 rounded-4 ${closing ? "modal-card-out" : "modal-card-bounce"}`}
        style={{ width: "90%", maxWidth: "400px", background: "#fff" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-body p-4 text-center">

          <div className="modal-icon-wrap mb-4">
            <div className="d-inline-block p-3 rounded-circle" style={{ background: "rgba(220,53,69,0.08)", border: "1.5px solid rgba(220,53,69,0.2)" }}>
              <i className="bi bi-box-arrow-right text-danger" style={{ fontSize: "2.5rem" }}></i>
            </div>
          </div>

          <h4 className="text-dark mb-2 fw-bold">Confirm Logout</h4>
          <p className="text-secondary mb-4">Are you sure you want to log out of your account?</p>

          <div className="d-flex gap-3 mt-2">
            <button
              className="btn btn-outline-dark rounded-pill flex-grow-1 fw-bold py-2 modal-cancel-btn"
              onClick={handleClose}
            >
              <i className="bi bi-x-lg me-2"></i>Cancel
            </button>
            <button
              className="btn btn-danger rounded-pill flex-grow-1 fw-bold py-2 shadow-sm modal-logout-btn"
              onClick={onConfirm}
            >
              <i className="bi bi-box-arrow-right me-2"></i>Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;