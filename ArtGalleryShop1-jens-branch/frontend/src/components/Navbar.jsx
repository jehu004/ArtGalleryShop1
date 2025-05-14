import { Link } from "react-router-dom";
import "../styles/Navbar.css"; 

const Navbar = () => {
  return (
    <header className="navbar-container">
      <div className="logo">
        <img src="/images/Skjermbilde 2024-11-30 kl. 08.26.26.jpeg" alt="Logo" />
      </div>

      <nav className="navbar">
        <Link to="/shop">Shop</Link>
        <Link to="/artists">Artists</Link>
        <Link to="/contact">Contact</Link>
        <a
          href="https://www.galleriedwin.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Gallery
        </a>
        
      </nav>
    </header>
  );
};

export default Navbar;
