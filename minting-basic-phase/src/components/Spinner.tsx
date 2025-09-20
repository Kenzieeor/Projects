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
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin [animation-duration:0.4s]"></div>
        </div>
      )}
      {!loading && children}
    </>
  );
}
