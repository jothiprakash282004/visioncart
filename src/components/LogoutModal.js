import React from "react";

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{ 
        backgroundColor: "rgba(0, 0, 0, 0.6)", 
        backdropFilter: "blur(5px)",
        zIndex: 1060 
      }}
      onClick={onClose}
    >
      <div 
        className="card premium-card text-white shadow-lg border-0 rounded-4"
        style={{ width: "90%", maxWidth: "400px", animation: "fadeInDown 0.3s ease-out forwards" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-body p-4 text-center">
          
          <div className="mb-4 d-inline-block p-3 rounded-circle bg-danger bg-opacity-10 border border-danger border-opacity-25">
             <i className="bi bi-box-arrow-right text-danger display-5"></i>
          </div>
          
          <h4 className="text-dark opacity-75 mb-4">Confirm Logout</h4>
          <p className="text-dark opacity-75 mb-4">Are you sure you want to log out of your account?</p>
          
          <div className="d-flex gap-3 mt-2">
            <button 
              className="btn btn-outline-dark rounded-pill flex-grow-1 fw-bold py-2"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="btn btn-danger rounded-pill flex-grow-1 fw-bold py-2 shadow-sm"
              onClick={onConfirm}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      <style>
        {`
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default LogoutModal;
