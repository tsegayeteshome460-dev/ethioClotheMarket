
import { useState } from "react";

export default function ProductCard({ product }) {
  const [added, setAdded] = useState(false);
  const [favorite, setFavorite] = useState(false);

  function addToCart() {
    const cart = JSON.parse(localStorage.getItem("ethio-cart") || "[]");
    const existing = cart.find((item) => item.id === product.id);

    const updated = existing
      ? cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      : [...cart, { ...product, quantity: 1 }];

    localStorage.setItem("ethio-cart", JSON.stringify(updated));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className="product-badge">{product.badge}</span>
        <button
          className={favorite ? "favorite active" : "favorite"}
          onClick={() => setFavorite(!favorite)}
          aria-label="Toggle favorite"
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3>{product.name}</h3>
        <div className="product-rating">
          <span>★★★★★</span>
          <small>(New collection)</small>
        </div>
        <div className="product-bottom">
          <strong>{product.price.toLocaleString()} ETB</strong>
          <button onClick={addToCart} className="add-cart">
            {added ? "✓ Added" : "+ Add"}
          </button>
        </div>
      </div>
    </article>
  );
}
