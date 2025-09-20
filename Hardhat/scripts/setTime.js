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

  const now = Math.floor(Date.now() / 1000);
  const newStartTime = now + 1 * 60;
  const newEndTime = newStartTime + 10 * 60;
  const newClaimTime = newEndTime + 1 * 60;

  const tx = await contract.setTimeStamp(newStartTime, newEndTime);
  await tx.wait();

  const claim = await contract.setClaimTime(newClaimTime);
  await claim.wait();

  console.log("✅ Presale time updated:");
  console.log(
    "Start Time        :",
    newStartTime,
    "-",
    new Date(newStartTime * 1000).toLocaleString()
  );
  console.log(
    "End Time          :",
    newEndTime,
    "-",
    new Date(newEndTime * 1000).toLocaleString()
  );
  console.log("Tx Hash (Presale) :", tx.hash);

  console.log("✅ Claim start time updated");
  console.log(
    "Claim Start Time  :",
    newClaimTime,
    "-",
    new Date(newClaimTime * 1000).toLocaleString()
  );
  console.log("Tx Hash (Claim)   :", claim.hash);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
