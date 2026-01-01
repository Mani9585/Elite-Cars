import { useEffect, useState } from "react";
import "./Loader.css";
import logo from "../assets/logo.png";

export default function Loader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 25);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loader">
      <div className="loader-center">
        <img src={logo} alt="Elite Cars Logo" />
        <p>ELITE MOTORS</p>
        <span className="loader-progress">{progress}%</span>

        <div className="loader-bar">
          <div
            className="loader-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

