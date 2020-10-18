// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.6.0;

interface IMint {
    function mint(uint256 credit) external returns (bool);

    function mintTo(uint256 credit, address target) external returns (bool);
}
