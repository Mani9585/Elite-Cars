import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

export default function Admin() {
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("adminToken");

  const [cars, setCars] = useState([]);
  const [newCar, setNewCar] = useState({
    name: "",
    image: "",
    topSpeed: "",
    price: "",
    mileage: "",
    fuelType: "",
    stock: ""
  });

  // 🔐 Redirect if not logged in
  useEffect(() => {
    if (!token) navigate("/admin-login");
    fetchCars();
  }, []);

  // ⏱ Auto logout after 10 minutes inactivity
  useEffect(() => {
    let timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        alert("Session expired due to inactivity");
        logout();
      }, 10 * 60 * 1000);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, []);

  const fetchCars = async () => {
    const res = await fetch(`${API}/cars`);
    const data = await res.json();
    setCars(Array.isArray(data) ? data : []);
  };

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  const updateStock = async (name, change) => {
    await fetch(`${API}/admin/update-stock`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ carName: name, change })
    });
    fetchCars();
  };

  const deleteCar = async (name) => {
    if (!window.confirm(`Delete "${name}" permanently?`)) return;

    await fetch(`${API}/admin/delete-car`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ name })
    });
    fetchCars();
  };

  const addCar = async () => {
    const { name, image, topSpeed, price, mileage, fuelType, stock } = newCar;

    if (!name || !image || !topSpeed || !price || !mileage || !fuelType || !stock) {
      alert("All fields are required");
      return;
    }

    if (!window.confirm(`Add "${name}" to Elite Collections?`)) return;

    await fetch(`${API}/admin/add-car`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        ...newCar,
        stock: Number(stock)
      })
    });

    setNewCar({
      name: "",
      image: "",
      topSpeed: "",
      price: "",
      mileage: "",
      fuelType: "",
      stock: ""
    });

    fetchCars();
  };

  return (
    <div className="admin">
      {/* HEADER */}
      <div className="admin-header">
        <h1>Admin – Catalogue Management</h1>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      {/* ADD NEW CAR */}
      <div className="admin-card">
        <h2>Add New Car</h2>

        {Object.keys(newCar).map((key) => (
          <input
            key={key}
            placeholder={key}
            value={newCar[key]}
            onChange={(e) =>
              setNewCar({ ...newCar, [key]: e.target.value })
            }
          />
        ))}

        <button className="add-btn" onClick={addCar}>
          Add Car
        </button>
      </div>

      {/* EXISTING CARS */}
      {cars.map((car) => (
        <div className="admin-car-row" key={car.id}>
          <div>
            <strong>{car.name}</strong>
            <div>ID: {car.id}</div>
            <div>Stock: {car.stock}</div>
          </div>

          <div className="actions">
            <button onClick={() => updateStock(car.name, +1)}>➕</button>
            <button onClick={() => updateStock(car.name, -1)}>➖</button>
            <button onClick={() => deleteCar(car.name)}>🗑</button>
          </div>
        </div>
      ))}
    </div>
  );
}
