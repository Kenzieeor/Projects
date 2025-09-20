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
    `Are you sure you want to deploy to '${network.name}' (y/n): `
  );

  if (!confirm) {
    console.log("Deployment canceled!");
    process.exit(0);
  }

  const Presale = await ethers.getContractFactory("Presale");

  console.log("Deploying Impl contract...");
  const presaleImpl = await Presale.deploy();

  console.log("Waiting for deployment Impl contract...");
  await presaleImpl.waitForDeployment();
  const presaleImplAddress = await presaleImpl.getAddress();

  console.log("Presale implementation deployed at:", presaleImplAddress);

  // Presale init params
  const tokenAddress = "0x784efEe2C61a6132090540540F661B1bd99c93F3";
  const treasuryAddress = "0xF5d0102B6E8c0f463e4bC3BA269D46B77B33a18f";
  const rate = 1500;

  const now = Math.floor(Date.now() / 1000);
  const startTime = now + 5 * 60;
  const endTime = startTime + 10 * 60;
  const claimTime = endTime + 5 * 60;
  const totalCap = ethers.parseEther("1000000");

  console.log(
    "Start:",
    startTime,
    "| End:",
    endTime,
    "| Claim Start:",
    claimTime,
    "| Cap:",
    totalCap.toString()
  );

  const initializerData = Presale.interface.encodeFunctionData("initialize", [
    tokenAddress,
    treasuryAddress,
    rate,
    startTime,
    endTime,
    claimTime,
    totalCap,
  ]);

  const Proxy = await ethers.getContractFactory("ERC1967proxy");

  console.log("Deploying proxy contract...");
  const proxy = await Proxy.deploy(presaleImplAddress, initializerData);

  console.log("Waiting Deployment proxy contract...");
  await proxy.waitForDeployment();
  const proxyAddress = await proxy.getAddress();

  console.log("✅ Successfully deployed proxy to:", proxyAddress);

  // Save info
  const tempDir = path.resolve(__dirname, "../temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  fs.writeFileSync(
    path.resolve(tempDir, `${network.name}.json`),
    JSON.stringify(
      {
        proxy: proxyAddress,
        logic: presaleImplAddress,
        initData: initializerData,
        deployer: deployer.address,
        treasuryAddress,
        tokenAddress,
        rate,
        startTime,
        endTime,
        claimTime,
        totalCap: totalCap.toString(),
        network: network.name,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error("Deployment failed!", err);
  process.exit(1);
});
