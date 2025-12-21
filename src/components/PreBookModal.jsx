import { useState, useEffect } from "react";
import "./PreBookModal.css";

export default function PreBookModal({ car, onClose, onBooked }) {
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔐 CAPTCHA STATE
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [answer, setAnswer] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  // FORM STATE
  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    time: ""
  });

  // Generate captcha when modal opens
  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    setNum1(a);
    setNum2(b);
    setAnswer("");
    setCaptchaError("");
  };

  const verifyCaptcha = () => {
    if (parseInt(answer, 10) === num1 + num2) {
      setVerified(true);
    } else {
      setCaptchaError("Incorrect answer. Try again.");
      generateCaptcha();
    }
  };

  const isFormValid =
    verified &&
    form.name &&
    form.phone &&
    form.date &&
    form.time;

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/prebook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          carName: car.name
        })
      });

      const data = await res.json();

      if (data.success) {
        alert("Pre-booking request sent successfully!");
        onBooked(); // 🔥 reduce stock + close modal
      } else {
        alert("Booking failed. Please try again.");
      }
    } catch {
      alert("Server error. Try again later.");
    }

    setLoading(false);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">

        <h2>Pre-Book {car.name}</h2>

        {/* CAPTCHA STEP */}
        {!verified ? (
          <div className="captcha-box">
            <p className="captcha-question">
              Verify you are human
            </p>

            <div className="captcha-math">
              {num1} + {num2} = ?
            </div>

            <input
              placeholder="Enter answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />

            {captchaError && (
              <div className="captcha-error">{captchaError}</div>
            )}

            <button
              className="verify-btn"
              onClick={verifyCaptcha}
            >
              Verify
            </button>
          </div>
        ) : (
          <>
            <input
              placeholder="Your Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <input
              placeholder="Phone Number"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />

            <div className="input-group">
              <label>Delivery Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
              />
            </div>

            <div className="input-group">
              <label>Delivery Time</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) =>
                  setForm({ ...form, time: e.target.value })
                }
              />
            </div>

            <button
              className="book-btn"
              disabled={!isFormValid || loading}
              onClick={handleSubmit}
            >
              {loading ? "Booking..." : "Book Now"}
            </button>
          </>
        )}

        <span className="close" onClick={onClose}>×</span>
      </div>
    </div>
  );
}
