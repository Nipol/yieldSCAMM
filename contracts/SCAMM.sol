// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.6.0;

import "./Interface/IERC20.sol";
import "./Library/SafeMath.sol";

import "@nomiclabs/buidler/console.sol";

contract SCAMM {
    using SafeMath for uint256;

    IERC20 public immutable LPToken;
    IERC20[] public stables;

    uint256 private constant BASE = 1e27;

    constructor(address lpt, address[] tokens) public {
        LPToken = lpt;
        for (uint256 i = 0; tokens.length > i; i++) {
            addStable(tokens[i]);
        }
    }

    // Token 추가하는 함수
    function addStable(IERC20 addr) public returns (bool) {
        IERC20[] tmpStables = stables;
        for (uint256 i = 0; tmpStables.length > i; i++) {
            require(tmpStables[i] != addr, "SCAMM/Already-Exist-Addr");
        }

        stables.push(addr);
    }

    function factor() public view returns (uint256) {
        uint256 collateral = weightedCollateral();

        if (collateral > 0) {
            return LPToken.totalSupply().mul(BASE).div(collateral);
        }
        return BASE;
    }

    function weightedCollateral() private view returns (uint256 collateral) {
        IERC20[] tmpStables = stables;
        uint256 realBalance = 0;
        uint256 dividedBalance = 0;
        for (uint256 i = 0; tmpStables.length > i; i++) {
            realBalance = realBalance.add(
                IERC20(tmpStables).balanceOf(address(this))
            );
        }

        dividedBalance = realBalance.div(tmpStables.length);

        for (uint256 i = 0; tmpStables.length > i; i++) {
            uint256 balance = IERC20(tmpStables[i]).balanceOf(address(this);
            uint256 precision = dividedBalance.divWithPrecision(balance, BASE);
            collateral = collateral.add(balance.mul(precision).div(BASE));
        }
    }
}
