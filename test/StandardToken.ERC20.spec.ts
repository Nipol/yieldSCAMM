import { expect, use } from 'chai';
import { ethers } from '@nomiclabs/buidler';
import { Contract, BigNumber, constants } from 'ethers';

describe('StandardToken', async () => {
  const [wallet, walletTo, Dummy] = await ethers.getSigners();
  let StandardToken: Contract;

  const contractVersion = '1';
  const tokenName = 'template';
  const tokenSymbol = 'TEMP';
  const tokenDecimals = BigNumber.from('18');
  const initialToken = BigNumber.from('100000000000000000000');

  beforeEach(async () => {
    const StandardTokenTemplate = await ethers.getContractFactory('StandardToken');
    StandardToken = await StandardTokenTemplate.deploy();

    await StandardToken.deployed();
    const walletAddress = await wallet.getAddress();
    await StandardToken.initialize(walletAddress, contractVersion, tokenName, tokenSymbol, tokenDecimals);
    await StandardToken.mint(initialToken);
  });

  describe('#name()', () => {
    it('should be correct name', async () => {
      expect(await StandardToken.name()).to.equal(tokenName);
    });
  });

  describe('#symbol()', () => {
    it('should be correct symbol', async () => {
      expect(await StandardToken.symbol()).to.equal(tokenSymbol);
    });
  });

  describe('#decimals()', () => {
    it('should be correct decimals', async () => {
      expect(await StandardToken.decimals()).to.equal(tokenDecimals);
    });
  });

  describe('#totalSupply()', () => {
    it('should be correct decimals', async () => {
      expect(await StandardToken.totalSupply()).to.be.equal(initialToken);
    });
  });

  describe('#balanceOf()', () => {
    it('should be initial Value, at Deployer Address', async () => {
      const walletAddress = await wallet.getAddress();
      expect(await StandardToken.balanceOf(walletAddress)).to.be.equal(initialToken);
    });

    it('should be Zero, at Zero Address', async () => {
      expect(await StandardToken.balanceOf(constants.AddressZero)).to.be.equal('0');
    });
  });

  describe('#allowance()', () => {
    it('should be allowance value is Zero', async () => {
      const walletAddress = await wallet.getAddress();
      const walletToAddress = await walletTo.getAddress();
      expect(await StandardToken.allowance(walletAddress, walletToAddress)).to.be.equal('0');
    });
  });

  describe('#approve()', () => {
    it('should be success, Approval.', async () => {
      const value = BigNumber.from('5000000000000000000');
      const walletAddress = await wallet.getAddress();
      const walletToAddress = await walletTo.getAddress();

      await expect(StandardToken.approve(walletToAddress, value))
        .to.emit(StandardToken, 'Approval')
        .withArgs(walletAddress, walletToAddress, value);
      expect(await StandardToken.allowance(walletAddress, walletToAddress)).to.be.equal(value);
      const value2 = BigNumber.from('0');
      await expect(StandardToken.approve(walletToAddress, value2))
        .to.emit(StandardToken, 'Approval')
        .withArgs(walletAddress, walletToAddress, value2);
      expect(await StandardToken.allowance(walletAddress, walletToAddress)).to.be.equal(value2);
    });

    it('should be success over Total Supply', async () => {
      const value = constants.MaxUint256;
      const walletAddress = await wallet.getAddress();
      const walletToAddress = await walletTo.getAddress();

      await expect(StandardToken.approve(walletToAddress, value))
        .to.emit(StandardToken, 'Approval')
        .withArgs(walletAddress, walletToAddress, value);
      expect(await StandardToken.allowance(walletAddress, walletToAddress)).to.be.equal(value);
    });
  });

  describe('#transfer()', () => {
    it('should be reverted, over Transfer Value', async () => {
      const value = initialToken.add('1');
      const walletAddress = await wallet.getAddress();
      await expect(StandardToken.transfer(walletAddress, value)).to.be.revertedWith('ERC20/Not-Enough-Balance');
    });

    it('should be successfully Transfer', async () => {
      const value = BigNumber.from('1000000000000000000');
      const walletAddress = await wallet.getAddress();
      const walletToAddress = await walletTo.getAddress();

      await expect(StandardToken.transfer(walletToAddress, value))
        .to.emit(StandardToken, 'Transfer')
        .withArgs(walletAddress, walletToAddress, value);
      expect(await StandardToken.balanceOf(walletToAddress)).to.equal(value);
      const balance = initialToken.sub(value);
      expect(await StandardToken.balanceOf(walletAddress)).to.equal(balance);
    });
  });

  describe('#transferFrom()', () => {
    it('should be reverted, not Allow with value transfer', async () => {
      const value = BigNumber.from('5000000000000000000');
      const walletAddress = await wallet.getAddress();
      const walletToAddress = await walletTo.getAddress();
      const DummyAddress = await Dummy.getAddress();

      await expect(StandardToken.approve(walletToAddress, value))
        .to.emit(StandardToken, 'Approval')
        .withArgs(walletAddress, walletToAddress, value);
      expect(await StandardToken.allowance(walletAddress, walletToAddress)).to.be.equal(value);

      await StandardToken.connect(walletTo);

      const newValue = value.add('1');
      await expect(StandardToken.transferFrom(walletAddress, DummyAddress, newValue)).to.be.revertedWith(
        'ERC20/Not-Enough-Allowance',
      );
    });

    it('should be reverted, over transfer value', async () => {
      const value = constants.MaxUint256;
      const walletAddress = await wallet.getAddress();
      const walletToAddress = await walletTo.getAddress();
      const DummyAddress = await Dummy.getAddress();

      await expect(StandardToken.approve(walletToAddress, value))
        .to.emit(StandardToken, 'Approval')
        .withArgs(walletAddress, walletToAddress, value);
      expect(await StandardToken.allowance(walletAddress, walletToAddress)).to.be.equal(value);

      StandardToken = await StandardToken.connect(walletTo);

      const newValue = initialToken.add('1');
      await expect(StandardToken.transferFrom(walletAddress, DummyAddress, newValue)).to.be.revertedWith(
        'ERC20/Not-Enough-Balance',
      );
    });

    it('should be success, over transfer value', async () => {
      const value = BigNumber.from('1000000000000000000');
      const walletAddress = await wallet.getAddress();
      const walletToAddress = await walletTo.getAddress();
      const DummyAddress = await Dummy.getAddress();

      await expect(StandardToken.approve(walletToAddress, value))
        .to.emit(StandardToken, 'Approval')
        .withArgs(walletAddress, walletToAddress, value);
      expect(await StandardToken.allowance(walletAddress, walletToAddress)).to.be.equal(value);

      StandardToken = await StandardToken.connect(walletTo);

      await expect(StandardToken.transferFrom(walletAddress, DummyAddress, value))
        .to.emit(StandardToken, 'Transfer')
        .withArgs(walletAddress, DummyAddress, value);
      expect(await StandardToken.balanceOf(walletAddress)).to.be.equal(initialToken.sub(value));
      expect(await StandardToken.balanceOf(walletToAddress)).to.be.equal('0');
      expect(await StandardToken.balanceOf(DummyAddress)).to.be.equal(value);
    });
  });
});
