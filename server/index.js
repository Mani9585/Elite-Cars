import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import axios from "axios";
import { generateInvoice } from "./utils/generateInvoice.js";

const app = express();
app.use(cors());
app.use(express.json());

/* ======================================================
   📦 Schema (PRICE FIXED)
====================================================== */
const catalogueSchema = new mongoose.Schema({
  company: String,
  menu: [
    {
      id: Number,
      name: String,
      category: String,
      image: String,
      topSpeed: String,
      price: Number,          // ✅ FIXED (was String)
      power: String,
      fuelType: String,
      stock: Number,
      sale: Number,
      saleEnd: String,
      seating: Number
    }
  ]
});

const Catalogue = mongoose.model("Catalogue", catalogueSchema);

/* ======================================================
   🔐 Staff Schema
====================================================== */

const staffSchema = new mongoose.Schema({
  company: String,
  user: [
    {
      id: Number,
      UserName: String,
      Password: String
    }
  ]
});

const Staff = mongoose.model("Staff", staffSchema, "staffs");


/* ======================================================
   🔐 Admin Auth Helper
====================================================== */
const isAdmin = (req) => {
  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "");
  return token === `${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD}`;
};

/* ======================================================
   🔐 Invoice Staff Auth Helper
====================================================== */

const isInvoiceStaff = async (req) => {
  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "");

  if (!token.includes(":")) return false;

  const [username, password] = token.split(":");

  const staff = await Staff.findOne({
    company: "EliteMotors",
    user: {
      $elemMatch: {
        UserName: username,
        Password: password
      }
    }
  });

  return !!staff;
};

/* ======================================================
   Health Check API
====================================================== */
app.get("/health", async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping(); // real DB ping
    res.status(200).json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "starting" });
  }
});



/* ======================================================
   🚗 Public API
====================================================== */
app.get("/cars", async (req, res) => {
  try {
    const catalogue = await Catalogue.findOne({});
    res.json(catalogue?.menu || []);
  } catch (err) {
    console.error("Cars API error:", err);
    res.json([]);
  }
});

