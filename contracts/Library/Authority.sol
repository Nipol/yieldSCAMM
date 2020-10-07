// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.6.0;

import "../Interface/IERC173.sol";

contract Authority is IERC173 {
    address private _owner;

    modifier onlyAuthority() {
        require(_owner == msg.sender, "Authority/Not-Authorized");
        _;
    }

    function owner() external override view returns (address) {
        return _owner;
    }

    function initialize(address newOwner) internal {
        _owner = newOwner;
        emit OwnershipTransferred(address(0), newOwner);
    }

    function transferOwnership(address newOwner)
        external
        override
        onlyAuthority
    {
        _owner = newOwner;
        emit OwnershipTransferred(msg.sender, newOwner);
    }
}
