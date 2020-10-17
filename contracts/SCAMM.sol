// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.6.0;

import "./Interface/IERC20.sol";
import "./Interface/IMint.sol";
import "./Interface/IBurn.sol";
import "./Library/SafeMath.sol";
import "./Library/Authority.sol";

contract SCAMM is Authority {
    using SafeMath for uint256;

    // Stable을 가질 토큰의 주소
    address public immutable LPToken;
    // SCAMM에서 등록해서 가질 토큰 주소들
    address[] public stables;
    // SCAMM에 등록할 수 있는 토큰 주소에 대한 허용 여부
    mapping(address => bool) public allowedToken;

    // Scale Factor Ratio Decimals
    uint256 private constant BASE = 1e27;

    uint256 private FEE;
    // 10000 -> 100%
    // 00005 -> 5
    uint256 private FEE_BASE = 1e4;

    // 토큰이 추가 되었을 경우 호출되는 이벤트
    event AddToken(address token);

    // 토큰이 삭제 되었을 경우 호출되는 이벤트
    event RemoveToken(address token);

    // 거버넌스, lp, 그리고 초기에 구성될 토큰들의 주소
    constructor(
        address governance,
        address lpt,
        address[] memory tokens,
        uint256 fee
    ) public {
        LPToken = lpt;
        for (uint256 i = 0; tokens.length > i; i++) {
            addStable(tokens[i]);
        }
        Authority.initialize(governance);
        FEE = fee;
    }

    // 리스팅 할 Token 추가하는 함수
    function addStable(address addr) public onlyAuthority {
        require(allowedToken[addr] == false, "SCAMM/Already-Exist-Addr");
        allowedToken[addr] = true;
        stables.push(addr);
        emit AddToken(addr);
    }

    // 리스팅 된 Token을 삭제하는 함수
    function removeStable(address addr) public onlyAuthority {
        address[] memory tmpStables = stables;
        for (uint256 i = 0; tmpStables.length > i; i++) {
            if (tmpStables[i] == addr) {
                delete stables[i];
                delete allowedToken[addr];
                emit RemoveToken(addr);
            }
        }
    }

    // 발행된 LPToken과의 수량을 통해 ScaleFactor를 반환함.
    // @return RAY
    function factor() external view returns (uint256) {
        uint256 collateral = weightedCollateral();

        if (collateral > 0) {
            return
                IERC20(LPToken).totalSupply().mul(BASE).div(collateral).sub(1);
        }
        return BASE;
    }

    // 등록 가능한 토큰을 예치하는 함수
    function deposit(address[] memory tokens, uint256[] memory amounts)
        public
    {
        // 토큰이 예치되기 전에 발생한 총 자산의 비율
        uint256 beforeCollateral = weightedCollateral();

        for (uint256 i = 0; i > tokens.length; i++) {
            // 토큰 허용 체크
            require(
                allowedToken[tokens[i]] == true,
                "SCAMM/Not-Allowed-Token"
            );
            // 토큰 실질 전송
            require(
                IERC20(tokens[i]).transferFrom(
                    msg.sender,
                    address(this),
                    amounts[i]
                )
            );
        }

        // 토큰이 예치된 이후의 총 자산 비율
        uint256 afterCollateral = weightedCollateral();

        uint256 newAmount = afterCollateral.sub(beforeCollateral);

        IMint(LPToken).mintTo(newAmount, msg.sender);
    }

    // 토큰을 소각하고 토큰을 고루 돌려받는 것.
    function withdraw(uint256 amountLP) public {
        require(
            IERC20(LPToken).balanceOf(msg.sender) >= amountLP,
            "SCAMM/Not-Enough-Balance"
        );
        // 소각하고자 하는 amount와 동일한 Token 수량들이 필요함.
        address[] memory tmpStables = stables;
        uint256 dividedBalance = amountLP.div(tmpStables.length);
        for (uint256 i = 0; tmpStables.length > i; i++) {
            // 토큰의 수량 확인
            uint256 balance = IERC20(tmpStables[i]).balanceOf(address(this));
            // 평균적으로 나눠진 토큰의 수량에 따라
            uint256 precision = dividedBalance.divWithPrecision(balance, BASE);
            // 최종적으로 가중치가 적용된 실제 token balance 산정
            uint256 finalAmount = dividedBalance.mul(precision).div(1e18);
            // 토큰 전송
            IERC20(tmpStables[i]).transfer(msg.sender, finalAmount);
        }
        // amount에 따른 LP 회수
        require(
            IERC20(LPToken).transferFrom(msg.sender, address(this), amountLP),
            "SCAMM/Not-Allowance"
        );
        // LP 소각
        require(IBurn(LPToken).burn(amountLP), "SCAMM/Impossible-Burn");
    }

    // 토큰을 소각하고 원하는 토큰 하나로 돌려받는 것.
    function withdrawToken(uint256 amountLP, address token) public {
        require(
            IERC20(LPToken).balanceOf(msg.sender) >= amountLP,
            "SCAMM/Not-Enough-Balance"
        );

        uint256 withdrawBalance;

        address[] memory tmpStables = stables;
        uint256 dividedBalance = amountLP.div(tmpStables.length);
        for (uint256 i = 0; tmpStables.length > i; i++) {
            // AMM에 예치된 토큰의 수량 확인
            uint256 balance = IERC20(tmpStables[i]).balanceOf(address(this));
            // 평균적으로 나눠진 토큰의 수량에 따라
            uint256 precision = dividedBalance.divWithPrecision(balance, BASE);
            // 최종적으로 가중치가 적용된 실제 token balance 산정
            uint256 finalAmount = dividedBalance.mul(precision).div(1e18);
            // 가지고 나갈 수 있는 토큰 수량 적립
            withdrawBalance = withdrawBalance.add(
                getAmountOut(tmpStables[i], finalAmount, token)
            );
        }
        require(
            IERC20(token).transfer(msg.sender, withdrawBalance),
            "SCAMM/What-Happen"
        );
    }

    function swap(
        address tokenIn,
        uint256 amountIn,
        address tokenOut
    ) public returns (bool) {
        // 토큰 유효성 검사
        require(
            allowedToken[tokenIn] && allowedToken[tokenOut],
            "SCAMM/Already-Exist-Addr"
        );

        // 토큰 가지고 나갈 수량
        uint256 amountOut = getAmountOut(tokenIn, amountIn, tokenOut);

        // 가지고 나가고자 하는 AMM이 가지고 있는 토큰 밸런스 검사
        require(
            IERC20(tokenOut).balanceOf(address(this)) >= amountOut,
            "SCAMM/Not-Enough-Balance"
        );

        // 토큰 미리 입금 받음
        require(
            IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn),
            "SCAMM/Not-Allowed-Balance"
        );
        // 입금 받았으니 전송해줌
        require(
            IERC20(tokenOut).transfer(msg.sender, amountOut),
            "SCAMM/What-Happen"
        );
    }

    function getAmountOut(
        address tokenIn,
        uint256 amountIn,
        address tokenOut
    ) public view returns (uint256 amountOut) {
        uint256 reserveIn = IERC20(tokenIn).balanceOf(address(this));
        uint256 reserveOut = IERC20(tokenOut).balanceOf(address(this));

        uint256 amountInWithFee = amountIn.mul(FEE_BASE.sub(FEE));
        uint256 numerator = amountInWithFee.mul(reserveOut);
        uint256 denominator = reserveIn.mul(FEE_BASE).add(amountInWithFee);
        amountOut = numerator / denominator;
    }

    function weightedCollateral() private view returns (uint256 collateral) {
        address[] memory tmpStables = stables;
        uint256 realBalance = 0;
        uint256 dividedBalance = 0;
        for (uint256 i = 0; tmpStables.length > i; i++) {
            realBalance = realBalance.add(
                IERC20(tmpStables[i]).balanceOf(address(this))
            );
        }

        dividedBalance = realBalance.div(tmpStables.length);

        for (uint256 i = 0; tmpStables.length > i; i++) {
            uint256 balance = IERC20(tmpStables[i]).balanceOf(address(this));
            uint256 precision = dividedBalance.divWithPrecision(balance, BASE);
            collateral = collateral.add(balance.mul(precision).div(BASE));
        }
    }

    // not yet
    // function weightedRatio(address token)
    //     private
    //     view
    //     returns (uint256 ratio)
    // {
    //     address[] memory tmpStables = stables;
    //     uint256 realBalance = 0;
    //     uint256 dividedBalance = 0;
    //     for (uint256 i = 0; tmpStables.length > i; i++) {
    //         realBalance = realBalance.add(
    //             IERC20(tmpStables[i]).balanceOf(address(this))
    //         );
    //     }

    //     dividedBalance = realBalance.div(tmpStables.length);
    //     uint256 balance = IERC20(tmpStables[i]).balanceOf(address(this));
    //     ratio = dividedBalance.divWithPrecision(balance, BASE);
    // }
}
