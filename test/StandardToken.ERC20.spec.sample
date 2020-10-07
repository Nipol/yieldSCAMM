import { expect, use } from 'chai';
import { Contract, BigNumber, constants } from 'ethers';
import { deployContract, MockProvider, solidity } from 'ethereum-waffle';
import StandardTokenTemplate from '../build/StandardToken.json';

use(solidity);

describe('StandardToken', () => {
  const [wallet, walletTo, Dummy] = new MockProvider().getWallets();
  let StandardToken: Contract;

  const contractVersion = '1';
  const tokenName = 'template';
  const tokenSymbol = 'TEMP';
  const tokenDecimals = BigNumber.from('18');
  const initialToken = BigNumber.from('100000000000000000000');

  beforeEach(async () => {
    StandardToken = await deployContract(wallet, StandardTokenTemplate);
    await StandardToken.initialize(wallet.address, contractVersion, tokenName, tokenSymbol, tokenDecimals);
    await StandardToken.mint(initialToken);
  });

  describe('#name()', () => {
    it('should be correct name', async () => {
      expect(await StandardToken.name()).to.be.equal(tokenName);
    });
  });

  describe('#symbol()', () => {
    it('should be correct symbol', async () => {
      expect(await StandardToken.symbol()).to.be.equal(tokenSymbol);
    });
  });

  describe('#decimals()', () => {
    it('should be correct decimals', async () => {
      expect(await StandardToken.decimals()).to.be.equal(tokenDecimals);
    });
  });

  describe('#totalSupply()', () => {
    it('should be correct decimals', async () => {
      expect(await StandardToken.totalSupply()).to.be.equal(initialToken);
    });
  });

  describe('#balanceOf()', () => {
    it('should be initial Value, at Deployer Address', async () => {
      expect(await StandardToken.balanceOf(wallet.address)).to.be.equal(initialToken);
    });

    it('should be Zero, at Zero Address', async () => {
      expect(await StandardToken.balanceOf(constants.AddressZero)).to.be.equal('0');
    });
  });

  describe('#allowance()', () => {
    it('should be allowance value is Zero', async () => {
      expect(await StandardToken.allowance(wallet.address, walletTo.address)).to.be.equal('0');
    });
  });

  describe('#approve()', () => {
    it('should be success, Approval.', async () => {
      const value = BigNumber.from('5000000000000000000');
      await expect(StandardToken.approve(walletTo.address, value))
        .to.emit(StandardToken, 'Approval')
        .withArgs(wallet.address, walletTo.address, value);
      expect(await StandardToken.allowance(wallet.address, walletTo.address)).to.be.equal(value);
      const value2 = BigNumber.from('0');
      await expect(StandardToken.approve(walletTo.address, value2))
        .to.emit(StandardToken, 'Approval')
        .withArgs(wallet.address, walletTo.address, value2);
      expect(await StandardToken.allowance(wallet.address, walletTo.address)).to.be.equal(value2);
    });

    it('should be success over Total Supply', async () => {
      const value = constants.MaxUint256;
      await expect(StandardToken.approve(walletTo.address, value))
        .to.emit(StandardToken, 'Approval')
        .withArgs(wallet.address, walletTo.address, value);
      expect(await StandardToken.allowance(wallet.address, walletTo.address)).to.be.equal(value);
    });
  });

  describe('#transfer()', () => {
    it('should be reverted, over Transfer Value', async () => {
      const value = initialToken.add('1');
      await expect(StandardToken.transfer(walletTo.address, value)).to.be.revertedWith('ERC20/Not-Enough-Balance');
    });

    it('should be successfully Transfer', async () => {
      const value = BigNumber.from('1000000000000000000');
      await expect(StandardToken.transfer(walletTo.address, value))
        .to.emit(StandardToken, 'Transfer')
        .withArgs(wallet.address, walletTo.address, value);
      expect(await StandardToken.balanceOf(walletTo.address)).to.equal(value);
      const balance = initialToken.sub(value);
      expect(await StandardToken.balanceOf(wallet.address)).to.equal(balance);
    });
  });

  describe('#transferFrom()', () => {
    it('should be reverted, not Allow with value transfer', async () => {
      const value = BigNumber.from('5000000000000000000');
      await expect(StandardToken.approve(walletTo.address, value))
        .to.emit(StandardToken, 'Approval')
        .withArgs(wallet.address, walletTo.address, value);
      expect(await StandardToken.allowance(wallet.address, walletTo.address)).to.be.equal(value);

      await StandardToken.connect(walletTo);

      const newValue = value.add('1');
      await expect(StandardToken.transferFrom(wallet.address, Dummy.address, newValue)).to.be.revertedWith(
        'ERC20/Not-Enough-Allowance',
      );
    });

    it('should be reverted, over transfer value', async () => {
      const value = constants.MaxUint256;
      await expect(StandardToken.approve(walletTo.address, value))
        .to.emit(StandardToken, 'Approval')
        .withArgs(wallet.address, walletTo.address, value);
      expect(await StandardToken.allowance(wallet.address, walletTo.address)).to.be.equal(value);
      // const temp = await StandardToken.allowance(wallet.address, walletTo.address);
      // console.log(temp.toString());

      StandardToken = await StandardToken.connect(walletTo);

      const newValue = initialToken.add('1');
      await expect(StandardToken.transferFrom(wallet.address, Dummy.address, newValue)).to.be.revertedWith(
        'ERC20/Not-Enough-Balance',
      );
    });

    it('should be success, over transfer value', async () => {
      const value = BigNumber.from('1000000000000000000');
      await expect(StandardToken.approve(walletTo.address, value))
        .to.emit(StandardToken, 'Approval')
        .withArgs(wallet.address, walletTo.address, value);
      expect(await StandardToken.allowance(wallet.address, walletTo.address)).to.be.equal(value);

      StandardToken = await StandardToken.connect(walletTo);

      await expect(StandardToken.transferFrom(wallet.address, Dummy.address, value))
        .to.emit(StandardToken, 'Transfer')
        .withArgs(wallet.address, Dummy.address, value);
      expect(await StandardToken.balanceOf(wallet.address)).to.be.equal(initialToken.sub(value));
      expect(await StandardToken.balanceOf(walletTo.address)).to.be.equal('0');
      expect(await StandardToken.balanceOf(Dummy.address)).to.be.equal(value);
    });
  });
});
