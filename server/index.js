import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
app.use(cors());
app.use(express.json());

// ======================================================
// 🔗 MongoDB Connection
// ======================================================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

// ======================================================
// 📦 Schema (matches your data exactly)
// ======================================================
const catalogueSchema = new mongoose.Schema({
  company: String,
  menu: [
    {
      id: Number,
      name: String,
      image: String,
      topSpeed: String,
      price: String,
      mileage: String,
      fuelType: String,
      stock: Number
    }
  ]
});

const Catalogue = mongoose.model("Catalogue", catalogueSchema);

// ======================================================
// 🔐 Admin Auth Helper
// ======================================================
const isAdmin = (req) => {
  const token = req.headers.authorization;
  return (
    token ===
    `Bearer ${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD}`
  );
};

// ======================================================
// 🚗 Public API
// ======================================================
app.get("/cars", async (req, res) => {
  try {
    const catalogue = await Catalogue.findOne({});
    res.json(catalogue?.menu || []);
  } catch (err) {
    console.error("Cars API error:", err);
    res.json([]); // ALWAYS return array
  }
});


//// SEED

app.get("/seed", async (req, res) => {
  await Catalogue.create({
    company: "EliteMotors",
    menu: [
      {
        id: 1,
        name: "Aurora X1",
        image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738",
        topSpeed: "220 km/h",
        price: "25 Lakh",
        mileage: "18 km/l",
        fuelType: "Petrol",
        stock: 10
      }
    ]
  });

  res.send("Seeded");
});


// ======================================================
// 📦 Booking API
// ======================================================
app.post("/prebook", async (req, res) => {
  try {
    const { name, phone, date, time, carName } = req.body;

    const exists = await Catalogue.findOne({
      "menu.name": carName,
      "menu.stock": { $gt: 0 }
    });

    if (!exists) {
      return res.status(400).json({ success: false });
    }

    await Catalogue.updateOne(
      { "menu.name": carName },
      { $inc: { "menu.$.stock": -1 } }
    );

    if (process.env.DISCORD_WEBHOOK) {
      await fetch(process.env.DISCORD_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `
🚗 NEW PRE-BOOKING
Car: ${carName}
Name: ${name}
Phone: ${phone}
Delivery: ${date} ${time}
          `
        })
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// ======================================================
// 🔐 Admin Login
// ======================================================
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return res.json({
      success: true,
      token: `${username}:${password}`
    });
  }

  res.status(401).json({ success: false });
});

// ======================================================
// 🔐 Admin APIs
// ======================================================

// ➕ / ➖ Update Stock
app.post("/admin/update-stock", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ success: false });

  const { carName, change } = req.body;

  await Catalogue.updateOne(
    { "menu.name": carName },
    { $inc: { "menu.$.stock": change } }
  );

  res.json({ success: true });
});

// ➕ Add New Car (AUTO-ID)
app.post("/admin/add-car", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ success: false });

  try {
    const catalogue = await Catalogue.findOne({});
    const menu = catalogue.menu || [];

    const maxId = menu.length
      ? Math.max(...menu.map(car => car.id || 0))
      : 0;

    const newCar = {
      ...req.body,
      id: maxId + 1,
      stock: Number(req.body.stock)
    };

    await Catalogue.updateOne(
      {},
      { $push: { menu: newCar } }
    );

    res.json({ success: true, id: newCar.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// 🗑 Delete Car
app.post("/admin/delete-car", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ success: false });

  const { name } = req.body;

  await Catalogue.updateOne(
    {},
    { $pull: { menu: { name } } }
  );

  res.json({ success: true });
});

// ======================================================
// 🚀 Start Server
// ======================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Backend running on port ${PORT}`)
);
