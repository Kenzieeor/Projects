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

  const withdrawTx = await contract.withdrawCRO();
  await withdrawTx.wait();

  console.log("✅ Withdrawn CRO successfully.");
  console.log("Withdraw Tx:", withdrawTx.hash);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
