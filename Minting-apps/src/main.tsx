import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { Providers } from "@/components/Providers.tsx";
import { Spinner } from "@/components/Spinner.tsx";
import Navbar from "@/components/Navbar.tsx";
import Footer from "@/components/Footer.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Providers>
        <Spinner>
          <Navbar />
          <App />
          <Footer />
        </Spinner>
      </Providers>
    </BrowserRouter>
  </StrictMode>
);
