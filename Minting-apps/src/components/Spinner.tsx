import { useEffect, useState } from "react";

export function Spinner({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex justify-center mt-28 z-50">
          {/* Spinner */}
          <div className="spinner"></div>
        </div>
      )}
      {!loading && children}
    </>
  );
}
