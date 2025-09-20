const { ethers, upgrades, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();

  const Presale = await ethers.getContractFactory("Presale");

  const tokenAddress = "0x4b72B0F65868986341722789601Def3EfCA0362D";
  const rate = 105;
  const now = Math.floor(Date.now() / 1000);
  const startTime = now + 5 * 60;
  const endTime = now + 20 * 60;
  const claimStartTime = endTime + 10 * 60;
  const treasuryAddress = "0xb8a4A3391b8032d3597e082F42cB415efbD90B77";
  const totalCap = ethers.parseEther("1000000");

  console.log("Deploying Presale (ERC1967 Upgradeable Proxy)...");
  console.log(
    "Start:",
    startTime,
    "| End:",
    endTime,
    "| Claim Start:",
    claimStartTime,
    "| Cap:",
    totalCap.toString()
  );

  const presale = await upgrades.deployProxy(
    Presale,
    [
      tokenAddress,
      treasuryAddress,
      rate,
      startTime,
      endTime,
      totalCap,
      claimStartTime,
    ],
    {
      initializer: "initialize",
    }
  );

  await presale.waitForDeployment();

  const proxyAddress = await presale.getAddress();
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(
    proxyAddress
  );

  console.log("✅ Presale (proxy) deployed at:", proxyAddress);
  console.log("🧠 Implementation logic at:", implementationAddress);
  console.log("Deployer:", deployer.address);

  const deployments = {
    proxyAddress,
    implementationAddress,
    deployer: deployer.address,
    treasuryAddress,
    tokenAddress,
    rate,
    startTime,
    endTime,
    claimStartTime,
    totalCap: totalCap.toString(),
    network: network.name,
  };

  const filePath = path.join(__dirname, "presale-upgradeable-address.json");
  fs.writeFileSync(filePath, JSON.stringify(deployments, null, 2));
  console.log(`📝 Deployment info saved to ${filePath}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
