// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DemoAgentPayments {
    address public immutable owner;

    event PaymentSettled(
        uint256 indexed runId,
        address indexed recipient,
        uint256 amount,
        string memo
    );

    error OnlyOwner();
    error InvalidRecipient();
    error InvalidAmount();
    error TransferFailed();

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert OnlyOwner();
        }
        _;
    }

    function settlePayment(
        uint256 runId,
        address payable recipient,
        string calldata memo
    ) external payable onlyOwner {
        if (recipient == address(0)) {
            revert InvalidRecipient();
        }
        if (msg.value == 0) {
            revert InvalidAmount();
        }

        (bool success, ) = recipient.call{value: msg.value}("");
        if (!success) {
            revert TransferFailed();
        }

        emit PaymentSettled(runId, recipient, msg.value, memo);
    }

    receive() external payable {}
}
