const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function askYesNo(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    process.stdin.on("data", (key) => {
      const lower = key.toLowerCase();
      if (lower === "y") {
        process.stdout.write("y\n");
        process.stdin.setRawMode(false);
        process.stdin.pause();
        resolve(true);
      } else if (lower === "n") {
        process.stdout.write("n\n");
        process.stdin.setRawMode(false);
        process.stdin.pause();
        resolve(false);
      }
    });
  });
}

async function main() {
  const [deployer] = await ethers.getSigners();

  const confirm = await askYesNo(
    `Are you sure want to deploy to '${network.name}' (y/n): `
  );

  if (!confirm) {
    console.log("Deployment canceled!");
    process.exit(0);
  }

  const name = "Degen Ape Cronos";
  const symbol = "DAC";
  const supply = 300_000_000;

  const CRC20 = await ethers.getContractFactory("CRC20");

  console.log("Deploying contract...");
  const contract = await CRC20.deploy(name, symbol, supply);

  console.log("Waiting for deployment...");
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("CRC20 deployed to:", contractAddress);

  const deployments = {
    name,
    symbol,
    totalsupply: supply.toString(),
    network: network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
  };

  const tempDir = path.resolve(__dirname, "../temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const filePath = path.resolve(tempDir, "Token.json");
  fs.writeFileSync(filePath, JSON.stringify(deployments, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
