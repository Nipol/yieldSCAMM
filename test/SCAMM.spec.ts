import { expect, use } from 'chai';
import { ethers } from '@nomiclabs/buidler';
import { Contract, BigNumber, constants } from 'ethers';

describe('SCAMM', async () => {
    const [wallet, walletTo, Dummy] = await ethers.getSigners();

    let yTokenA: Contract;
    let yTokenB: Contract;
    let yTokenC: Contract;

    let lpToken: Contract;

    let SCAMM: Contract;

    const contractVersion = '1';
    const tokenDecimals = BigNumber.from('18');
    // 각 yToken이 가지고 있어야 하는 토큰 수량 1000개
    const initialToken = BigNumber.from('10000000000000000000000');

    beforeEach(async () => {
        const StandardTokenTemplate = await ethers.getContractFactory('StandardToken');
        yTokenA = await StandardTokenTemplate.deploy();
        yTokenB = await StandardTokenTemplate.deploy();
        yTokenC = await StandardTokenTemplate.deploy();

        const ScaleTokenTemplate = await ethers.getContractFactory('ScaleToken');
        lpToken = await ScaleTokenTemplate.deploy();

        const SCAMMTemplate = await ethers.getContractFactory('SCAMM');
        const walletAddress = await wallet.getAddress();
        const walletToAddress = await walletTo.getAddress();
        const yTokenAAddress = yTokenA.address;
        const yTokenBAddress = yTokenB.address;
        const yTokenCAddress = yTokenC.address;

        // 0.5%
        const FEE = BigNumber.from('50');
        SCAMM = await SCAMMTemplate.deploy(walletAddress, lpToken.address, [yTokenAAddress, yTokenBAddress, yTokenCAddress], FEE);

        await lpToken.initialize(SCAMM.address, contractVersion, 'uUSD', 'uUSD', tokenDecimals);

        await yTokenA.initialize(walletAddress, contractVersion, 'yUSDA', 'yUSDA', tokenDecimals);
        await yTokenA.mintTo(initialToken, walletAddress);
        await yTokenA.mintTo(initialToken, walletToAddress);
        await yTokenB.initialize(walletAddress, contractVersion, 'yUSDB', 'yUSDB', tokenDecimals);
        await yTokenB.mintTo(initialToken, walletAddress);
        await yTokenB.mintTo(initialToken, walletToAddress);
        await yTokenC.initialize(walletAddress, contractVersion, 'yUSDC', 'yUSDC', tokenDecimals);
        await yTokenC.mintTo(initialToken, walletAddress);
        await yTokenC.mintTo(initialToken, walletToAddress);
      });

    describe('#deposit()', () => {
        it('잘 작동하나요?', async () => {
            // 100개
            const depositBalance = BigNumber.from('100000000000000000000');
            const walletAddress = await wallet.getAddress();
            const walletToAddress = await walletTo.getAddress();

            // 각 토큰별로 SCAMM에 무한한 값으로 Approve 함
            await expect(yTokenA.approve(SCAMM.address, constants.MaxUint256))
                .to.emit(yTokenA, 'Approval')
                .withArgs(walletAddress, SCAMM.address, constants.MaxUint256);

            await expect(yTokenB.approve(SCAMM.address, constants.MaxUint256))
                .to.emit(yTokenB, 'Approval')
                .withArgs(walletAddress, SCAMM.address, constants.MaxUint256);

            await expect(yTokenC.approve(SCAMM.address, constants.MaxUint256))
                .to.emit(yTokenC, 'Approval')
                .withArgs(walletAddress, SCAMM.address, constants.MaxUint256);

            // SCAMM에 토큰 예치
            await SCAMM.deposit([yTokenA.address, yTokenB.address, yTokenC.address], [depositBalance, depositBalance, depositBalance]);
            await expect(await yTokenA.balanceOf(SCAMM.address)).to.equal(depositBalance);
            await expect(await yTokenB.balanceOf(SCAMM.address)).to.equal(depositBalance);
            await expect(await yTokenC.balanceOf(SCAMM.address)).to.equal(depositBalance);

            // // 발행된 lp 토큰 수량 체크
            // // 0.5% 수수료가 적용되어 거의 298.5개의 토큰이 발행되어야 함
            // await expect(await lpToken.creditOf(walletAddress)).to.equal(BigNumber.from('298500000000000000000'));
            await expect(await lpToken.balanceOf(walletAddress)).to.equal(BigNumber.from('300000000000000000000'));

            const swapBalance = BigNumber.from('5000000000000000000');
            // 5달러씩 거래
            for(let i = 0; i < 50; i++) {
                await SCAMM.swap(yTokenA.address, swapBalance, yTokenB.address);
                await SCAMM.swap(yTokenB.address, swapBalance, yTokenC.address);
                await SCAMM.swap(yTokenC.address, swapBalance, yTokenA.address);
            }

            // 거래 이후에 발행된 lp 토큰 수량 체크
            await expect(await lpToken.balanceOf(walletAddress)).to.equal(BigNumber.from('303772920423893886000'));
            await expect(await lpToken.totalSupply()).to.equal(BigNumber.from('303772920423893886000'));

            // 새로운 월렛 등장
            yTokenA = yTokenA.connect(walletTo);
            yTokenB = yTokenB.connect(walletTo);
            yTokenC = yTokenC.connect(walletTo);
            SCAMM = SCAMM.connect(walletTo);

            // 새로운 월렛이 각 토큰별로 SCAMM에 무한한 값으로 Approve 함
            await expect(yTokenA.approve(SCAMM.address, constants.MaxUint256))
                .to.emit(yTokenA, 'Approval')
                .withArgs(walletToAddress, SCAMM.address, constants.MaxUint256);

            await expect(yTokenB.approve(SCAMM.address, constants.MaxUint256))
                .to.emit(yTokenB, 'Approval')
                .withArgs(walletToAddress, SCAMM.address, constants.MaxUint256);

            await expect(yTokenC.approve(SCAMM.address, constants.MaxUint256))
                .to.emit(yTokenC, 'Approval')
                .withArgs(walletToAddress, SCAMM.address, constants.MaxUint256);
            
            // 새로운 월렛이 SCAMM에 토큰 예치
            await SCAMM.deposit([yTokenA.address, yTokenB.address, yTokenC.address], [depositBalance, depositBalance, depositBalance]);
            // await expect(await lpToken.creditOf(walletAddress)).to.equal(BigNumber.from('298500000000000000000'));
            // await expect(await lpToken.creditOf(walletToAddress)).to.equal(BigNumber.from('296996256410046005561'));
            await expect(await lpToken.balanceOf(walletAddress)).to.equal(BigNumber.from('304935818395906002900'));
            await expect(await lpToken.balanceOf(walletToAddress)).to.equal(BigNumber.from('298837102027987882842'));

            // 새로운 월렛의 5달러씩 거래
            for(let i = 0; i < 50; i++) {
                await SCAMM.swap(yTokenA.address, swapBalance, yTokenB.address);
                await SCAMM.swap(yTokenB.address, swapBalance, yTokenC.address);
                await SCAMM.swap(yTokenC.address, swapBalance, yTokenA.address);
            }

            // 수수료 누적에 따른 증가된 밸런스
            await expect(await lpToken.balanceOf(walletAddress)).to.equal(BigNumber.from('306813672668732262900'));
            await expect(await lpToken.balanceOf(walletToAddress)).to.equal(BigNumber.from('300677399215357617642'));
        });
    });
})