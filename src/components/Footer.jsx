
export default function Footer() {
  return (
    <footer className="footer">
      <a className="brand footer-brand" href="#home">
        <span className="brand-icon">✿</span>
        <span>
          Ethio
          <small>Clothes Market</small>
        </span>
      </a>

      <p>Celebrating Ethiopian culture through fashion.</p>

      <div className="footer-links">
        <a href="#shop">Shop</a>
        <a href="#categories">Categories</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </div>

      <small>© {new Date().getFullYear()} Ethio Clothes Market.</small>
    </footer>
  );
}
