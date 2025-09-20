const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("BraveDogModule", (m) => {
  const name = "Brave Dog";
  const symbol = "BRAVE";
  const uri = "ipfs://QmdbuuWPN3nBJ1yfqTvi8pUh2a6VnVhnZTX8rCvvY6nn1J/";

  const braveDog = m.contract("BraveDog", [name, symbol, uri], {
    gasLimit: 5_000_000,
  });

  return { braveDog };
});
