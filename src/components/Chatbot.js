import React, { useState, useContext } from "react";
import { CartContext } from "../context/CartContext";
import products from "../data/products";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const { addToCart, removeFromCart, cartItems } = useContext(CartContext);

const handleSend = () => {
  if (!message.trim()) return;

  const lowerMsg = message.toLowerCase();

  // Extract quantity
  let quantity = 1;
  const words = lowerMsg.split(" ");
  const numberWord = words.find((word) => !isNaN(word));
  if (numberWord) {
    quantity = parseInt(numberWord);
  }

  // Find product
  const product = products.find((p) =>
    lowerMsg.includes(p.name.toLowerCase())
  );

  // ADD / BUY / WANT
  if (
    (lowerMsg.includes("add") ||
      lowerMsg.includes("buy") ||
      lowerMsg.includes("need") ||
      lowerMsg.includes("want")) &&
    product
  ) {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }

    setChat((prev) => [
      ...prev,
      `🛒 Added ${quantity} ${product.name} to cart`,
    ]);
  }

  // REMOVE
  else if (lowerMsg.includes("remove") && product) {
    removeFromCart(product.id);

    setChat((prev) => [
      ...prev,
      `❌ Removed ${product.name} from cart`,
    ]);
  }

  // SHOW CART
  else if (lowerMsg.includes("show cart")) {
    if (cartItems.length === 0) {
      setChat((prev) => [...prev, "🛒 Your cart is empty"]);
    } else {
      const itemsList = cartItems
        .map((item) => `${item.name} x${item.quantity}`)
        .join(", ");

      setChat((prev) => [
        ...prev,
        `🛍 Cart Items: ${itemsList}`,
      ]);
    }
  }

  else {
    setChat((prev) => [
      ...prev,
      "🤖 Sorry, what you are excatly trying to say!!",
    ]);
  }

  setMessage("");
};
const username = localStorage.getItem("user") || "Guest";
  return (
    <>
      {/* Floating Button */}
    <div
        onClick={() => {
        setOpen(!open);
        if (!open) {
          setChat([]); // 🔥 clears chat when opening
        }
      }}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          background: "linear-gradient(90deg,#00f5ff,#ff00ff)",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          fontSize: "24px",
        }}
      >
        🤖
      </div>

      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            right: "30px",
            width: "320px",
            height: "420px",
            background: "#111",
            borderRadius: "20px",
            padding: "15px",
            color: "white",
            display: "flex",
            flexDirection: "column",
          }}
        >
         <div
  style={{
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: chat.length === 0 ? "center" : "flex-start",
    alignItems: "center",
    textAlign: "center",
  }}
>
  {chat.length === 0 ? (
    <h3>👋 Hey {username}, <br /> What’s up buddy?</h3>
  ) : 
  (chat.map((msg, index) => <p key={index}>{msg}</p>))}
</div>

          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type: Add 2 Milk"
            style={{
              padding: "8px",
              marginTop: "10px",
              borderRadius: "8px",
              border: "none",
            }}
          />

          <button
            onClick={handleSend}
            style={{
              marginTop: "8px",
              padding: "8px",
              borderRadius: "8px",
              border: "none",
              background: "#00f5ff",
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </div>
      )}
    </>
  );
}

export default Chatbot;