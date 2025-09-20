const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  // Ambil alamat kontrak dari file deploy Ignition
  const deploymentPath = path.resolve(__dirname, "../temp/NFT.json");
  const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
  const contractAddress = deploymentData["contract"];

  if (!contractAddress) {
    throw new Error("Contract address not found in NFT.json");
  }

  // Attach ke contract
  const Azuki = await hre.ethers.getContractAt("Azuki", contractAddress);

  // Hitung waktu mulai 2 menit dari sekarang (120 detik)
  const now = Math.floor(Date.now() / 1000);
  const publicStart = now + 3 * 60; // tambah 2 menit

  // Format helper biar lebih rapi
  const formatTime = (ts) => {
    return new Date(ts * 1000).toLocaleString("en-GB", {
      hour12: true,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Log timestamp human readable
  console.log("PUBLIC MINT START:", formatTime(publicStart));

  // Kirim transaksi ke contract
  const tx = await Azuki.setMintTime(publicStart);
  await tx.wait();

  console.log("✅ Mint time updated!");
  console.log("📬 Transaction Hash:", tx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
