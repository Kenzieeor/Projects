const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  // Contract Address
  const contractAddress = "0xfb53EF7Ec92c3e59791518dE5A0694292Aa850De";
  const BraveDog = await hre.ethers.getContractAt("BraveDog", contractAddress);

  // Whitelistwallets
  const removewhitelistAddress = [
    "0x4dC6786BBFeE88fa9769d2b5eF4D8d17BA9C8572",
    "0x585059CF96b6BCFcC2594092100B07fD971CC39B",
    "0xd41D5b257cBA4b3D093E95fd06e9E284Dc74A458",
  ];

  // functions success
  const tx = await BraveDog.removeWhitelistUser(removewhitelistAddress);
  await tx.wait();
  console.log(
    `Address: ${removewhitelistAddress} sucessfully For Remove from whitelist!`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
