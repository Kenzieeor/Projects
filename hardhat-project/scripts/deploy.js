const { ethers, network } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();

  const CRC20 = await ethers.getContractFactory("CRC20");

  const name = "Degen Ape Cronos";
  const symbol = "DAC";
  const totalSupply = 300_000_000;

  const deploy = await CRC20.deploy(name, symbol, totalSupply);

  console.log("Waiting for deployment...");
  await deploy.waitForDeployment();

  const contractAddress = await deploy.getAddress();

  console.log(`Sucessfuly deployed to: ${contractAddress}`);

  const info = {
    contract: contractAddress,
    deployer: deployer.address,
    network: network.name,
  };

  const tempDir = path.resolve(__dirname, "../temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const deploymentPath = path.resolve(tempDir, "Token.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(info, null, 2));
}

main().catch((err) => {
  console.error("Deployment failed!", err);
  process.exit(1);
});
