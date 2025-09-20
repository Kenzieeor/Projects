const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Load deployed contract address
  const deploymentPath = path.resolve(__dirname, "../temp/cronos.json");
  const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
  const contractAddress = deploymentData.proxy;

  const Presale = await ethers.getContractFactory("Presale");
  const contract = await Presale.attach(contractAddress);

  // === Withdraw Remaining Tokens ===
  const withdrawTx = await contract.withdrawTokens();
  await withdrawTx.wait();

  console.log("✅ Remaining tokens withdrawn successfully.");
  console.log("Withdraw Tx:", withdrawTx.hash);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
