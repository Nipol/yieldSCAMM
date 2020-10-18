import { expect, use } from 'chai';
import { ethers } from '@nomiclabs/buidler';
import { Contract, Signer, Wallet, ContractFactory, utils } from 'ethers';

describe('Gov contract', function () {
  let GovFactory: ContractFactory;
  let ScammGov: Contract;
  let scamm: Wallet;
  scamm = new Wallet('0x' + 'a'.repeat(64));
  
  let governors: string[];
  let powers: number[];
  let owner: Signer, addr1: Signer, addr2: Signer, addr3: Signer, addr4: Signer;
  let ownerAddr: string, addr1Addr: string, addr2Addr: string, addr3Addr: string, addr4Addr: string;

  let totalPower: number;
  let dummybytes32 = '0xc4ad000000000000000000000000000000000000000000000000000000000001';
  let reqNumerator = 2;
  let reqDenominator = 3;

  beforeEach(async function () {
    GovFactory = await ethers.getContractFactory('Governance');

    [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

    ownerAddr = await owner.getAddress();
    addr1Addr = await addr1.getAddress();
    addr2Addr = await addr2.getAddress();
    addr3Addr = await addr3.getAddress();
    addr4Addr = await addr4.getAddress();

    governors = [ownerAddr, addr1Addr, addr2Addr];
    powers = [10, 5, 4];
    totalPower = powers[0] + powers[1] + powers[2];
    var consensus = [reqNumerator, reqDenominator];

    ScammGov = await GovFactory.deploy(governors, powers, consensus);
    await ScammGov.deployed();
  });

  describe('Deploy', function () {
    it('Should initialize gov contract correctly', async function () {
      var govs = await ScammGov.getGovernors();
      expect(govs[0]).to.equal(governors[0]);
      expect(govs[1]).to.equal(governors[1]);
      expect(govs[2]).to.equal(governors[2]);
      expect(await ScammGov.powerOf(ownerAddr)).to.equal(powers[0]);
      expect(await ScammGov.powerOf(addr1Addr)).to.equal(powers[1]);
      expect(await ScammGov.powerOf(addr2Addr)).to.equal(powers[2]);
    });
  });

  describe('Required', function () {
    it('Should required() work correctly', async function () {
      expect(await ScammGov.required()).to.equal(Math.floor((reqNumerator * totalPower) / reqDenominator + 1)); // Solidity does floor division
    });

    it('Should get total power', async function () {
      expect(await ScammGov.totalPower()).to.equal(totalPower);
    });
  });

  describe('Transactions', function () {
    it('Should create a transaction', async function () {
      await ScammGov.connect(addr2).createTransaction(scamm.address, 0, 'test', dummybytes32); // consensus not reached yet
      var tx = await ScammGov.getTransaction(0);
      expect(tx.destination).to.equal(scamm.address);
    });

    it('Should confirm and execute a transaction', async function () {
      await ScammGov.connect(addr2).createTransaction(scamm.address, 0, 'test', dummybytes32); // consensus not reached yet
      var tx = await ScammGov.getTransaction(0);
      expect(tx.executed).to.equal(false);

      await ScammGov.connect(owner).confirmTransaction(0); // consensus reached as the voted power is >66%
      tx = await ScammGov.getTransaction(0);
      expect(tx.executed).to.equal(true);
    });
  });

  describe('Manage governors', function () {
    it('Should add new governor', async function () {
      //check current governors
      var govs = await ScammGov.getGovernors();
      var numGovs = await ScammGov.governorsCount();
      expect(govs.length).to.equal(numGovs);
      expect(govs.length).to.equal(3);

      // let ut: utils;

      //build bytes data
      var sig = 'setGovernor(address,uint256)';
      var newGovAddrBytes = utils.zeroPad(addr3Addr, 32);
      var newGovPower = '0x0000000000000000000000000000000000000000000000000000000000000003';
      var data = utils.defaultAbiCoder.encode(['bytes32', 'bytes32'], [newGovAddrBytes, newGovPower]);

      // create tx that calls setGovernor()
      await ScammGov.connect(owner).createTransaction(ScammGov.address, 0, sig, data); // consensus not reached yet
      await ScammGov.connect(addr1).confirmTransaction(0); // consensus reached

      govs = await ScammGov.getGovernors();
      numGovs = await ScammGov.governorsCount();
      expect(govs.length).to.equal(4);

      expect(govs[3]).to.equal(addr3Addr);
      expect(await ScammGov.powerOf(addr3Addr)).to.equal(3);
    });

    it('Should check governor or not', async function () {
      expect(await ScammGov.isGovernor(ownerAddr)).to.equal(true);
      expect(await ScammGov.isGovernor(addr4Addr)).to.equal(false);
    });

    it('Should remove governor', async function () {
      var govs = await ScammGov.getGovernors();
      var numGovs = await ScammGov.governorsCount();
      expect(govs.length).to.equal(numGovs);
      expect(govs.length).to.equal(3);

      //build bytes data to remove addr1 from governors
      var sig = 'removeGovernor(address)';
      var targetGovAddrBytes = utils.zeroPad(addr1Addr, 32);
      var data = utils.defaultAbiCoder.encode(['bytes32'], [targetGovAddrBytes]);

      // create tx that calls removeGovernor()
      await ScammGov.connect(owner).createTransaction(ScammGov.address, 0, sig, data); // consensus not reached yet
      await ScammGov.connect(addr2).confirmTransaction(0); // consensus reached

      expect(await ScammGov.isGovernor(addr1Addr)).to.equal(false);
      expect(await ScammGov.governorsCount()).to.equal(2);
    });
  });
});
