const { ethers } = require("hardhat");

async function main() {
  const Presale = await ethers.getContractFactory("CrowdSale");
  const data = Presale.interface.encodeFunctionData("initialize", [
    "0xFaD4d317CCc26D007EaF2458dB62D1515Ab0e853",
    "0xA41f98A6f2edc92905e1D71bc8e220eAAA0911eE",
    21000,
    1750149806,
    1750153406,
    1750154006,
    ethers.parseEther("2000"),
  ]);

  console.log("Encoded initializer data:\n", data);
}

main();
