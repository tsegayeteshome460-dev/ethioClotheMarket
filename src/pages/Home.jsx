
import ProductCard from "../components/ProductCard";

const categories = [
  {
    name: "Habesha Kemis",
    image:
      "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=600&q=85",
  },
  {
    name: "Men's Traditional",
    image:
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=600&q=85",
  },
  {
    name: "Modern Fashion",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=85",
  },
  {
    name: "Accessories",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=600&q=85",
  },
];

const products = [
  {
    id: 1,
    name: "Elegant Habesha Dress",
    category: "Habesha Kemis",
    price: 2500,
    image:
      "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=600&q=85",
    badge: "Bestseller",
  },
  {
    id: 2,
    name: "Classic Men's Outfit",
    category: "Men's Traditional",
    price: 1800,
    image:
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=600&q=85",
    badge: "Popular",
  },
  {
    id: 3,
    name: "Modern Fashion Dress",
    category: "Modern Fashion",
    price: 1600,
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=85",
    badge: "New",
  },
  {
    id: 4,
    name: "Fashion Accessories",
    category: "Accessories",
    price: 750,
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=600&q=85",
    badge: "Featured",
  },
];

export default function Home() {
  return (
    <main>
      <section className="hero" id="home">
        <div className="hero-content">
          <span className="eyebrow">MADE WITH ETHIOPIAN PRIDE</span>
          <h1>
            Discover the Beauty of{" "}
            <span>Ethiopian Culture.</span>
          </h1>
          <p>
            Celebrate tradition and modern style with clothing
            inspired by the beauty, artistry, and heritage of Ethiopia.
          </p>
          <a className="primary-btn" href="#shop">
            Explore Collection <span>→</span>
          </a>

          <div className="hero-note">
            <span>✦ Authentic style</span>
            <span>✦ Carefully selected</span>
          </div>
        </div>

        <div className="hero-image">
          <img
            src={categories[0].image}
            alt="Fashion collection inspiration"
          />
          <div className="image-caption">
            <span>ETHIOPIAN COLLECTION</span>
            <strong>Tradition meets elegance.</strong>
          </div>
        </div>
      </section>

      <section className="benefits">
        <div><span>✧</span><p><strong>Unique Styles</strong><small>Celebrate culture</small></p></div>
        <div><span>↗</span><p><strong>Easy Shopping</strong><small>Simple and convenient</small></p></div>
        <div><span>◇</span><p><strong>Secure Checkout</strong><small>Safer transactions</small></p></div>
        <div><span>♡</span><p><strong>Friendly Support</strong><small>We're here to help</small></p></div>
      </section>

      <section className="section" id="categories">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FIND YOUR STYLE</span>
            <h2>Shop by Category</h2>
          </div>
          <a className="text-link" href="#shop">Explore all →</a>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <a
              className="category-card"
              href="#shop"
              key={category.name}
            >
              <img src={category.image} alt={category.name} />
              <div className="category-label">
                <strong>{category.name}</strong>
                <span>Discover →</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="section products-section" id="shop">
        <div className="section-heading">
          <div>
            <span className="eyebrow">SELECTED FOR YOU</span>
            <h2>Featured Collection</h2>
            <p className="section-description">
              Find something special for every occasion.
            </p>
          </div>
          <span className="collection-count">04 COLLECTIONS</span>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="culture-banner" id="about">
        <div>
          <span className="eyebrow">OUR CULTURE, OUR PRIDE</span>
          <h2>Wear your heritage.<br />Express your style.</h2>
          <p>
            Discover clothing that brings together Ethiopian
            tradition and contemporary fashion.
          </p>
          <a className="light-btn" href="#categories">
            Find Your Style →
          </a>
        </div>
        <div className="culture-symbol" aria-hidden="true">✳</div>
      </section>

      <section className="contact-strip" id="contact">
        <div>
          <span className="eyebrow">LET'S CONNECT</span>
          <h2>Find your next favorite outfit.</h2>
        </div>
        <a className="primary-btn" href="mailto:hello@ethioclothes.example">
          Contact Us →
        </a>
      </section>
    </main>
  );
}
