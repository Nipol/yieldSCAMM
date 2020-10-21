<img align="right" width="100" height="100" src="https://user-images.githubusercontent.com/693461/96717178-08bb6400-13e1-11eb-9362-b5319c4a6b0c.png">

# yieldSCAMM

*In a world of scams, yieldSCAMM brings liquidity to non-fungible tokens within the same asset class, starting from UMA’s yield dollars.*

*yieldSCAMM = accruing sustainable yields (yield) + through rebases (SC) + while providing liquidity (AMM)*

## Description

yieldSCAMM is an AMM geared towards DeFi assets that are under the same class, but are non-fungible since they require different token contracts. We have designed our first yieldSCAMM for UMA’s yield USD (uUSD).

Our team has always been fascinated with DeFi. We have, in our free time, consistently discussed and researched interesting upcoming DeFi primitives. One that caught our eye was UMA’s yield USD which provided a unique approach to lending/borrowing. However, we’ve identified the biggest bottleneck for adoption would be the lack of liquidity for uUSD, primarily because of how token contracts would be different for each maturity.

We considered an AMM dedicated for uUSDs would be a better approach than requiring a base asset such as ETH. We understand that there are one-sided AMM approaches like Dodo, but we think it is yet to be seen whether it functions competitively compared to Uniswap. Additionally, by having a dedicated AMM for uUSDs, we found that we can design a stablecoin that provides additional yields to uUSD holders in an interesting way.

uUSD is the yield dollar token designed by UMA inspired by Dan Robinson and Allan Niemerg’s paper Yield Protocol (https://research.paradigm.xyz/Yield.pdf). The interest rate for uUSD will fluctuate depending on the markets, but will be fixed at the time of trade. For more details on how this works, please refer to Clayton Roche’s write up on uUSD (https://medium.com/uma-project/the-yield-dollar-on-uma-3a492e79069f).

uUSD currently takes ETH and renBTC as collateral. Additionally, it requires a maturity date. For each differing maturity, uUSD will have different token contracts, essentially making them non-fungible. At the moment, UMA has created liquidity for uUSD on Balancer by incentivizing it, but this won’t be sustainable in the long run.

This is where yieldSCAMM comes in. yieldSCAMM is an AMM that pools any uUSD allowing users to trade their uUSD of one maturity to uUSD of any other maturity. As Curve Finance has become the go-to DEX for stablecoins, we anticipate yieldSCAMM to become the go-to DEX for uUSD. 

Another mechanism that yieldSCAMM introduces is how the LP tokens are maintained. The LP tokens are meant to retain a peg to $1 rather than letting the LP token’s value to float. The LP tokens will consistently rebase to reflect the US dollar value of the pooled tokens in the AMM.

Eventually the LP token will be backed by uUSD of multiple maturities with some eventually expiring. At date of maturity, the expiring uUSD will be automatically used to claim locked up collateral. The collateral will be instantaneously traded for USDC to store in a Reserve Contract. USDC in the Reserve Contract will be deposited on Compound or Aave to accrue interest.

We anticipate yieldSCAMM can be applied to include other asset classes as well like on-chain options and futures.

**Future work required**
* Protocol-izing yieldSCAMM to apply it to other asset classes
* Improving governance such that regular maintenance on yieldSCAMM can be conducted seamlessly
* Researching how to leverage arbitrage opportunities to provide additional yields to LPs

## Demo URL
* [yieldSCAMM.eth](http://yieldscamm.eth)
* [yieldSCAMM from cloudflare](https://cloudflare-ipfs.com/ipfs/QmYvMSx3rdqFmqo7ED5WqvXYB9BMSb88yxXLCdAvytzDGL)
* [yieldSCAMM from ipfs.io](https://ipfs.io/ipfs/QmYvMSx3rdqFmqo7ED5WqvXYB9BMSb88yxXLCdAvytzDGL)

_If you want to test it, please leave your rinkby address as an issue. I'll send you a token._

## Demo Video
[![IMAGE ALT TEXT HERE](https://yt-embed.herokuapp.com/embed?v=oF2x3PgVa0g)](https://www.youtube.com/watch?v=oF2x3PgVa0g "yieldSCAMM DEMO")

## Components of yieldSCAMM
* ENS: ENS URLs have become an easier way to interact with DApps and therefore we have opted to use [yieldscamm.eth](yieldscamm.eth) for the access point to our front end.
* IPFS: IPFS is serving the actual front end code.
* UMA Protocol: UMA's yield dollar (uUSD) is pooled into our AMM. If any uUSD in the AMM matures, the uUSD is repaid to UMA to withdraw collateral. The collateral is instantaneously traded for USDC and deposited to the Reserve Contract.
* Aave / Compound: USDC that sits on the Reserve Contract utilized Aave or Compound to accrue additional interest for LP token holders.

