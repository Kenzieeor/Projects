const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");

describe("Presale", function () {
  async function deployPresaleFixture() {
    const [owner, user1, treasury] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("CRC20");
    const token = await Token.deploy();
    await token.waitForDeployment();

    const Presale = await ethers.getContractFactory("Presale");
    const now = await time.latest();
    const startTime = now + 60;
    const endTime = now + 3600;
    const claimTime = endTime + 60;
    const rate = 1000;
    const totalCap = ethers.parseEther("10");

    // ✅ Gunakan proxy untuk kontrak upgradeable
    const presale = await upgrades.deployProxy(Presale, [
      await token.getAddress(),
      treasury.address,
      rate,
      startTime,
      endTime,
      totalCap,
      claimTime,
    ]);

    await presale.waitForDeployment();

    const tokenAmount = ethers.parseUnits("1000000", 18);
    await token.transfer(await presale.getAddress(), tokenAmount);

    return {
      presale,
      token,
      owner,
      user1,
      treasury,
      rate,
      startTime,
      endTime,
      claimTime,
    };
  }

  it("should initialize properly", async function () {
    const { presale, token } = await loadFixture(deployPresaleFixture);
    expect(await presale.saleToken()).to.equal(await token.getAddress());
  });

  it("should allow a valid purchase", async function () {
    const { presale, user1, startTime, rate } = await loadFixture(
      deployPresaleFixture
    );
    await time.increaseTo(startTime + 10);

    const amount = ethers.parseEther("1");
    const expectedTokens = amount * BigInt(rate);

    await presale.connect(user1).buy({ value: amount });
    const allocation = await presale.tokenAllocations(user1.address);
    expect(allocation).to.equal(expectedTokens);
  });

  it("should reject purchase above max limit", async function () {
    const { presale, user1, startTime } = await loadFixture(
      deployPresaleFixture
    );
    await time.increaseTo(startTime + 10);

    const overLimit = ethers.parseEther("6");
    await expect(
      presale.connect(user1).buy({ value: overLimit })
    ).to.be.revertedWith("Maximum purchase is 5 ETH");
  });

  it("should allow claiming after presale ends and claimStartTime reached", async function () {
    const { presale, user1, startTime, claimTime, rate, token } =
      await loadFixture(deployPresaleFixture);

    await time.increaseTo(startTime + 10);

    const amount = ethers.parseEther("2");
    const expectedTokens = amount * BigInt(rate);

    await presale.connect(user1).buy({ value: amount });
    await time.increaseTo(claimTime + 1);

    await presale.connect(user1).claim();

    const balance = await token.balanceOf(user1.address);
    expect(balance).to.equal(expectedTokens);
  });

  it("should reject double claim", async function () {
    const { presale, user1, startTime, claimTime } = await loadFixture(
      deployPresaleFixture
    );

    await time.increaseTo(startTime + 10);
    await presale.connect(user1).buy({ value: ethers.parseEther("1") });

    await time.increaseTo(claimTime + 1);
    await presale.connect(user1).claim();

    await expect(presale.connect(user1).claim()).to.be.revertedWith(
      "Tokens already claimed"
    );
  });
});
