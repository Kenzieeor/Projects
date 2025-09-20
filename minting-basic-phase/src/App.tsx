import { Routes, Route } from "react-router-dom";
import Mint from "@/pages/Mint";
import Galery from "@/pages/Galery";
import Royalties from "@/pages/Royalties";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Mint />} />
      <Route path="/galery" element={<Galery />} />
      <Route path="/royalties" element={<Royalties />} />
    </Routes>
  );
}
