import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import InputDataPage from "@/pages/InputDataPage";
import DetailsPage from "@/pages/Details";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/input" element={<InputDataPage />} />
      <Route path="/details" element={<DetailsPage />} />
    </Routes>
  );
}
