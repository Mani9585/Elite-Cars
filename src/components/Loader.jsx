import "./Loader.css";
import logo from "../assets/logo.png";

export default function Loader() {
  return (
    <div className="loader">
      <img src={logo} alt="Elite Cars Logo" />
      <p>ELITE CARS</p>
    </div>
  );
}
