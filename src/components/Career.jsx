import { useEffect, useState } from "react";
import "./Career.css";

export default function Career() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className={`career ${show ? "show" : ""}`}>
      <h1>CAREERS AT ELITE MOTORS</h1>

      <p className="subtitle">
        Build the future of mobility with us.
      </p>

      <div className="career-content">
        <p>
          At Elite Motors, we believe innovation starts with people.
          Join a team driven by performance, precision, and passion.
        </p>

        <p>
          We are always looking for talented individuals in design,
          engineering, sales, and customer experience.
        </p>
      </div>
    </section>
  );
}
