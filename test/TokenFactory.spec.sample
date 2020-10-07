import { expect, use } from 'chai';
import { Contract, BigNumber, constants, ContractFactory } from 'ethers';
import {
  keccak256,
  defaultAbiCoder,
  toUtf8Bytes,
  solidityPack,
  splitSignature,
  arrayify,
  joinSignature,
  SigningKey,
  getAddress,
} from 'ethers/lib/utils';
import { deployContract, MockProvider, solidity } from 'ethereum-waffle';
import StandardTokenTemplate from '../build/StandardToken.json';
import TokenFactoryTemplate from '../build/TokenFactory.json';
import AddressCheckerTemplate from '../build/AddressChecker.json';
import { stringify } from 'querystring';

use(solidity);

describe('TokenFactory', async () => {
  const [wallet, walletTo, Dummy] = new MockProvider().getWallets();

  const contractVersion = '1';
  const tokenName = 'template';
  const tokenSymbol = 'TEMP';
  const tokenDecimals = BigNumber.from('18');

  let AddressChecker: Contract;
  let TemplateToken: Contract;
  let TokenFactory: Contract;

  beforeEach(async () => {
    AddressChecker = await deployContract(wallet, AddressCheckerTemplate);
    TemplateToken = await deployContract(wallet, StandardTokenTemplate);
    await TemplateToken.initialize(wallet.address, contractVersion, tokenName, tokenSymbol, tokenDecimals);
    TokenFactory = await deployContract(wallet, TokenFactoryTemplate, [TemplateToken.address]);
  });

  describe('newToken', () => {
    it('should be success for generate New Token', async () => {
      const version = '1';
      const name = 'Example';
      const symbol = 'EXAM';
      const decimals = BigNumber.from('18');
      const initialToken = BigNumber.from('100000000000000000000');

      const tokenAddress = await TokenFactory.calculateNewTokenAddress(wallet.address, version, name, symbol, decimals);
      await TokenFactory.newToken(wallet.address, version, name, symbol, decimals);
      const deployedTokenMaker = new ContractFactory(StandardTokenTemplate.abi, StandardTokenTemplate.bytecode, wallet);
      const deployedToken = deployedTokenMaker.attach(tokenAddress);
      await deployedToken.mint(initialToken);

      expect(await deployedToken.totalSupply()).to.be.equal(initialToken);
      expect(await deployedToken.name()).to.be.equal(name);
      expect(await deployedToken.symbol()).to.be.equal(symbol);
      // const byteCode = getCreationCode(TemplateToken.address, wallet.address, version, name, symbol, decimals);
      // console.log(byteCode);
      // const salted = await getAlreadyDeployedSaltAndTarget(TokenFactory, wallet.address, byteCode);

      // expect(getCreate2Address(TokenFactory.address, salted[0].salt, byteCode)).to.be.equal(tokenAddress);
    });
  });

  const getCreationCode = (
    tokenTemplateAddress: string,
    owner: string,
    version: string,
    name: string,
    symbol: string,
    decimals: BigNumber,
  ): string => {
    const creationCode =
      '0x60806040526040516102523803806102528339818101604052604081101561002657600080fd5b81019080805190602001909291908051604051939291908464010000000082111561005057600080fd5b8382019150602082018581111561006657600080fd5b825186600182028301116401000000008211171561008357600080fd5b8083526020830192505050908051906020019080838360005b838110156100b757808201518184015260208101905061009c565b50505050905090810190601f1680156100e45780820380516001836020036101000a031916815260200191505b5060405250505060008273ffffffffffffffffffffffffffffffffffffffff16826040518082805190602001908083835b602083106101385780518252602082019150602081019050602083039250610115565b6001836020036101000a038019825116818451168082178552505050505050905001915050600060405180830381855af49150503d8060008114610198576040519150601f19603f3d011682016040523d82523d6000602084013e61019d565b606091505b50509050806101b0573d6000803e3d6000fd5b606069363d3d373d3d3d363d7360b01b846e5af43d82803e903d91602b57fd5bf360881b604051602001808475ffffffffffffffffffffffffffffffffffffffffffff19168152600a018373ffffffffffffffffffffffffffffffffffffffff1660601b81526014018270ffffffffffffffffffffffffffffffffff19168152600f0193505050506040516020818303038152906040529050602d81602001f3fe';

    const initializationCalldata = TemplateToken.interface.encodeFunctionData('initialize', [
      owner,
      version,
      name,
      symbol,
      decimals,
    ]);

    return solidityPack(
      ['bytes', 'bytes'],
      [creationCode, defaultAbiCoder.encode(['address', 'bytes'], [tokenTemplateAddress, initializationCalldata])],
    );
  };

  const getCreate2Address = (factoryAddress: string, salt: string, bytecode: string): string => {
    const create2Inputs = ['0xff', factoryAddress, salt, keccak256(bytecode)];
    const sanitizedInputs = `0x${create2Inputs.map(i => i.slice(2)).join('')}`;
    return getAddress(`0x${keccak256(sanitizedInputs).slice(-40)}`);
  };

  const getAlreadyDeployedSaltAndTarget = async (
    factory: Contract,
    deployerAddress: string,
    bytecode: string,
  ): Promise<Array<{ salt: string; address: string }>> => {
    let nonce: number = 0;
    let salt = keccak256(solidityPack(['address', 'uint256'], [deployerAddress, nonce]));
    let address: string = '0x0';
    let fin = new Array<{ salt: string; address: string }>();
    while (1) {
      address = getCreate2Address(factory.address, salt, bytecode);
      fin.push({ salt, address });
      if (await AddressChecker.check(address)) {
        salt = keccak256(solidityPack(['address', 'uint256'], [deployerAddress, nonce++]));
      } else {
        break;
      }
    }

    return Promise.resolve(fin);
  };

  const getSaltAndTarget = async (
    factory: Contract,
    deployerAddress: string,
    bytecode: string,
  ): Promise<{ salt: string; address: string }> => {
    let nonce: number = 0;
    let salt = keccak256(solidityPack(['address', 'uint256'], [deployerAddress, nonce]));
    let address: string = '0x0';
    while (1) {
      address = getCreate2Address(factory.address, salt, bytecode);
      if (await AddressChecker.check(address)) {
        salt = keccak256(solidityPack(['address', 'uint256'], [deployerAddress, nonce++]));
      } else {
        break;
      }
    }

    return Promise.resolve({ salt, address });
  };
});
