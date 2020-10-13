// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.6.0;

library SafeMath {
    uint256 public constant WAD = 1e18;
    uint256 public constant RAY = 1e27;
    uint256 public constant RAD = 1e45;

    function min(uint256 x, uint256 y) internal pure returns (uint256 z) {
        z = x <= y ? x : y;
    }

    function max(uint256 x, uint256 y) internal pure returns (uint256 z) {
        z = x >= y ? x : y;
    }

    function add(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require((z = x + y) >= x, "Math/Add-Overflow");
    }

    function sub(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require((z = x - y) <= x, "Math/Sub-Overflow");
    }

    function sub(
        uint256 x,
        uint256 y,
        string memory message
    ) internal pure returns (uint256 z) {
        require((z = x - y) <= x, message);
    }

    function mul(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || ((z = x * y) / y) == x, "Math/Mul-Overflow");
    }

    function div(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y > 0, "Math/Div-Overflow");
        z = x / y;
    }

    function mod(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y != 0, "Math/Mod-Overflow");
        z = x % y;
    }

    function mulWithPrecision(
        uint256 x,
        uint256 y,
        uint256 precision
    ) internal pure returns (uint256 z) {
        z = add(mul(x, y), precision / 2) / precision;
    }

    function divWithPrecision(
        uint256 x,
        uint256 y,
        uint256 precision
    ) internal pure returns (uint256 z) {
        z = add(mul(x, precision), y / 2) / y;
    }

    function toPrecision(uint256 wad, uint256 precision)
        internal
        pure
        returns (uint256 z)
    {
        require(precision < 18, "Math/Too-high-Precision");
        z = mul(wad, 10**(18 - precision));
    }
}
