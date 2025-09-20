const { JsonRpcProvider } = require("ethers");
const { url } = require("inspector");
const { performance } = require("perf_hooks");

const rpcList = [
  { name: "Cronos", url: "https://evm.cronos.org" },
  {
    name: "Thirdweb",
    url: "https://25.rpc.thirdweb.com/70d501a12c8cba907d961fa9ad2669b3",
  },
  { name: "Public Node", url: "https://cronos.publicnode.com" },
  {
    name: "Getblock",
    url: "https://go.getblock.io/6367b081aa1c443f98be02cfde2098a0",
  },
  {
    name: "Chainstack",
    url: "https://cronos-mainnet.core.chainstack.com/22eb872052b6e0442f6b0765862b3c8e",
  },
  {
    name: "Dwellir",
    url: "https://api-cronos-mainnet-archive.n.dwellir.com/40b6337d-9118-4871-8d46-6a34d194b4d6",
  },
];

async function testRpc(rpc) {
  try {
    const provider = new JsonRpcProvider(rpc.url);
    const start = performance.now();
    const blockNumber = await provider.getBlockNumber();
    const end = performance.now();
    const time = (end - start).toFixed(2);
    return `✅ ${rpc.name.padEnd(25)} → Block: ${blockNumber} (⏱️ ${time} ms)`;
  } catch (err) {
    return `❌ ${rpc.name.padEnd(25)} → Error: ${err.message}`;
  }
}

async function main() {
  console.log("🔍 Parallel testing Cronos RPC endpoints...\n");

  const testPromises = rpcList.map((rpc) => testRpc(rpc));
  const results = await Promise.all(testPromises);

  results.forEach((result) => console.log(result));
}

main();
