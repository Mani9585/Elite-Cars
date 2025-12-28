import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Invoice.css";

export default function InvoiceLogin() {
  const API = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: ""
  });

  const login = async () => {
    const res = await fetch(`${API}/invoice/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("invoiceToken", data.token);
      localStorage.setItem("invoiceUser", data.user);
      navigate("/invoice");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="invoice-login">
      <h2>Invoice Staff Login</h2>

      <input
        placeholder="Username"
        onChange={e => setForm({ ...form, username: e.target.value })}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={e => setForm({ ...form, password: e.target.value })}
      />

      <button onClick={login}>Login</button>
    </div>
  );
}
