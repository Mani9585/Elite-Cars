import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import "./Header.css";
import logo from "../assets/logo.png";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="header">
      <div className="brand">
        <img src={logo} alt="Elite Cars Logo" />
        <span className="title">ELITE MOTORS</span>
      </div>

      {/* Desktop Nav */}
      <nav className={`nav ${open ? "open" : ""}`}>
        <NavLink to="/" end onClick={() => setOpen(false)}>Home</NavLink>
        <NavLink to="/catalogue" onClick={() => setOpen(false)}>Catalogue</NavLink>
        <NavLink to="/career" onClick={() => setOpen(false)}>Career</NavLink>
      </nav>

      {/* Mobile Menu Icon */}
      <button
        className="menu-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Toggle Menu"
      >
        {open ? <FaTimes /> : <FaBars />}
      </button>
    </header>
  );
}
