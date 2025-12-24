import { NavLink } from "react-router-dom";
import "./Header.css";
import logo from "../assets/logo.png";

export default function Header() {
  return (
    <header className="header">
      <div className="brand">
        <span>ELITE MOTORS</span>
        <img src={logo} alt="Elite Cars Logo" />
      </div>

      <nav className="nav">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/catalogue">Catalogue</NavLink>
        <NavLink to="/career">Career</NavLink>
      </nav>
    </header>
  );
}
