import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    if (!token) navigate("/admin-login");
    fetchCars();
  }, []);

  const fetchCars = async () => {
    const res = await fetch(`${API}/cars`);
    const data = await res.json();
    setCars(data);
  };

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
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
    if (!window.confirm("Delete this car?")) return;

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
    <div style={{ padding: 40, color: "white" }}>
      <h1>Admin – Catalogue Management</h1>

      {/* ADD NEW CAR */}
      <div style={{ background: "#111", padding: 20, borderRadius: 10, marginBottom: 40 }}>
        <h2>Add New Car</h2>

        {Object.keys(newCar).map(key => (
          <input
            key={key}
            placeholder={key}
            value={newCar[key]}
            onChange={e => setNewCar({ ...newCar, [key]: e.target.value })}
            style={{ display: "block", marginBottom: 10, width: "100%", padding: 10 }}
          />
        ))}

        <button onClick={addCar}>Add Car</button>
      </div>

      {/* EXISTING CARS */}
      {cars.map(car => (
        <div
          key={car.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            background: "#222",
            padding: 14,
            marginBottom: 10,
            borderRadius: 8
          }}
        >
          <div>
            <strong>{car.name}</strong>
            <div>ID: {car.id}</div>
            <div>Stock: {car.stock}</div>
          </div>

          <div>
            <button onClick={() => updateStock(car.name, +1)}>➕</button>
            <button onClick={() => updateStock(car.name, -1)}>➖</button>
            <button onClick={() => deleteCar(car.name)}>🗑</button>
          </div>
        </div>
      ))}
    </div>
  );
}
