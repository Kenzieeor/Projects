const { run } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const { proxy, logic, initData } = JSON.parse(
    fs.readFileSync(path.join(__dirname, "info.json"), "utf-8")
  );

  console.log("Verifying proxy at:", proxy);

  await run("verify:verify", {
    address: proxy,
    constructorArguments: [logic, initData],
    contract: "contracts/ERC1967proxy.sol:ERC1967proxy",
  });

  console.log("✅ Proxy verified successfully!");
}

main().catch((error) => {
  console.error("❌ Verification failed:", error);
  process.exit(1);
});
