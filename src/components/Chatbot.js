import React, { useState, useRef, useEffect, useContext } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { useChatbot } from "../context/ChatbotContext";

const STYLES = `
  @keyframes chatFadeIn {
    from { opacity: 0; transform: translateY(-16px) scale(0.96); transform-origin: top right; }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes msgSlideUser {
    from { opacity: 0; transform: translateX(16px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes msgSlideBot {
    from { opacity: 0; transform: translateX(-16px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes typingBounce {
    0%, 60%, 100% { transform: translateY(0); }
    30%           { transform: translateY(-5px); }
  }
  @keyframes botBtnPulse {
    0%,100% { box-shadow: 0 4px 14px rgba(13,202,240,0.25); }
    50%      { box-shadow: 0 6px 22px rgba(13,202,240,0.45); }
  }
  @keyframes sendBtnWiggle {
    0%,100% { transform: translateX(0); }
    30%      { transform: translateX(3px); }
    70%      { transform: translateX(-2px); }
  }

  /* Chat window */
  .chatbot-window {
    animation: chatFadeIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both !important;
    transform-origin: top right;
  }

  /* Bot toggle button */
  .chatbot-toggle-btn {
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1),
                box-shadow 0.25s ease !important;
    animation: botBtnPulse 2.8s ease-in-out infinite;
  }
  .chatbot-toggle-btn:hover { transform: scale(1.06) translateY(-2px) !important; }
  .chatbot-toggle-btn:active { transform: scale(0.95) !important; }

  /* Icon transition inside toggle */
  .chatbot-toggle-btn .bi {
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s;
  }

  /* Message bubbles */
  .chat-msg-user {
    animation: msgSlideUser 0.28s cubic-bezier(0.22,1,0.36,1) both;
  }
  .chat-msg-bot {
    animation: msgSlideBot 0.28s cubic-bezier(0.22,1,0.36,1) both;
  }

  /* Typing dots */
  .typing-dot {
    width: 6px; height: 6px; background-color: #6c757d;
    border-radius: 50%;
    animation: typingBounce 1.4s infinite ease-in-out both;
  }

  /* Send button */
  .send-btn {
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), background 0.2s !important;
  }
  .send-btn:hover { transform: scale(1.06) !important; }
  .send-btn:active { transform: scale(0.93) !important; }
  .send-btn:hover .bi { animation: sendBtnWiggle 0.4s ease; }

  /* Input focus glow */
  .chat-input-field:focus {
    box-shadow: none !important;
    border-color: transparent !important;
  }

  /* Product cards in chat */
  .chat-product-card {
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease;
  }
  .chat-product-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1) !important;
  }

  /* Added to cart card pop */
  @keyframes cartCardPop {
    0%   { transform: scale(0.9); opacity: 0; }
    60%  { transform: scale(1.04); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  .cart-card-added { animation: cartCardPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }

  /* Minimise button */
  .chat-close-btn {
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), color 0.15s;
  }
  .chat-close-btn:hover { transform: scale(1.2) rotate(90deg) !important; color: #e74c3c !important; }
`;

