import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

function Cart() {
  const {
    cartItems,
    removeFromCart,
    increaseQty,
    decreaseQty,
  } = useContext(CartContext);

  const navigate = useNavigate();

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div style={{
      minHeight: "100vh",
      padding: "50px",
      background: "linear-gradient(135deg,#0f0f1a,#1a1a2e)",
      color: "white"
    }}>
      <h1 style={{
        textAlign: "center",
        marginBottom: "40px",
        background: "linear-gradient(90deg,#00f5ff,#ff00ff)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
      }}>
        Your Cart
      </h1>

      {cartItems.length === 0 ? (
        <h3 style={{ textAlign: "center" }}>Cart is Empty 🛒</h3>
      ) : (
        <div style={{ maxWidth: "800px", margin: "auto" }}>
          {cartItems.map(item => (
            <div key={item.id} style={{
              background: "rgba(255,255,255,0.05)",
              padding: "20px",
              borderRadius: "15px",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 0 20px rgba(0,255,255,0.2)"
            }}>
              <div>
                <h3>{item.name}</h3>
                <p>₹{item.price}</p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button onClick={() => decreaseQty(item.id)} style={qtyBtn}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() => increaseQty(item.id)} style={qtyBtn}>+</button>
              </div>

              <h3>₹{item.price * item.quantity}</h3>

              <button
                onClick={() => removeFromCart(item.id)}
                style={removeBtn}
              >
                Remove
              </button>
            </div>
          ))}

          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <h2>Total: ₹{totalPrice}</h2>

            <button
              onClick={() => navigate("/checkout")}
              style={checkoutBtn}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const qtyBtn = {
  padding: "5px 12px",
  borderRadius: "50%",
  border: "none",
  background: "#00f5ff",
  cursor: "pointer",
  fontWeight: "bold"
};

const removeBtn = {
  padding: "8px 15px",
  borderRadius: "20px",
  border: "none",
  background: "#ff004c",
  color: "white",
  cursor: "pointer"
};

const checkoutBtn = {
  marginTop: "20px",
  padding: "12px 30px",
  borderRadius: "30px",
  border: "none",
  background: "linear-gradient(90deg,#00f5ff,#ff00ff)",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer"
};

export default Cart;