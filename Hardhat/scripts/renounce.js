const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Load deployed contract address
  const deploymentPath = path.join(
    __dirname,
    "..",
    "ignition",
    "deployments",
    "chain-11155111",
    "deployed_addresses.json"
  );

  const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
  const contractAddress = deploymentData["CRC20Module#CRC20"];
  if (!contractAddress) {
    throw new Error("Contract address not found in deployed_addresses.json");
  }

  // Get contract factory and attach
  const CRC20 = await ethers.getContractFactory("CRC20"); // sesuaikan nama kontrak
  const contract = await CRC20.attach(contractAddress);

  // Call renounceOwnership function (tidak perlu parameter)
  const tx = await contract.renounceOwnership();
  await tx.wait();

  console.log("✅ Ownership renounced");
  console.log("Tx hash:", tx.hash);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
