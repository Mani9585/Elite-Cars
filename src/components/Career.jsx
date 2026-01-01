import { useEffect, useState } from "react";
import logo from "../assets/logo.png"
import "./Career.css";

export default function Career() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className={`career ${show ? "show" : ""}`}>
      <div
        className="brand-logo-wrapper"
      >
        <img
          src={logo}
          alt="Elite Cars Logo"
          className="brand-logo"
        />
      </div>
      <h1 data-animate="1">CAREERS AT ELITE MOTORS</h1>

      <p className="subtitle" data-animate="2">
        Build the future of mobility with us.
      </p>

      <div className="career-content">
        <p data-animate="3">
          At Elite Motors, we believe innovation starts with people.
          Our culture is built on performance, precision, and passion.
        </p>

        <p data-animate="4">
          We are constantly shaping the future of luxury automotive
          experiences and always value exceptional talent.
        </p>

        <div className="career-notice" data-animate="5">
          <h3>No Current Openings</h3>
          <p>
            We do not have any active job openings at the moment.
            New opportunities will be announced here soon.
          </p>
        </div>
      </div>
    </section>
  );
}
