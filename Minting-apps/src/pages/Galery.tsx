"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { ABI } from "@/components/Abi";
import { ADDRESS } from "@/components/Contracts";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FiMinimize2 } from "react-icons/fi";

const Galery = () => {
  const { address } = useAccount();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [showSpinner, setShowSpinner] = useState<{ [key: number]: boolean }>(
    {}
  );

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);

  const { data: userTokens, isLoading } = useReadContract({
    address: ADDRESS,
    abi: ABI,
    functionName: "tokensOfOwner",
    args: [address],
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const tokenIds = userTokens
    ? (userTokens as bigint[]).map((id) => Number(id))
    : [];

  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedImage]);

  const renderContent = () => {
    if (!address) {
      return (
        <>
          <div className="flex flex-col items-center justify-center bg-black/50 rounded-xl p-6">
            <p className="text-gray-300 text-3xl font-bold">Ninja fu</p>
            <p className="text-gray-500 text-[16px] translate-y-2">
              Connect Wallet to see the Ninja fu NFT you own
            </p>
          </div>
          <div className="pt-4">
            <ConnectButton />
          </div>
        </>
      );
    }

    if (isLoading) {
      return (
        <div className="flex flex-col gap-1 items-center justify-center bg-black/50 rounded-xl p-6">
          <h1 className="text-gray-300 text-lg">Loading your NFTs...</h1>
        </div>
      );
    }

    if (address && tokenIds.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center bg-black/50 rounded-xl p-6">
          <h1 className="text-gray-300 text-3xl font-bold">Ninja fu</h1>
          <h2 className="text-gray-500 text-[16px] translate-y-2">
            You do not own any Ninja fu currently
          </h2>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 w-full">
        {tokenIds.map((id) => {
          const imgUrl = `https://ipfs.io/ipfs/QmYDvPAXtiJg7s8JdRBSLWdgSphQdac8j1YuQNNxcGE1hg/${id}.png`;
          const isLoaded = loadedImages[id];
          const spinnerVisible = showSpinner[id] ?? true;

          return (
            <div
              key={id}
              onClick={() => {
                setSelectedImage(imgUrl);
                setIsImageLoaded(false);
                setPreviewLoaded(false);
              }}
              className="flex flex-col items-center text-center p-2 bg-gray-900 rounded-lg cursor-pointer hover:scale-105 transition-transform duration-300"
            >
              <div className="relative w-auto h-auto">
                {/* Spinner thumbnail */}
                {spinnerVisible && (
                  <div
                    className={`absolute inset-0 flex items-center justify-center rounded-md transition-opacity duration-500 ${
                      isLoaded ? "opacity-0" : "opacity-100"
                    }`}
                    onTransitionEnd={() => {
                      if (isLoaded) {
                        setShowSpinner((prev) => ({ ...prev, [id]: false }));
                      }
                    }}
                  >
                    <div className="relative w-15 h-15 animate-spin [animation-duration:2s]">
                      <div className="absolute top-0 left-1/2 w-2 h-2 bg-red-500 rounded-sm -translate-x-1/2" />
                      <div className="absolute right-0 top-1/2 w-2 h-2 bg-blue-500 rounded-sm -translate-y-1/2" />
                      <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-yellow-500 rounded-sm -translate-x-1/2" />
                      <div className="absolute left-0 top-1/2 w-2 h-2 bg-orange-500 rounded-sm -translate-y-1/2" />
                    </div>
                  </div>
                )}

                {/* Gambar thumbnail */}
                <img
                  src={imgUrl}
                  alt={`Ninja fu #${id}`}
                  loading="lazy"
                  width={80}
                  height={80}
                  className={`rounded-lg transition-opacity duration-500 ${
                    isLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => {
                    setLoadedImages((prev) => ({ ...prev, [id]: true }));
                  }}
                />
              </div>
              <p className="text-[15px] text-gray-300 mt-1">Ninja fu #{id}</p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center transition-all duration-300 p-4">
      {renderContent()}

      {/* Preview full image */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="relative">
            {/* Spinner saat preview loading */}
            {!previewLoaded && (
              <div
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
                  isImageLoaded ? "opacity-0" : "opacity-100"
                }`}
                onTransitionEnd={() => {
                  if (isImageLoaded) setPreviewLoaded(true);
                }}
              >
                <div className="relative w-25 h-25 animate-spin [animation-duration:2s]">
                  <div className="absolute top-0 left-1/2 w-3 h-3 bg-red-500 rounded-sm -translate-x-1/2" />
                  <div className="absolute right-0 top-1/2 w-3 h-3 bg-blue-500 rounded-sm -translate-y-1/2" />
                  <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-yellow-500 rounded-sm -translate-x-1/2" />
                  <div className="absolute left-0 top-1/2 w-3 h-3 bg-orange-500 rounded-sm -translate-y-1/2" />
                </div>
              </div>
            )}

            {/* Gambar Preview */}
            <img
              src={selectedImage}
              alt="Preview"
              className={`rounded-lg w-[300px] h-[300px] md:w-[400px] md:h-[400px] max-w-[90vw] max-h-[80vh] transition-opacity duration-500 ${
                isImageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setIsImageLoaded(true)}
              onError={() => setIsImageLoaded(true)}
            />
          </div>

          {/* Tombol close */}
          <button
            className="absolute top-3 right-3 p-2 rounded-lg cursor-pointer"
            onClick={() => {
              setSelectedImage(null);
              setIsImageLoaded(false);
              setPreviewLoaded(false);
            }}
          >
            <FiMinimize2 strokeWidth={2} className="w-10 h-10" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Galery;
