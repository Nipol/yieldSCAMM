// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.6.0;

interface IStakeManager {
    // function totalStake() external view returns (uint256);

    // function stakedOf(address target) external view returns (uint256);

    function stake(uint256 amount) external returns (bool);

    function withdraw(uint256 amount) external returns (bool);
}
