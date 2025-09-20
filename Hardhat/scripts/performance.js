const { ethers } = require("ethers");
const { performance } = require("perf_hooks");
const crypto = require("crypto");
const chalk = require("chalk");

const PRESALE_ADDRESS = "0x3a771077A797A05d923E9a50672f93de8d079655";

const abi = [
  "function rate() view returns (uint256)",
  "function totalCap() view returns (uint256)",
  "function startTime() view returns (uint256)",
  "function endTime() view returns (uint256)",
  "function treasuryAddress() view returns (address)",
];

const rpcList = [
  { name: "Cronos Testnet Official", url: "https://evm-t3.cronos.org" },
  { name: "dRPC Testnet", url: "https://cronos-testnet.drpc.org/" },
  { name: "Thirdweb Testnet", url: "https://338.rpc.thirdweb.com" },
];

function hashCode(code) {
  return crypto.createHash("sha256").update(code).digest("hex").slice(0, 10);
}

function withTimeout(promise, timeout = 3000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeout)
    ),
  ]);
}

async function testRpc(rpc) {
  try {
    const provider = new ethers.JsonRpcProvider(rpc.url);
    const start = performance.now();

    const blockNumber = await withTimeout(provider.getBlockNumber());
    const code = await withTimeout(provider.getCode(PRESALE_ADDRESS));
    const hasCode = code && code !== "0x";
    const codeHash = hasCode ? hashCode(code) : "N/A";

    const contract = new ethers.Contract(PRESALE_ADDRESS, abi, provider);

    const [rate, totalCap, startTime, endTime, treasuryAddress] =
      await Promise.all([
        withTimeout(contract.rate()),
        withTimeout(contract.totalCap()),
        withTimeout(contract.startTime()),
        withTimeout(contract.endTime()),
        withTimeout(contract.treasuryAddress()),
      ]);

    const duration = (performance.now() - start).toFixed(1);

    console.log(
      chalk.green(`✅ ${rpc.name.padEnd(20)}`) +
        ` → Block: ${blockNumber} | Code: ${
          hasCode ? "✅" : "❌"
        } | Hash: ${codeHash} | ⏱️ ${duration} ms`
    );

    console.log(
      chalk.gray(
        `   ↪ Rate: ${rate.toString()} | Cap: ${ethers.formatEther(
          totalCap
        )} CRO`
      )
    );
    console.log(
      chalk.gray(
        `   ↪ Start: ${new Date(
          Number(startTime) * 1000
        ).toLocaleString()} | End: ${new Date(
          Number(endTime) * 1000
        ).toLocaleString()}`
      )
    );
    console.log(chalk.gray(`   ↪ Treasury: ${treasuryAddress}`));
  } catch (err) {
    console.log(chalk.red(`❌ ${rpc.name.padEnd(20)} → Error: ${err.message}`));
  }
}

async function main() {
  console.log(chalk.cyan("🔍 Presale RPC check (code presence + view()):\n"));

  for (const rpc of rpcList) {
    await testRpc(rpc);
  }
}

main();
