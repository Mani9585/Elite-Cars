import { useEffect, useState } from "react";
import { FaTachometerAlt, FaGasPump, FaRupeeSign, FaUsers } from "react-icons/fa";
import { PiEngineBold } from "react-icons/pi";
import logo from "../assets/logo.png"
import PreBookModal from "./PreBookModal";
import "./Catalogue.css";

export default function Catalogue() {
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [show, setShow] = useState(false);

  // 🔄 Fetch cars
  useEffect(() => {
    const fetchCars = () => {
      fetch(`${process.env.REACT_APP_API_URL}/cars`)
        .then(res => res.json())
        .then(data => setCars(Array.isArray(data) ? data : []))
        .catch(() => {});
    };

    fetchCars();
    const interval = setInterval(fetchCars, 5000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 Trigger animations on mount
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  // ✅ Sale active
  const isSaleActive = (car) =>
    car.sale && car.saleEnd && new Date(car.saleEnd).getTime() > Date.now();

  // 🧠 Categories
  const categories = [
    "All",
    ...new Set(cars.map(car => car.category).filter(Boolean))
  ];

  const filteredCars =
    activeCategory === "All"
      ? cars
      : cars.filter(car => car.category === activeCategory);

  const formatPrice = (value) =>
    Number(value).toLocaleString("en-IN");

  return (
    <section className={`catalogue ${show ? "show" : ""}`}>

      {/* HEADING */}
      <div className="catalogue-heading">
        <div 
          data-animate="1"
          className="brand-logo-wrapper"
        >
          <img
              src={logo}
              alt="Elite Cars Logo"
              className="brand-logo"
          />
        </div>
        <h1 data-animate="1">Elite Collections</h1>
        <p data-animate="2">
          Handpicked luxury vehicles crafted for performance and prestige
        </p>
      </div>

      {/* CATEGORY FILTER */}
      <div className="category-bar" data-animate="3">
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-btn ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div className="catalogue-grid">
        {filteredCars.map((car, index) => {
          const price = Number(car.price);
          const sale = Math.max(0, Number(car.sale) || 0);
          const saleActive = sale > 0 && isSaleActive(car);

          const discount = saleActive
            ? Math.round(price * (sale / 100))
            : 0;

          const finalPrice = price - discount;

          return (
            <div
              className="catalogue-card"
              key={index}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {/* STOCK */}
              <div className={`stock-badge ${car.stock > 0 ? "in-stock" : "out-stock"}`}>
                {car.stock > 0 ? `${car.stock} LEFT` : "OUT OF STOCK"}
              </div>

              {/* SALE */}
              {saleActive && (
                <div className="sale-badge">
                  {sale}% OFF
                  <span className="sale-timer">
                    Ends {new Date(car.saleEnd).toLocaleString()}
                  </span>
                </div>
              )}

              <img src={car.image} alt={car.name} />
              <h3>{car.name}</h3>

              <div className="specs">
                <span><FaTachometerAlt /> {car.topSpeed || "Nil"}</span>
                <span><PiEngineBold /> {car.power || "Nil"}</span>
                <span><FaGasPump /> {car.fuelType || "Nil"}</span>
                <span><FaUsers /> {car.seating || "—"} Seater</span>

                <span className="price">
                  <FaRupeeSign />
                  {saleActive ? (
                    <>
                      <span className="old-price">
                        {formatPrice(price)} + Taxes
                      </span>
                      <span className="new-price">
                        {formatPrice(finalPrice)} + Taxes
                      </span>
                    </>
                  ) : (
                    <>
                      {formatPrice(price)}
                      <span className="tax-text">+ Taxes</span>
                    </>
                  )}
                </span>
              </div>

              {car.stock > 0 ? (
                <button
                  className="prebook-btn"
                  onClick={() => setSelectedCar(car)}
                >
                  Pre-Book
                </button>
              ) : (
                <div className="available-soon">Available Soon</div>
              )}
            </div>
          );
        })}
      </div>

      {/* EMPTY */}
      {filteredCars.length === 0 && (
        <div className="empty-state" data-animate="4">
          <h2 className="empty-title">NO CARS FOUND</h2>
          <p className="empty-subtitle">
            No vehicles available in this category
          </p>
        </div>
      )}

      {selectedCar && (
        <PreBookModal
          car={selectedCar}
          onClose={() => setSelectedCar(null)}
          onBooked={() => setSelectedCar(null)}
        />
      )}
    </section>
  );
}
