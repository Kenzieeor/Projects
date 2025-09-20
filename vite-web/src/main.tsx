// main.tsx
import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Providers } from "./components/Providers.tsx";
import Navbar from "./components/Navbar.tsx";
import { Spinner } from "./components/Spinner.tsx";

function Root() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // contoh fetch data
    fetch("https://jsonplaceholder.typicode.com/posts/1")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, []);

  return (
    <Providers>
      <Spinner isLoading={loading}>
        <Navbar />
        <App />
      </Spinner>
    </Providers>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
