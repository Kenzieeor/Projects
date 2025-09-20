const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Load deployed contract address
  const deploymentPath = path.join(__dirname, "info.json");
  const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
  const contractAddress = deploymentData.proxy;

  const Presale = await ethers.getContractFactory("Presale");
  const contract = await Presale.attach(contractAddress);

  // === Set CRO Cap ===
  const newLimit = ethers.parseEther("10000"); // example: cap at 1000 CRO

  const capTx = await contract.setLimit(newLimit);
  await capTx.wait();

  console.log("✅ Cap updated to:", ethers.formatEther(newLimit), "CRO");
  console.log("Cap Tx    :", capTx.hash);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
