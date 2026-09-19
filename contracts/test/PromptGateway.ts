import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

const FEE = 10_000_000_000_000_000n;

describe("PromptGateway", () => {
  async function deployFixture() {
    const [owner, payer, other] = await ethers.getSigners();
    const gateway = await ethers.deployContract("PromptGateway", [FEE]);
    return { gateway, owner, payer, other };
  }

  it("sets owner and fee", async () => {
    const { gateway, owner } = await loadFixture(deployFixture);
    expect(await gateway.owner()).to.equal(owner.address);
    expect(await gateway.feeAmount()).to.equal(FEE);
  });

  it("accepts exact native fee and marks payment id used", async () => {
    const { gateway, payer } = await loadFixture(deployFixture);
    const paymentId = ethers.id("payment-1");

    await expect(
      gateway.connect(payer).depositPayment(paymentId, { value: FEE }),
    )
      .to.emit(gateway, "PaymentDeposited")
      .withArgs(payer.address, paymentId, FEE);

    expect(await gateway.isUsed(paymentId)).to.equal(true);
  });

  it("rejects wrong fee, zero id, and replay", async () => {
    const { gateway, payer } = await loadFixture(deployFixture);
    const paymentId = ethers.id("payment-2");

    await expect(
      gateway.connect(payer).depositPayment(paymentId, { value: FEE - 1n }),
    ).to.be.revertedWithCustomError(gateway, "IncorrectFee");

    await expect(
      gateway.connect(payer).depositPayment(ethers.ZeroHash, { value: FEE }),
    ).to.be.revertedWithCustomError(gateway, "InvalidPaymentId");

    await gateway.connect(payer).depositPayment(paymentId, { value: FEE });
    await expect(
      gateway.connect(payer).depositPayment(paymentId, { value: FEE }),
    ).to.be.revertedWithCustomError(gateway, "PaymentAlreadyUsed");
  });

  it("only owner can withdraw fees", async () => {
    const { gateway, owner, payer, other } = await loadFixture(deployFixture);
    const paymentId = ethers.id("payment-3");
    await gateway.connect(payer).depositPayment(paymentId, { value: FEE });

    await expect(
      gateway.connect(other).withdrawFees(),
    ).to.be.revertedWithCustomError(gateway, "OnlyOwner");

    await expect(gateway.connect(owner).withdrawFees())
      .to.emit(gateway, "FeesWithdrawn")
      .withArgs(owner.address, FEE);

    expect(await ethers.provider.getBalance(await gateway.getAddress())).to.equal(
      0n,
    );
  });
});
