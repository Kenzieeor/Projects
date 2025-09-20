import { useState, useEffect } from "react";
import { FiMinimize2 } from "react-icons/fi";
import { motion } from "framer-motion";
import { ABI } from "@/components/Abi";
import { ADDRESS } from "@/components/Contracts";
import CountdownTimer from "@/components/Coundown";

import {
  useAccount,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";

export default function Mint() {
  const links = [
    { name: "home", path: "/" },
    { name: "galery", path: "/galery" },
    { name: "royalties", path: "/royalties" },
  ];

  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [mintAmount, setMintAmount] = useState(1);
  const [isMinting, setIsMinting] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  const [showSuccess, setShowSuccess] = useState(false);
  const [newMintedIds, setNewMintedIds] = useState<number[]>([]);
  const [showMintedBox, setShowMintedBox] = useState(true);
  const [supplyBeforeMint, setSupplyBeforeMint] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [showSpinner, setShowSpinner] = useState<{ [key: number]: boolean }>(
    {}
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mint start time
  const { data: mintTime } = useReadContract({
    address: ADDRESS,
    abi: ABI,
    functionName: "getMintTime",
    query: { refetchInterval: 1000 },
  });

  // Total supply
  const { data: totalSupply } = useReadContract({
    address: ADDRESS,
    abi: ABI,
    functionName: "totalSupply",
    query: { refetchInterval: 1000 },
  });

  const { data: MAX_SUPPLY } = useReadContract({
    address: ADDRESS,
    abi: ABI,
    functionName: "MAX_SUPPLY",
    query: { refetchInterval: 1000 },
  });

  const { data: mintedPerWalletData } = useReadContract({
    address: ADDRESS,
    abi: ABI,
    functionName: "mintedPerWallet",
    args: [address],
    query: { refetchInterval: 1000 },
  });

  const supply = totalSupply !== undefined ? Number(totalSupply) : 0;

  const mintedPerWalletNum = mintedPerWalletData
    ? Number(mintedPerWalletData)
    : 0;
  const isPhase1 = supply < 100;
  const maxMintPhase2 = 50;

  const getPriceFrontend = (currentSupply: number, mintAmount: number) => {
    let totalCost = 0;
    for (let i = 1; i <= mintAmount; i++) {
      const tokenId = currentSupply + i;
      if (tokenId <= 100) {
        totalCost += 1;
      } else {
        totalCost += 2;
      }
    }
    return totalCost;
  };

  const totalPrice: bigint =
    BigInt(getPriceFrontend(supply, mintAmount)) * 1000000000000000000n;

  const publicStart = mintTime ? Number(mintTime as bigint) : 0;
  const stage = now >= publicStart ? "Public" : "Closed";

  const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const handleMint = async () => {
    if (totalSupply === undefined) return;
    setSupplyBeforeMint(Number(totalSupply));
    setIsMinting(true);
    setTxHash(undefined);
    setShowSuccess(false);
    setShowMintedBox(false);

    try {
      const tx = await writeContractAsync({
        address: ADDRESS,
        abi: ABI,
        functionName: "mint",
        args: [BigInt(mintAmount)],
        value: totalPrice,
      });
      setTxHash(tx);
    } catch (err: any) {
      console.error(err);
      setIsMinting(false);
    }
  };

  const isSoldOut =
    MAX_SUPPLY !== undefined &&
    totalSupply !== undefined &&
    Number(totalSupply) >= Number(MAX_SUPPLY);

  const hasError = MAX_SUPPLY === undefined || totalSupply === undefined;

  useEffect(() => {
    if (isSuccess) {
      setIsMinting(false);
      setMintAmount(1);
      setShowSuccess(true);
      setShowMintedBox(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isSuccess) {
      setIsMinting(false);
      setMintAmount(1);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isSoldOut) {
      setMintAmount(0);
    } else if (stage === "Public") {
      setMintAmount(1);
    }
  }, [isSoldOut, stage]);

  useEffect(() => {
    if (isSuccess && totalSupply !== undefined && supplyBeforeMint !== null) {
      const from = supplyBeforeMint + 1;
      const to = Number(totalSupply);
      const newIds: number[] = [];
      for (let i = from; i <= to; i++) {
        newIds.push(i);
      }
      setNewMintedIds(newIds);
    }
  }, [isSuccess, totalSupply, supplyBeforeMint]);

  useEffect(() => {
    const popupOpen = showMintedBox && newMintedIds.length > 0;

    if (popupOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showMintedBox, newMintedIds]);

  const decrement = () => {
    if (isPhase1) return;
    setMintAmount((prev) => Math.max(prev - 1, 1));
  };

  const increment = () => {
    if (isPhase1) return;
    setMintAmount((prev) => Math.min(prev + 1, maxMintPhase2));
  };
  const displayAmount =
    stage === "Closed" ? 0 : isSoldOut ? 0 : isPhase1 ? 1 : mintAmount;

  const isMintDisabled = isPhase1 && mintedPerWalletNum > 0;

  return (
    <>
      {/* CONTAINER */}
      <div className="relative flex items-center justify-center my-5">
        <div className="w-full md:w-[70%] bg-black/50 rounded-lg overflow-hidden">
          <div className="flex items-center justify-center text-4xl mt-3 mb-4 font-semibold drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">
            Ninja fu
          </div>

          <div className="px-4">
            <div className="flex flex-col font-semibold text-[16.1px] gap-2 pt-2 pb-2 border-t border-b border-white/10 italic">
              <h2 className="text-left">
                MINTING PHASE I PRICE: 1 CRO 1 - 100 NFT
              </h2>
              <h2 className="text-left">
                MINTING PHASE II PRICE: 2 CRO 100 - 200 NFT
              </h2>
            </div>

            {/* DESCRIPTION */}
            <div className="flex text-white/50 text-[16px] border-white/10 border-b pb-2 mt-2">
              Since centuries, in a mystical world where nature and magic
              coexist harmoniously, there have been nine clans of bears endowed
              with extraordinary powers. These clans live in vast and diverse
              territories, each having developed unique skills adapted to their
              environment. The MystBear stood out for their wisdom, their
              mastery of the mystical arts, and their deep connection with the
              energies.
            </div>
          </div>

          {/* IMAGE & ALL MINT BUTTON */}
          <div className="flex flex-col md:flex-row items-center justify-center md:gap-10">
            {/* IMAGE */}
            <div className="flex items-center justify-center mb-2 mt-2">
              <img
                src="/Background/logo1.gif"
                alt="logo"
                className="w-[230px] h-[230px] rounded-lg"
              />
            </div>

            {/* MOBILE MINTING */}
            <div className="">
              {newMintedIds.length > 0 && showMintedBox && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-70">
                  {/* Close Button */}
                  <button
                    onClick={() => setShowMintedBox(false)}
                    className="absolute top-3 right-3 rounded md:p-2 cursor-pointer"
                  >
                    <FiMinimize2 strokeWidth={2} className="w-10 h-10" />
                  </button>

                  <div className="text-center mb-2 mt-2">
                    <div className="font-semibold text-2xl">Congrats 🥳</div>
                    <h2 className="text-lg font-semibold text-gray-200 mt-2 mb-2">
                      You just minted {newMintedIds.length} NFT
                      {newMintedIds.length > 1 ? "s" : ""}
                    </h2>
                  </div>

                  {/* Scrollable Content Box */}
                  <div className="bg-gray-900 rounded-lg w-fit p-4 mb-3 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 place-items-center">
                      {newMintedIds.map((id: number) => {
                        const imgUrl = `https://ipfs.io/ipfs/QmYDvPAXtiJg7s8JdRBSLWdgSphQdac8j1YuQNNxcGE1hg/${id}.png`;
                        const isLoaded = loadedImages[id];
                        const spinnerVisible = showSpinner[id] ?? true;

                        return (
                          <div
                            key={id}
                            className="flex flex-col items-center relative"
                          >
                            {/* Spinner */}
                            {spinnerVisible && (
                              <div
                                className={`absolute inset-0 flex items-center justify-center rounded-md transition-opacity duration-500 ${
                                  isLoaded ? "opacity-0" : "opacity-100"
                                }`}
                                onTransitionEnd={() => {
                                  if (isLoaded) {
                                    setShowSpinner((prev) => ({
                                      ...prev,
                                      [id]: false,
                                    }));
                                  }
                                }}
                              >
                                <div className="relative w-25 h-25 animate-spin [animation-duration:2s]">
                                  <div className="absolute top-0 left-1/2 w-2 h-2 bg-red-500 -translate-x-1/2" />
                                  <div className="absolute right-0 top-1/2 w-2 h-2 bg-blue-500 -translate-y-1/2" />
                                  <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-yellow-500 -translate-x-1/2" />
                                  <div className="absolute left-0 top-1/2 w-2 h-2 bg-orange-500 -translate-y-1/2" />
                                </div>
                              </div>
                            )}

                            {/* Image */}
                            <img
                              src={imgUrl}
                              alt={`Ninja fu #${id}`}
                              loading="lazy"
                              className={`w-[280px] h-[280px] rounded-lg transition-opacity duration-500 ${
                                isLoaded ? "opacity-100" : "opacity-0"
                              }`}
                              onLoad={() => {
                                setLoadedImages((prev) => ({
                                  ...prev,
                                  [id]: true,
                                }));
                              }}
                            />

                            <span className="text-[18px] mt-3">
                              Ninja fu #{id}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ALL MINT BUTTON */}
            <div className="flex flex-col gap-8 items-center justify-center">
              {/* MAX SUPPLY */}
              <div className="translate-y-[10px]">
                {isSoldOut ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.5,
                      ease: "linear",
                    }}
                    className="w-5 h-5 flex items-center justify-center border-blue-500 border-2 border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <CountdownTimer />
                    <div className="text-[18px] translate-x-1">
                      {stage !== "Closed" && MAX_SUPPLY !== undefined && (
                        <p className="text-white flex items-center justify-center gap-1">
                          <span className="font-semibold">
                            {totalSupply !== undefined
                              ? Number(totalSupply)
                              : 0}{" "}
                            / {Number(MAX_SUPPLY)}
                          </span>
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* DECREMENT & INCREMENT */}
              {MAX_SUPPLY !== undefined && totalSupply !== undefined ? (
                <div className="flex flex-row gap-3">
                  <button
                    onClick={decrement}
                    disabled={
                      isMinting || isSoldOut || stage === "Closed" || isPhase1
                    }
                    className="flex items-center justify-center bg-white/10 hover:bg-white/20 w-10 h-10 text-[18px] rounded-lg cursor-pointer font-semibold font-sans transition duration-200"
                  >
                    –
                  </button>

                  <span className="flex items-center justify-center min-w-[20px] font-semibold text-lg">
                    {displayAmount}
                  </span>

                  <button
                    onClick={increment}
                    disabled={
                      isMinting || isSoldOut || stage === "Closed" || isPhase1
                    }
                    className="flex items-center justify-center bg-white/10 hover:bg-white/20 w-10 h-10 text-[18px] rounded-lg cursor-pointer font-semibold  font-sans transition duration-200"
                  >
                    +
                  </button>
                </div>
              ) : (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.4,
                    ease: "linear",
                  }}
                  className="w-5 h-5 flex items-center justify-center border-blue-500 border-2 border-t-transparent rounded-full mb-5"
                />
              )}

              {/* HANDLE MINT */}
              {MAX_SUPPLY !== undefined &&
                totalSupply !== undefined &&
                !isSoldOut && (
                  <button
                    onClick={handleMint}
                    disabled={
                      isMinting ||
                      !address ||
                      stage === "Closed" ||
                      hasError ||
                      isSoldOut ||
                      isMintDisabled
                    }
                    className={`w-30 h-9 flex items-center justify-center rounded-lg transition duration-200 text-lg ${
                      isMinting ||
                      !address ||
                      stage === "Closed" ||
                      hasError ||
                      isSoldOut ||
                      isMintDisabled
                        ? "bg-white/10 cursor-not-allowed"
                        : "bg-white/10 hover:bg-white/20 cursor-pointer"
                    }`}
                  >
                    {isMinting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.6,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-white/50 border-2 border-t-transparent rounded-full"
                      />
                    ) : (
                      "MINT"
                    )}
                  </button>
                )}

              {/* PRICE */}
              <div className="flex items-center justify-center min-w-[180px] -translate-y-4">
                {stage !== "Closed" &&
                  MAX_SUPPLY !== undefined &&
                  totalSupply !== undefined && (
                    <div className="text-white text-center">
                      {isSoldOut ? (
                        <span className="font-bold text-3xl border-b border-white/15 pb-2">
                          SOLD OUT
                        </span>
                      ) : (
                        <>
                          <div className="text-[17px]">
                            <span>Your Price is</span>{" "}
                            <span className="ml-1 font-semibold">
                              {Number(totalPrice) / 1e18} CRO
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* LINKS */}
          <div className="hidden md:flex flex-row items-center justify-center space-x-6 mt-5 mb-4">
            {links.map((item, index) => (
              <a
                key={index}
                href={item.path}
                className="uppercase text-lg rounded px-4 py-1 border-b border-blue-400 hover:text-white/50 transition duration-200"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
