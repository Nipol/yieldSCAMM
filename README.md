# yieldSCAMM

## Description

yieldSCAMM is an AMM geared towards DeFi assets that are under the same class, but are non-fungible since they require different token contracts. We have designed our first yieldSCAMM for UMA’s yield USD (uUSD).

Our team has always been fascinated with DeFi. We have, in our free time, consistently discussed and researched interesting upcoming DeFi primitives. One that caught our eye was UMA’s yield USD which provided a unique approach to lending/borrowing. However, we’ve identified the biggest bottleneck for adoption would be the lack of liquidity for uUSD, primarily because of how token contracts would be different for each maturity.

We considered an AMM dedicated for uUSDs would be a better approach than requiring a base asset such as ETH. We understand that there are one-sided AMM approaches like Dodo, but we think it is yet to be seen whether it functions competitively compared to Uniswap. Additionally, by having a dedicated AMM for uUSDs, we found that we can design a stablecoin that provides additional yields to uUSD holders in an interesting way.

uUSD is the yield dollar token designed by UMA inspired by [Dan Robinson and Allan Niemerg’s paper Yield Protocol](https://research.paradigm.xyz/Yield.pdf). The interest rate for uUSD will fluctuate depending on the markets, but will be fixed at the time of trade. For more details on how this works, please refer to [Clayton Roche’s write up on uUSD](https://medium.com/uma-project/the-yield-dollar-on-uma-3a492e79069f).

uUSD currently takes ETH and renBTC as collateral. Additionally, it requires a maturity date. For each differing maturity, uUSD will have different token contracts, essentially making them non-fungible. At the moment, UMA has created liquidity for uUSD on Balancer by incentivizing it, but this won’t be sustainable in the long run.

This is where yieldSCAMM comes in. yieldSCAMM is an AMM that pools any uUSD allowing users to trade their uUSD of one maturity to uUSD of any other maturity. As Curve Finance has become the go-to DEX for stablecoins, we anticipate yieldSCAMM to become the go-to DEX for uUSD.

Another mechanism that yieldSCAMM introduces is how the LP tokens are maintained. The LP tokens are meant to retain a peg to \$1 rather than letting the LP token’s value to float. The LP tokens will consistently rebase to reflect the US dollar value of the pooled tokens in the AMM.

We anticipate yieldSCAMM can be applied to include other asset classes as well like on-chain options and futures.

## Future work

- Protocol-izing yieldSCAMM to apply it to other asset classes
- Improving governance such that regular maintenance on yieldSCAMM can be conducted seamlessly
- Researching how to leverage arbitrage opportunities to provide additional yields to LPs

## Demo Video
[![IMAGE ALT TEXT HERE](https://yt-embed.herokuapp.com/embed?v=oF2x3PgVa0g)](https://www.youtube.com/watch?v=oF2x3PgVa0g "yieldSCAMM DEMO")

## Using Protocol

- ENS - Frontend를 Serving 할 때, 접근하기 쉬운 URL 인터페이스로 사용하고 있습니다.
- IPFS - Frontend를 직접적으로 Serving하고 있습니다.
- UMA Protocol - 만기가 존재하는 uUSD를 AMM에 담을 수 있는 용도로 사용합니다. AMM에 들어있는 uUSD가 만기되면, Governance는 uUSD를 UMA로 되돌려 담보를 출금합니다. 담보는 Uniswap과 같은 AMM을 통하여 USD//C로 교환되어 Reserve Contract에 예치됩니다.
- USD//C - uUSD와 동일하게 AMM에 담을 수 있는 자산으로 사용됩니다. uUSD를 USD//C로 교환하거나 USD//C를 uUSD들로 교환할 수 있습니다
- Aave, Compound - Reserve Contract에 예치된 USD//C는 Aave 또는 Compound로 예치되어 LPToken의 수량을 지속적으로 상승시키는 역할을 합니다.
