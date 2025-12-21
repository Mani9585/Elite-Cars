import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(
  process.cwd(),
  "data",
  "catalogue.json"
);

// 📌 READ CARS
const readCars = () => {
  const data = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(data);
};

// 📌 WRITE CARS
const writeCars = (cars) => {
  fs.writeFileSync(DATA_PATH, JSON.stringify(cars, null, 2));
};

// ✅ GET CATALOGUE
app.get("/cars", (req, res) => {
  const cars = readCars();
  res.json(cars);
});

// ✅ PREBOOK (REDUCE STOCK + DISCORD)
app.post("/prebook", async (req, res) => {
  try {
    const { name, phone, date, time, carName } = req.body;

    const cars = readCars();

    const carIndex = cars.findIndex(
      (c) => c.name === carName && c.stock > 0
    );

    if (carIndex === -1) {
      return res.status(400).json({ success: false });
    }

    // 🔥 REDUCE STOCK
    cars[carIndex].stock -= 1;

    // 💾 SAVE TO JSON
    writeCars(cars);

    // 🔔 DISCORD MESSAGE
    await fetch(process.env.DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `
🚗 **NEW PRE-BOOKING**

**Car:** ${carName}
**Name:** ${name}
**Phone:** ${phone}
**Delivery:** ${date} ${time}
        `
      })
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.listen(5000, () =>
  console.log("Backend running on http://localhost:5000")
);
