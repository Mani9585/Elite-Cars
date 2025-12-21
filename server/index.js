import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(process.cwd(), "data", "catalogue.json");

// ================= HELPERS =================
const readCars = () =>
  JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));

const writeCars = (cars) =>
  fs.writeFileSync(DATA_PATH, JSON.stringify(cars, null, 2));

const isAdmin = (req) => {
  const token = req.headers.authorization;
  return (
    token ===
    `Bearer ${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD}`
  );
};

// ================= PUBLIC =================
app.get("/cars", (req, res) => {
  res.json(readCars());
});

// ================= ADMIN LOGIN =================
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

// ================= BOOKING =================
app.post("/prebook", async (req, res) => {
  try {
    const { name, phone, date, time, carName } = req.body;

    const cars = readCars();
    const car = cars.find(c => c.name === carName && c.stock > 0);

    if (!car) {
      return res.status(400).json({ success: false });
    }

    car.stock -= 1;
    writeCars(cars);

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
  } catch {
    res.status(500).json({ success: false });
  }
});

// ================= ADMIN APIs =================
app.post("/admin/update-stock", (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ success: false });

  const { carName, change } = req.body;
  const cars = readCars();
  const car = cars.find(c => c.name === carName);

  if (!car) return res.status(404).json({ success: false });

  car.stock = Math.max(0, car.stock + change);
  writeCars(cars);

  res.json({ success: true, stock: car.stock });
});

app.post("/admin/add-car", (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ success: false });

  const cars = readCars();
  cars.push(req.body);
  writeCars(cars);

  res.json({ success: true });
});

app.post("/admin/delete-car", (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ success: false });

  const { name } = req.body;
  const cars = readCars().filter(c => c.name !== name);
  writeCars(cars);

  res.json({ success: true });
});

// ================= START =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Backend running on port ${PORT}`)
);
