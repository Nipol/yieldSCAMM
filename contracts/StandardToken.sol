// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.6.0;

import "./Interface/IERC20.sol";
import "./Interface/IERC165.sol";
import "./Interface/IERC173.sol";
import "./Interface/IERC1271.sol";
import "./Interface/IERC2612.sol";
import "./Interface/Iinitialize.sol";
import "./Library/SafeMath.sol";
import "./Library/Address.sol";
import "./Library/Authority.sol";
import "./Library/EIP712.sol";

contract StandardToken is
    Authority,
    EIP712,
    IERC20,
    IERC165,
    IERC2612,
    Iinitialize
{
    using SafeMath for uint256;
    using Address for address;

    string private _name;
    string private _symbol;
    uint8 private _decimals;
    uint256 private _totalSupply = 0;

    mapping(address => uint256) private _balances;
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

    function name() external override view returns (string memory) {
        return _name;
    }

    function symbol() external override view returns (string memory) {
        return _symbol;
    }

    function decimals() external override view returns (uint8) {
        return _decimals;
    }

    function totalSupply() external override view returns (uint256) {
        return _totalSupply;
    }

    function transfer(address to, uint256 value)
        external
        override
        returns (bool)
    {
        require(to != address(this), "ERC20/Not-Allowed-Transfer");
        _balances[msg.sender] = _balances[msg.sender].sub(
            value,
            "ERC20/Not-Enough-Balance"
        );
        _balances[to] = _balances[to].add(value);

        emit Transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external override returns (bool) {
        require(to != address(this), "ERC20/Not-Allowed-Transfer");
        _allowances[from][msg.sender] = _allowances[from][msg.sender].sub(
            value,
            "ERC20/Not-Enough-Allowance"
        );
        _balances[from] = _balances[from].sub(
            value,
            "ERC20/Not-Enough-Balance"
        );
        _balances[to] = _balances[to].add(value);

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
        override
        view
        returns (uint256)
    {
        return _balances[target];
    }

    function allowance(address target, address spender)
        external
        override
        view
        returns (uint256)
    {
        return _allowances[target][spender];
    }

    function mint(uint256 value) external onlyAuthority returns (bool) {
        _totalSupply = _totalSupply.add(value);
        _balances[msg.sender] = _balances[msg.sender].add(value);
        emit Transfer(address(0), msg.sender, value);
        return true;
    }

    function burn(uint256 value) external onlyAuthority returns (bool) {
        _balances[msg.sender] = _balances[msg.sender].sub(
            value,
            "ERC20/Not-Enough-Balance"
        );
        _totalSupply = _totalSupply.sub(value);
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
        override
        view
        returns (bool)
    {
        return
            interfaceID == type(IERC20).interfaceId || // ERC20
            interfaceID == type(IERC165).interfaceId || // ERC165
            interfaceID == type(IERC173).interfaceId || // ERC173
            interfaceID == type(IERC2612).interfaceId; // ERC2612
    }
}
