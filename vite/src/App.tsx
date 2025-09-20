import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ABI } from "@/components/Abi";
import { CONTRACT_ADDRESS } from "@/components/Contracts";
import { parseEther } from "viem";
import Countdown from "react-countdown";
import {
  useWriteContract,
  useReadContract,
  useAccount,
  useWaitForTransactionReceipt,
} from "wagmi";

export default function App() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [mintAmount, setMintAmount] = useState(1);
  const [isMinting, setIsMinting] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: mintTime } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getMintTime",
    query: { refetchInterval: 1000 },
  });

  // total supply
  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "totalSupply",
    query: {
      refetchInterval: 2000,
    },
  });

  // max supply
  const { data: maxSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "MAX_SUPPLY",
  });

  const supply = totalSupply ? Number(totalSupply) : 0;
  const max = maxSupply ? Number(maxSupply) : 10000;

  const [freemintStart, whitelistStart, publicStart] = (mintTime ?? [
    0n,
    0n,
    0n,
  ]) as [bigint, bigint, bigint];

  const stage = (() => {
    if (now >= Number(publicStart)) return "Public";
    if (now >= Number(whitelistStart)) return "Whitelist";
    if (now >= Number(freemintStart)) return "Freemint";
    return "Starts in";
  })();

  const stageTime = (() => {
    if (now < Number(freemintStart)) return Number(freemintStart);
    if (now < Number(whitelistStart)) return Number(whitelistStart);
    if (now < Number(publicStart)) return Number(publicStart);
    return null;
  })();

  const price = (() => {
    switch (stage) {
      case "Freemint":
        return 0;
      case "Whitelist":
        return 1;
      case "Public":
        return 2;
      default:
        return 0;
    }
  })();

  const maxMint = (() => {
    switch (stage) {
      case "Freemint":
        return 1;
      case "Whitelist":
        return 10;
      case "Public":
        return 50;
      default:
        return 1;
    }
  })();

  const { isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleMint = async () => {
    setIsMinting(true);
    setTxHash(undefined);

    try {
      const tx = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "mint",
        args: [BigInt(mintAmount)],
        value: parseEther(`${price * mintAmount}`),
      });
      setTxHash(tx);
    } catch (err: any) {
      console.error(err, "Minting failed!");
      setIsMinting(false);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setMintAmount(1);
      setIsMinting(false);
    }
  }, [isSuccess]);

  const decrement = () => setMintAmount((prev) => Math.max(prev - 1, 1));
  const increment = () => setMintAmount((prev) => Math.min(prev + 1, maxMint));

  return (
    <div className="flex items-center justify-center mt-20 mb-2 overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20">
        <div className="flex items-center justify-center min-h-[380px]">
          <img
            src="/Background/logo1.gif"
            alt="logo"
            className="w-[280px] h-[300px] rounded-lg"
          />
        </div>

        <div className="flex flex-col gap-4 bg-[#141414] p-6 rounded-2xl w-auto max-w-[300px] text-white shadow-lg">
          {/* Title */}
          <div className="flex flex-col">
            <div className="text-2xl font-bold -translate-y-3">Ninja fu</div>
            <div className="text-sm text-gray-400">
              A suite of simple tools to create, launch and grow your NFT
              projects.
            </div>
          </div>

          {/* Mint status row */}
          <div className="flex flex-col bg-white/5 gap-4 p-2 rounded-lg">
            <div className="flex items-center justify-between text-sm font-medium">
              <div className="flex flex-col text-lg uppercase min-h-[60px] translate-y-1">
                {!mintTime ? (
                  // Kalau masih loading data kontrak
                  <div className="flex items-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.6,
                        ease: "linear",
                      }}
                      className="ml-2 w-4 h-4 translate-y-5 border-2 border-blue-500 border-t-transparent rounded-full"
                    />
                  </div>
                ) : (
                  <>
                    {stage}{" "}
                    {stage === "Starts in" && stageTime ? (
                      <Countdown
                        date={stageTime * 1000}
                        renderer={({ days, hours, minutes, seconds }) => (
                          <div className="text-sm text-yellow-400">
                            {days}d {hours}h {minutes}m {seconds}s
                          </div>
                        )}
                      />
                    ) : (
                      <div className="text-[17px] text-green-500">LIVE</div>
                    )}
                  </>
                )}
              </div>

              <div className="flex flex-col gap-1 text-lg">
                <div className="flex justify-end">{price * mintAmount} CRO</div>
                <div className="text-right text-sm text-gray-400">
                  {supply} / {max}
                </div>
              </div>
            </div>
            {/* Progress */}
            <div className="flex flex-col gap-2">
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-white/80 transition-all duration-500"
                  style={{ width: `${(supply / max) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="flex flex-row gap-2 border border-white/20 rounded px-1 py-1 w-fit">
                <button
                  onClick={decrement}
                  disabled={isMinting}
                  className="flex items-center justify-center bg-white/10 hover:bg-white/20 w-10 h-auto rounded cursor-pointer transition duration-200"
                >
                  –
                </button>

                <span className="flex items-center justify-center min-w-[20px] text-sm">
                  {mintAmount}
                </span>

                <button
                  onClick={increment}
                  disabled={isMinting}
                  className="flex items-center justify-center bg-white/10 hover:bg-white/20 w-10 h-auto rounded cursor-pointer transition duration-200"
                >
                  +
                </button>
              </div>
            </div>

            {/* Mint button */}
            <button
              onClick={handleMint}
              disabled={isMinting}
              className="flex items-center justify-center h-9 w-full bg-white/10 rounded transition duration-200 cursor-pointer"
            >
              {isMinting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.6,
                    ease: "linear",
                  }}
                  className="w-5 h-5 border-2 border-white/30 border-t-transparent rounded-full"
                />
              ) : (
                "Mint"
              )}
            </button>
            {/* Limit info */}
            <div className="text-center text-sm text-gray-400">
              Limit 1 Per Wallet
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
