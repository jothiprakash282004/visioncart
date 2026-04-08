import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cartItems, addToCart, increaseQty, decreaseQty } = useContext(CartContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const getQuantity = (id) => {
    const item = cartItems.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

  const qty = product ? getQuantity(product.id) : 0;

  const handleAddToCart = (e, product) => {
    // Map to expected format for context if needed (image vs image_url)
    const cartProduct = {
      ...product,
      image: product.image_url
    };
    
    addToCart(cartProduct);

    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const cartIcon = document.getElementById("navbar-cart-icon");

    if (cartIcon) {
      const cartRect = cartIcon.getBoundingClientRect();

      const img = document.createElement("img");
      img.src = product.image_url;
      img.style.position ="fixed";
      img.style.zIndex = "9999";
      img.style.width = "50px";
      img.style.height = "50px";
      img.style.borderRadius = "50%";
      img.style.objectFit = "cover";
      img.style.left = `${rect.left + rect.width / 2 - 25}px`;
      img.style.top = `${rect.top + rect.height / 2 - 25}px`;
      img.style.transition = "all 0.8s cubic-bezier(0.25, 1, 0.5, 1)";
      img.style.boxShadow = "0 5px 15px rgba(0,0,0,0.5)";
      img.style.pointerEvents = "none";

      document.body.appendChild(img);
      void img.offsetWidth;

      img.style.left = `${cartRect.left + cartRect.width / 2 - 10}px`;
      img.style.top = `${cartRect.top + cartRect.height / 2 - 10}px`;
      img.style.width = "20px";
      img.style.height = "20px";
      img.style.opacity = "0";
      img.style.transform = "scale(0.3)";

      setTimeout(() => {
        img.remove();
        cartIcon.classList.add("cart-bounce");
        setTimeout(() => cartIcon.classList.remove("cart-bounce"), 400);
      }, 800);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-5 text-center">
        <h2 className="text-danger">Oops!</h2>
        <p className="text-muted">{error || "Product not found"}</p>
        <button className="btn btn-outline-primary mt-3" onClick={() => navigate("/")}>
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <button 
        className="btn btn-light mb-4 shadow-sm fw-bold d-flex align-items-center gap-2 px-4 py-2"
        onClick={() => navigate("/")}
        style={{ borderRadius: "20px", color: "#444" }}
      >
        <i className="bi bi-arrow-left"></i> Back to Products
      </button>

      <div className="row g-5 align-items-center">
        {/* Left Side: Product Image */}
        <div className="col-lg-6 text-center">
          <div className="position-relative overflow-hidden rounded-4 shadow-sm" style={{ backgroundColor: "#f9f9f9" }}>
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="img-fluid w-100" 
              style={{ objectFit: "contain", maxHeight: "500px", padding: "2rem" }}
            />
          </div>
        </div>

        {/* Right Side: Product Information */}
        <div className="col-lg-6">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge bg-secondary px-3 py-2 text-uppercase fw-semibold shadow-sm" style={{ letterSpacing: "1px" }}>
              {product.brand}
            </span>
          </div>

          <h1 className="fw-bold display-5 mb-3 text-dark">{product.name}</h1>
          <h2 className="fw-bold mb-4" style={{ color: "#ff6a00", fontSize: "2.5rem" }}>
            ₹{product.price}
          </h2>

          <div className="bg-light rounded-4 p-4 mb-4 border" style={{ borderColor: "#eee" }}>
            <h5 className="fw-bold text-dark mb-3 border-bottom pb-2">Description</h5>
            <p className="text-muted fs-5 mb-0 lh-lg" style={{ textAlign: "justify" }}>
              {product.description || "A premium quality product brought to you exclusively by SmartCart. Discover the perfect blend of style, functionality, and performance."}
            </p>
          </div>

          <div className="d-flex align-items-center gap-3 mb-4">
            <i className="bi bi-geo-alt-fill text-muted fs-4"></i>
            <span className="text-muted fw-medium fs-5">Location: <span className="text-dark fw-bold">{product.address}</span></span>
          </div>

          <div className="mt-5">
            {qty === 0 ? (
              <button 
                className="btn btn-lg w-100 rounded-pill shadow d-flex justify-content-center align-items-center gap-3 fw-bold pb-2 pt-2 text-white"
                style={{ backgroundColor: "#ff6a00", border: "none", fontSize: "1.2rem" }}
                onClick={(e) => handleAddToCart(e, product)}
              >
                <i className="bi bi-cart-plus-fill fs-3"></i> 
                Add to Cart
              </button>
            ) : (
              <div className="d-flex justify-content-between align-items-center bg-light rounded-pill p-2 shadow-sm border" style={{ borderColor: "#ff6a00", maxWidth: "400px" }}>
                <button
                  className="btn d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: "50px", height: "50px", background: "#ff6a00", color: "white" }}
                  onClick={() => decreaseQty(product.id)}
                >
                  <i className="bi bi-dash fs-4 fw-bold"></i>
                </button>
                <span className="fw-bold text-dark mx-4" style={{ fontSize: "1.5rem" }}>{qty} <span className="fs-6 text-muted ms-1">in cart</span></span>
                <button
                  className="btn d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: "50px", height: "50px", background: "#ff6a00", color: "white" }}
                  onClick={() => increaseQty(product.id)}
                >
                  <i className="bi bi-plus fs-4 fw-bold"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
