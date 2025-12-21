import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import "./BackgroundLayout.css";
import bg from "../assets/car-bg.png";

export default function BackgroundLayout() {
  const location = useLocation();
  const blurPages = ["/catalogue", "/career"];
  const isBlur = blurPages.includes(location.pathname);

  useEffect(() => {
    if (window.innerWidth < 768) return;

    const move = (e) => {
      document.documentElement.style.setProperty("--x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--y", `${e.clientY}px`);
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div className="layout">
      <div
        className={`bg-layer ${isBlur ? "blur" : ""}`}
        style={{ backgroundImage: `url(${bg})` }}
      />

      <div className="ui-layer">
        <Header />

        <main className="content">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
