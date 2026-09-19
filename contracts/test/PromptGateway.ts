import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

const MIN_FEE = 10_000_000_000_000_000n;

describe("PromptGateway", () => {
  async function deployFixture() {
    const [owner, payer, other] = await ethers.getSigners();
    const gateway = await ethers.deployContract("PromptGateway", [MIN_FEE]);
    return { gateway, owner, payer, other };
  }

  it("sets owner and minFee", async () => {
    const { gateway, owner } = await loadFixture(deployFixture);
    expect(await gateway.owner()).to.equal(owner.address);
    expect(await gateway.minFee()).to.equal(MIN_FEE);
    expect(await gateway.feeAmount()).to.equal(MIN_FEE);
  });

  it("accepts min fee and marks payment id used", async () => {
    const { gateway, payer } = await loadFixture(deployFixture);
    const paymentId = ethers.id("payment-1");

    await expect(
      gateway.connect(payer).depositPayment(paymentId, { value: MIN_FEE }),
    )
      .to.emit(gateway, "PaymentDeposited")
      .withArgs(payer.address, paymentId, MIN_FEE);

    expect(await gateway.isUsed(paymentId)).to.equal(true);
  });

  it("accepts amounts above minFee", async () => {
    const { gateway, payer } = await loadFixture(deployFixture);
    const paymentId = ethers.id("payment-above");
    const amount = MIN_FEE * 2n;

    await expect(
      gateway.connect(payer).depositPayment(paymentId, { value: amount }),
    )
      .to.emit(gateway, "PaymentDeposited")
      .withArgs(payer.address, paymentId, amount);
  });

  it("rejects below min fee, zero id, and replay", async () => {
    const { gateway, payer } = await loadFixture(deployFixture);
    const paymentId = ethers.id("payment-2");

    await expect(
      gateway.connect(payer).depositPayment(paymentId, { value: MIN_FEE - 1n }),
    ).to.be.revertedWithCustomError(gateway, "BelowMinFee");

    await expect(
      gateway.connect(payer).depositPayment(ethers.ZeroHash, { value: MIN_FEE }),
    ).to.be.revertedWithCustomError(gateway, "InvalidPaymentId");

    await gateway.connect(payer).depositPayment(paymentId, { value: MIN_FEE });
    await expect(
      gateway.connect(payer).depositPayment(paymentId, { value: MIN_FEE }),
    ).to.be.revertedWithCustomError(gateway, "PaymentAlreadyUsed");
  });

  it("only owner can withdraw fees", async () => {
    const { gateway, owner, payer, other } = await loadFixture(deployFixture);
    const paymentId = ethers.id("payment-3");
    const amount = MIN_FEE * 2n;
    await gateway.connect(payer).depositPayment(paymentId, { value: amount });

    await expect(
      gateway.connect(other).withdrawFees(),
    ).to.be.revertedWithCustomError(gateway, "OnlyOwner");

    await expect(gateway.connect(owner).withdrawFees())
      .to.emit(gateway, "FeesWithdrawn")
      .withArgs(owner.address, amount);

    expect(await ethers.provider.getBalance(await gateway.getAddress())).to.equal(
      0n,
    );
  });
});
