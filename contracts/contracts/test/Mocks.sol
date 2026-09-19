// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IPromptGatewayWithdraw {
    function withdrawSeller() external;
}

/// @dev Reverts on receiving native value.
contract RejectingReceiver {
    receive() external payable {
        revert("nope");
    }

    fallback() external payable {
        revert("nope");
    }
}

/// @dev On receiving native value, attempts a reentrant seller withdraw.
contract ReentrantSeller {
    IPromptGatewayWithdraw public gateway;
    uint256 public reenterCount;

    function setGateway(address gateway_) external {
        gateway = IPromptGatewayWithdraw(gateway_);
    }

    function pull() external {
        gateway.withdrawSeller();
    }

    receive() external payable {
        reenterCount += 1;
        if (reenterCount == 1) {
            gateway.withdrawSeller();
        }
    }
}

/// @dev Forces ETH into a contract via selfdestruct (same-tx creation).
contract ForceSend {
    constructor(address payable target) payable {
        selfdestruct(target);
    }
}
