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

const TEXT = "ELITE PERFORMANCE";

export default function Home() {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);

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
        <div className="hero">
          <h1 className="typing">
            {text}
            {!done && <span className="cursor">|</span>}
          </h1>
          <p className={`sub ${done ? "show" : ""}`}>
            Luxury. Power. Precision.
          </p>
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
                    <span className="showroom-text">To be Updated...</span>
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
