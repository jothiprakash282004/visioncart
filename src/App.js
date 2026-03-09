import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import { CartProvider } from "./context/CartContext";
import Chatbot from "./components/Chatbot";
import Login from "./pages/login";
import ProtectedRoute from "./components/ProtectedRoute";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import Payment from "./pages/Payment";
import Timeout from "./pages/Timeout";

function App() {
  return (
    <CartProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart"element={<ProtectedRoute><Cart /></ProtectedRoute>}/>
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>}/> 
          <Route path="/success" element={<Success />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/timeout" element={<Timeout/>} />
        </Routes>
        <Chatbot />
      </Router>
    </CartProvider>
  );
}

export default App;