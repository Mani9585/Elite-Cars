import { useEffect, useState } from "react";
import {
  FaTachometerAlt,
  FaGasPump,
  FaRoad,
  FaBoxOpen
} from "react-icons/fa";
import PreBookModal from "./PreBookModal";
import "./Catalogue.css";

export default function Catalogue() {
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);

  // 🔥 LOAD CARS FROM BACKEND
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/cars`)
      .then((res) => res.json())
      .then(setCars);
  }, []);

  return (
    <section className="catalogue">

      <div className="catalogue-heading">
        <h1>Elite Collections</h1>
        <p>Handpicked luxury vehicles crafted for performance and prestige</p>
      </div>

      <div className="catalogue-grid">
        {cars.map((car, index) => (
          <div className="catalogue-card" key={index}>

            <div className={`stock-badge ${car.stock > 0 ? "in-stock" : "out-stock"}`}>
              {car.stock > 0 ? `${car.stock} LEFT` : "OUT OF STOCK"}
            </div>

            <img src={car.image} alt={car.name} />
            <h3>{car.name}</h3>

            <div className="specs">
              <span><FaTachometerAlt /> {car.topSpeed}</span>
              <span><FaRoad /> {car.mileage}</span>
              <span><FaGasPump /> {car.fuelType}</span>
              <span><FaBoxOpen /> {car.price}</span>
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
        ))}
      </div>

      {selectedCar && (
        <PreBookModal
          car={selectedCar}
          onClose={() => setSelectedCar(null)}
          onBooked={() => {
            // 🔄 RE-FETCH UPDATED DATA
            fetch("http://localhost:5000/cars")
              .then((res) => res.json())
              .then(setCars);
            setSelectedCar(null);
          }}
        />
      )}

    </section>
  );
}
