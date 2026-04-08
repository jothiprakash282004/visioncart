import React, { useState, useRef, useEffect, useContext } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

function Chatbot() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { cartItems, addToCart, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, isLoading]);

  const sendMessage = async () => {
    if (message.trim() === "") return;

    const userMessage = { sender: "user", text: message };
    setChat(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      // Format history for the backend (excluding the current message we are about to add)
      const history = chat.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text
      }));

      const res = await axios.post("http://localhost:5000/chat", {
        message: message,
        history: history
      });

      if (res.data.action && res.data.action.type === "ADD_TO_CART") {
        addToCart(res.data.action.payload);
      } else if (res.data.action && res.data.action.type === "REMOVE_FROM_CART") {
        removeFromCart(res.data.action.payload.id);
      } else if (res.data.action && res.data.action.type === "NAVIGATE") {
        setIsOpen(false);
        navigate(res.data.action.payload.url);
      }

      const botMessage = {
        sender: "bot",
        text: res.data.reply,
        action: res.data.action
      };

      setChat(prev => [...prev, botMessage]);
    } catch (error) {
      console.log(error);
      const errorMessage = {
        sender: "bot",
        text: "Sorry, I'm having trouble connecting right now."
      };
      setChat(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <div ref={wrapperRef}>
      <li className="nav-item">
        <button 
          className="btn btn-outline-info rounded-pill px-4 py-2 shadow-sm fw-semibold d-flex align-items-center gap-2 justify-content-center w-100"
          onClick={() => {
            if (isOpen) setChat([]);
            setIsOpen(!isOpen);
          }}
        >
          <i className={`bi ${isOpen ? 'bi-x-lg' : 'bi-robot'} fs-5`}></i>
          <span>Chat</span>
        </button>
      </li>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="premium-card position-fixed shadow-lg d-flex flex-column" 
          style={{ 
            width: "350px", 
            height: "450px", 
            top: "90px", 
            right: "30px", 
            zIndex: 1050,
            animation: "fadeInDown 0.3s ease-out forwards"
          }}
        >
          {/* Header */}
          <div className="bg-light p-3 border-bottom border-secondary d-flex align-items-center justify-content-between">
            <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-gradient">
              <i className="bi bi-robot text-info"></i> Smart Assistant
            </h5>
            <button className="btn btn-sm btn-link text-white text-decoration-none shadow-none" onClick={() => { setChat([]); setIsOpen(false); }}>
               <i className="bi bi-dash-lg"></i>
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-grow-1 p-3 overflow-auto d-flex flex-column gap-3" style={{ background: "#d3d3d3ff" }}>
            {chat.length === 0 && (
              <div className="text-center text-muted my-auto">
                <i className="bi bi-chat-heart fs-1 mb-2 d-block"></i>
                <p className="small">Hi! How can I help you today?</p>
              </div>
            )}
            {chat.map((msg, index) => (
              <div key={index} className={`d-flex ${msg.sender === "user" ? "justify-content-end" : "justify-content-start"}`}>
                <div 
                  className={`p-2 px-3 shadow-sm ${msg.sender === "user" ? "text-white" : "text-dark"}`}
                  style={{ 
                    maxWidth: "85%", 
                    fontSize: "0.95rem",
                    background: msg.sender === "user" ? "linear-gradient(135deg, #7d2ae8 0%, #00f5ff 100%)" : "#ffffff",
                    borderRadius: msg.sender === "user" ? "18px 18px 0px 18px" : "18px 18px 18px 0px",
                    border: msg.sender === "bot" ? "1px solid #dee2e6" : "none"
                  }}
                >
                  {msg.text}
                  {msg.action && msg.action.type === "SHOW_PRODUCT" && (
                    <div className="mt-3 p-2 border rounded bg-light text-dark shadow-sm">
                      <img src={msg.action.payload.image_url} alt={msg.action.payload.name} className="img-fluid rounded mb-2 w-100" style={{maxHeight:'120px', objectFit:'contain'}} />
                      <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{msg.action.payload.name}</div>
                      <div className="text-secondary small mb-2 fw-semibold">₹{msg.action.payload.price}</div>
                      <div className="d-flex gap-2">
                        <Link to={`/product/${msg.action.payload.id}`} className="btn btn-outline-primary btn-sm flex-grow-1" style={{ fontSize: '0.8rem' }}>Store Link</Link>
                        <button className="btn btn-primary btn-sm flex-grow-1" style={{ fontSize: '0.8rem' }} onClick={() => addToCart(msg.action.payload)}>
                          <i className="bi bi-cart-plus me-1"></i> Add
                        </button>
                      </div>
                    </div>
                  )}
                  {msg.action && msg.action.type === "SHOW_PRODUCTS" && (
                    <div className="mt-3 d-flex flex-column gap-3">
                      {msg.action.payload.map((prod, idx) => (
                        <div key={idx} className="p-2 border rounded bg-light text-dark shadow-sm">
                          <img src={prod.image_url} alt={prod.name} className="img-fluid rounded mb-2 w-100" style={{maxHeight:'120px', objectFit:'contain'}} />
                          <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{prod.name}</div>
                          <div className="text-secondary small mb-2 fw-semibold">₹{prod.price}</div>
                          <div className="d-flex gap-2">
                            <Link to={`/product/${prod.id}`} className="btn btn-outline-primary btn-sm flex-grow-1" style={{ fontSize: '0.8rem' }}>Store Link</Link>
                            <button className="btn btn-primary btn-sm flex-grow-1" style={{ fontSize: '0.8rem' }} onClick={() => addToCart(prod)}>
                              <i className="bi bi-cart-plus me-1"></i> Add
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {msg.action && msg.action.type === "NAVIGATE" && (
                    <div className="mt-2">
                      <Link to={msg.action.payload.url} className="btn btn-success btn-sm w-100 fw-bold shadow-sm">
                        <i className="bi bi-box-seam me-1"></i> {msg.action.payload.text || "Proceed"}
                      </Link>
                    </div>
                  )}
                  {msg.action && msg.action.type === "ADD_TO_CART" && (
                    <div className="mt-3 p-2 border rounded bg-success-subtle text-dark shadow-sm">
                      <div className="fw-bold mb-1 text-success"><i className="bi bi-cart-check-fill"></i> Added to Cart!</div>
                      <div className="d-flex align-items-center gap-2 mt-2">
                        <img src={msg.action.payload.image_url} alt="Added" style={{width:'40px', height:'40px', objectFit:'cover', borderRadius:'4px'}} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{msg.action.payload.name}</span>
                      </div>
                    </div>
                  )}
                  {msg.action && msg.action.type === "REMOVE_FROM_CART" && (
                    <div className="mt-3 p-2 border rounded bg-danger-subtle text-dark shadow-sm">
                      <div className="fw-bold mb-1 text-danger"><i className="bi bi-cart-x-fill"></i> Removed from Cart!</div>
                      <div className="d-flex align-items-center gap-2 mt-2">
                        <img src={msg.action.payload.image_url} alt="Removed" style={{width:'40px', height:'40px', objectFit:'cover', borderRadius:'4px'}} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{msg.action.payload.name}</span>
                      </div>
                    </div>
                  )}
                  {msg.action && msg.action.type === "VIEW_CART" && (
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
                                      <img src={item.image_url} alt={item.name} style={{width:'36px', height:'36px', objectFit:'cover', borderRadius:'4px'}} />
                                      <div style={{ fontSize: '0.85rem', lineHeight:'1.2' }}>
                                        <div className="fw-bold text-truncate" style={{maxWidth:'120px'}}>{item.name}</div>
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
              <div className="d-flex justify-content-start">
                <div 
                  className="p-2 px-3 text-dark d-flex align-items-center gap-1"
                  style={{ 
                    background: "#ffffff",
                    borderRadius: "18px 18px 18px 0px",
                    border: "1px solid #dee2e6",
                    height: "36px"
                  }}
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
                className="form-control border-0 bg-white text-dark shadow-none px-4"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button 
                className="btn btn-primary px-4 fw-bold" 
                onClick={sendMessage}
              >
                <i className="bi bi-send-fill me-1"></i> Send
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>
        {`
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes typingDotBounce {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-4px); }
          }
          .typing-dot {
            width: 6px;
            height: 6px;
            background-color: #6c757d;
            border-radius: 50%;
            animation: typingDotBounce 1.4s infinite ease-in-out both;
          }
        `}
      </style>
    </div>
  );
}

export default Chatbot;