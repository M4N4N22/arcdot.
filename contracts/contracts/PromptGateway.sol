// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title PromptGateway (V2)
/// @notice Native-USDC micropayment escrow with seller / platform split on Arc.
/// @dev Native USDC = 18 decimals. minFee default 0.01 USDC = 1e16 wei.
contract PromptGateway {
    address public immutable owner;
    uint256 public immutable minFee;
    /// @notice Platform fee in basis points (e.g. 1000 = 10%).
    uint256 public immutable platformFeeBps;

    mapping(bytes32 => bool) public usedPaymentId;
    mapping(address => uint256) public pendingSeller;
    uint256 public pendingPlatform;

    event PaymentDeposited(
        address indexed payer,
        address indexed seller,
        bytes32 indexed paymentId,
        uint256 amount,
        uint256 sellerAmount,
        uint256 platformAmount
    );

    event SellerWithdrawn(address indexed seller, uint256 amount);
    event PlatformWithdrawn(address indexed to, uint256 amount);

    error OnlyOwner();
    error InvalidPaymentId();
    error InvalidSeller();
    error PaymentAlreadyUsed();
    error BelowMinFee();
    error NothingToWithdraw();
    error WithdrawFailed();

    constructor(uint256 minFee_, uint256 platformFeeBps_) {
        require(minFee_ > 0, "minFee=0");
        require(platformFeeBps_ <= 10_000, "bps");
        owner = msg.sender;
        minFee = minFee_;
        platformFeeBps = platformFeeBps_;
    }

    /// @notice Pay at least minFee; credit seller and platform pending balances.
    function depositPayment(bytes32 paymentId, address seller) external payable {
        if (paymentId == bytes32(0)) revert InvalidPaymentId();
        if (seller == address(0)) revert InvalidSeller();
        if (usedPaymentId[paymentId]) revert PaymentAlreadyUsed();
        if (msg.value < minFee) revert BelowMinFee();

        usedPaymentId[paymentId] = true;

        uint256 platformAmount = (msg.value * platformFeeBps) / 10_000;
        uint256 sellerAmount = msg.value - platformAmount;

        pendingSeller[seller] += sellerAmount;
        pendingPlatform += platformAmount;

        emit PaymentDeposited(
            msg.sender,
            seller,
            paymentId,
            msg.value,
            sellerAmount,
            platformAmount
        );
    }

    function withdrawSeller() external {
        uint256 amount = pendingSeller[msg.sender];
        if (amount == 0) revert NothingToWithdraw();
        pendingSeller[msg.sender] = 0;
        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        if (!ok) revert WithdrawFailed();
        emit SellerWithdrawn(msg.sender, amount);
    }

    function withdrawPlatform() external {
        if (msg.sender != owner) revert OnlyOwner();
        uint256 amount = pendingPlatform;
        if (amount == 0) revert NothingToWithdraw();
        pendingPlatform = 0;
        (bool ok, ) = payable(owner).call{value: amount}("");
        if (!ok) revert WithdrawFailed();
        emit PlatformWithdrawn(owner, amount);
    }

    function isUsed(bytes32 paymentId) external view returns (bool) {
        return usedPaymentId[paymentId];
    }

    /// @dev Back-compat alias.
    function feeAmount() external view returns (uint256) {
        return minFee;
    }
}
