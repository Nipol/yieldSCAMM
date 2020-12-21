// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.6.0;

import "./Interface/IERC20.sol";

// @TODO
// Aave, Compound, dydx 지원 및 주기적으로 Switch 할 수 있는 권한을 Governance에게 위임

contract Reserve {
    address private reserveToken;
    address public amm;
    IERC20 public token;
    
    constructor(address _amm, address _token, address _reserveToken) public {
        amm = _amm;
        token = _token;
        reserveToken = _reserveToken;
    }

    // 토큰 소각한 만큼, 토큰 전송
    function claim(uint256 amount) external {
        require(IERC20(_reserveToken).balanceOf(address(this)) > amount, "Reserve/Not-Enough-Reserve");
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Reserve/Not-Enough-Token");
    }
}