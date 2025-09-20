const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();

  const deploymentPath = path.resolve(__dirname, "../temp/NFT.json");
  const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
  const contractAddress = deploymentData["contract"];
  const BraveDog = await ethers.getContractFactory("BraveDog");

  const contract = BraveDog.attach(contractAddress);

  const tx = await contract.togglePause();
  const receipt = await tx.wait();

  console.log("Paused status changed successfull");
  console.log("Transaction hash:", receipt.hash);
}
main().catch((err) => {
  console.error(err, "Paused failed");
  process.exit(1);
});
