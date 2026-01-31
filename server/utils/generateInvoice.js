import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateInvoice = async ({
  carName,
  customerName,
  phone,
  deliveryDate,
  deliveryTime,
  price,
  sale,
  saleApplied,
  sellerName,
  plate
}) => {
  // 🔥 Render allows only /tmp for writing
  const invoicesDir = "/tmp/invoices";

  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  const fileName = `invoice-${Date.now()}.pdf`;
  const filePath = path.join(invoicesDir, fileName);

  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const stream = fs.createWriteStream(filePath);
  const tax = 10;
  doc.pipe(stream);

  /* ================= WATERMARK ================= */
  const watermarkPath = path.join(process.cwd(), "assets", "logo.png");

  if (fs.existsSync(watermarkPath)) {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    doc.save();
    doc.opacity(0.08);
    doc.image(watermarkPath, pageWidth / 2 - 180, pageHeight / 2 - 180, { width: 360 });
    doc.restore();
  }

  /* ================= PRICE LOGIC ================= */
  const basePrice = Number(price);
  const safePrice = isNaN(basePrice) ? 0 : basePrice;

  const discount =
    saleApplied && Number(sale) > 0
      ? Math.round((safePrice * Number(sale)) / 100)
      : 0;

  const withoutTaxPrice = safePrice - discount;
  const taxAmount = Math.round(withoutTaxPrice * (tax / 100));
  const total = withoutTaxPrice + taxAmount;

  /* ================= HEADER ================= */
  const logoPath = path.join(process.cwd(), "assets", "logo.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 40, 35, { width: 70 });
  }

  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("ELITE MOTORS", 0, 40, { align: "center" });

  doc.fontSize(12).font("Helvetica").text("CAR DEALERSHIP", { align: "center" });
  doc.moveDown(1).fontSize(18).fillColor("#e10600").font("Helvetica-Bold").text("INVOICE", { align: "center" });
  doc.fillColor("#000");

  /* ================= CUSTOMER INFO ================= */
  doc.moveDown(2).fontSize(11).font("Helvetica");
  doc.text(`NAME : ${customerName}`, 40);
  doc.text(`PHONE : ${phone}`, 40);
  doc.text(`INVOICE : EL-${Date.now()}`, 40);
  doc.text(`DATE : ${new Date().toLocaleDateString()}`, 400, doc.y - 42);
  doc.text(`SELLER : ${sellerName}`, 400, doc.y - 42);

  doc.moveDown(5).moveTo(40, doc.y).lineTo(555, doc.y).stroke();

  /* ================= TABLE ================= */
  doc.moveDown(1);
  const tableTop = doc.y;

  doc.rect(40, tableTop, 515, 28).fill("#2f3640");
  doc.fillColor("white").font("Helvetica-Bold").fontSize(11)
    .text("CAR INFO", 50, tableTop + 8)
    .text("QTY", 350, tableTop + 8)
    .text("PRICE", 450, tableTop + 8);

  doc.fillColor("black").moveDown(2).font("Helvetica");
  doc.text(`CAR MODEL : ${carName}`, 50);
  doc.text(`NUMBER PLATE : ${plate}`, 50, doc.y + 15);
  doc.text("1", 360, tableTop + 36);
  doc.text(`Rs. ${safePrice.toLocaleString("en-IN")}`, 450, tableTop + 36);

  /* ================= TOTALS ================= */
  doc.moveDown(15).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(1).fontSize(11).font("Helvetica-Bold").text("PAYMENT DETAILS", 40);
  doc.font("Helvetica").moveDown(0.5);
  doc.text("TO : ELITE MOTORS", 40);
  doc.text("PAYMENT METHOD : BANK TRANSACTION", 40);

  doc.font("Helvetica-Bold");
  doc.text(`SUBTOTAL : Rs. ${safePrice.toLocaleString("en-IN")}`, 400, doc.y - 50);
  doc.text(`DISCOUNT : Rs. ${discount.toLocaleString("en-IN")}`, 400);
  doc.text(`TAX @ ${tax}% : Rs. ${taxAmount.toLocaleString("en-IN")}`, 400);
  doc.text(`TOTAL        : Rs. ${total.toLocaleString("en-IN")}`, 400);

  /* ================= FOOTER ================= */
  const footerHeight = 40;
  const footerY = doc.page.height - footerHeight;
  doc.save().rect(0, footerY, doc.page.width, footerHeight).fill("#2f3640").restore();

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
    throw new Error("Invoice PDF failed to generate");
  }

  return { filePath, fileName };
};
