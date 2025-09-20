const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const deploymentPath = path.resolve(__dirname, "../temp/NFT.json");
  const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
  const contractAddress = deploymentData["contract"];
  const bravedog = await hre.ethers.getContractAt(
    "Azuki",
    contractAddress,
    deployer
  );

  const mintAmount = 99;

  console.log(
    `⛏️ Sending teamMint(${mintAmount}) to contract as ${deployer.address}...`
  );
  const tx = await bravedog.teamMint(mintAmount, deployer.address);
  console.log("⏳ Waiting for transaction confirmation...");
  const receipt = await tx.wait();

  console.log("✅ Team mint successful!");
  console.log("Transaction Hash:", receipt.hash);
}

main().catch((error) => {
  console.error("❌ Error during team mint:", error);
  process.exit(1);
});
