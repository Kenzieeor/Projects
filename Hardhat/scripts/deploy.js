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

async function Main() {
  const [deployer] = await ethers.getSigners();

  const confirm = await askYesNo(
    `Are you sure you want to deploy to '${network.name}'? (y/n): `
  );

  if (!confirm) {
    console.log("Deployment canceled!");
    process.exit(0);
  }

  const BraveDog = await ethers.getContractFactory("BraveDog");

  const name = "Brave Dog";
  const symbol = "BRAVE";
  const uri = "ipfs://QmdbuuWPN3nBJ1yfqTvi8pUh2a6VnVhnZTX8rCvvY6nn1J/";

  console.log("Deploying contract...");
  const bravedog = await BraveDog.deploy(name, symbol, uri);

  console.log("Waiting for deployment...");
  await bravedog.waitForDeployment();

  const contractAddress = await bravedog.getAddress();
  console.log("Contract successfully deployed to:", contractAddress);

  const info = {
    name: "Brave Dog",
    contract: contractAddress,
    deployer: deployer.address,
    network: network.name,
  };

  const tempDir = path.resolve(__dirname, "../temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const deploymentPath = path.resolve(tempDir, "NFT.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(info, null, 2));
}

Main().catch((err) => {
  console.error("Deployment failed!", err);
  process.exit(1);
});
