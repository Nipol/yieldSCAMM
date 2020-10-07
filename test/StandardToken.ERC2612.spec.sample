import { expect, use } from 'chai';
import { Contract, BigNumber, constants } from 'ethers';
import {
  keccak256,
  defaultAbiCoder,
  toUtf8Bytes,
  solidityPack,
  splitSignature,
  arrayify,
  joinSignature,
  SigningKey,
} from 'ethers/lib/utils';
import { deployContract, MockProvider, solidity } from 'ethereum-waffle';
import StandardTokenTemplate from '../build/StandardToken.json';
import IdentityMock from '../build/IdentityMock.json';

use(solidity);

const EIP712DOMAIN_TYPEHASH = keccak256(
  toUtf8Bytes('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
);

const PERMIT_TYPEHASH = keccak256(
  toUtf8Bytes('Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)'),
);

function getDomainSeparator(name: string, version: string, chainId: number, address: string) {
  return keccak256(
    defaultAbiCoder.encode(
      ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
      [EIP712DOMAIN_TYPEHASH, keccak256(toUtf8Bytes(name)), keccak256(toUtf8Bytes(version)), chainId, address],
    ),
  );
}

async function getApprovalDigest(
  chainId: number,
  token: Contract,
  approve: {
    owner: string;
    spender: string;
    value: BigNumber;
  },
  nonce: BigNumber,
  deadline: BigNumber,
): Promise<string> {
  const name = await token.name();
  const version = await token.version();
  // const DOMAIN_SEPARATOR = await token.DOMAIN_SEPARATOR();
  const DOMAIN_SEPARATOR = getDomainSeparator(name, version, chainId, token.address);
  return keccak256(
    solidityPack(
      ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
      [
        '0x19',
        '0x01',
        DOMAIN_SEPARATOR,
        keccak256(
          defaultAbiCoder.encode(
            ['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'],
            [PERMIT_TYPEHASH, approve.owner, approve.spender, approve.value, nonce, deadline],
          ),
        ),
      ],
    ),
  );
}

describe('StandardToken', () => {
  const [wallet, walletTo, Dummy] = new MockProvider({
    ganacheOptions: {
      gasLimit: 12_000_000,
    },
  }).getWallets();
  let StandardToken: Contract;

  const contractVersion = '1';
  const tokenName = 'template';
  const tokenSymbol = 'TEMP';
  const tokenDecimals = BigNumber.from(18);
  const initialToken = BigNumber.from('100000000000000000000');

  beforeEach(async () => {
    StandardToken = await deployContract(wallet, StandardTokenTemplate);
    await StandardToken.initialize(wallet.address, contractVersion, tokenName, tokenSymbol, tokenDecimals);
    await StandardToken.mint(initialToken);
  });

  describe('#permit()', () => {
    it('should be success', async () => {
      const value = constants.MaxUint256;
      // const chainId = await wallet.getChainId();
      const chainId = 1;
      const deadline = constants.MaxUint256;
      const nonce = await StandardToken.nonces(wallet.address);

      const digest = await getApprovalDigest(
        chainId,
        StandardToken,
        { owner: wallet.address, spender: walletTo.address, value },
        nonce,
        deadline,
      );

      const hash = arrayify(digest);

      const sig = joinSignature(new SigningKey(wallet.privateKey).signDigest(hash));
      // console.log(wallet.address);
      // console.log(recoverAddress(hash, sig));
      const { v, r, s } = splitSignature(sig);

      StandardToken = StandardToken.connect(walletTo);

      await expect(StandardToken.permit(wallet.address, walletTo.address, value, deadline, v, r, s))
        .to.emit(StandardToken, 'Approval')
        .withArgs(wallet.address, walletTo.address, value);
      expect(await StandardToken.allowance(wallet.address, walletTo.address)).to.be.equal(value);
    });

    it('should be success for Identity', async () => {
      let Identity = await deployContract(wallet, IdentityMock);
      const value = constants.MaxUint256;
      const chainId = 1;
      const deadline = constants.MaxUint256;
      const nonce = await StandardToken.nonces(Identity.address);

      const digest = await getApprovalDigest(
        chainId,
        StandardToken,
        { owner: Identity.address, spender: walletTo.address, value },
        nonce,
        deadline,
      );

      const hash = arrayify(digest);

      const sig = joinSignature(new SigningKey(wallet.privateKey).signDigest(hash));
      const { r, s, v } = splitSignature(sig);

      expect(await Identity.isValidSignature(hash, sig)).to.equal('0x20c13b0b');

      StandardToken = StandardToken.connect(walletTo);

      await expect(StandardToken.permit(Identity.address, walletTo.address, value, deadline, v, r, s))
        .to.emit(StandardToken, 'Approval')
        .withArgs(Identity.address, walletTo.address, value);
      expect(await StandardToken.allowance(Identity.address, walletTo.address)).to.be.equal(value);
    });

    it('should be reverted when expired deadline', async () => {
      const value = constants.MaxUint256;
      const chainId = 1;
      const deadline = BigNumber.from('1');
      const nonce = await StandardToken.nonces(wallet.address);

      const digest = await getApprovalDigest(
        chainId,
        StandardToken,
        { owner: wallet.address, spender: walletTo.address, value },
        nonce,
        deadline,
      );

      const hash = arrayify(digest);

      const sig = joinSignature(new SigningKey(wallet.privateKey).signDigest(hash));
      const { r, s, v } = splitSignature(sig);

      StandardToken = StandardToken.connect(walletTo);

      await expect(StandardToken.permit(wallet.address, walletTo.address, value, deadline, v, r, s)).to.be.revertedWith(
        'ERC2612/Expired-time',
      );
    });

    it('should be reverted when owner for zero address', async () => {
      const value = constants.MaxUint256;
      const chainId = 1;
      const deadline = constants.MaxUint256;
      const nonce = await StandardToken.nonces(wallet.address);

      const digest = await getApprovalDigest(
        chainId,
        StandardToken,
        { owner: wallet.address, spender: walletTo.address, value },
        nonce,
        deadline,
      );

      const hash = arrayify(digest);

      const sig = joinSignature(new SigningKey(wallet.privateKey).signDigest(hash));
      const { r, s, v } = splitSignature(sig);

      StandardToken = StandardToken.connect(walletTo);

      await expect(
        StandardToken.permit(constants.AddressZero, walletTo.address, value, deadline, v, r, s),
      ).to.be.revertedWith('ERC2612/Invalid-address-0');
    });

    it('should be reverted with invalid signature', async () => {
      const value = constants.MaxUint256;
      const chainId = 1;
      const deadline = constants.MaxUint256;
      const nonce = await StandardToken.nonces(wallet.address);

      const digest = await getApprovalDigest(
        chainId,
        StandardToken,
        { owner: wallet.address, spender: walletTo.address, value },
        nonce,
        deadline,
      );

      const hash = arrayify(digest);

      const sig = joinSignature(new SigningKey(wallet.privateKey).signDigest(hash));
      const { r, s, v } = splitSignature(sig);
      const fakeR = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

      StandardToken = StandardToken.connect(walletTo);

      await expect(
        StandardToken.permit(wallet.address, walletTo.address, value, deadline, v, fakeR, s),
      ).to.be.revertedWith('ERC2612/Invalid-Signature');
    });

    it('should be reverted with invalid signature for Identity', async () => {
      let Identity = await deployContract(wallet, IdentityMock);
      const value = constants.MaxUint256;
      const chainId = 1;
      const deadline = constants.MaxUint256;
      const nonce = await StandardToken.nonces(Identity.address);

      const digest = await getApprovalDigest(
        chainId,
        StandardToken,
        { owner: Identity.address, spender: walletTo.address, value },
        nonce,
        deadline,
      );

      const hash = arrayify(digest);

      const sig = joinSignature(new SigningKey(wallet.privateKey).signDigest(hash));
      const { r, v } = splitSignature(sig);
      const fakeS = '0x1112111111111111fdcfa906bf28eb5d442e7645901e5d97847a5170ff811111';

      const newSig = joinSignature({ r, s: fakeS, v });

      expect(await Identity.isValidSignature(hash, newSig)).to.equal('0xffffffff');

      StandardToken = StandardToken.connect(walletTo);

      await expect(
        StandardToken.permit(Identity.address, walletTo.address, value, deadline, v, r, fakeS),
      ).to.be.revertedWith('ERC2612/Invalid-Signature');
    });
  });
});
