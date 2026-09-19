import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

/** 0.01 USDC native floor (18 decimals) */
const MIN_FEE = 10_000_000_000_000_000n;
/** 10_000 USDC fat-finger cap */
const MAX_FEE = 10_000n * 10n ** 18n;
const FEE_BPS = 1000n; // 10%

describe("PromptGateway V3", () => {
  async function deployFixture() {
    const [owner, payer, seller, other, treasury] = await ethers.getSigners();
    const gateway = await ethers.deployContract("PromptGateway", [
      MIN_FEE,
      MAX_FEE,
      FEE_BPS,
      treasury.address,
    ]);
    return { gateway, owner, payer, seller, other, treasury };
  }

  describe("constructor", () => {
    it("locks owner, treasury, fees", async () => {
      const { gateway, owner, treasury } = await loadFixture(deployFixture);
      expect(await gateway.owner()).to.equal(owner.address);
      expect(await gateway.treasury()).to.equal(treasury.address);
      expect(await gateway.minFee()).to.equal(MIN_FEE);
      expect(await gateway.maxFee()).to.equal(MAX_FEE);
      expect(await gateway.platformFeeBps()).to.equal(FEE_BPS);
      expect(await gateway.feeAmount()).to.equal(MIN_FEE);
    });

    it("rejects invalid constructor args", async () => {
      const { gateway } = await loadFixture(deployFixture);
      const [, treasury] = await ethers.getSigners();
      const Factory = await ethers.getContractFactory("PromptGateway");

      await expect(
        Factory.deploy(0, MAX_FEE, FEE_BPS, treasury.address),
      ).to.be.revertedWithCustomError(gateway, "InvalidFeeRange");

      await expect(
        Factory.deploy(MIN_FEE, MIN_FEE - 1n, FEE_BPS, treasury.address),
      ).to.be.revertedWithCustomError(gateway, "InvalidFeeRange");

      await expect(
        Factory.deploy(MIN_FEE, MAX_FEE, 10_001n, treasury.address),
      ).to.be.revertedWithCustomError(gateway, "InvalidBps");

      await expect(
        Factory.deploy(MIN_FEE, MAX_FEE, FEE_BPS, ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(gateway, "InvalidTreasury");
    });
  });

  describe("depositPayment", () => {
    it("splits at exact minFee and records paymentAmount", async () => {
      const { gateway, payer, seller } = await loadFixture(deployFixture);
      const paymentId = ethers.id("exact-min");
      const platformAmount = (MIN_FEE * FEE_BPS) / 10_000n;
      const sellerAmount = MIN_FEE - platformAmount;

      await expect(
        gateway
          .connect(payer)
          .depositPayment(paymentId, seller.address, { value: MIN_FEE }),
      )
        .to.emit(gateway, "PaymentDeposited")
        .withArgs(
          payer.address,
          seller.address,
          paymentId,
          MIN_FEE,
          sellerAmount,
          platformAmount,
        );

      expect(await gateway.pendingSeller(seller.address)).to.equal(sellerAmount);
      expect(await gateway.pendingPlatform()).to.equal(platformAmount);
      expect(await gateway.totalPending()).to.equal(MIN_FEE);
      expect(await gateway.paymentAmount(paymentId)).to.equal(MIN_FEE);
      expect(await gateway.isUsed(paymentId)).to.equal(true);
    });

    it("accumulates multiple deposits for one seller", async () => {
      const { gateway, payer, seller } = await loadFixture(deployFixture);
      await gateway
        .connect(payer)
        .depositPayment(ethers.id("a"), seller.address, { value: MIN_FEE });
      await gateway
        .connect(payer)
        .depositPayment(ethers.id("b"), seller.address, {
          value: MIN_FEE * 2n,
        });

      const total = MIN_FEE + MIN_FEE * 2n;
      const platform = (total * FEE_BPS) / 10_000n;
      expect(await gateway.pendingPlatform()).to.equal(platform);
      expect(await gateway.pendingSeller(seller.address)).to.equal(
        total - platform,
      );
      expect(await gateway.totalPending()).to.equal(total);
    });

    it("previewSplit matches deposit accounting", async () => {
      const { gateway } = await loadFixture(deployFixture);
      const amount = MIN_FEE * 3n;
      const [sellerAmount, platformAmount] = await gateway.previewSplit(amount);
      expect(platformAmount).to.equal((amount * FEE_BPS) / 10_000n);
      expect(sellerAmount).to.equal(amount - platformAmount);
    });

    it("rejects below min, above max, zero id, zero seller, self seller, replay", async () => {
      const { gateway, payer, seller, treasury } =
        await loadFixture(deployFixture);
      const paymentId = ethers.id("pay-bad");
      const gatewayAddr = await gateway.getAddress();

      await expect(
        gateway
          .connect(payer)
          .depositPayment(paymentId, seller.address, { value: MIN_FEE - 1n }),
      ).to.be.revertedWithCustomError(gateway, "BelowMinFee");

      // Use a tight maxFee so the over-max tx fits in Hardhat balances.
      const tight = await ethers.deployContract("PromptGateway", [
        MIN_FEE,
        MIN_FEE,
        FEE_BPS,
        treasury.address,
      ]);
      await expect(
        tight
          .connect(payer)
          .depositPayment(paymentId, seller.address, { value: MIN_FEE + 1n }),
      ).to.be.revertedWithCustomError(tight, "AboveMaxFee");

      await expect(
        gateway
          .connect(payer)
          .depositPayment(ethers.ZeroHash, seller.address, { value: MIN_FEE }),
      ).to.be.revertedWithCustomError(gateway, "InvalidPaymentId");

      await expect(
        gateway
          .connect(payer)
          .depositPayment(paymentId, ethers.ZeroAddress, { value: MIN_FEE }),
      ).to.be.revertedWithCustomError(gateway, "InvalidSeller");

      await expect(
        gateway
          .connect(payer)
          .depositPayment(paymentId, gatewayAddr, { value: MIN_FEE }),
      ).to.be.revertedWithCustomError(gateway, "InvalidSeller");

      await gateway
        .connect(payer)
        .depositPayment(paymentId, seller.address, { value: MIN_FEE });
      await expect(
        gateway
          .connect(payer)
          .depositPayment(paymentId, seller.address, { value: MIN_FEE }),
      ).to.be.revertedWithCustomError(gateway, "PaymentAlreadyUsed");
    });

    it("rejects naked ETH via receive", async () => {
      const { gateway, payer } = await loadFixture(deployFixture);
      const addr = await gateway.getAddress();

      await expect(
        payer.sendTransaction({ to: addr, value: MIN_FEE }),
      ).to.be.revertedWithCustomError(gateway, "DirectDepositDisabled");
    });

    it("handles 0% and 100% platform fee extremes", async () => {
      const [payer, , seller, , treasury] = await ethers.getSigners();

      const zeroBps = await ethers.deployContract("PromptGateway", [
        MIN_FEE,
        MAX_FEE,
        0n,
        treasury.address,
      ]);
      await zeroBps
        .connect(payer)
        .depositPayment(ethers.id("z"), seller.address, { value: MIN_FEE });
      expect(await zeroBps.pendingSeller(seller.address)).to.equal(MIN_FEE);
      expect(await zeroBps.pendingPlatform()).to.equal(0n);

      const fullBps = await ethers.deployContract("PromptGateway", [
        MIN_FEE,
        MAX_FEE,
        10_000n,
        treasury.address,
      ]);
      await fullBps
        .connect(payer)
        .depositPayment(ethers.id("f"), seller.address, { value: MIN_FEE });
      expect(await fullBps.pendingSeller(seller.address)).to.equal(0n);
      expect(await fullBps.pendingPlatform()).to.equal(MIN_FEE);
    });
  });

  describe("withdrawals", () => {
    it("lets seller and platform withdraw to treasury", async () => {
      const { gateway, owner, payer, seller, other, treasury } =
        await loadFixture(deployFixture);
      const amount = MIN_FEE * 2n;
      const platformAmount = (amount * FEE_BPS) / 10_000n;
      const sellerAmount = amount - platformAmount;

      await gateway
        .connect(payer)
        .depositPayment(ethers.id("w1"), seller.address, { value: amount });

      await expect(
        gateway.connect(other).withdrawSeller(),
      ).to.be.revertedWithCustomError(gateway, "NothingToWithdraw");

      await expect(gateway.connect(seller).withdrawSeller())
        .to.emit(gateway, "SellerWithdrawn")
        .withArgs(seller.address, sellerAmount);

      expect(await gateway.pendingSeller(seller.address)).to.equal(0n);
      expect(await gateway.totalPending()).to.equal(platformAmount);

      await expect(
        gateway.connect(seller).withdrawSeller(),
      ).to.be.revertedWithCustomError(gateway, "NothingToWithdraw");

      await expect(
        gateway.connect(other).withdrawPlatform(),
      ).to.be.revertedWithCustomError(gateway, "OnlyOwner");

      const treasuryBefore = await ethers.provider.getBalance(treasury.address);
      await expect(gateway.connect(owner).withdrawPlatform())
        .to.emit(gateway, "PlatformWithdrawn")
        .withArgs(treasury.address, platformAmount);
      const treasuryAfter = await ethers.provider.getBalance(treasury.address);
      expect(treasuryAfter - treasuryBefore).to.equal(platformAmount);

      expect(await gateway.pendingPlatform()).to.equal(0n);
      expect(await gateway.totalPending()).to.equal(0n);
      expect(
        await ethers.provider.getBalance(await gateway.getAddress()),
      ).to.equal(0n);
    });

    it("reverts WithdrawFailed when treasury rejects", async () => {
      const [owner, payer] = await ethers.getSigners();
      const badTreasury = await ethers.deployContract("RejectingReceiver");
      const gateway = await ethers.deployContract("PromptGateway", [
        MIN_FEE,
        MAX_FEE,
        FEE_BPS,
        await badTreasury.getAddress(),
      ]);

      await gateway
        .connect(payer)
        .depositPayment(ethers.id("plat"), owner.address, { value: MIN_FEE });

      await expect(
        gateway.connect(owner).withdrawPlatform(),
      ).to.be.revertedWithCustomError(gateway, "WithdrawFailed");
    });

    it("blocks reentrant seller withdraw", async () => {
      const [, payer, , , treasury] = await ethers.getSigners();
      const attacker = await ethers.deployContract("ReentrantSeller");
      const gateway = await ethers.deployContract("PromptGateway", [
        MIN_FEE,
        MAX_FEE,
        FEE_BPS,
        treasury.address,
      ]);
      await attacker.setGateway(await gateway.getAddress());

      await gateway
        .connect(payer)
        .depositPayment(ethers.id("re"), await attacker.getAddress(), {
          value: MIN_FEE,
        });

      // Nested withdraw hits nonReentrant → outer call fails with WithdrawFailed.
      await expect(attacker.pull()).to.be.revertedWithCustomError(
        gateway,
        "WithdrawFailed",
      );

      // Funds remain locked for a later successful non-reentrant path after reset —
      // attacker.reenterCount stays > 0 so a second pull would still reenter once.
      // Balance accounting must still show pending seller funds.
      const pending = await gateway.pendingSeller(await attacker.getAddress());
      expect(pending).to.be.gt(0n);
    });
  });

  describe("skimSurplus", () => {
    it("skims forced surplus to treasury and rejects when none", async () => {
      const { gateway, owner, other, treasury } =
        await loadFixture(deployFixture);

      await expect(
        gateway.connect(other).skimSurplus(),
      ).to.be.revertedWithCustomError(gateway, "OnlyOwner");

      await expect(
        gateway.connect(owner).skimSurplus(),
      ).to.be.revertedWithCustomError(gateway, "NothingToWithdraw");

      const gatewayAddr = await gateway.getAddress();
      await ethers.deployContract("ForceSend", [gatewayAddr], {
        value: MIN_FEE,
      });

      expect(await ethers.provider.getBalance(gatewayAddr)).to.equal(MIN_FEE);
      expect(await gateway.totalPending()).to.equal(0n);

      const before = await ethers.provider.getBalance(treasury.address);
      await expect(gateway.connect(owner).skimSurplus())
        .to.emit(gateway, "SurplusSkimmed")
        .withArgs(treasury.address, MIN_FEE);
      const after = await ethers.provider.getBalance(treasury.address);
      expect(after - before).to.equal(MIN_FEE);
    });
  });
});
