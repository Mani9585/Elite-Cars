import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EditCarModal from "./EditCarModal";
import "./Admin.css";

export default function Admin() {
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("adminToken");

  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);

  // 🚘 New Car
  const [newCar, setNewCar] = useState({
    name: "",
    category: "",
    image: "",
    topSpeed: "",
    price: "",
    mileage: "",
    fuelType: "",
    stock: "",
    sale: "",
    saleEnd: ""
  });

  // 👤 Invoice Users
  const [invoiceUsers, setInvoiceUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    UserName: "",
    Password: ""
  });

  // 🔐 Auth
  useEffect(() => {
    if (!token) navigate("/admin-login");
    fetchCars();
    fetchInvoiceUsers();
  }, []);

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  /* ================= CAR APIs ================= */

  const fetchCars = async () => {
    const res = await fetch(`${API}/cars`);
    const data = await res.json();
    setCars(Array.isArray(data) ? data : []);
  };

  const addCar = async () => {
    if (!newCar.name || !newCar.category || !newCar.price) {
      alert("Fill all required fields");
      return;
    }

    await fetch(`${API}/admin/add-car`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        ...newCar,
        price: Number(newCar.price),
        stock: Number(newCar.stock),
        sale: Number(newCar.sale) || 0
      })
    });

    setNewCar({
      name: "",
      category: "",
      image: "",
      topSpeed: "",
      price: "",
      mileage: "",
      fuelType: "",
      stock: "",
      sale: "",
      saleEnd: ""
    });

    fetchCars();
  };

  const deleteCar = async (name) => {
    if (!window.confirm(`Delete ${name}?`)) return;

    await fetch(`${API}/admin/delete-car`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    });

    fetchCars();
  };

  /* ================= INVOICE USER APIs ================= */

  const fetchInvoiceUsers = async () => {
    const res = await fetch(`${API}/admin/invoice-users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setInvoiceUsers(Array.isArray(data) ? data : []);
  };

  const addInvoiceUser = async () => {
    if (!newUser.UserName || !newUser.Password) {
      alert("Username & Password required");
      return;
    }

    await fetch(`${API}/admin/add-invoice-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(newUser)
    });

    setNewUser({ UserName: "", Password: "" });
    fetchInvoiceUsers();
  };

  const deleteInvoiceUser = async (id) => {
    if (!window.confirm("Delete this invoice user?")) return;

    await fetch(`${API}/admin/delete-invoice-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ id })
    });

    fetchInvoiceUsers();
  };

  return (
    <div className="admin">

      {/* HEADER */}
      <div className="admin-header">
        <h1>Admin – Elite Motors</h1>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>

      {/* ================= ADD INVOICE USER ================= */}
      <div className="admin-card">
        <h2>Invoice User Management</h2>

        <label>User Name</label>
        <input
          value={newUser.UserName}
          onChange={(e) =>
            setNewUser({ ...newUser, UserName: e.target.value })
          }
        />

        <label>Password</label>
        <input
          type="password"
          value={newUser.Password}
          onChange={(e) =>
            setNewUser({ ...newUser, Password: e.target.value })
          }
        />

        <button className="add-btn" onClick={addInvoiceUser}>
          Add Invoice User
        </button>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoiceUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.UserName}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => deleteInvoiceUser(u.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ➕ ADD NEW CAR */}
      <div className="admin-card">
        <h2>Add New Car</h2>

        <label>Car Name</label>
        <input
          value={newCar.name}
          onChange={(e) =>
            setNewCar({ ...newCar, name: e.target.value })
          }
        />

        <label>Category</label>
        <input
          placeholder="SUV / Sedan / Sports / Electric"
          value={newCar.category}
          onChange={(e) =>
            setNewCar({ ...newCar, category: e.target.value })
          }
        />

        <label>Image URL</label>
        <input
          value={newCar.image}
          onChange={(e) =>
            setNewCar({ ...newCar, image: e.target.value })
          }
        />

        <label>Top Speed</label>
        <input
          value={newCar.topSpeed}
          onChange={(e) =>
            setNewCar({ ...newCar, topSpeed: e.target.value })
          }
        />

        <label>Price (Full Amount)</label>
        <input
          type="number"
          placeholder="Eg: 2500000"
          value={newCar.price}
          onChange={(e) =>
            setNewCar({ ...newCar, price: e.target.value })
          }
        />

        <label>Mileage</label>
        <input
          value={newCar.mileage}
          onChange={(e) =>
            setNewCar({ ...newCar, mileage: e.target.value })
          }
        />

        <label>Fuel Type</label>
        <input
          value={newCar.fuelType}
          onChange={(e) =>
            setNewCar({ ...newCar, fuelType: e.target.value })
          }
        />

        <label>Stock</label>
        <input
          type="number"
          value={newCar.stock}
          onChange={(e) =>
            setNewCar({ ...newCar, stock: e.target.value })
          }
        />

        <label>Sale (%)</label>
        <input
          type="number"
          min="0"
          max="100"
          value={newCar.sale}
          onChange={(e) =>
            setNewCar({ ...newCar, sale: e.target.value })
          }
        />

        <label>Sale End Date & Time</label>
        <input
          type="datetime-local"
          value={newCar.saleEnd}
          onChange={(e) =>
            setNewCar({ ...newCar, saleEnd: e.target.value })
          }
        />

        <button className="add-btn" onClick={addCar}>
          Add Car
        </button>
      </div>

      {/* ================= CARS TABLE ================= */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Sale %</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {cars.map((car) => (
            <tr key={car.id}>
              <td>
                <img src={car.image} alt={car.name} className="admin-thumb" />
              </td>
              <td>{car.name}</td>
              <td>{car.category}</td>
              <td>₹ {Number(car.price).toLocaleString("en-IN")}</td>
              <td>{car.stock}</td>
              <td>{car.sale || 0}%</td>
              <td>
                <button
                  className="edit-btn"
                  onClick={() => setSelectedCar(car)}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => deleteCar(car.name)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedCar && (
        <EditCarModal
          car={selectedCar}
          onClose={() => setSelectedCar(null)}
          onUpdated={() => {
            fetchCars();
            setSelectedCar(null);
          }}
        />
      )}
    </div>
  );
}
