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
    throw new Error("Contract address not found in deployed_addresses.json");
  }

  // Attach ke contract
  const BraveDog = await hre.ethers.getContractAt("Azuki", contractAddress);

  // Withdraw functions
  const tx = await BraveDog.withdraw();
  await tx.wait();
  console.log("✅ Funds successfully withdrawn!");
  console.log("Tx hash:", tx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
