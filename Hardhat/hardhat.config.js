require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  sourcify: {
    enabled: false,
  },
  networks: {
    cronos: {
      url: process.env.CRONOS_RPC_URL,
      chainId: 338,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
    customChains: [
      {
        network: "cronos",
        chainId: 338,
        urls: {
          apiURL:
            "https://explorer-api.cronos.org/testnet/api/v1/hardhat/contract?apikey=hXTjEv7fN0FM1HnWVtePglunkhTjit2e",
          browserURL: "http://explorer.cronos.org/testnet",
        },
      },
    ],
  },
};
