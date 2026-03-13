// ============================================================
// FILE: src/contracts/VaultlessCore.sol
// ============================================================
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VaultlessCore {
    struct Identity {
        bytes32 commitmentHash;
        uint256 enrolledAt;
        bool isLocked;
        bool exists;
    }

    mapping(address => Identity) public identities;
    mapping(bytes32 => bool) public usedNullifiers;

    event Registered(address indexed user, uint256 timestamp);
    event AuthSuccess(address indexed user, bytes32 nullifier);
    event AuthFailed(address indexed user);
    event DuressActivated(address indexed user, uint256 timestamp);

    function register(bytes32 commitmentHash) external {
        require(!identities[msg.sender].exists, "Already registered");
        identities[msg.sender] = Identity(commitmentHash, block.timestamp, false, true);
        emit Registered(msg.sender, block.timestamp);
    }

    function authenticate(bytes32 nullifier) external returns (bool) {
        require(identities[msg.sender].exists, "Not registered");
        require(!identities[msg.sender].isLocked, "Account locked");
        require(!usedNullifiers[nullifier], "Nullifier already used");
        usedNullifiers[nullifier] = true;
        emit AuthSuccess(msg.sender, nullifier);
        return true;
    }

    function triggerDuress() external {
        require(identities[msg.sender].exists, "Not registered");
        identities[msg.sender].isLocked = true;
        emit DuressActivated(msg.sender, block.timestamp);
    }

    function refine(bytes32 newHash) external {
        require(identities[msg.sender].exists && !identities[msg.sender].isLocked, "Cannot refine");
        identities[msg.sender].commitmentHash = newHash;
    }

    function authFailed() external {
        require(identities[msg.sender].exists, "Not registered");
        emit AuthFailed(msg.sender);
    }
}
