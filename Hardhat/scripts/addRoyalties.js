const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const deploymentPath = path.resolve(__dirname, "../temp/NFT.json");
  const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
  const contractAddress = deploymentData["contract"];

  const BraveDog = await hre.ethers.getContractAt("BraveDog", contractAddress);

  const amountCro = "150";
  const amountWei = hre.ethers.parseEther(amountCro);

  console.log(
    `💸 Sending ${amountCro} CRO to addRoyalties from ${deployer.address}...`
  );
  const tx = await BraveDog.addRoyalties({ value: amountWei });
  await tx.wait();

  console.log(`✅ Royalties of ${amountCro} CRO added!`);
  console.log("📬 Transaction Hash:", tx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
