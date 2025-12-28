import { useState } from "react";
import "./Admin.css";

export default function EditCarModal({ car, onClose, onUpdated }) {
  const API = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("adminToken");

  const [form, setForm] = useState({
    name: car.name,
    image: car.image,
    category: car.category,
    topSpeed: car.topSpeed,
    price: car.price,        // ✅ numeric
    mileage: car.mileage,
    fuelType: car.fuelType,
    stock: car.stock,
    sale: car.sale || 0,
    saleEnd: car.saleEnd || ""
  });

  const saveChanges = async () => {
    await fetch(`${API}/admin/update-car`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),                 // ✅ IMPORTANT
        stock: Number(form.stock),
        sale: Math.min(100, Math.max(0, Number(form.sale) || 0)),
        saleEnd: form.saleEnd || null
      })
    });

    onUpdated();
  };

  return (
    <div className="modal-backdrop">
      <div className="edit-modal">
        <h2>Edit Car</h2>

        {/* NAME */}
        <label>Car Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        {/* IMAGE */}
        <label>Image URL</label>
        <input
          type="text"
          value={form.image}
          onChange={(e) =>
            setForm({ ...form, image: e.target.value })
          }
        />

        {/* CATEGORY */}
        <label>Category</label>
        <input
          type="text"
          placeholder="SUV / Sedan / Sports / Electric"
          value={form.category}
          onChange={(e) =>
            setForm({ ...form, category: e.target.value })
          }
        />

        {/* TOP SPEED */}
        <label>Top Speed</label>
        <input
          type="text"
          value={form.topSpeed}
          onChange={(e) =>
            setForm({ ...form, topSpeed: e.target.value })
          }
        />

        {/* PRICE */}
        <label>Price (Full Amount)</label>
        <input
          type="number"
          placeholder="Eg: 2500000"
          value={form.price}
          onChange={(e) =>
            setForm({ ...form, price: e.target.value })
          }
        />

        {/* MILEAGE */}
        <label>Mileage</label>
        <input
          type="text"
          value={form.mileage}
          onChange={(e) =>
            setForm({ ...form, mileage: e.target.value })
          }
        />

        {/* FUEL TYPE */}
        <label>Fuel Type</label>
        <input
          type="text"
          value={form.fuelType}
          onChange={(e) =>
            setForm({ ...form, fuelType: e.target.value })
          }
        />

        {/* STOCK */}
        <label>Stock Available</label>
        <input
          type="number"
          min="0"
          value={form.stock}
          onChange={(e) =>
            setForm({ ...form, stock: e.target.value })
          }
        />

        {/* SALE */}
        <label>Sale Percentage (%)</label>
        <input
          type="number"
          min="0"
          max="100"
          value={form.sale}
          onChange={(e) =>
            setForm({ ...form, sale: e.target.value })
          }
        />

        {/* SALE END */}
        <label>Sale End Date & Time</label>
        <input
          type="datetime-local"
          value={form.saleEnd}
          onChange={(e) =>
            setForm({ ...form, saleEnd: e.target.value })
          }
        />

        <div className="modal-actions">
          <button className="save-btn" onClick={saveChanges}>
            Save Changes
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
