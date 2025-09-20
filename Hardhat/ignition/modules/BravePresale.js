const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("BravePresaleModule", (m) => {
  const tokenAddress = "0xf6C1719Af4563ADA4d9D8F0ba0C5Dd20A1d8357b";
  const rate = 500_000;

  const startTime = Math.floor(Date.now() / 1000) + 60;
  const endTime = startTime + 3600 * 24 * 7;

  console.log("Deploy startTime:", startTime);
  console.log("Deploy endTime:", endTime);

  // Gunakan .upgradeableContract untuk deploy dengan proxy & initialize
  const bravePresale = m.upgradeableContract(
    "BravePresale",
    [tokenAddress, rate, startTime, endTime],
    {
      initializer: "initialize",
      gasLimit: 1000000,
    }
  );

  return { bravePresale };
});
