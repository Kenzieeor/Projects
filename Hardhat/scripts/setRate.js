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

  const newRate = 105000;

  const tx = await contract.setRate(newRate);
  await tx.wait();

  console.log("✅ Rate updated successfully");
  console.log("New Rate :", newRate);
  console.log("Tx Hash  :", tx.hash);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
