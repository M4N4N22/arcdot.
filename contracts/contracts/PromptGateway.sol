// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title PromptGateway (V3)
/// @notice Immutable native-USDC micropayment escrow with seller / platform split on Arc.
/// @dev Native USDC = 18 decimals. Deploy with minFee = 1e16 (0.01 USDC). No proxy / no upgrades —
///      all economic parameters are constructor-locked. Redeploy to change policy.
contract PromptGateway {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    /// @notice Deployer / operator — may trigger platform + surplus withdrawals.
    address public immutable owner;
    /// @notice Destination for platform fees and surplus skims (may differ from owner).
    address public immutable treasury;
    /// @notice Minimum accepted `msg.value` (floor). Catalog prices may be higher.
    uint256 public immutable minFee;
    /// @notice Maximum accepted `msg.value` (fat-finger / griefing cap).
    uint256 public immutable maxFee;
    /// @notice Platform cut in basis points (e.g. 1000 = 10%). Seller receives the remainder.
    uint256 public immutable platformFeeBps;

    mapping(bytes32 => bool) public usedPaymentId;
    /// @notice Gross amount recorded per paymentId (for off-chain verification / disputes).
    mapping(bytes32 => uint256) public paymentAmount;
    mapping(address => uint256) public pendingSeller;
    uint256 public pendingPlatform;
    /// @notice Sum of all pending seller + platform balances (excludes accidental surplus ETH).
    uint256 public totalPending;

    uint256 private _status;

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
    event SurplusSkimmed(address indexed to, uint256 amount);

    error OnlyOwner();
    error InvalidPaymentId();
    error InvalidSeller();
    error InvalidTreasury();
    error InvalidFeeRange();
    error InvalidBps();
    error PaymentAlreadyUsed();
    error BelowMinFee();
    error AboveMaxFee();
    error NothingToWithdraw();
    error WithdrawFailed();
    error DirectDepositDisabled();
    error Reentrancy();

    constructor(
        uint256 minFee_,
        uint256 maxFee_,
        uint256 platformFeeBps_,
        address treasury_
    ) {
        if (minFee_ == 0 || maxFee_ < minFee_) revert InvalidFeeRange();
        if (platformFeeBps_ > 10_000) revert InvalidBps();
        if (treasury_ == address(0) || treasury_ == address(this)) {
            revert InvalidTreasury();
        }

        owner = msg.sender;
        treasury = treasury_;
        minFee = minFee_;
        maxFee = maxFee_;
        platformFeeBps = platformFeeBps_;
        _status = _NOT_ENTERED;
    }

    /// @notice Reject naked native transfers — all value must go through `depositPayment`.
    receive() external payable {
        revert DirectDepositDisabled();
    }

    fallback() external payable {
        revert DirectDepositDisabled();
    }

    /// @notice Preview seller / platform split for an amount (no state change).
    function previewSplit(
        uint256 amount
    ) external view returns (uint256 sellerAmount, uint256 platformAmount) {
        platformAmount = (amount * platformFeeBps) / 10_000;
        sellerAmount = amount - platformAmount;
    }

    /// @notice Pay between minFee and maxFee; credit seller and platform pending balances.
    /// @dev `paymentId` must be unique forever. Bind it off-chain to payer + service + nonce.
    function depositPayment(
        bytes32 paymentId,
        address seller
    ) external payable nonReentrant {
        if (paymentId == bytes32(0)) revert InvalidPaymentId();
        if (seller == address(0) || seller == address(this)) revert InvalidSeller();
        if (usedPaymentId[paymentId]) revert PaymentAlreadyUsed();
        if (msg.value < minFee) revert BelowMinFee();
        if (msg.value > maxFee) revert AboveMaxFee();

        usedPaymentId[paymentId] = true;
        paymentAmount[paymentId] = msg.value;

        uint256 platformAmount = (msg.value * platformFeeBps) / 10_000;
        uint256 sellerAmount = msg.value - platformAmount;

        pendingSeller[seller] += sellerAmount;
        pendingPlatform += platformAmount;
        totalPending += msg.value;

        emit PaymentDeposited(
            msg.sender,
            seller,
            paymentId,
            msg.value,
            sellerAmount,
            platformAmount
        );
    }

    function withdrawSeller() external nonReentrant {
        uint256 amount = pendingSeller[msg.sender];
        if (amount == 0) revert NothingToWithdraw();

        pendingSeller[msg.sender] = 0;
        totalPending -= amount;

        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        if (!ok) revert WithdrawFailed();

        emit SellerWithdrawn(msg.sender, amount);
    }

    /// @notice Owner pulls accrued platform fees to the immutable treasury.
    function withdrawPlatform() external nonReentrant {
        if (msg.sender != owner) revert OnlyOwner();

        uint256 amount = pendingPlatform;
        if (amount == 0) revert NothingToWithdraw();

        pendingPlatform = 0;
        totalPending -= amount;

        (bool ok, ) = payable(treasury).call{value: amount}("");
        if (!ok) revert WithdrawFailed();

        emit PlatformWithdrawn(treasury, amount);
    }

    /// @notice Rescue ETH that is not part of pending balances (e.g. forced selfdestruct dust).
    function skimSurplus() external nonReentrant {
        if (msg.sender != owner) revert OnlyOwner();

        uint256 bal = address(this).balance;
        if (bal <= totalPending) revert NothingToWithdraw();
        uint256 surplus = bal - totalPending;

        (bool ok, ) = payable(treasury).call{value: surplus}("");
        if (!ok) revert WithdrawFailed();

        emit SurplusSkimmed(treasury, surplus);
    }

    function isUsed(bytes32 paymentId) external view returns (bool) {
        return usedPaymentId[paymentId];
    }

    /// @dev Back-compat alias for minFee.
    function feeAmount() external view returns (uint256) {
        return minFee;
    }

    modifier nonReentrant() {
        if (_status == _ENTERED) revert Reentrancy();
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}
