"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { ABI } from "@/components/Abi";
import { ADDRESS } from "@/components/Contracts";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FiX } from "react-icons/fi";
import { FaCheckCircle } from "react-icons/fa";

export default function ClaimRoyalties() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const { data: userTokens, refetch: refetchTokens } = useReadContract({
    address: ADDRESS,
    abi: ABI,
    functionName: "tokensOfOwner",
    args: [address],
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const { data: availableToClaim, refetch: refetchAvailable } = useReadContract(
    {
      address: ADDRESS,
      abi: ABI,
      functionName: "getRoyalties",
      args: [address],
      query: { enabled: !!address, refetchInterval: 1000 },
    }
  );

  const { data: totalDistributed, refetch: refetchTotal } = useReadContract({
    address: ADDRESS,
    abi: ABI,
    functionName: "totalRoyalties",
    query: { refetchInterval: 5000 },
  });

  const tokenIds = userTokens ? (userTokens as bigint[]).map(Number) : [];

  const handleClaim = async () => {
    if (!address || selectedIds.length === 0) return;
    setClaiming(true);
    setClaimed(false);
    setTxHash(undefined);

    try {
      const tx = await writeContractAsync({
        address: ADDRESS,
        abi: ABI,
        functionName: "claimRoyalties",
        args: [selectedIds.map(BigInt)],
      });
      setTxHash(tx);

      await Promise.all([refetchAvailable(), refetchTokens(), refetchTotal()]);
      setSelectedIds([]);
      setClaimed(true);
      setShowNotification(true);
    } catch (err) {
      console.error("Claim error:", err);
    } finally {
      setClaiming(false);
    }
  };

  useEffect(() => {
    if (availableToClaim && Number(availableToClaim) > 0) {
      setClaimed(false);
    }
  }, [availableToClaim]);

  const formatCRO = (value?: bigint) => {
    if (!value) return "0";
    const num = Number(value) / 1e18;
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const selectAll = () => setSelectedIds(tokenIds);
  const deselectAll = () => setSelectedIds([]);

  const available = availableToClaim as bigint | undefined;
  const distributed = totalDistributed as bigint | undefined;

  return (
    <div
      className={`flex flex-col items-center gap-6 px-4 overflow-hidden ${
        !address ? "py-2" : "py-2"
      }`}
    >
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.2 }}
            className="fixed top-18 right-3 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg z-50 border-l-8 border-blue-500"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <FaCheckCircle className="text-green-500" size={20} />
                <div className="block text-[17px] font-semibold">Success:</div>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="text-white font-bold ml-4 cursor-pointer hover:bg-white/10 px-1 py-1 rounded transition duration-200"
              >
                <FiX size={19} />
              </button>
            </div>
            <div className="mt-1 text-white/80 ml-7 text-[15px]">
              Just sent royalties to your address!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!address ? (
        <>
          <div className="flex flex-col items-center justify-center bg-black/50 rounded-xl p-6">
            <h1 className="text-3xl font-semibold text-center">Royalties</h1>
            <p className="text-gray-500 text-[16px] text-center translate-y-2">
              Connect Wallet to see royalties available to claim
            </p>
          </div>
          <ConnectButton />
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-center">Royalties</h1>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-xl">
            <div className="bg-black/50 p-4 sm:p-6 rounded-xl text-center flex-1">
              <p className="text-gray-300 text-lg">Available to claim</p>
              <p className="text-xl sm:text-2xl font-bold">
                {formatCRO(available)} CRO
              </p>
            </div>

            <div className="bg-black/50 p-4 sm:p-6 rounded-xl text-center flex-1">
              <p className="text-gray-300 text-lg">Total Distributed</p>
              <p className="text-xl sm:text-2xl font-bold">
                {formatCRO(distributed)} CRO
              </p>
            </div>

            <div className="bg-black/50 p-4 sm:p-6 rounded-xl text-center flex-1">
              <p className="text-gray-300 text-lg">Owned NFTs</p>
              <p className="text-xl sm:text-2xl font-bold">{tokenIds.length}</p>
            </div>
          </div>

          <button
            onClick={handleClaim}
            disabled={claiming || claimed || selectedIds.length === 0}
            className={`w-auto min-w-[180px] min-h-[40px] rounded-lg px-2 py-2 text-[16px] font-semibold flex items-center justify-center gap-2 transition duration-300 ${
              claiming || claimed || selectedIds.length === 0
                ? "bg-white/15 cursor-not-allowed opacity-50"
                : "bg-white/15 cursor-pointer"
            }`}
          >
            {claiming ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.5,
                    ease: "linear",
                  }}
                  className="w-4 h-4 border-white border-2 border-t-transparent rounded-full"
                />
              </>
            ) : (
              `Claim ${formatCRO(available)} CRO`
            )}
          </button>

          <p className="text-[15px] font-semibold">
            Selected {selectedIds.length}
          </p>

          <div className="flex gap-3 flex-wrap justify-center mb-5 sm:mb-0 text-[16px]">
            <button
              onClick={selectAll}
              disabled={
                tokenIds.length === 0 ||
                !address ||
                Number(availableToClaim) === 0
              }
              className={`px-4 py-2 rounded-md bg-white/15 w-32 transition duration-200 ${
                tokenIds.length === 0 ||
                !address ||
                Number(availableToClaim) === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-white/20 cursor-pointer"
              }`}
            >
              Select All
            </button>

            <button
              onClick={deselectAll}
              disabled={selectedIds.length === 0 || !address}
              className={`px-4 py-2 rounded-md bg-white/15 w-32 ${
                selectedIds.length === 0 || !address
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              Deselect All
            </button>
          </div>
        </>
      )}
    </div>
  );
}
