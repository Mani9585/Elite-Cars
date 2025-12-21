import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import ScrollToTop from "./components/ScrollToTop";
import Loader from "./components/Loader";
import BackgroundLayout from "./components/BackgroundLayout";
import Home from "./components/Home";
import Catalogue from "./components/Catalogue";
import Career from "./components/Career";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";


export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <Loader />;

  console.log("API URL:", process.env.REACT_APP_API_URL);

  return (
    <BrowserRouter>
      <ScrollToTop/> 
      <Routes>
        <Route element={<BackgroundLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/career" element={<Career />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
