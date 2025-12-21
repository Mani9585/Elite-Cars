import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const [cars, setCars] = useState([]);
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("adminToken");

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
    await fetch(`${API}/admin/delete-car`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ name })
    });
    fetchCars();
  };

  return (
    <div style={{ padding: 40, color: "white" }}>
      <h1>Admin – Stock Control</h1>

      {cars.map(car => (
        <div
          key={car.name}
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
