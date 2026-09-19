// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title PromptGateway
/// @notice Minimal native-USDC escrow for arcdot. API micropayments on Arc.
/// @dev On Arc, native USDC uses 18 decimals. minFee default = 0.01 USDC = 1e16 wei.
///      Catalog prices are enforced off-chain; on-chain enforces msg.value >= minFee.
contract PromptGateway {
    address public immutable owner;
    /// @notice Minimum accepted native USDC payment (18 decimals).
    uint256 public immutable minFee;

    mapping(bytes32 => bool) public usedPaymentId;

    event PaymentDeposited(
        address indexed payer,
        bytes32 indexed paymentId,
        uint256 amount
    );

    event FeesWithdrawn(address indexed to, uint256 amount);

    error OnlyOwner();
    error InvalidPaymentId();
    error PaymentAlreadyUsed();
    error BelowMinFee();
    error WithdrawFailed();

    constructor(uint256 minFee_) {
        require(minFee_ > 0, "minFee=0");
        owner = msg.sender;
        minFee = minFee_;
    }

    /// @notice Pay at least minFee in native USDC and reserve a payment id.
    function depositPayment(bytes32 paymentId) external payable {
        if (paymentId == bytes32(0)) revert InvalidPaymentId();
        if (usedPaymentId[paymentId]) revert PaymentAlreadyUsed();
        if (msg.value < minFee) revert BelowMinFee();

        usedPaymentId[paymentId] = true;
        emit PaymentDeposited(msg.sender, paymentId, msg.value);
    }

    /// @notice Owner pulls all collected fees.
    function withdrawFees() external {
        if (msg.sender != owner) revert OnlyOwner();

        uint256 amount = address(this).balance;
        (bool ok, ) = payable(owner).call{value: amount}("");
        if (!ok) revert WithdrawFailed();

        emit FeesWithdrawn(owner, amount);
    }

    function isUsed(bytes32 paymentId) external view returns (bool) {
        return usedPaymentId[paymentId];
    }

    /// @dev Back-compat alias for older clients reading feeAmount().
    function feeAmount() external view returns (uint256) {
        return minFee;
    }
}
