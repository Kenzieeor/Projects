import { useState, useEffect } from "react";

interface Partner {
  x: number;
  y: number;
  caught: boolean;
}

export default function App() {
  const [playerX, setPlayerX] = useState(300);
  const [partner, setPartner] = useState<Partner>({
    x: 500,
    y: 300,
    caught: false,
  });
  const [score, setScore] = useState(0);

  // Gerakkan partner secara acak setiap 2 detik
  useEffect(() => {
    const interval = setInterval(() => {
      setPartner((prev) => ({
        x: Math.random() * 600,
        y: Math.random() * 400,
        caught: false,
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Handle player movement & “pacaran”
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") setPlayerX((x) => Math.max(x - 20, 0));
    if (e.key === "ArrowRight") setPlayerX((x) => Math.min(x + 20, 600));

    // cek dekat dengan partner
    const dx = Math.abs(partner.x - playerX);
    const dy = Math.abs(partner.y - 500); // player di bawah
    if (dx < 50 && dy < 50 && !partner.caught) {
      setScore(score + 1);
      setPartner({ ...partner, caught: true });
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playerX, partner, score]);

  return (
    <div className="relative w-[700px] h-screen bg-pink-200 mx-auto overflow-hidden">
      {/* Score */}
      <div className="absolute top-4 left-4 text-white font-bold text-xl">
        Score: {score}
      </div>

      {/* Player */}
      <div
        className="absolute w-40 h-40 bg-blue-500 rounded-full bottom-0"
        style={{ left: playerX }}
      ></div>

      {/* Partner */}
      {!partner.caught && (
        <div
          className="absolute w-40 h-40 bg-red-500 rounded-full"
          style={{ left: partner.x, top: partner.y }}
        ></div>
      )}
    </div>
  );
}
