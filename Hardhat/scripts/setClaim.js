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

  const newClaimStartTime = Math.floor(Date.now() / 1000) + 1 * 60;

  const tx = await contract.setClaimTime(newClaimStartTime);
  await tx.wait();

  console.log("✅ Claim start time updated");
  console.log(
    "Claim Start Time:",
    newClaimStartTime,
    "-",
    new Date(newClaimStartTime * 1000).toLocaleString()
  );
  console.log("Tx Hash         :", tx.hash);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
