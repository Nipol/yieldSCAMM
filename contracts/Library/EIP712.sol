// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.6.0;

contract EIP712 {
    bytes32 public constant EIP712DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );

    bytes32 public DOMAIN_SEPARATOR;

    string private _version;

    function initialize(string memory version, string memory name) internal {
        uint256 chainId;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            chainId := chainid()
        }

        _version = version;

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                EIP712DOMAIN_TYPEHASH,
                keccak256(bytes(name)), // name
                keccak256(bytes(version)), // version
                chainId, // chainid
                address(this) // this address
            )
        );
    }

    function verify(
        bytes32 typehash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal view returns (address) {
        // Note: we need to use `encodePacked` here instead of `encode`.
        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, typehash)
        );
        return ecrecover(digest, v, r, s);
    }

    function version() public view returns (string memory) {
        return _version;
    }
}
