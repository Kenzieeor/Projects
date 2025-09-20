const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("CRC20Module", (m) => {
  const name = "Brave Dog";
  const symbol = "BRAVE";
  const supply = 300_000_000;
  const CRC20 = m.contract("CRC20", [name, symbol, supply]);

  return { CRC20 };
});
