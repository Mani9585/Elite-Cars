import { useEffect, useState } from "react";
import {
  FaTachometerAlt,
  FaGasPump,
  FaRoad,
  FaRupeeSign
} from "react-icons/fa";
import PreBookModal from "./PreBookModal";
import "./Catalogue.css";

export default function Catalogue() {
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  // 🔄 Fetch cars (polling)
  useEffect(() => {
    const fetchCars = () => {
      fetch(`${process.env.REACT_APP_API_URL}/cars`)
        .then(res => res.json())
        .then(data => {
          setCars(Array.isArray(data) ? data : []);
        })
        .catch(() => {});
    };

    fetchCars();
    const interval = setInterval(fetchCars, 5000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Sale active check
  const isSaleActive = (car) => {
    if (!car.sale || !car.saleEnd) return false;
    return new Date(car.saleEnd).getTime() > Date.now();
  };

  // 🧠 Extract categories from DB
  const categories = [
    "All",
    ...new Set(cars.map(car => car.category).filter(Boolean))
  ];

  // 🔍 Filter cars
  const filteredCars =
    activeCategory === "All"
      ? cars
      : cars.filter(car => car.category === activeCategory);

  // 💰 Price formatter (Indian format)
  const formatPrice = (value) =>
    Number(value).toLocaleString("en-IN");

  return (
    <section className="catalogue">

      <div className="catalogue-heading">
        <h1>Elite Collections</h1>
        <p>Handpicked luxury vehicles crafted for performance and prestige</p>
      </div>

      {/* 🔖 CATEGORY FILTER */}
      <div className="category-bar">
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

      {/* 🚗 GRID */}
      <div className="catalogue-grid">
        {filteredCars.map((car, index) => {
          const price = Number(car.price);
          const sale = Math.max(0, Number(car.sale) || 0);
          const saleActive = sale > 0 && isSaleActive(car);

          const discountAmount = saleActive
            ? Math.round(price * (sale / 100))
            : 0;

          const finalPrice = price - discountAmount;

          return (
            <div className="catalogue-card" key={index}>

              {/* STOCK BADGE */}
              <div
                className={`stock-badge ${
                  car.stock > 0 ? "in-stock" : "out-stock"
                }`}
              >
                {car.stock > 0 ? `${car.stock} LEFT` : "OUT OF STOCK"}
              </div>

              {/* SALE BADGE */}
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

              {/* SPECS */}
              <div className="specs">
                <span><FaTachometerAlt /> {car.topSpeed}</span>
                <span><FaRoad /> {car.mileage}</span>
                <span><FaGasPump /> {car.fuelType}</span>

                <span className="price">
                  <FaRupeeSign />
                  {saleActive ? (
                    <>
                      <span className="old-price">
                        {formatPrice(price)}
                      </span>
                      <span className="new-price">
                        {formatPrice(finalPrice)}
                      </span>
                    </>
                  ) : (
                    formatPrice(price)
                  )}
                </span>
              </div>

              {/* ACTION */}
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

      {/* EMPTY STATE */}
      {filteredCars.length === 0 && (
        <div className="empty-state">
          <h2 className="empty-title">NO CARS FOUND</h2>
          <p className="empty-subtitle">
            No vehicles available in this category
          </p>
        </div>
      )}

      {/* MODAL */}
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
