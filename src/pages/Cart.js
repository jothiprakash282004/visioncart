import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

function Cart() {
  const { cartItems, removeFromCart, increaseQty, decreaseQty } =
    useContext(CartContext);

  const navigate = useNavigate();

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="container-fluid py-5">
      <div className="container">

        <div className="text-center mb-5">
          <h1 className="fw-bold display-4" style={{ color: "#333" }}>
            Your Cart
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-5">
            <h3 className="text-muted">Cart is Empty 🛒</h3>
            <button className="btn btn-premium mt-3" onClick={() => navigate("/")}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="mx-auto" style={{ maxWidth: "900px" }}>

            {cartItems.map((item) => (
              <div
                key={item.id}
                className="card premium-card mb-4 border-0"
              >
                <div className="card-body p-4 d-flex justify-content-between align-items-center flex-wrap gap-3">

                  <div className="d-flex align-items-center gap-4">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      loading="lazy"
                      style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "10px" }}
                    />
                    <div>
                      <h5 className="fw-bold mb-1">{item.name}</h5>
                      <p className="text-gradient-success fw-semibold mb-0">₹{item.price}</p>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3 bg-light rounded-pill py-2 px-3 border" style={{ borderColor: "#ff6a00" }}>
                    <button
                      className="btn btn-sm rounded-circle"
                      style={{ width: "32px", height: "32px", padding: 0, background: "#ff6a00", color: "white" }}
                      onClick={() => decreaseQty(item.id)}
                    >
                      <i className="bi bi-dash fw-bold"></i>
                    </button>

                    <span className="fw-bold fs-5 px-2" style={{ color: "#333" }}>{item.quantity}</span>

                    <button
                      className="btn btn-sm rounded-circle"
                      style={{ width: "32px", height: "32px", padding: 0, background: "#ff6a00", color: "white" }}
                      onClick={() => increaseQty(item.id)}
                    >
                      <i className="bi bi-plus fw-bold"></i>
                    </button>
                  </div>

                  <div className="text-end">
                    <h4 className="fw-bold mb-2 text-gradient-success">
                      ₹{item.price * item.quantity}
                    </h4>
                    <button
                      className="btn btn-sm btn-outline-danger rounded-pill px-3"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>

                </div>
              </div>
            ))}

            <div className="premium-card p-4 mt-5 text-center shadow-sm">
              <h2 className="mb-4 fw-bold" style={{ color: "#333" }}>Total Amount: <span className="text-gradient-success">₹{totalPrice}</span></h2>
              <button
                className="btn btn-lg btn-premium px-5 rounded-pill shadow-sm"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;