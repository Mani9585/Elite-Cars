import { useEffect, useState, useCallback } from "react";
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
    power: "",
    fuelType: "",
    stock: "",
    sale: "",
    saleEnd: "",
    seating: ""
  });

  // 👤 Invoice Users
  const [invoiceUsers, setInvoiceUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    UserName: "",
    Password: ""
  });

  // ================= FETCH FUNCTIONS =================

  const fetchCars = useCallback(async () => {
    const res = await fetch(`${API}/cars`);
    const data = await res.json();
    setCars(Array.isArray(data) ? data : []);
  }, [API]);

  const fetchInvoiceUsers = useCallback(async () => {
    const res = await fetch(`${API}/admin/invoice-users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setInvoiceUsers(Array.isArray(data) ? data : []);
  }, [API, token]);

  // ================= AUTH =================

  useEffect(() => {
    if (!token) {
      navigate("/admin-login");
      return;
    }

    fetchCars();
    fetchInvoiceUsers();
  }, [token, navigate, fetchCars, fetchInvoiceUsers]);

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  /* ================= CAR APIs ================= */

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
        seating: Number(newCar.seating),
        sale: Number(newCar.sale) || 0
      })
    });

    setNewCar({
      name: "",
      category: "",
      image: "",
      topSpeed: "",
      price: "",
      power: "",
      fuelType: "",
      stock: "",
      sale: "",
      saleEnd: "",
      seating: ""
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

  // ================= UI =================

  return (
    <div className="admin">

      <div className="admin-header">
        <h1>Admin – Elite Motors</h1>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>

      {/* ================= INVOICE USERS ================= */}
      <div className="admin-card">
        <h2>Invoice User Management</h2>

        <input
          placeholder="Username"
          value={newUser.UserName}
          onChange={(e) =>
            setNewUser({ ...newUser, UserName: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={newUser.Password}
          onChange={(e) =>
            setNewUser({ ...newUser, Password: e.target.value })
          }
        />

        <button className="add-btn" onClick={addInvoiceUser}>
          Add Invoice User
        </button>

        <table className="admin-table">
          <tbody>
            {invoiceUsers.map((u) => (
              <tr key={u.id}>
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

      {/* ================= CARS ================= */}
      <table className="admin-table">
        <tbody>
          {cars.map((car) => (
            <tr key={car.name}>
              <td>{car.name}</td>
              <td>₹ {Number(car.price).toLocaleString("en-IN")}</td>
              <td>{car.stock}</td>
              <td>
                <button onClick={() => setSelectedCar(car)}>Edit</button>
                <button onClick={() => deleteCar(car.name)}>Delete</button>
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
