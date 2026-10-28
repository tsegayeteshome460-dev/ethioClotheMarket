import { useEffect, useMemo, useState } from "react";
import { apiRequest, toStoreOrder, toStoreProduct } from "./services/api";
import "./App.css";

const sizes = ["S", "M", "L", "XL", "XXL"];
const sampleProducts = [
  { id: 1, name: "White Habesha Kemis", category: "Habesha Kemis", price: 1500, image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d3/Ethfashmod5.jpg/1280px-Ethfashmod5.jpg", badge: "Bestseller", description: "A graceful white Habesha kemis with colorful embroidered tibeb, made for celebrations and meaningful occasions.", sizes },
  { id: 2, name: "Men's Traditional Shirt", category: "Men's Traditional", price: 1200, image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=85", badge: "Handwoven", description: "An easy-to-wear traditional shirt with a crisp finish and Ethiopian-inspired detailing.", sizes },
  { id: 3, name: "Modern Embroidered Dress", category: "Women's Fashion", price: 1800, image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85", badge: "New", description: "A contemporary silhouette with carefully chosen details for a distinctive day-to-evening look.", sizes },
  { id: 4, name: "Traditional Leather Bag", category: "Accessories", price: 1000, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85", badge: "Popular", description: "A versatile everyday bag with a warm, artisanal look and thoughtful finishing." },
  { id: 5, name: "Ethiopian Tibeb Shawl", category: "Accessories", price: 600, image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=900&q=85", badge: "Handwoven", description: "A beautiful finishing layer inspired by the color and craftsmanship of Ethiopian textiles." },
  { id: 6, name: "Traditional Men's Jacket", category: "Men's Traditional", price: 1400, image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85", badge: "New", description: "A polished traditional-inspired jacket designed to bring cultural character to special occasions.", sizes },
  { id: 7, name: "Gold Tone Necklace", category: "Accessories", price: 850, image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85", badge: "Popular", description: "A striking accessory with a warm gold finish that complements both traditional and modern outfits." },
  { id: 8, name: "Children's Celebration Dress", category: "Children's Clothes", price: 1100, image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=85", badge: "Made with care", description: "A comfortable celebration outfit for little ones, with cheerful details inspired by Ethiopian heritage.", sizes: ["S", "M", "L"] },
];

const categories = ["All Products", "Habesha Kemis", "Men's Traditional", "Women's Fashion", "Accessories", "Children's Clothes"];
const currency = (amount) => `ETB ${amount.toLocaleString()}`;
const authStorageKey = "ethio-auth";

function loadSavedAuth() {
  const savedAuth = localStorage.getItem(authStorageKey) || sessionStorage.getItem(authStorageKey);
  if (!savedAuth) return null;

  try {
    const auth = JSON.parse(savedAuth);
    return auth?.token && auth?.user?.name ? auth : null;
  } catch {
    localStorage.removeItem(authStorageKey);
    sessionStorage.removeItem(authStorageKey);
    return null;
  }
}

function loadSavedValue(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

export default function App() {
  const [page, setPage] = useState("Home");
  const [category, setCategory] = useState("All Products");
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("Featured");
  const [cart, setCart] = useState(() => loadSavedValue("ethio-cart", []));
  const [favorites, setFavorites] = useState(() => loadSavedValue("ethio-favorites", []));
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [catalogVersion, setCatalogVersion] = useState(0);
  const [orders, setOrders] = useState([]);
  const [ordersError, setOrdersError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("M");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [lastOrder, setLastOrder] = useState(null);
  const [auth, setAuth] = useState(loadSavedAuth);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [checkout, setCheckout] = useState({ name: "", phone: "", address: "", city: "Addis Ababa", payment: "Cash on Delivery" });

  useEffect(() => {
    let active = true;
    apiRequest("/api/products")
      .then((result) => {
        if (active) setProducts(result.map(toStoreProduct));
      })
      .catch((error) => {
        if (active) setProductsError(error.message);
      })
      .finally(() => {
        if (active) setProductsLoading(false);
      });
    return () => { active = false; };
  }, [catalogVersion]);

  useEffect(() => {
    localStorage.setItem("ethio-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("ethio-favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (!auth?.token || page !== "Dashboard") return undefined;
    let active = true;
    apiRequest("/api/orders", { token: auth.token })
      .then((result) => {
        if (active) {
          setOrders(result.map(toStoreOrder));
          setOrdersError("");
        }
      })
      .catch((error) => {
        if (active) setOrdersError(error.message);
      });
    return () => { active = false; };
  }, [auth, page]);

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesCategory = category === "All Products" || product.category === category;
      const matchesSearch = `${product.name} ${product.category}`.toLowerCase().includes(query.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });
    if (sort === "Price: Low to High") return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "Price: High to Low") return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [products, category, query, sort]);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function navigate(next) {
    setPage(next);
    setMenuOpen(false);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openShop(nextCategory = "All Products") {
    setCategory(nextCategory);
    setQuery("");
    navigate("Shop");
  }

  function addToCart(product, size) {
    const itemSize = size || (product.sizes
      ? product.sizes.includes(selectedSize) ? selectedSize : "M"
      : "One size");
    const existing = cart.find((item) => item.id === product.id && item.size === itemSize);
    if (product.stock < (existing?.quantity || 0) + 1) {
      setNotice(product.stock > 0 ? `Only ${product.stock} ${product.name} available.` : `${product.name} is out of stock.`);
      return;
    }
    setCart((current) => {
      const existingItem = current.find((item) => item.id === product.id && item.size === itemSize);
      return existingItem
        ? current.map((item) => item.id === product.id && item.size === itemSize ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { ...product, size: itemSize, quantity: 1 }];
    });
    setNotice(`${product.name} added to your cart`);
  }

  function updateQuantity(productId, size, amount) {
    const item = cart.find((entry) => entry.id === productId && entry.size === size);
    const product = products.find((entry) => entry.id === productId);
    if (amount > 0 && item && product && item.quantity >= product.stock) {
      setNotice(`Only ${product.stock} ${product.name} available.`);
      return;
    }
    setCart((current) => current
      .map((item) => item.id === productId && item.size === size ? { ...item, quantity: item.quantity + amount } : item)
      .filter((item) => item.quantity > 0));
  }

  function toggleFavorite(productId) {
    setFavorites((current) => current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId]);
  }

  function showProduct(product) {
    setSelectedProduct(product);
    setSelectedSize(product.sizes ? "M" : "One size");
    navigate("Product");
  }

  function completeLogin(nextAuth, remember) {
    const storage = remember ? localStorage : sessionStorage;
    const otherStorage = remember ? sessionStorage : localStorage;
    otherStorage.removeItem(authStorageKey);
    storage.setItem(authStorageKey, JSON.stringify(nextAuth));
    setAuth(nextAuth);
    setCheckout((current) => ({
      ...current,
      name: nextAuth.user.name || current.name,
      phone: nextAuth.user.phone || current.phone,
    }));
    navigate("Dashboard");
    setNotice(`Welcome, ${nextAuth.user.name}.`);
  }

  function logout() {
    localStorage.removeItem(authStorageKey);
    sessionStorage.removeItem(authStorageKey);
    setAuth(null);
    navigate("Home");
    setNotice("You have been signed out.");
  }

  async function placeOrder(event) {
    event.preventDefault();
    if (cart.length === 0) return;
    if (!auth?.token) {
      navigate("Login");
      setNotice("Sign in before placing an order.");
      return;
    }
    setOrderSubmitting(true);
    setOrderError("");
    try {
      const serverOrder = await apiRequest("/api/orders", {
        method: "POST",
        token: auth.token,
        body: JSON.stringify({
          items: cart.map((item) => ({ productId: String(item.id), quantity: item.quantity, size: item.size })),
          phone: checkout.phone,
          deliveryAddress: `${checkout.address}, ${checkout.city}`,
          customerName: checkout.name,
        }),
      });
      const order = toStoreOrder(serverOrder);
      setLastOrder(order);
      setOrders((current) => [order, ...current]);
      setCart([]);
      navigate("Tracking");
      setNotice("Your order was placed. Payment is not processed online.");
    } catch (error) {
      setOrderError(error.message);
    } finally {
      setOrderSubmitting(false);
    }
  }

  return (
    <div className="store">
      <header className="topbar">
        <button className="brand" onClick={() => navigate("Home")} aria-label="Ethio Clothes Market home">
          <span className="logo">✿</span>
          <span>Ethio<small>Clothes Market</small></span>
        </button>
        <button className="mobile-menu" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "×" : "☰"}</button>
        <nav className={menuOpen ? "navigation show" : "navigation"} aria-label="Main navigation">
          {["Home", "Shop", "Categories", "About", "Contact"].map((item) => (
            <button key={item} className={(page === item || (item === "Shop" && page === "Product")) ? "nav-current" : ""} onClick={() => item === "Categories" ? openShop() : navigate(item)}>{item}</button>
          ))}
        </nav>
        <div className="nav-actions">
          <button aria-label="Search products" onClick={() => openShop()}>⌕</button>
          <button aria-label="Wishlist" onClick={() => navigate("Wishlist")}>♡</button>
          <button className="cart-action" aria-label={`Shopping cart, ${itemCount} items`} onClick={() => navigate("Cart")}>♧<b>{itemCount}</b></button>
          <button aria-label={auth ? `My account: ${auth.user.name}` : "My account"} onClick={() => navigate(auth ? "Dashboard" : "Login")}>♙</button>
        </div>
      </header>

      {notice && <div className="notice" role="status">{notice}<button aria-label="Dismiss notice" onClick={() => setNotice("")}>×</button></div>}
      {productsError && <div className="catalog-alert" role="alert">{productsError}<button onClick={() => setCatalogVersion((version) => version + 1)}>Try again</button></div>}

      {page === "Home" && <HomePage products={products} loading={productsLoading} onNavigate={navigate} onShop={openShop} onProduct={showProduct} onAdd={addToCart} favorites={favorites} onFavorite={toggleFavorite} />}
      {page === "Shop" && <ShopPage products={visibleProducts} loading={productsLoading} category={category} onCategory={setCategory} selectedSizes={selectedSizes} onSizes={setSelectedSizes} query={query} onQuery={setQuery} sort={sort} onSort={setSort} onProduct={showProduct} onAdd={addToCart} favorites={favorites} onFavorite={toggleFavorite} />}
      {page === "Product" && selectedProduct && <ProductPage product={selectedProduct} selectedSize={selectedSize} onSize={setSelectedSize} onAdd={addToCart} onBack={() => navigate("Shop")} />}
      {page === "Cart" && <CartPage cart={cart} total={total} onQuantity={updateQuantity} onCheckout={() => {
        if (!auth?.token) {
          navigate("Login");
          setNotice("Sign in before checkout.");
          return;
        }
        navigate("Checkout");
      }} onShop={() => openShop()} />}
      {page === "Checkout" && <CheckoutPage cart={cart} total={total} checkout={checkout} onChange={setCheckout} onSubmit={placeOrder} submitting={orderSubmitting} error={orderError} onBack={() => navigate("Cart")} />}
      {page === "Tracking" && <TrackingPage order={lastOrder} onShop={() => openShop()} />}
      {page === "Dashboard" && (auth
        ? <DashboardPage orders={orders} ordersError={ordersError} user={auth.user} onNavigate={navigate} onTrackOrder={(order) => { setLastOrder(order); navigate("Tracking"); }} onLogout={logout} />
        : <AuthRequired onLogin={() => navigate("Login")} />)}
      {page === "Wishlist" && <WishlistPage products={products} favorites={favorites} onProduct={showProduct} onAdd={addToCart} onFavorite={toggleFavorite} onShop={() => openShop()} />}
      {page === "Settings" && <SettingsPage onSave={() => setNotice("Your settings were saved for this demo session.")} />}
      {page === "Admin" && (auth?.user?.role === "admin"
        ? <AdminPage products={products} onProduct={showProduct} onRefresh={() => setCatalogVersion((version) => version + 1)} token={auth.token} />
        : <AuthRequired onLogin={() => navigate(auth ? "Dashboard" : "Login")} />)}
      {page === "Login" && <AuthPage mode="Login" onSwitch={() => navigate("Register")} onAuthenticated={completeLogin} />}
      {page === "Register" && <AuthPage mode="Register" onSwitch={() => navigate("Login")} onAuthenticated={completeLogin} />}
      {page === "About" && <AboutPage onShop={() => openShop()} />}
      {page === "Contact" && <ContactPage />}

      <Footer onNavigate={navigate} onShop={openShop} />
      <nav className="mobile-tabs" aria-label="Mobile navigation">
        <button onClick={() => navigate("Home")}><span>⌂</span>Home</button>
        <button onClick={() => openShop()}><span>▦</span>Shop</button>
        <button onClick={() => navigate("Wishlist")}><span>♡</span>Saved</button>
        <button onClick={() => navigate("Dashboard")}><span>♙</span>Profile</button>
      </nav>
    </div>
  );
}

function HomePage({ products, loading, onNavigate, onShop, onProduct, onAdd, favorites, onFavorite }) {
  const featured = products.slice(0, 4);
  const categoryProducts = [
    {
      name: "Habesha Kemis",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85",
    },
    { name: "Men's Traditional", image: sampleProducts[5].image },
    {
      name: "Modern Dress",
      image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=85",
    },
    { name: "Accessories", image: sampleProducts[6].image },
  ];
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">OUR CULTURE · OUR PRIDE</span>
          <h1>Discover the Beauty of <em>Ethiopian Culture.</em></h1>
          <p>Traditional and modern Ethiopian clothes, thoughtfully selected for every occasion.</p>
          <button className="primary" onClick={() => onShop()}>Shop Now <span>→</span></button>
        </div>
        <div className="hero-image">
          <img src={sampleProducts[0].image} alt="Ethiopian model wearing a traditional white dress and netela shawl at a fashion show" />
          <div className="hero-label"><small>WEAR YOUR CULTURE</small><strong>With pride.</strong></div>
          <a className="photo-credit" href="https://commons.wikimedia.org/wiki/File:Ethfashmod5.jpg" target="_blank" rel="noreferrer">Photo: schipul · CC BY-SA 2.0</a>
        </div>
      </section>

      <section className="benefits" aria-label="Shopping benefits">
        <div><span>✿</span><p><b>Authentic style</b><small>Ethiopian designs</small></p></div>
        <div><span>↗</span><p><b>Fast &amp; safe</b><small>Reliable delivery</small></p></div>
        <div><span>◇</span><p><b>Secure payment</b><small>Checkout with confidence</small></p></div>
        <div><span>♡</span><p><b>Here to help</b><small>Friendly customer support</small></p></div>
      </section>

      <section className="section">
        <SectionHeading eyebrow="FIND YOUR STYLE" title="Shop by Category" action="View all →" onAction={() => onShop()} />
        <div className="category-grid">
          {categoryProducts.map(({ name, image }) => (
            <button className="category-card" key={name} onClick={() => onShop(name === "Modern Dress" ? "Women's Fashion" : name)}>
              <img src={image} alt={name} /><span>{name}</span><small>Explore collection →</small>
            </button>
          ))}
        </div>
      </section>

      <section className="section product-section">
        <SectionHeading eyebrow="HANDPICKED FOR YOU" title="Featured Products" description="Thoughtful details. Timeless Ethiopian style." action="Shop all →" onAction={() => onShop()} />
        {loading && <p className="muted-copy" role="status">Loading products…</p>}
        <ProductGrid products={featured} onProduct={onProduct} onAdd={onAdd} favorites={favorites} onFavorite={onFavorite} />
      </section>

      <section className="culture-banner">
        <div><small>CELEBRATE YOUR HERITAGE</small><h2>Wear your culture.<br />Express your style.</h2><p>Discover fashion inspired by tradition, craftsmanship, and the beauty of Ethiopia.</p><button className="light-button" onClick={() => onShop()}>Explore the collection →</button></div>
        <span className="big-flower" aria-hidden="true">✳</span>
      </section>

      <section className="newsletter-strip">
        <div><span className="eyebrow">STAY IN THE LOOP</span><h2>Stories, style, and new arrivals.</h2></div>
        <button className="outline-button" onClick={() => onNavigate("Contact")}>Get in touch →</button>
      </section>
    </main>
  );
}

function SectionHeading({ eyebrow, title, description, action, onAction }) {
  return (
    <div className="section-title">
      <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{description && <p>{description}</p>}</div>
      {action && <button className="text-button" onClick={onAction}>{action}</button>}
    </div>
  );
}

function ProductGrid({ products: list, onProduct, onAdd, favorites, onFavorite }) {
  if (!list.length) return <div className="no-results"><span>⌕</span><h3>No products found</h3><p>Try another search or category.</p></div>;
  return (
    <div className="product-grid">
      {list.map((product) => (
        <article className="product-card" key={product.id}>
          <div className="product-image">
            <button className="image-open" aria-label={`View ${product.name}`} onClick={() => onProduct(product)}><img src={product.image} alt={product.name} /></button>
            <span className="product-badge">{product.badge}</span>
            <button className={`favorite ${favorites.includes(product.id) ? "active" : ""}`} aria-label={favorites.includes(product.id) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`} onClick={() => onFavorite(product.id)}>{favorites.includes(product.id) ? "♥" : "♡"}</button>
          </div>
          <div className="product-info">
            <small>{product.category}</small>
            <button className="product-name" onClick={() => onProduct(product)}>{product.name}</button>
            <div className="rating"><span>★★★★★</span><small> (4.8) · 12 reviews</small></div>
            <div className="product-bottom"><b>{currency(product.price)}</b><button disabled={product.stock < 1} onClick={() => onAdd(product, "M")}>{product.stock < 1 ? "Out of stock" : "Add to Cart"}</button></div>
          </div>
        </article>
      ))}
    </div>
  );
}

function ShopPage({ products: list, loading, category, onCategory, selectedSizes, onSizes, query, onQuery, sort, onSort, onProduct, onAdd, favorites, onFavorite }) {
  const [maxPrice, setMaxPrice] = useState(15000);
  const priceFiltered = list.filter((product) => product.price <= maxPrice
    && (!selectedSizes.length || selectedSizes.some((size) => product.sizes?.includes(size))));
  function toggleSize(size) {
    onSizes((current) => current.includes(size)
      ? current.filter((item) => item !== size)
      : [...current, size]);
  }
  return (
    <main className="shop-layout section">
      <aside className="filters-panel">
        <h2>Categories</h2>
        <div className="side-filters">
          {categories.map((item) => <button className={category === item ? "side-filter active" : "side-filter"} key={item} onClick={() => onCategory(item)}><span>{category === item ? "●" : "○"}</span>{item}</button>)}
        </div>
        <div className="filter-group"><h3>Price range</h3><input aria-label="Maximum price" type="range" min="500" max="15000" step="500" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} /><div className="range-labels"><span>ETB 0</span><span>{currency(maxPrice)}</span></div></div>
        <div className="filter-group"><h3>Size</h3><div className="size-filters">{sizes.map((size) => <button className={selectedSizes.includes(size) ? "selected" : ""} aria-pressed={selectedSizes.includes(size)} key={size} onClick={() => toggleSize(size)}>{size}</button>)}</div></div>
        <p className="filter-note">Browse authentic styles for every occasion.</p>
      </aside>
      <div className="shop-content">
        <div className="shop-heading"><div><span className="eyebrow">ETHIO CLOTHES MARKET</span><h1>Our Products</h1><p>Find your next favorite piece.</p></div><label className="sort-label">Sort by<select value={sort} onChange={(event) => onSort(event.target.value)}><option>Featured</option><option>Price: Low to High</option><option>Price: High to Low</option></select></label></div>
        <div className="catalog-toolbar"><label className="catalog-search"><span>⌕</span><input aria-label="Search products" value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search products..." /></label><span>{priceFiltered.length} products</span></div>
        {loading && <p className="muted-copy" role="status">Loading products…</p>}
        <ProductGrid products={priceFiltered} onProduct={onProduct} onAdd={onAdd} favorites={favorites} onFavorite={onFavorite} />
      </div>
    </main>
  );
}

function ProductPage({ product, selectedSize, onSize, onAdd, onBack }) {
  const [quantity, setQuantity] = useState(1);
  const availableSizes = product.sizes || ["One size"];
  return (
    <main className="section product-detail">
      <div className="breadcrumbs"><button onClick={onBack}>Shop</button><span>›</span><span>{product.category}</span><span>›</span><span>{product.name}</span></div>
      <div className="detail-layout">
        <div className="detail-gallery"><img src={product.image} alt={product.name} /><div className="thumbnail-row"><img src={product.image} alt="" /><img src={product.image} alt="" /><img src={product.image} alt="" /></div></div>
        <div className="detail-info"><span className="eyebrow">{product.category}</span><h1>{product.name}</h1><div className="rating detail-rating"><span>★★★★★</span><small> 4.8 · 12 reviews</small></div><strong className="detail-price">{currency(product.price)}</strong><p>{product.description}</p><div className="detail-points"><span>✓ Authentic design</span><span>✓ Quality checked</span><span>↗ Delivery available</span></div><div className="size-select"><div><b>{product.sizes ? "Select size" : "Size"}</b>{product.sizes && <button type="button">Size guide</button>}</div><div className="size-options">{availableSizes.map((size) => <button className={selectedSize === size ? "selected" : ""} key={size} onClick={() => onSize(size)}>{size}</button>)}</div></div><div className="detail-buy"><div className="quantity-control"><button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><span>{quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity(quantity + 1)}>+</button></div><button className="primary" onClick={() => Array.from({ length: quantity }).forEach(() => onAdd(product, selectedSize))}>Add to Cart</button></div><button className="buy-now" onClick={onBack}>Continue browsing</button></div>
      </div>
      <section className="detail-description"><span className="eyebrow">MADE WITH MEANING</span><h2>Details that tell a story</h2><p>{product.description} Designed to celebrate Ethiopian heritage with a comfortable fit and lasting quality.</p></section>
    </main>
  );
}

function CartPage({ cart, total, onQuantity, onCheckout, onShop }) {
  return (
    <main className="section account-page">
      <span className="eyebrow">YOUR SHOPPING BAG</span><h1 className="page-title">Your Cart <small>({cart.reduce((count, item) => count + item.quantity, 0)} items)</small></h1>
      {cart.length === 0 ? <div className="empty"><span>♧</span><h2>Your cart is waiting</h2><p>Explore our collection and add something you love.</p><button className="primary" onClick={onShop}>Browse products →</button></div> : (
        <div className="cart-layout">
          <div className="cart-list"><div className="cart-list-head"><span>Product</span><span>Subtotal</span></div>{cart.map((item) => <div className="cart-item" key={`${item.id}-${item.size}`}><div className="cart-thumb"><img src={item.image} alt={item.name} /></div><div className="cart-item-info"><b>{item.name}</b><small>Size: {item.size}</small><span>{currency(item.price)}</span><div className="quantity-control"><button aria-label="Decrease quantity" onClick={() => onQuantity(item.id, item.size, -1)}>−</button><span>{item.quantity}</span><button aria-label="Increase quantity" onClick={() => onQuantity(item.id, item.size, 1)}>+</button></div></div><b className="cart-line-total">{currency(item.price * item.quantity)}</b></div>)}<button className="continue-link" onClick={onShop}>← Continue shopping</button></div>
          <OrderSummary total={total} actionLabel="Proceed to Checkout" onAction={onCheckout} />
        </div>
      )}
    </main>
  );
}

function OrderSummary({ total, actionLabel, onAction }) {
  return <aside className="summary"><h2>Order Summary</h2><p><span>Subtotal</span><b>{currency(total)}</b></p><p><span>Delivery</span><b className="free-delivery">Calculated at checkout</b></p><hr /><h3><span>Total</span><b>{currency(total)}</b></h3><button className="primary full" onClick={onAction}>{actionLabel} →</button><small className="secure-note">◇ Secure checkout · Payment on delivery available</small></aside>;
}

function CheckoutPage({ cart, total, checkout, onChange, onSubmit, submitting, error, onBack }) {
  if (!cart.length) return <main className="section account-page"><div className="empty"><h2>Your cart is empty</h2><p>Add a product before checkout.</p><button className="primary" onClick={onBack}>Return to cart</button></div></main>;
  return (
    <main className="section account-page">
      <div className="checkout-heading"><div><span className="eyebrow">ALMOST YOURS</span><h1 className="page-title">Checkout</h1></div><span className="checkout-steps"><b>1</b> Shipping <i>—</i> <b>2</b> Payment <i>—</i> <span>3</span> Review</span></div>
      <form className="checkout-layout" onSubmit={onSubmit}>
        <div className="checkout-form">
          <section className="form-card"><h2><span>1</span> Shipping Information</h2><div className="form-grid"><label>Full name<input required minLength="2" value={checkout.name} onChange={(event) => onChange({ ...checkout, name: event.target.value })} placeholder="Your full name" /></label><label>Phone number<input required type="tel" value={checkout.phone} onChange={(event) => onChange({ ...checkout, phone: event.target.value })} placeholder="+251 9XX XXX XXX" /></label><label className="wide-field">Delivery address<input required minLength="5" value={checkout.address} onChange={(event) => onChange({ ...checkout, address: event.target.value })} placeholder="Street, area, house number" /></label><label>City<input required value={checkout.city} onChange={(event) => onChange({ ...checkout, city: event.target.value })} /></label><label>Postal code<input placeholder="Optional" /></label></div></section>
          <section className="form-card"><h2><span>2</span> Payment Method</h2><label className="payment-option"><input type="radio" name="payment" checked readOnly /><span><b>Cash on Delivery</b><small>Pay when your order arrives</small></span><i>✓</i></label><p className="demo-disclaimer">Online payments are not enabled. Your order will be saved as unpaid.</p></section>
        </div>
        <div className="checkout-side"><div className="summary"><h2>Your Order <small>({cart.reduce((count, item) => count + item.quantity, 0)} items)</small></h2>{cart.map((item) => <div className="checkout-item" key={`${item.id}-${item.size}`}><img src={item.image} alt="" /><span>{item.name}<small>Size {item.size} × {item.quantity}</small></span><b>{currency(item.price * item.quantity)}</b></div>)}<hr /><p><span>Subtotal</span><b>{currency(total)}</b></p><p><span>Delivery</span><b>Calculated later</b></p><hr /><h3><span>Total</span><b>{currency(total)}</b></h3><button className="primary full" type="submit" disabled={submitting}>{submitting ? "Placing order…" : "Place Order"}</button>{error && <p className="form-message error" role="alert">{error}</p>}<small className="secure-note">◇ Your order is submitted securely to the store.</small></div><button className="continue-link" type="button" onClick={onBack}>← Return to cart</button></div>
      </form>
    </main>
  );
}

function TrackingPage({ order, onShop }) {
  if (!order) return <main className="section account-page"><div className="empty"><span>↗</span><h2>No recent order</h2><p>Your recently placed order will appear here.</p><button className="primary" onClick={onShop}>Explore the shop</button></div></main>;
  const stages = ["pending", "processing", "shipped", "delivered"];
  const currentStage = stages.indexOf(order.status);
  const labels = ["Order confirmed", "Preparing", "Out for delivery", "Delivered"];
  return <main className="section account-page tracking-page"><span className="eyebrow">ORDER TRACKING</span><h1 className="page-title">Order status: {order.status}</h1><p className="tracking-intro">Order <b>#{order.id}</b> · {order.date}</p><div className="tracking-layout"><section className="tracking-card"><div className="tracking-progress">{labels.map((step, index) => <div className={`tracking-step ${index <= currentStage ? "complete" : ""}`} key={step}><span>{index <= currentStage ? "✓" : index + 1}</span><b>{step}</b><small>{index === currentStage ? order.date : index < currentStage ? "Complete" : "Pending"}</small></div>)}</div><h2>Items in your order</h2>{order.items.map((item) => <div className="checkout-item" key={`${item.id}-${item.size}`}><img src={item.image} alt="" /><span>{item.name}<small>Quantity: {item.quantity}</small></span><b>{currency(item.price * item.quantity)}</b></div>)}</section><aside className="summary"><h2>Delivery Details</h2><p><span>Name</span><b>{order.customerName}</b></p><p><span>Phone</span><b>{order.phone}</b></p><p><span>Address</span><b>{order.address}</b></p><hr /><h3><span>Order total</span><b>{currency(order.total)}</b></h3></aside></div></main>;
}

function DashboardPage({ orders, ordersError, user, onNavigate, onTrackOrder, onLogout }) {
  const name = user?.name || "Customer";
  const firstName = name.split(/\s+/)[0];
  const recentOrder = orders[0];
  return (
    <main className="section dashboard-layout">
      <aside className="account-sidebar"><div className="account-avatar">{name.charAt(0).toUpperCase()}</div><b>Welcome, {firstName}!</b><small>{user?.role === "admin" ? "Administrator account" : "Customer account"}</small>{["Overview", "My Orders", "Wishlist", "Profile", "Settings"].map((item) => <button className={item === "Overview" ? "active" : ""} key={item} onClick={() => item === "Wishlist" ? onNavigate("Wishlist") : item === "Settings" || item === "Profile" ? onNavigate("Settings") : item === "My Orders" && order ? onNavigate("Tracking") : onNavigate("Dashboard")}>{item}</button>)}<button onClick={onLogout}>Logout</button></aside>
      <div className="dashboard-content"><span className="eyebrow">YOUR ACCOUNT</span><h1 className="page-title">Hello, {firstName}!</h1><p className="muted-copy">Here’s what’s happening with your account today.</p><div className="metric-grid"><Metric label="Total Orders" value={orders.length} tone="green" /><Metric label="Pending" value={orders.filter((order) => order.status === "pending").length} tone="orange" /><Metric label="Delivered" value={orders.filter((order) => order.status === "delivered").length} tone="blue" /><Metric label="Wishlist" value={loadSavedValue("ethio-favorites", []).length} tone="purple" /></div><section className="dashboard-card"><div className="card-heading"><h2>Recent Orders</h2><button onClick={() => recentOrder ? onTrackOrder(recentOrder) : onNavigate("Shop")}>View all →</button></div>{ordersError && <p className="form-message error" role="alert">{ordersError}</p>}{recentOrder ? orders.slice(0, 5).map((order) => <div className="order-row" key={order.id}><b>#{order.id}</b><span>{currency(order.total)}</span><span className="status-pill pending">{order.status}</span><span>{order.date}</span><button onClick={() => onTrackOrder(order)}>Track order</button></div>) : <div className="dashboard-empty">No orders yet. <button onClick={() => onNavigate("Shop")}>Start shopping →</button></div>}</section><section className="dashboard-card profile-card"><div><span className="eyebrow">PROFILE</span><h2>{name}</h2>{user?.email && <p>{user.email}</p>}{user?.phone && <p>{user.phone}</p>}</div><button className="outline-button" onClick={() => onNavigate("Settings")}>Edit Profile</button></section></div>
    </main>
  );
}

function Metric({ label, value, tone }) {
  return <div className={`metric-card ${tone}`}><span>{label}</span><b>{value}</b><small>Updated just now</small></div>;
}

function WishlistPage({ products, favorites, onProduct, onAdd, onFavorite, onShop }) {
  const saved = products.filter((product) => favorites.includes(product.id));
  return <main className="section account-page"><span className="eyebrow">SAVED FOR LATER</span><h1 className="page-title">Your Wishlist</h1>{saved.length ? <ProductGrid products={saved} onProduct={onProduct} onAdd={onAdd} favorites={favorites} onFavorite={onFavorite} /> : <div className="empty"><span>♡</span><h2>Your wishlist is waiting</h2><p>Save the pieces you love and find them here.</p><button className="primary" onClick={onShop}>Explore products →</button></div>}</main>;
}

function SettingsPage({ onSave }) {
  const [saved, setSaved] = useState(false);
  return <main className="section settings-layout"><aside className="account-sidebar"><b>Settings</b>{["Account Settings", "Security", "Notifications", "Language", "Theme"].map((item, index) => <button className={index === 0 ? "active" : ""} key={item}>{item}</button>)}</aside><form className="settings-card" onSubmit={(event) => { event.preventDefault(); onSave(); setSaved(true); }}><span className="eyebrow">YOUR ACCOUNT</span><h1 className="page-title">Account Settings</h1><div className="form-grid"><label>Full name<input defaultValue="Tesheme Tsegaye" /></label><label>Email<input type="email" defaultValue="tesheme@example.com" /></label><label>Phone number<input defaultValue="+251 912 345 678" /></label><label>City<input defaultValue="Addis Ababa" /></label><label className="wide-field">Address<input defaultValue="Addis Ababa, Ethiopia" /></label></div><button className="primary" type="submit">Save Changes</button>{saved && <p className="saved-message">Saved for this demo session.</p>}</form></main>;
}

function AdminPage({ products, onProduct, onRefresh, token }) {
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", description: "", category: "Women's Fashion", price: "", image: "", stock: "0" });
  async function createProduct(event) {
    event.preventDefault();
    setMessage("");
    try {
      await apiRequest("/api/products", {
        method: "POST",
        token,
        body: JSON.stringify({ ...form, price: Number(form.price), stock: Number(form.stock) }),
      });
      setForm({ name: "", description: "", category: "Women's Fashion", price: "", image: "", stock: "0" });
      onRefresh();
      setMessage("Product created.");
    } catch (error) {
      setMessage(error.message);
    }
  }
  async function deleteProduct(product) {
    if (!window.confirm(`Remove "${product.name}" from the storefront?`)) return;
    setMessage("");
    try {
      await apiRequest(`/api/products/${product.id}`, { method: "DELETE", token });
      onRefresh();
      setMessage("Product removed from the storefront.");
    } catch (error) {
      setMessage(error.message);
    }
  }
  return <main className="section admin-layout"><aside className="admin-sidebar"><div className="brand"><span className="logo">✿</span><span>Ethio<small>Admin Panel</small></span></div><b>Products</b></aside><div className="admin-content"><span className="eyebrow">STORE MANAGEMENT</span><h1 className="page-title">Manage Products</h1><section className="dashboard-card"><h2>Add product</h2><form className="settings-card" onSubmit={createProduct}><div className="form-grid"><label>Name<input required minLength="2" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Category<input required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label><label>Price (ETB)<input required type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label><label>Stock<input required type="number" min="0" step="1" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} /></label><label className="wide-field">Image URL<input required type="url" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} /></label><label className="wide-field">Description<textarea required minLength="1" maxLength="2000" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label></div><button className="primary" type="submit">Create product</button></form>{message && <p role="status" className="form-message">{message}</p>}</section><section className="dashboard-card"><h2>Current products ({products.length})</h2><div className="admin-products">{products.map((product) => <div className="admin-product" key={product.id}><img src={product.image} alt="" /><button onClick={() => onProduct(product)}><b>{product.name}</b><small>{product.category}</small></button><strong>{currency(product.price)}</strong><span>Stock: {product.stock}</span><button type="button" onClick={() => deleteProduct(product)}>Remove</button></div>)}</div></section></div></main>;
}

function AuthPage({ mode, onSwitch, onAuthenticated }) {
  const [message, setMessage] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isRegister = mode === "Register";
  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);

    const identifierField = identifier.trim();
    const body = isRegister
      ? {
          name: name.trim(),
          password,
          ...(identifierField.includes("@")
            ? { email: identifierField }
            : { phone: identifierField }),
        }
      : { identifier: identifierField, password };

    try {
      const response = await fetch(`/api/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.headers.get("content-type")?.includes("application/json")) {
        throw new Error("The authentication service returned an invalid response. Please try again shortly.");
      }
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.message || "Authentication failed. Please try again.");
        return;
      }
      if (!result.token || !result.user) {
        setMessage("The authentication service returned an incomplete response.");
        return;
      }
      onAuthenticated(result, remember);
    } catch (error) {
      setMessage(error instanceof TypeError
        ? "Unable to connect to the authentication service. Please try again shortly."
        : error instanceof SyntaxError
          ? "The authentication service returned an invalid response. Please try again shortly."
          : error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-art"><span>✿</span><h2>Wear your culture with pride.</h2><p>Discover Ethiopian fashion for every occasion.</p></div>
      <form className="auth-card" onSubmit={submit} aria-busy={submitting}>
        <div className="logo auth-logo">✿</div>
        <h1>{isRegister ? "Create Your Account" : "Welcome Back!"}</h1>
        <p>{isRegister ? "Join our fashion community." : "Sign in to continue shopping."}</p>
        {isRegister && <label>Full name<input required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={(event) => { setName(event.target.value); setMessage(""); }} placeholder="Enter your full name" /></label>}
        <label>Email or phone<input required autoComplete="username" value={identifier} onChange={(event) => { setIdentifier(event.target.value); setMessage(""); }} placeholder="you@example.com or +251..." /></label>
        <label>Password<input required minLength={isRegister ? 8 : undefined} maxLength={72} type="password" autoComplete={isRegister ? "new-password" : "current-password"} value={password} onChange={(event) => { setPassword(event.target.value); setMessage(""); }} placeholder="Enter your password" /></label>
        <div className="remember-row">
          <label><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Remember me</label>
          {!isRegister && <button type="button" onClick={() => setMessage("Password reset is not enabled yet. Please contact customer support.")}>Forgot password?</button>}
        </div>
        <button className="primary full" type="submit" disabled={submitting}>{submitting ? "Please wait..." : isRegister ? "Create Account" : "Login"}</button>
        {message && <p className="form-message error" role="alert" aria-live="assertive">{message}</p>}
        <p className="auth-switch">{isRegister ? "Already have an account?" : "Don't have an account?"} <button type="button" onClick={onSwitch}>{isRegister ? "Login" : "Register"}</button></p>
      </form>
    </main>
  );
}

function AboutPage({ onShop }) {
  return <main className="section about-page"><span className="eyebrow">OUR CULTURE · OUR PRIDE</span><h1 className="page-title">Wear your culture with pride.</h1><p>Ethio Clothes Market brings together traditional Ethiopian clothing and modern style in one thoughtful collection. Discover pieces inspired by our heritage and made for everyday expression.</p><button className="primary" onClick={onShop}>Explore the collection →</button><div className="about-image"><img src={sampleProducts[0].image} alt="Ethiopian-inspired fashion" /></div></main>;
}

function AuthRequired({ onLogin }) {
  return <main className="section account-page"><div className="empty"><h2>Please sign in</h2><p>This area is available after you sign in to your account.</p><button className="primary" onClick={onLogin}>Sign in →</button></div></main>;
}

function ContactPage() {
  return <main className="section account-page"><span className="eyebrow">WE'RE HERE TO HELP</span><h1 className="page-title">Contact our team</h1><div className="contact-card"><p>Questions about sizes, delivery, or your order? Send us a message and our team will be happy to help.</p><a className="primary" href="mailto:hello@ethioclothes.example">Email customer support →</a><p className="muted-copy">hello@ethioclothes.example · Addis Ababa, Ethiopia</p></div></main>;
}

function Footer({ onNavigate, onShop }) {
  return <footer className="footer"><div className="footer-main"><button className="brand footer-brand" onClick={() => onNavigate("Home")}><span className="logo">✿</span><span>Ethio<small>Clothes Market</small></span></button><p>Celebrating Ethiopian-inspired fashion.</p></div><div className="footer-links"><button onClick={() => onShop()}>Shop</button><button onClick={() => onNavigate("About")}>Our Story</button><button onClick={() => onNavigate("Contact")}>Contact</button><button onClick={() => onNavigate("Dashboard")}>My Account</button><button onClick={() => onNavigate("Admin")}>Admin preview</button></div><small>© {new Date().getFullYear()} Ethio Clothes Market · Demo storefront</small></footer>;
}
