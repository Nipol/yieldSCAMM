// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.6.0;

import "./Interface/IERC20.sol";
import "./Interface/IERC165.sol";
import "./Interface/IERC173.sol";
import "./Interface/IERC1271.sol";
import "./Interface/IERC2612.sol";
import "./Interface/Iinitialize.sol";
import "./Interface/IScaleFactor.sol";
import "./Interface/ICredit.sol";
import "./Library/SafeMath.sol";
import "./Library/Address.sol";
import "./Library/Authority.sol";
import "./Library/EIP712.sol";

import "@nomiclabs/buidler/console.sol";

contract ScaleToken is
    Authority,
    EIP712,
    IERC20,
    IERC165,
    IERC2612,
    Iinitialize,
    ICredit
{
    using SafeMath for uint256;
    using Address for address;

    string private _name;
    string private _symbol;
    uint8 private _decimals;
    uint256 private _totalCredit;

    mapping(address => uint256) private _credits;

    mapping(address => mapping(address => uint256)) private _allowances;

    // for ERC1271
    bytes4 internal constant ERC1271ID = bytes4(
        keccak256("isValidSignature(bytes,bytes)")
    );

    // for ERC2612
    bytes32 public constant PERMIT_TYPEHASH = keccak256(
        "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
    );
    mapping(address => uint256) public nonces;

    function initialize(
        address owner,
        string calldata version,
        string calldata name,
        string calldata symbol,
        uint8 decimals
    ) external override {
        Authority.initialize(owner);
        EIP712.initialize(version, name);

        _name = name;
        _symbol = symbol;
        _decimals = decimals;
    }

    function name() external view override returns (string memory) {
        return _name;
    }

    function symbol() external view override returns (string memory) {
        return _symbol;
    }

    function decimals() external view override returns (uint8) {
        return _decimals;
    }

    function totalSupply() external view override returns (uint256) {
        uint256 factor = IScaleFactor(this.owner()).factor();
        return _totalCredit.mulWithPrecision(factor, 1e18);
    }

    function totalCredit() external view override returns (uint256) {
        return _totalCredit;
    }

    function transfer(address to, uint256 value)
        external
        override
        returns (bool)
    {
        require(to != address(this), "ERC20/Not-Allowed-Transfer");

        uint256 factor = IScaleFactor(this.owner()).factor().div(1e18);
        uint256 tmpCredit = value.div(factor);

        _credits[msg.sender] = _credits[msg.sender].sub(
            tmpCredit,
            "ERC20/Not-Enough-Balance"
        );
        _credits[to] = _credits[to].add(tmpCredit);

        emit Transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external override returns (bool) {
        require(to != address(this), "ERC20/Not-Allowed-Transfer");
        uint256 factor = IScaleFactor(this.owner()).factor().div(1e18);
        uint256 tmpCredit = value.div(factor);

        _allowances[from][msg.sender] = _allowances[from][msg.sender].sub(
            value,
            "ERC20/Not-Enough-Allowance"
        );
        _credits[from] = _credits[from].sub(
            tmpCredit,
            "ERC20/Not-Enough-Balance"
        );
        _credits[to] = _credits[to].add(tmpCredit);

        emit Transfer(from, to, value);
        return true;
    }

    function approve(address spender, uint256 value)
        external
        override
        returns (bool)
    {
        _allowances[msg.sender][spender] = value;

        emit Approval(msg.sender, spender, value);
        return true;
    }

    function balanceOf(address target)
        external
        view
        override
        returns (uint256)
    {
        uint256 factor = IScaleFactor(this.owner()).factor();
        return _credits[target].mulWithPrecision(factor, 1e18);
    }

    function creditOf(address target) external view returns (uint256) {
        return _credits[target];
    }

    function allowance(address target, address spender)
        external
        view
        override
        returns (uint256)
    {
        return _allowances[target][spender];
    }

    function mint(uint256 value) external onlyAuthority returns (bool) {
        return this.mintTo(value, msg.sender);
    }

    function mintTo(uint256 credit, address target)
        external
        onlyAuthority
        returns (bool)
    {
        uint256 factor = IScaleFactor(this.owner()).factor();
        uint256 value = credit.mul(factor).div(1e18);
        _totalCredit = _totalCredit.add(credit);
        _credits[target] = _credits[target].add(credit);
        emit Transfer(address(0), target, value);
        return true;
    }

    function burn(uint256 credit) external onlyAuthority returns (bool) {
        uint256 factor = IScaleFactor(this.owner()).factor();
        uint256 value = credit.mul(factor).div(1e18);
        _credits[msg.sender] = _credits[msg.sender].sub(
            credit,
            "ERC20/Not-Enough-Balance"
        );
        _totalCredit = _totalCredit.sub(credit);
        emit Transfer(msg.sender, address(0), value);
        return true;
    }

    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external override {
        require(owner != address(0), "ERC2612/Invalid-address-0");
        require(deadline >= now, "ERC2612/Expired-time");

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(
                    abi.encode(
                        PERMIT_TYPEHASH,
                        owner,
                        spender,
                        value,
                        nonces[owner]++,
                        deadline
                    )
                )
            )
        );

        if (owner.isContract()) {
            // signature Concatening.
            bytes memory signature = new bytes(65);
            // solhint-disable-next-line no-inline-assembly
            // assembly {
            //     mstore(add(signature, 32), r)
            //     mstore(add(signature, 64), s)
            //     mstore(add(signature, 65), v)
            // }
            signature = abi.encodePacked(r, s, v);

            // digest bytes32 to bytes
            bytes memory bDigest = new bytes(32);
            // solhint-disable-next-line no-inline-assembly
            // assembly {
            //     mstore(add(digest, 32), bDigest)
            // }
            bDigest = abi.encodePacked(digest);

            try IERC1271(owner).isValidSignature(bDigest, signature) returns (
                bytes4 magicValue
            ) {
                require(magicValue == ERC1271ID, "ERC2612/Invalid-Signature");
                _allowances[owner][spender] = value;
                emit Approval(owner, spender, value);
            } catch Error(string memory reason) {
                revert(reason);
            }
        } else {
            address recovered = ecrecover(digest, v, r, s);
            require(
                recovered != address(0) && recovered == owner,
                "ERC2612/Invalid-Signature"
            );
            _allowances[owner][spender] = value;
            emit Approval(owner, spender, value);
        }
    }

    function supportsInterface(bytes4 interfaceID)
        external
        view
        override
        returns (bool)
    {
        return
            interfaceID == type(IERC20).interfaceId || // ERC20
            interfaceID == type(IERC165).interfaceId || // ERC165
            interfaceID == type(IERC173).interfaceId || // ERC173
            interfaceID == type(IERC2612).interfaceId; // ERC2612
    }
}