function Chatbot() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const wrapperRef = useRef(null);
  const { cartItems, addToCart, removeFromCart } = useContext(CartContext);
  const { isChatbotOpen, setIsChatbotOpen } = useChatbot();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [chat, isLoading]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsChatbotOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsChatbotOpen]);

  const sendMessage = async () => {
    if (message.trim() === "") return;
    const userMessage = { sender: "user", text: message };
    setChat(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const history = chat.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text
      }));
      const res = await axios.post("http://localhost:5000/chat", { message, history });

      let botReply = res.data.reply;
      let botAction = res.data.action;

      if (typeof botReply === "string" && botReply.trim().startsWith("{") && !botAction) {
        try {
          const parsed = JSON.parse(botReply);
          botReply = parsed.reply || botReply;
          botAction = parsed.action || botAction;
        } catch (error) {
          // ignore invalid fallback JSON
        }
      }

      if (botAction?.type === "ADD_TO_CART") addToCart(botAction.payload);
      else if (botAction?.type === "REMOVE_FROM_CART") removeFromCart(botAction.payload.id);
      else if (botAction?.type === "NAVIGATE") {
        setIsChatbotOpen(false);
        navigate(botAction.payload.url);
      }

      setChat(prev => [...prev, { sender: "bot", text: botReply, action: botAction }]);
    } catch {
      setChat(prev => [...prev, { sender: "bot", text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div ref={wrapperRef}>
        <li className="nav-item">
          <button
            className="btn btn-outline-info rounded-pill px-4 py-2 shadow-sm fw-semibold d-flex align-items-center gap-2 justify-content-center w-100 chatbot-toggle-btn"
            onClick={() => { if (isChatbotOpen) setChat([]); setIsChatbotOpen(!isChatbotOpen); }}
          >
            <i className={`bi ${isChatbotOpen ? "bi-x-lg" : "bi-robot"} fs-5`}></i>
            <span>{isChatbotOpen ? "Close" : "Chat"}</span>
          </button>
        </li>

        {/* Chat Window */}
        {isChatbotOpen && (
          <div
            className="chatbot-window premium-card position-fixed shadow-lg d-flex flex-column"
            style={{
              width: "350px",
              height: "450px",
              top: "90px",
              right: "30px",
              zIndex: 100  // Lower z-index so products appear over chatbot
            }}
          >
            {/* Header */}
            <div className="bg-light p-3 border-bottom border-secondary d-flex align-items-center justify-content-between">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-gradient">
                <i className="bi bi-robot text-info"></i> Smart Assistant
              </h5>
              <button
                className="btn btn-sm btn-link text-dark text-decoration-none shadow-none chat-close-btn"
                onClick={() => { setChat([]); setIsChatbotOpen(false); }}
              >
                <i className="bi bi-x-lg fs-6"></i>
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-grow-1 p-3 overflow-auto d-flex flex-column gap-3" style={{ background: "#d3d3d3ff" }}>
              {chat.length === 0 && (
                <div className="text-center text-muted my-auto">
                  <i className="bi bi-chat-heart fs-1 mb-2 d-block" style={{ animation: "typingBounce 2s ease-in-out infinite" }}></i>
                  <p className="small fw-semibold">Hi! How can I help you today?</p>
                  {/* Suggestion chips */}
                  <div className="d-flex flex-wrap justify-content-center gap-1 mt-2">
                    {["Show products", "View cart", "Best deals"].map((chip, i) => (
                      <button
                        key={i}
                        className="btn btn-sm btn-light border rounded-pill px-3 py-1"
                        style={{ fontSize: "0.75rem", transition: "all 0.2s" }}
                        onMouseOver={e => { e.currentTarget.style.background = "#ff6a00"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#ff6a00"; }}
                        onMouseOut={e => { e.currentTarget.style.background = ""; e.currentTarget.style.color = ""; e.currentTarget.style.borderColor = ""; }}
                        onClick={() => { setMessage(chip); }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chat.map((msg, index) => (
                <div key={index} className={`d-flex ${msg.sender === "user" ? "justify-content-end chat-msg-user" : "justify-content-start chat-msg-bot"}`}>
                  <div
                    className={`p-2 px-3 shadow-sm ${msg.sender === "user" ? "text-white" : "text-dark"}`}
                    style={{
                      maxWidth: "85%", fontSize: "0.95rem",
                      background: msg.sender === "user" ? "linear-gradient(135deg, #7d2ae8 0%, #00f5ff 100%)" : "#ffffff",
                      borderRadius: msg.sender === "user" ? "18px 18px 0px 18px" : "18px 18px 18px 0px",
                      border: msg.sender === "bot" ? "1px solid #dee2e6" : "none"
                    }}
                  >
                    {msg.text}

                    {msg.action?.type === "SHOW_PRODUCT" && (
                      <div className="mt-3 p-2 border rounded bg-light text-dark shadow-sm chat-product-card">
                        <img src={msg.action.payload.image_url} alt={msg.action.payload.name} className="img-fluid rounded mb-2 w-100" style={{ maxHeight: "120px", objectFit: "contain" }} />
                        <div className="fw-bold" style={{ fontSize: "0.9rem" }}>{msg.action.payload.name}</div>
                        <div className="text-secondary small mb-2 fw-semibold">₹{msg.action.payload.price}</div>
                        <div className="d-flex gap-2">
                          <Link to={`/product/${msg.action.payload.id}`} className="btn btn-outline-primary btn-sm flex-grow-1" style={{ fontSize: "0.8rem" }}>Store Link</Link>
                          <button className="btn btn-primary btn-sm flex-grow-1" style={{ fontSize: "0.8rem" }} onClick={() => addToCart(msg.action.payload)}>
                            <i className="bi bi-cart-plus me-1"></i> Add
                          </button>
                        </div>
                      </div>
                    )}

                    {msg.action?.type === "SHOW_PRODUCTS" && (
                      <div className="mt-3 d-flex flex-column gap-3">
                        {msg.action.payload.map((prod, idx) => (
                          <div key={idx} className="p-2 border rounded bg-light text-dark shadow-sm chat-product-card">
                            <img src={prod.image_url} alt={prod.name} className="img-fluid rounded mb-2 w-100" style={{ maxHeight: "120px", objectFit: "contain" }} />
                            <div className="fw-bold" style={{ fontSize: "0.9rem" }}>{prod.name}</div>
                            <div className="text-secondary small mb-2 fw-semibold">₹{prod.price}</div>
                            <div className="d-flex gap-2">
                              <Link to={`/product/${prod.id}`} className="btn btn-outline-primary btn-sm flex-grow-1" style={{ fontSize: "0.8rem" }}>Store Link</Link>
                              <button className="btn btn-primary btn-sm flex-grow-1" style={{ fontSize: "0.8rem" }} onClick={() => addToCart(prod)}>
                                <i className="bi bi-cart-plus me-1"></i> Add
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {msg.action?.type === "NAVIGATE" && (
                      <div className="mt-2">
                        <Link to={msg.action.payload.url} className="btn btn-success btn-sm w-100 fw-bold shadow-sm">
                          <i className="bi bi-box-seam me-1"></i> {msg.action.payload.text || "Proceed"}
                        </Link>
                      </div>
                    )}

                    {msg.action?.type === "ADD_TO_CART" && (
                      <div className="mt-3 p-2 border rounded bg-success-subtle text-dark shadow-sm cart-card-added">
                        <div className="fw-bold mb-1 text-success"><i className="bi bi-cart-check-fill"></i> Added to Cart!</div>
                        <div className="d-flex align-items-center gap-2 mt-2">
                          <img src={msg.action.payload.image_url} alt="Added" style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }} />
                          <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>{msg.action.payload.name}</span>
                        </div>
                      </div>
                    )}

                    {msg.action?.type === "REMOVE_FROM_CART" && (
                      <div className="mt-3 p-2 border rounded bg-danger-subtle text-dark shadow-sm cart-card-added">
                        <div className="fw-bold mb-1 text-danger"><i className="bi bi-cart-x-fill"></i> Removed from Cart!</div>
                        <div className="d-flex align-items-center gap-2 mt-2">
                          <img src={msg.action.payload.image_url} alt="Removed" style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }} />
                          <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>{msg.action.payload.name}</span>
                        </div>
                      </div>
                    )}

                    {msg.action?.type === "VIEW_CART" && (
                      <div className="mt-3 d-flex flex-column gap-2">
                        {(!cartItems || cartItems.length === 0) ? (
                          <div className="p-2 border rounded bg-light text-secondary small text-center shadow-sm">
                            <i className="bi bi-cart-x fs-4 d-block mb-1"></i>
                            Your cart is empty.
                          </div>
                        ) : (
                          <div className="bg-light border rounded p-2 shadow-sm">
                            <div className="fw-bold text-primary mb-2 border-bottom pb-1">Your Cart Items:</div>
                            <div className="d-flex flex-column gap-2">
                              {cartItems.map((item, idx) => (
                                <div key={idx} className="d-flex justify-content-between align-items-center bg-white p-1 rounded border">
                                  <div className="d-flex align-items-center gap-2">
                                    <img src={item.image_url} alt={item.name} style={{ width: "36px", height: "36px", objectFit: "cover", borderRadius: "4px" }} />
                                    <div style={{ fontSize: "0.85rem", lineHeight: "1.2" }}>
                                      <div className="fw-bold text-truncate" style={{ maxWidth: "120px" }}>{item.name}</div>
                                      <div className="text-muted">₹{item.price} x {item.quantity || 1}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <Link to="/checkout" className="btn btn-success btn-sm w-100 fw-bold mt-3 shadow-sm">
                              Proceed to Checkout
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="d-flex justify-content-start chat-msg-bot">
                  <div className="p-2 px-3 text-dark d-flex align-items-center gap-1"
                    style={{ background: "#ffffff", borderRadius: "18px 18px 18px 0px", border: "1px solid #dee2e6", height: "36px" }}
                  >
                    <div className="typing-dot"></div>
                    <div className="typing-dot" style={{ animationDelay: "0.2s" }}></div>
                    <div className="typing-dot" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer Input */}
            <div className="p-3 bg-white border-top border-secondary rounded-bottom">
              <div className="input-group shadow-sm rounded-pill overflow-hidden border border-primary">
                <input
                  type="text"
                  className="form-control border-0 bg-white text-dark shadow-none px-4 chat-input-field"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button className="btn btn-primary px-4 fw-bold send-btn" onClick={sendMessage}>
                  <i className="bi bi-send-fill me-1"></i> Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Chatbot;