const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  const deployer = await hre.ethers.getSigners();

  const deploymentPath = path.resolve(__dirname, "../temp/NFT.json");
  const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
  const contractAddress = deploymentData["contract"];
  const BraveDog = await ethers.getContractFactory("BraveDog");

  const contract = BraveDog.attach(contractAddress);

  // FreemintWallets
  const freemintAddress = ["0xc0588C71463B4a9ABF02706CdFa11BEc3a99F0f8"];

  // functions success
  const tx = await contract.addFreemint(freemintAddress);
  await tx.wait();
  console.log(`Address: ${freemintAddress} sucessfully For freemint!`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
