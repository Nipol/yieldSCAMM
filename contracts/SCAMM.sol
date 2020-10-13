// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.6.0;

import "./Interface/IERC20.sol";
import "./Library/SafeMath.sol";
import "./Library/Authority.sol";

import "@nomiclabs/buidler/console.sol";

contract SCAMM is Authority {
    using SafeMath for uint256;

    IERC20 public immutable LPToken;
    IERC20[] public stables;
    mapping(address => bool) public allowedToken;

    uint256 private constant BASE = SafeMath.RAY;

    event AddToken(address token);
    event RemoveToken(address token);

    constructor(address governance,address lpt, address[] tokens) public {
        LPToken = lpt;
        for (uint256 i = 0; tokens.length > i; i++) {
            addStable(tokens[i]);
        }
        Authority.initialize(governace);
    }

    // Token 추가하는 함수
    function addStable(IERC20 addr) public onlyAuthority {
        require(allowedToken[addr] == false, "SCAMM/Already-Exist-Addr");
        allowedToken[addr] = true;
        stables.push(addr);
        emit AddToken(addr);
    }

    // Token을 삭제하는 함수
    function removeStable(IERC20 addr) public onlyAuthority {
        IERC20[] tmpStables = stables;
        for (uint256 i = 0; tmpStables.length > i; i++) {
            if(tmpStables[i] == addr) {
                delete stables[i];
                delete allowedToken[addr];
                emit RemoveToken(addr);
            }
        }
    }

    // 발행된 LPToken과의 수량을 통해 ScaleFactor를 반환함.
    // @return RAY
    function factor() public view returns (uint256) {
        uint256 collateral = weightedCollateral();

        if (collateral > 0) {
            return LPToken.totalSupply().mul(BASE).div(collateral).sub(1);
        }
        return BASE;
    }

    function deposit(address token, uint256 amount) public {
        require(allowedToken[addr] == true, "SCAMM/Not-Allowed-Token");
        require(IERC20.transferFrom(msg.sender, address(this), amount));
        // 기존 factor를 유지하면서 새로운 수량을 mint할 것.
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
