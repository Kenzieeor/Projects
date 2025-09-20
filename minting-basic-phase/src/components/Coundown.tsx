"use client";

import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { ABI } from "../components/Abi";
import { ADDRESS } from "@/components/Contracts";

type CountdownProps = {
  targetTime: number;
  now: number;
};

const Countdown = ({ targetTime, now }: CountdownProps) => {
  const secondsLeft = targetTime - now;
  const started = secondsLeft <= 0;

  const days = Math.floor(Math.max(secondsLeft, 0) / (24 * 3600));
  const hours = Math.floor((Math.max(secondsLeft, 0) % (24 * 3600)) / 3600);
  const minutes = Math.floor((Math.max(secondsLeft, 0) % 3600) / 60);
  const secs = Math.max(secondsLeft, 0) % 60;

  return (
    <div className="text-lg transition-opacity duration-500 ease-in-out mb-5 mt-5">
      {started ? (
        <p className="text-4xl font-bold tracking-widest">LIVE</p>
      ) : (
        <div className="flex flex-col justify-between items-center text-center w-full gap-2">
          <p className="text-lg font-bold">STARTS IN</p>
          <p className="min-w-[140px]" translate="no">
            {days}d {hours}h {minutes}m {secs}s
          </p>
        </div>
      )}
    </div>
  );
};

const CountdownTimer = () => {
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  const { data: publicStart } = useReadContract({
    address: ADDRESS,
    abi: ABI,
    functionName: "getMintTime",
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!publicStart) return null;

  const targetTime = Number(publicStart); // langsung ambil 1 nilai

  return (
    <div className="text-lg flex items-center justify-center animate-fade-in">
      <Countdown targetTime={targetTime} now={now} />
    </div>
  );
};

export default CountdownTimer;
