import { useState, useEffect } from "react";
import "./PreBookModal.css";

export default function PreBookModal({ car, onClose, onBooked }) {
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState("");

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

  /* ================= HELPERS ================= */

  const price = Number(car.price);
  const sale = Math.max(0, Number(car.sale) || 0);

  const formatPrice = (value) =>
    Number(value).toLocaleString("en-IN");

  const now = new Date();

  // 🟢 Today's date for min attribute
  const minDate = now.toISOString().split("T")[0];

  // 🟢 Min time (only if today is selected)
  const getMinTime = () => {
    if (form.date === minDate) {
      return now.toTimeString().slice(0, 5);
    }
    return "00:00";
  };

  // 🛑 Validate future date & time
  const isFutureDateTime = () => {
    if (!form.date || !form.time) return false;
    const selected = new Date(`${form.date}T${form.time}`);
    return selected.getTime() > now.getTime();
  };

  // ✅ Sale check
  const isDeliveryWithinSale = () => {
    if (!sale || !car.saleEnd || !form.date || !form.time) return false;
    const deliveryDateTime = new Date(`${form.date}T${form.time}`);
    return deliveryDateTime.getTime() <= new Date(car.saleEnd).getTime();
  };

  const saleActive = sale > 0 && isDeliveryWithinSale();

  const discountAmount = saleActive
    ? Math.round(price * (sale / 100))
    : 0;

  const withoutTaxprice = price - discountAmount;

  const taxAmount = Math.round(withoutTaxprice * (30 / 100))

  const finalPrice = withoutTaxprice + taxAmount;

  const isFormValid =
    verified &&
    form.name &&
    form.phone &&
    form.date &&
    form.time ;

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!isFutureDateTime()) {
      setDateError("Please select a future delivery date & time");
      return;
    }

    setDateError("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/prebook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          carName: car.name,
          originalPrice: price,
          sale,
          withoutTaxprice: withoutTaxprice,
          taxAmount: taxAmount,
          appliedPrice: finalPrice,
          saleApplied: saleActive
        })
      });

      const data = await res.json();

      if (data.success) {
        alert("Pre-booking request sent successfully!");
        onBooked();
      } else {
        alert("Booking failed. Please try again.");
      }
    } catch {
      alert("Server error. Try again later.");
    }

    setLoading(false);
  };

  /* ================= UI ================= */

  return (
    <div className="modal-backdrop">
      <div className="modal">

        <h2>Pre-Book {car.name}</h2>

        {/* CAPTCHA */}
        {!verified ? (
          <div className="captcha-box">
            <p className="captcha-question">Verify you are human</p>

            <div className="captcha-math">
              {num1} + {num2} = ?
            </div>

            <input
              placeholder="Enter the result"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />

            {captchaError && (
              <div className="captcha-error">{captchaError}</div>
            )}

            <button className="verify-btn" onClick={verifyCaptcha}>
              Verify
            </button>
          </div>
        ) : (
          <>
            {/* 💰 PRICE */}
            <div className="price-box">
              <span className="price-label">Car Price</span>

              {saleActive ? (
                <>
                  <span className="old-price">
                    ₹ {formatPrice(price)}
                  </span>
                  <span className="new-price">
                    ₹ {formatPrice(finalPrice)}
                  </span>
                </>
              ) : (
                <span className="normal-price">
                  ₹ {formatPrice(price)}
                </span>
              )}
            </div>

            {car.saleEnd && !saleActive && (
              <div className="offer-warning">
                Offer not applicable for selected delivery date
              </div>
            )}

            {/* NAME */}
            <label>Your Name</label>
            <input
              placeholder="Eg: John Doe"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            {/* PHONE */}
            <label>Phone Number</label>
            <input
              placeholder="Eg: 9876543210"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />

            {/* DATE */}
            <div className="input-group">
              <label>Delivery Date</label>
              <input
                type="date"
                min={minDate}
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
              />
            </div>

            {/* TIME */}
            <div className="input-group">
              <label>Delivery Time</label>
              <input
                type="time"
                min={getMinTime()}
                value={form.time}
                onChange={(e) =>
                  setForm({ ...form, time: e.target.value })
                }
              />
            </div>

            {dateError && (
              <div className="date-error">{dateError}</div>
            )}

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
