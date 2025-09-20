const hre = require("hardhat");

async function main() {
  const deployer = await hre.ethers.getSigners();

  // Contract Address
  const contractAddress = "0x62F7a438AB25Cb3848921B0af2A0682F3DC27164";
  const Azuki = await hre.ethers.getContractAt("Azuki", contractAddress);

  // Freemintwallets
  const removefreemintAddress = ["0x134f3B8eE9629F0E1D44DfBc26752509CC68877c"];
  // functions success
  const tx = await Azuki.removeFreemintUser(removefreemintAddress);
  await tx.wait();
  console.log(
    `Address: ${removefreemintAddress} sucessfully For Remove from freemint!`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
