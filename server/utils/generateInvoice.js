import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateInvoice = async ({
  carName,
  customerName,
  phone,
  deliveryDate,
  deliveryTime,
  price,          // FULL AMOUNT (e.g. 2500000)
  sale,           // percentage (e.g. 5)
  saleApplied,     // true / false
  sellerName
}) => {
  const invoicesDir = path.join(process.cwd(), "invoices");

  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  const fileName = `invoice-${Date.now()}.pdf`;
  const filePath = path.join(invoicesDir, fileName);

  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  /* ================= PRICE LOGIC (FINAL) ================= */
  const basePrice = Number(price);
  const safePrice = isNaN(basePrice) ? 0 : basePrice;

  const discount =
    saleApplied && Number(sale) > 0
      ? Math.round((safePrice * Number(sale)) / 100)
      : 0;

  const total = safePrice - discount;

  /* ================= HEADER ================= */
  const logoPath = path.join(process.cwd(), "assets", "logo.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 40, 35, { width: 70 });
  }

  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("ELITE MOTORS", 0, 40, { align: "center" });

  doc
    .fontSize(12)
    .font("Helvetica")
    .text("CAR DEALERSHIP", { align: "center" });

  doc
    .moveDown(1)
    .fontSize(18)
    .fillColor("#e10600")
    .font("Helvetica-Bold")
    .text("INVOICE", { align: "center" });

  doc.fillColor("#000");

  /* ================= CUSTOMER INFO ================= */
  doc.moveDown(2);
  doc.fontSize(11).font("Helvetica");

  doc.text(`NAME : ${customerName}`, 40);
  doc.text(`PHONE : ${phone}`, 40);
  doc.text(`INVOICE : EL-${Date.now()}`, 40);

  doc.text(
    `DATE : ${new Date().toLocaleDateString()}`,
    400,
    doc.y - 42
  );
  
  doc.text(
    `SELLER : ${sellerName}`, 400, doc.y - 42
  );

  doc.moveDown(5);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();

  /* ================= TABLE HEADER ================= */
  doc.moveDown(1);
  const tableTop = doc.y;

  doc.rect(40, tableTop, 515, 28).fill("#2f3640");

  doc
    .fillColor("white")
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("CAR INFO", 50, tableTop + 8)
    .text("QTY", 350, tableTop + 8)
    .text("PRICE", 450, tableTop + 8);

  doc.fillColor("black");

  /* ================= TABLE CONTENT ================= */
  doc.moveDown(2);
  doc.font("Helvetica");

  doc.text(`CAR MODEL : ${carName}`, 50);
  doc.text("NUMBER PLATE : To Be Assigned", 50, doc.y + 15);

  doc.text("1", 360, tableTop + 36);
  doc.text(
    `Rs. ${safePrice.toLocaleString("en-IN")}`,
    450,
    tableTop + 36
  );

  /* ================= PAYMENT SECTION ================= */
  doc.moveDown(15);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();

  doc.moveDown(1);
  doc.fontSize(11).font("Helvetica-Bold").text("PAYMENT DETAILS", 40);
  doc.font("Helvetica").moveDown(0.5);

  doc.text("TO : ELITE MOTORS", 40);
  doc.text("PAYMENT METHOD : BANK TRANSACTION", 40);

  /* ================= TOTALS ================= */
  doc.font("Helvetica-Bold");

  doc.text(
    `SUBTOTAL : Rs. ${safePrice.toLocaleString("en-IN")}`,
    400,
    doc.y - 50
  );

  doc.text(
    `DISCOUNT : Rs. ${discount.toLocaleString("en-IN")}`,
    400
  );

  doc.text(
    `TOTAL : Rs. ${total.toLocaleString("en-IN")}`,
    400
  );

  /* ================= TERMS ================= */
  doc.moveDown(3);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();

  doc.moveDown(1);
  doc.font("Helvetica-Bold").text("TERMS AND CONDITIONS", 40);
  doc.moveDown(0.5);

  doc.font("Helvetica").fontSize(9).text(
    `This invoice is issued by Elite Motors, ThalaiNagaram City. All vehicle details, pricing, and customer information shown in this invoice are final at the time of sale. Payment must be completed before vehicle delivery. Once delivered, the dealer will not be responsible for any mechanical issues, damages, fines, or legal matters. Registration, insurance, and tax charges are the customer's responsibility unless mentioned otherwise. Cancellation after booking may result in loss of advance amount. Any legal matters, if raised, will be handled only in Thalaingaram City courts.`,
    40,
    doc.y,
    { width: 515, align: "justify" }
  );

  /* ================= FOOTER (FIXED) ================= */
  const footerHeight = 40;
  const footerY = doc.page.height - footerHeight;

  doc
    .save()
    .rect(0, footerY, doc.page.width, footerHeight)
    .fill("#2f3640")
    .restore();

  doc.end();

  /* ================= WAIT FOR FILE WRITE ================= */
  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  const stats = fs.statSync(filePath);
  if (stats.size === 0) {
    throw new Error("Generated invoice is empty");
  }

  return { filePath, fileName };
};
