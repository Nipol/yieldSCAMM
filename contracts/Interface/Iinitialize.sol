// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.6.0;

interface Iinitialize {
    function initialize(
        address owner,
        string calldata version,
        string calldata name,
        string calldata symbol,
        uint8 decimals
    ) external;
}
