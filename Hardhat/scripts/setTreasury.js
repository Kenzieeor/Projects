const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const deploymentPath = path.join(__dirname, "info.json");
  const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
  const contractAddress = deploymentData.proxy;

  const Presale = await ethers.getContractFactory("Presale");
  const contract = await Presale.attach(contractAddress);

  const newTreasury = "0xA41f98A6f2edc92905e1D71bc8e220eAAA0911eE";

  const tx = await contract.setTreasury(newTreasury);
  await tx.wait();

  console.log("✅ Treasury address updated to:", newTreasury);
  console.log("Tx Hash:", tx.hash);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
