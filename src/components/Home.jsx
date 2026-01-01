import { useEffect, useState } from "react";
import {
  FaCrown,
  FaCertificate,
  FaUserTie,
  FaKey,
  FaMapMarkerAlt,
  FaPhoneAlt
} from "react-icons/fa";
import "./Home.css";
import logo from "../assets/logo.png"; // adjust path if needed


const TEXT = "ELITE PERFORMANCE";

export default function Home() {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [showScroll, setShowScroll] = useState(true);
  const [logoOpacity, setLogoOpacity] = useState(1);


useEffect(() => {
  const handleScroll = () => {
    const scrollY = window.scrollY;

    // Scroll arrow logic
    if (scrollY < 50) {
      setShowScroll(true);
    } else {
      setShowScroll(false);
    }

    // Logo fade-out (first screen only)
    const fadeStart = 50;
    const fadeEnd = window.innerHeight * 0.6;

    if (scrollY <= fadeStart) {
      setLogoOpacity(1);
    } else if (scrollY >= fadeEnd) {
      setLogoOpacity(0);
    } else {
      const opacity =
        1 - (scrollY - fadeStart) / (fadeEnd - fadeStart);
      setLogoOpacity(opacity);
    }
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);


  useEffect(() => {
    let i = 0;
    const type = () => {
      setText(TEXT.slice(0, i + 1));
      i++;
      if (i < TEXT.length) setTimeout(type, 80);
      else setDone(true);
    };
    type();
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="home-hero">
        <div className="hero-layout">
          <div className="hero">
          <h1 className="typing">
            {text}
            {!done && <span className="cursor">|</span>}
          </h1>
          <p className={`sub ${done ? "show" : ""}`}>
            Luxury. Power. Precision.
          </p>
          </div>
          {done && showScroll && (
            <div className="scroll-arrow-wrapper">
              <div className="scroll-arrow"></div>
            </div>
          )}
          {/* BRAND LOGO (BOTTOM RIGHT – HERO ONLY) */}
          <div
            className="brand-logo-wrapper"
            style={{ opacity: logoOpacity }}
          >
            <img
              src={logo}
              alt="Elite Cars Logo"
              className="brand-logo"
            />
          </div>
        </div>
      </section>

      {/* BRAND INFO */}
      <section className="brand-info">
        <div className="brand-container">

          {/* HEADING */}
          <div className="brand-heading">
            <h2 className="brand-title">
              The <span className="brand-highlight">Elite Cars</span> Experience
            </h2>
            <p className="tagline">
              Redefining luxury automotive retail with unparalleled service and exclusivity.
            </p>
          </div>

          {/* FEATURES */}
          <div className="features-grid">
            <div className="feature-row row-one">
              <div className="feature-card">
                <FaCrown className="feature-icon" />
                <h3>Elite Selection</h3>
                <p>Handpicked collection of world's finest supercars</p>
              </div>
              <div className="feature-card">
                <FaCertificate className="feature-icon" />
                <h3>Certified Authentic</h3>
                <p>Every vehicle comes with complete certification</p>
              </div>
            </div>

            <div className="feature-row row-two">
              <div className="feature-card">
                <FaUserTie className="feature-icon" />
                <h3>White Glove Service</h3>
                <p>Personalized concierge service for every client</p>
              </div>
              <div className="feature-card">
                <FaKey className="feature-icon" />
                <h3>Exclusive Access</h3>
                <p>First access to rare and limited edition models</p>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="stats-section">
            <div className="stat-card highlight">
              <h3>200+</h3>
              <p>Exotic Cars Sold</p>
            </div>
            <div className="stat-card highlight">
              <h3>50+</h3>
              <p>Premium Brands</p>
            </div>
            <div className="stat-card highlight">
              <h3>100%</h3>
              <p>Client Satisfaction</p>
            </div>
          </div>

          {/* SHOWROOM */}
          <div className="showroom-section">
            <h2>Visit Our Exclusive Showroom</h2>

            <div className="showroom-info">
                <div className="showroom-card">
                    <FaMapMarkerAlt className="showroom-icon" />
                    <span className="showroom-text">8191, Popular Street, PD Back Side</span>
                </div>

                <div className="showroom-card">
                    <FaPhoneAlt className="showroom-icon" />
                    <span className="showroom-text">To be Updated...</span>
                </div>
            </div>


          </div>

          

        </div>
      </section>
    </>
  );
}
