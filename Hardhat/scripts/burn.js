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
    "chain-33111",
    "deployed_addresses.json"
  );

  const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
  const contractAddress = deploymentData["CRC20Module#CRC20"];
  if (!contractAddress) {
    throw new Error("Contract address not found in deployed_addresses.json");
  }

  // Get contract factory and attach
  const CRC20 = await ethers.getContractFactory("CRC20");
  const contract = await CRC20.attach(contractAddress);

  const decimals = 18;
  const burnAmount = ethers.parseUnits("500000000", decimals);

  // Call burn functions
  const burnTx = await contract.burn(burnAmount);
  await burnTx.wait();

  console.log(`✅ Burned ${ethers.formatUnits(burnAmount, decimals)} tokens`);
  console.log("Tx hash:", burnTx.hash);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
