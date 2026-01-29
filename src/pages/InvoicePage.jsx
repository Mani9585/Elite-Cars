import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Invoice.css";

export default function InvoicePage() {
  const API = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const token = localStorage.getItem("invoiceToken");
  const sellerName = localStorage.getItem("invoiceUser");

  const [cars, setCars] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const tax = 10;

  const [form, setForm] = useState({
    name: "",
    phone: "",
    carName: "",
    sale: 0,
    plate: ""
  });

  // ================= FETCH CARS =================

  const fetchCars = useCallback(async () => {
    try {
      const res = await fetch(`${API}/cars`);
      const data = await res.json();
      setCars(Array.isArray(data) ? data : []);
    } catch {
      setCars([]);
    }
  }, [API]);

  // ================= AUTH =================

  useEffect(() => {
    if (!token) {
      navigate("/invoice-login");
      return;
    }

    fetchCars();
  }, [token, navigate, fetchCars]);

  // ================= PRICING =================

  const selectedCar = cars.find(c => c.name === form.carName);
  const price = selectedCar ? Number(selectedCar.price) : 0;
  const discount = Math.round(price * (form.sale / 100));
  const withoutTaxPrice = price - discount;
  const taxAmount = Math.round(withoutTaxPrice * (tax / 100));
  const finalPrice = withoutTaxPrice + taxAmount;

  // ================= DATE & TIME =================

  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const time = now.toTimeString().slice(0, 5);

  // ================= INVOICE =================

  const generateInvoice = async () => {
    if (!form.name || !form.phone || !form.carName || !form.plate) {
      alert("Please fill all required fields");
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch(`${API}/invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          carName: form.carName,
          originalPrice: price,
          withoutTaxPrice,
          taxAmount,
          appliedPrice: finalPrice,
          sale: form.sale,
          saleApplied: form.sale > 0,
          plate: form.plate,
          date,
          time,
          sellerName
        })
      });

      if (!res.ok) throw new Error("Invoice failed");

      alert("Invoice generated and sent to Discord");
    } catch (err) {
      console.error(err);
      alert("Failed to generate invoice");
    } finally {
      setIsGenerating(false);
    }
  };

  // ================= LOGOUT =================

  const logout = () => {
    localStorage.removeItem("invoiceToken");
    localStorage.removeItem("invoiceUser");
    navigate("/invoice-login");
  };

  // ================= UI =================

  return (
    <div className="invoice-page">

      <div className="invoice-header">
        <h2>Generate Invoice</h2>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>

      <input
        placeholder="Customer Name"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
      />

      <input
        placeholder="Phone Number"
        value={form.phone}
        onChange={e => setForm({ ...form, phone: e.target.value })}
      />

      <select
        value={form.carName}
        onChange={e => setForm({ ...form, carName: e.target.value })}
      >
        <option value="">Select Car</option>
        {cars.map(car => (
          <option key={car.name} value={car.name}>
            {car.name}
          </option>
        ))}
      </select>

      <input
        placeholder="Car Number Plate"
        value={form.plate}
        onChange={e => setForm({ ...form, plate: e.target.value })}
      />

      <input
        type="number"
        placeholder="Sale %"
        value={form.sale}
        onChange={e => setForm({ ...form, sale: Number(e.target.value) })}
      />

      <div className="price-summary">
        <p>Original Price: ₹ {price.toLocaleString("en-IN")}</p>
        <p>Discount: ₹ {discount.toLocaleString("en-IN")}</p>
        <p className="final-price">
          Final Amount: ₹ {finalPrice.toLocaleString("en-IN")}
        </p>
      </div>

      <div className="invoice-meta">
        <p>Invoice Date: {date}</p>
        <p>Invoice Time: {time}</p>
      </div>

      <button
        className="generate-btn"
        onClick={generateInvoice}
        disabled={isGenerating}
      >
        {isGenerating ? "Generating..." : "Generate Invoice"}
      </button>

    </div>
  );
}