/* ======================================================
   📦 Pre-Booking API (PDF + Discord)
====================================================== */
app.post("/prebook", async (req, res) => {
  try {
    const {
      name,
      phone,
      date,
      time,
      carName,
      originalPrice,
      appliedPrice,
      sale,
      saleApplied
    } = req.body;

    // 🔍 Stock check (FIXED for Mongo arrays)
    const exists = await Catalogue.findOne({
      menu: { $elemMatch: { name: carName, stock: { $gt: 0 } } }
    });

    if (!exists) {
      return res.status(400).json({ success: false });
    }

    // ➖ Reduce stock (FIXED to match the same car)
    await Catalogue.updateOne(
      { menu: { $elemMatch: { name: carName, stock: { $gt: 0 } } } },
      { $inc: { "menu.$.stock": -1 } }
    );

    // 📤 Discord message (Render-safe, no FormData)
    if (process.env.DISCORD_WEBHOOK) {
      const safeOriginal = Number(originalPrice) || 0;
      const safeApplied = Number(appliedPrice) || 0;

      await axios.post(process.env.DISCORD_WEBHOOK, {
        content:
`🚗 **NEW PRE-BOOKING**

👤 **Customer:** ${name}
📞 **Phone:** ${phone}
🚘 **Car:** ${carName}
📅 **Delivery:** ${date} ${time}

💸 **Sale:** ${sale}%
✅ **Sale Applied:** ${saleApplied ? "YES" : "NO"}
💰 **Original Price:** Rs ${safeOriginal.toLocaleString("en-IN")}
🤑 **Final Price:** Rs ${safeApplied.toLocaleString("en-IN")}`
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Prebook error:", err);
    res.status(500).json({ success: false });
  }
});

/* ======================================================
   📦 Invoice Login API (PDF + Discord)
====================================================== */

app.post("/invoice/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const staffDoc = await Staff.findOne({ company: "EliteMotors" });
    if (!staffDoc) return res.status(404).json({ success: false });

    const user = staffDoc.user.find(
      u => u.UserName === username && u.Password === password
    );

    if (!user) return res.status(401).json({ success: false });

    res.json({
      success: true,
      token: `${username}:${password}`,
      user: user.UserName
    });

  } catch (err) {
    console.error("Invoice login error:", err);
    res.status(500).json({ success: false });
  }
});



/* ======================================================
   📦 Invoice Booking API (PDF + Discord)
====================================================== */
app.post("/invoice", async (req, res) => {
  try {
    const {
      name,
      phone,
      date,
      time,
      carName,
      originalPrice,
      appliedPrice,
      sale,
      saleApplied,
      sellerName,
      plate,
      withoutTaxPrice,
      taxAmount
    } = req.body;

    console.log("📥 Invoice Request:", req.body);

    // ===============================
    // 🔍 Stock Check
    // ===============================
    const exists = await Catalogue.findOne({
      menu: { $elemMatch: { name: carName, stock: { $gt: 0 } } }
    });

    if (!exists) {
      return res.status(400).json({
        success: false,
        message: "Car not found or out of stock"
      });
    }

    // ===============================
    // 💰 Safe Number Conversion
    // ===============================
    const original = Number(originalPrice);
    const withoutTax = Number(withoutTaxPrice);
    const tax = Number(taxAmount);
    const discount = Number(sale);
    const total = withoutTax + tax;

    // ===============================
    // 🧾 Generate Invoice PDF
    // ===============================
    const { filePath, fileName } = await generateInvoice({
      carName,
      customerName: name,
      phone,
      deliveryDate: date,
      deliveryTime: time,
      price: original,
      sale: discount,
      saleApplied,
      sellerName,
      plate
    });

    // ===============================
    // 📤 Send to Discord (multipart is required here)
    // ===============================
    if (process.env.INVOICE_WEBHOOK) {
      const form = new FormData();

      // Ensure file exists before reading (Render safety)
      if (!fs.existsSync(filePath)) {
        throw new Error("Invoice PDF not found: " + filePath);
      }

      form.append(
        "files[0]",
        fs.createReadStream(filePath),
        {
          filename: fileName,
          contentType: "application/pdf"
        }
      );

      form.append(
        "payload_json",
        JSON.stringify({
          content:
`🚗 **NEW BOOKING INVOICE**

👤 **Customer:** ${name}
📞 **Phone:** ${phone}
🚘 **Car:** ${carName}
📅 **Delivery:** ${date} ${time}
🙎 **Seller Staff:** ${sellerName}
🔢 **Car Plate:** ${plate}

💸 **Sale:** ${discount}%
✅ **Sale Applied:** ${saleApplied ? "YES" : "NO"}

💰 **Original Price:** Rs. ${original.toLocaleString("en-IN")}
🤑 **Discounted Price:** Rs. ${withoutTax.toLocaleString("en-IN")}
🙏 **Tax Amount:** Rs. ${tax.toLocaleString("en-IN")}
🪙 **Total Amount:** Rs. ${total.toLocaleString("en-IN")}`
        })
      );

      await axios.post(process.env.INVOICE_WEBHOOK, form, {
        headers: form.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
    }

    // ===============================
    // 🧹 Delete PDF (Render-safe)
    // ===============================
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error("❌ Failed to delete invoice:", e.message);
      }
    }

    res.json({ success: true });

  } catch (err) {
    console.error("🔥 Invoice Error:", err);
    res.status(500).json({
      success: false,
      message: "Invoice generation failed"
    });
  }
});

/* ======================================================
   🔐 Invoice Users
====================================================== */
app.get("/admin/invoice-users", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json([]);

  try {
    const staff = await Staff.findOne({ company: "EliteMotors" });
    res.json(staff?.user || []);
  } catch (err) {
    console.error("Fetch invoice users error:", err);
    res.json([]);
  }
});

