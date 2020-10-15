// We import Chai to use its asserting functions here.
const { expect } = require('chai');

// `describe` is a Mocha function that allows you to organize your tests. It's
// not actually needed, but having your tests organized makes debugging them
// easier. All Mocha functions are available in the global scope.
describe('Gov contract', function () {
  // A common pattern is to declare some variables, and assign them in the
  // `before` and `beforeEach` callbacks.
  let provider = ethers.getDefaultProvider();
  let Governance;
  let ScammGov;
  let scamm = new ethers.Wallet('0x' + 'a'.repeat(64), provider);
  let governors;
  let powers;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addr4;

  let dummybytes32 = '0xc4ad000000000000000000000000000000000000000000000000000000000001';
  let reqNumerator = 2;
  let reqDenominator = 3;

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    Governance = await ethers.getContractFactory('Governance');
    [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
    ownerAddr = await owner.getAddress();
    addr1Addr = await addr1.getAddress();
    addr2Addr = await addr2.getAddress();
    addr3Addr = await addr3.getAddress();
    addr4Addr = await addr4.getAddress();

    governors = [ownerAddr, addr1Addr, addr2Addr];
    powers = [10, 5, 1];
    totalPower = powers[0] + powers[1] + powers[2];
    consensus = [reqNumerator, reqDenominator];

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens onces its transaction has been
    // mined.
    ScammGov = await Governance.deploy(scamm.address, governors, powers, consensus);
    await ScammGov.deployed();
  });

  // You can nest describe calls to create subsections.
  describe('Deploy', function () {
    // `it` is another Mocha function. This is the one you use to define your
    // tests. It receives the test name, and a callback function.

    // If the callback function is async, Mocha will `await` it.
    it('Should initialize gov contract correctly', async function () {
      govs = await ScammGov.getGovernors();
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
      tx = await ScammGov.getTransaction(0);
      expect(tx.destination).to.equal(scamm.address);
    });

    it('Should confirm and execute a transaction', async function () {
      await ScammGov.connect(addr2).createTransaction(scamm.address, 0, 'test', dummybytes32); // consensus not reached yet
      expect(tx.executed).to.equal(false);

      await ScammGov.connect(owner).confirmTransaction(0); // consensus reached as the voted power is >66%
      tx = await ScammGov.getTransaction(0);
      expect(tx.executed).to.equal(true);
    });
  });

  describe('Manage governors', function () {
    it('Should add new governor', async function () {
      //check current governors
      govs = await ScammGov.getGovernors();
      numGovs = await ScammGov.governorsCount();
      expect(govs.length).to.equal(numGovs);
      expect(govs.length).to.equal(3);

      //build bytes data
      sig = 'setGovernor(address,uint256)';
      newGovAddrBytes = ethers.utils.hexZeroPad(addr3Addr, 32);
      newGovPower = '0x0000000000000000000000000000000000000000000000000000000000000003';
      data = ethers.utils.defaultAbiCoder.encode(['bytes32', 'bytes32'], [newGovAddrBytes, newGovPower]);

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
      govs = await ScammGov.getGovernors();
      numGovs = await ScammGov.governorsCount();
      expect(govs.length).to.equal(numGovs);
      expect(govs.length).to.equal(3);

      //build bytes data
      sig = 'removeGovernor(address)';
      targetGovAddrBytes = ethers.utils.hexZeroPad(addr2Addr, 32);
      data = ethers.utils.defaultAbiCoder.encode(['bytes32'], [targetGovAddrBytes]);

      // create tx that calls removeGovernor()
      await ScammGov.connect(owner).createTransaction(ScammGov.address, 0, sig, data); // consensus not reached yet
      await ScammGov.connect(addr1).confirmTransaction(0); // consensus reached

      // await ScammGov.removeGovernor(addr2Addr)
      expect(await ScammGov.isGovernor(addr2Addr)).to.equal(false);
      expect(await ScammGov.governorsCount()).to.equal(2);
    });
  });
});
