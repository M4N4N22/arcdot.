import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

const MIN_FEE = 10_000_000_000_000_000n;
const FEE_BPS = 1000n; // 10%

describe("PromptGateway V2", () => {
  async function deployFixture() {
    const [owner, payer, seller, other] = await ethers.getSigners();
    const gateway = await ethers.deployContract("PromptGateway", [
      MIN_FEE,
      FEE_BPS,
    ]);
    return { gateway, owner, payer, seller, other };
  }

  it("sets owner, minFee, and platformFeeBps", async () => {
    const { gateway, owner } = await loadFixture(deployFixture);
    expect(await gateway.owner()).to.equal(owner.address);
    expect(await gateway.minFee()).to.equal(MIN_FEE);
    expect(await gateway.platformFeeBps()).to.equal(FEE_BPS);
  });

  it("splits payment between seller and platform", async () => {
    const { gateway, payer, seller } = await loadFixture(deployFixture);
    const paymentId = ethers.id("pay-1");
    const amount = MIN_FEE * 2n;
    const platformAmount = (amount * FEE_BPS) / 10_000n;
    const sellerAmount = amount - platformAmount;

    await expect(
      gateway
        .connect(payer)
        .depositPayment(paymentId, seller.address, { value: amount }),
    )
      .to.emit(gateway, "PaymentDeposited")
      .withArgs(
        payer.address,
        seller.address,
        paymentId,
        amount,
        sellerAmount,
        platformAmount,
      );

    expect(await gateway.pendingSeller(seller.address)).to.equal(sellerAmount);
    expect(await gateway.pendingPlatform()).to.equal(platformAmount);
    expect(await gateway.isUsed(paymentId)).to.equal(true);
  });

  it("rejects below min, zero id, zero seller, replay", async () => {
    const { gateway, payer, seller } = await loadFixture(deployFixture);
    const paymentId = ethers.id("pay-2");

    await expect(
      gateway
        .connect(payer)
        .depositPayment(paymentId, seller.address, { value: MIN_FEE - 1n }),
    ).to.be.revertedWithCustomError(gateway, "BelowMinFee");

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

    await gateway
      .connect(payer)
      .depositPayment(paymentId, seller.address, { value: MIN_FEE });
    await expect(
      gateway
        .connect(payer)
        .depositPayment(paymentId, seller.address, { value: MIN_FEE }),
    ).to.be.revertedWithCustomError(gateway, "PaymentAlreadyUsed");
  });

  it("lets seller and platform withdraw", async () => {
    const { gateway, owner, payer, seller, other } =
      await loadFixture(deployFixture);
    const paymentId = ethers.id("pay-3");
    const amount = MIN_FEE * 2n;
    const platformAmount = (amount * FEE_BPS) / 10_000n;
    const sellerAmount = amount - platformAmount;

    await gateway
      .connect(payer)
      .depositPayment(paymentId, seller.address, { value: amount });

    await expect(
      gateway.connect(other).withdrawSeller(),
    ).to.be.revertedWithCustomError(gateway, "NothingToWithdraw");

    await expect(gateway.connect(seller).withdrawSeller())
      .to.emit(gateway, "SellerWithdrawn")
      .withArgs(seller.address, sellerAmount);
    expect(await gateway.pendingSeller(seller.address)).to.equal(0n);

    await expect(
      gateway.connect(other).withdrawPlatform(),
    ).to.be.revertedWithCustomError(gateway, "OnlyOwner");

    await expect(gateway.connect(owner).withdrawPlatform())
      .to.emit(gateway, "PlatformWithdrawn")
      .withArgs(owner.address, platformAmount);
    expect(await gateway.pendingPlatform()).to.equal(0n);
  });
});