/* ======================================================
    ➕ Add Invoice User
====================================================== */

app.post("/admin/add-invoice-user", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ success: false });

  try {
    const { UserName, Password } = req.body;

    if (!UserName || !Password) {
      return res.status(400).json({ success: false });
    }

    let staff = await Staff.findOne({ company: "EliteMotors" });

    // Create document if not exists
    if (!staff) {
      staff = new Staff({
        company: "EliteMotors",
        user: []
      });
    }

    // Auto increment ID
    const maxId = staff.user.length
      ? Math.max(...staff.user.map(u => u.id))
      : 0;

    staff.user.push({
      id: maxId + 1,
      UserName,
      Password
    });

    await staff.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Add invoice user error:", err);
    res.status(500).json({ success: false });
  }
});

/* ======================================================
  🗑️ Delete Invoice User
====================================================== */

app.post("/admin/delete-invoice-user", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ success: false });

  try {
    const { id } = req.body;

    await Staff.updateOne(
      { company: "EliteMotors" },
      { $pull: { user: { id: Number(id) } } }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Delete invoice user error:", err);
    res.status(500).json({ success: false });
  }
});

/* ======================================================
   🔐 Admin Login
====================================================== */
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

/* ======================================================
   🔐 Admin APIs
====================================================== */

// ➕ / ➖ Stock update
app.post("/admin/update-stock", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ success: false });

  const { carName, change } = req.body;

  await Catalogue.updateOne(
    { "menu.name": carName },
    { $inc: { "menu.$.stock": Number(change) } }
  );

  res.json({ success: true });
});

// ➕ Add new car
app.post("/admin/add-car", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ success: false });

  try {
    const catalogue = await Catalogue.findOne({});
    const menu = catalogue?.menu || [];

    const maxId = menu.length
      ? Math.max(...menu.map(car => car.id || 0))
      : 0;

    const newCar = {
      ...req.body,
      id: maxId + 1,
      price: Number(req.body.price),   // ✅ FORCE NUMBER
      stock: Number(req.body.stock),
      sale: Number(req.body.sale) || 0,
      seating: Number(req.body.seating),
      saleEnd: req.body.saleEnd || null
    };

    await Catalogue.updateOne({}, { $push: { menu: newCar } });

    res.json({ success: true, id: newCar.id });
  } catch (err) {
    console.error("Add car error:", err);
    res.status(500).json({ success: false });
  }
});

// ✏️ Update car
app.post("/admin/update-car", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ success: false });

  const car = req.body;

  await Catalogue.updateOne(
    { "menu.name": car.name },
    {
      $set: {
        "menu.$.image": car.image,
        "menu.$.category": car.category,
        "menu.$.topSpeed": car.topSpeed,
        "menu.$.price": Number(car.price),  // ✅ FIXED
        "menu.$.power": car.power,
        "menu.$.fuelType": car.fuelType,
        "menu.$.stock": Number(car.stock),
        "menu.$.seating": Number(car.seating),
        "menu.$.sale": Math.max(0, Number(car.sale) || 0),
        "menu.$.saleEnd": car.saleEnd || null
      }
    }
  );

  res.json({ success: true });
});

// 🗑 Delete car
app.post("/admin/delete-car", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ success: false });

  const { name } = req.body;
  await Catalogue.updateOne({}, { $pull: { menu: { name } } });

  res.json({ success: true });
});

/* ======================================================
   🟢 Health Check
====================================================== */
app.get("/", (req, res) => {
  res.send("Elite Cars API is running 🚀");
});

/* ======================================================
   🔗 MongoDB + Server
====================================================== */
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000
  })
  .then(() => {
    console.log("MongoDB connected:", mongoose.connection.name);
    app.listen(PORT, () =>
      console.log(`Backend running on port ${PORT}`)
    );
  })
  .catch(err => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });
