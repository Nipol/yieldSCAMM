// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "@nomiclabs/buidler/console.sol";
import "./Interface/IERC2767.sol";
import "./Library/SafeMath.sol";

contract Governance is IERC2767 {
    using SafeMath for uint256;

    struct Transaction {
        address destination;
        uint256 value;
        bytes data;
        bool executed;
        uint256 votes;
    }

    /// @dev Transactions proposed for being executed
    Transaction[] transactions;

    /// @dev consensus numerator and denominator stored together
    /// For 66% consensus, numerator = 2, denominator = 3
    /// For 5 fixed votes, numerator = 5, denominator = 0
    uint256[2] consensus;

    address[] governors;

    uint256 public override totalPower;
    mapping(address => uint256) powers;

    /// @dev Transaction confirmation given by individual governors
    mapping(uint256 => mapping(address => bool)) confirmation;

    ScammInterface public scamm;

    modifier onlyGovernor() {
        require(isGovernor(msg.sender), "Gov: Only Governor");
        _;
    }

    modifier onlyGovernance() {
        require(msg.sender == address(this), "Gov: Only Governance");
        _;
    }

    /// TODO: update to have different power for each governor
    constructor(
        address _scamm,
        address[] memory _governors,
        uint256[] memory _powers
    ) public {
        require(
            _governors.length == _powers.length,
            "Gov: Different input lengths"
        );
        scamm = ScammInterface(_scamm);
        uint256 _totalPower;

        governors = _governors;

        for (uint256 i = 0; i < _governors.length; i++) {
            powers[_governors[i]] = _powers[i];
            _totalPower += _powers[i];
            emit GovernorPowerUpdated(_governors[i], _powers[i]);
        }
        totalPower = _totalPower;
    }

    /// @dev Allows an governor to submit and confirm a transaction.
    /// @param _destination Transaction target address.
    /// @param _value Transaction ether value.
    /// @param _data Transaction data payload.
    /// @return Returns transaction ID.
    function createTransaction(
        address _destination,
        uint256 _value,
        bytes memory _data
    ) public onlyGovernor returns (uint256) {
        uint256 _transactionId = transactions.length;
        transactions.push(
            Transaction({
                destination: _destination,
                value: _value,
                data: _data,
                executed: false,
                votes: 0
            })
        );

        confirmTransaction(_transactionId);

        return _transactionId;
    }

    function confirmTransaction(uint256 _transactionId) public onlyGovernor {
        require(_transactionId < transactions.length, "Gov: Tx doesn't exist");
        require(
            !transactions[_transactionId].executed,
            "Gov: Tx already executed"
        );
        require(
            !confirmation[_transactionId][msg.sender],
            "Gov: Already confirmed"
        );

        confirmation[_transactionId][msg.sender] = true;
        // TODO: use snapshot as voting power can change
        transactions[_transactionId].votes += powers[msg.sender];

        if (isTransactionConfirmed(_transactionId)) {
            executeTransaction(_transactionId);
        }
    }

    // TODO: Discuss: Is revoke function necessary?
    function revokeConfirmation(uint256 _transactionId) public onlyGovernor {
        require(_transactionId < transactions.length, "Gov: Tx doesnt exists");
        require(
            !transactions[_transactionId].executed,
            "Gov: Tx already executed"
        );
        require(
            confirmation[_transactionId][msg.sender],
            "Gov: Didn't confirmed"
        );

        confirmation[_transactionId][msg.sender] = false;
        // TODO: use snapshot as voting power can change
        transactions[_transactionId].votes -= powers[msg.sender];
    }

    /// @notice Calls the governed contract to perform administrative task
    /// @param _transactionId Transaction ID
    function executeTransaction(uint256 _transactionId) public onlyGovernor {
        require(
            !transactions[_transactionId].executed,
            "Gov: Tx already executed"
        );
        require(
            isTransactionConfirmed(_transactionId),
            "Gov: Consensus not achieved"
        );

        // TODO: call scamm.addStable() or scamm.changeFee() according to the proposal contents
        (bool _success, ) = transactions[_transactionId].destination.call{
            value: transactions[_transactionId].value
        }(transactions[_transactionId].data);

        require(_success, "Gov: Call was reverted");

        transactions[_transactionId].executed = true;
    }

    function isTransactionConfirmed(uint256 _transactionId)
        internal
        view
        returns (bool)
    {
        return transactions[_transactionId].votes >= required();
    }

    function getTransaction(uint256 _transactionId)
        public
        view
        returns (Transaction memory)
    {
        return transactions[_transactionId];
    }

    function required() public override view returns (uint256) {
        if (consensus[1] == 0) {
            // when there's no denominator.
            return consensus[0];
        } else {
            return (consensus[0] * totalPower) / consensus[1] + 1;
        }
    }

    // /// @notice Gets the sum of the power of all governors
    // /// @return Sum of the power of all governors
    // function totalPower() external view returns (uint256) {
    //     return totalPower;
    // }

    function setRequired(uint256 _numerator, uint256 _denominator)
        internal
        onlyGovernance
    {
        consensus[0] = _numerator;
        consensus[1] = _denominator;
    }

    function getGovernors() public view returns (address[] memory) {
        return governors;
    }

    /// @notice Updates governor statuses
    /// @param _governor Governor address
    /// @param _newPower New power for the governor
    /// @dev Only Governance can call
    function setGovernor(address _governor, uint256 _newPower)
        public
        override
        onlyGovernance
    {
        if (powers[_governor] != 0) {
            // new governor
            governors.push(_governor);
            powers[_governor] = _newPower;
            emit GovernorPowerUpdated(_governor, _newPower);
        } else {
            // update existing governor
            powers[_governor] = _newPower;
            emit GovernorPowerUpdated(_governor, _newPower);
        }
    }

    function governorsCount() external view returns (uint256) {
        return governors.length;
    }

    function isGovernor(address _governor) public view returns (bool) {
        for (uint256 i = 0; i < governors.length; i++) {
            if (governors[i] == _governor) {
                return true;
            }
        }
        return false;
    }

    function removeGovernor(address _existingGovernor)
        internal
        onlyGovernance
    {
        uint256 _index;
        bool _exists;
        for (uint256 i = 0; i < governors.length; i++) {
            if (governors[i] == _existingGovernor) {
                _index = i;
                _exists = true;
                // TODO: no "break" in solidity?
            }
        }

        require(_exists, "Gov: Governor does not exist");

        powers[_existingGovernor] = 0;
        governors[_index] = governors[governors.length - 1];
        governors.pop();
    }

    /// @notice Gets the consensus power of the governor
    /// @param _governor Address of the governor
    /// @return The governor's voting power
    function powerOf(address _governor)
        external
        override
        view
        returns (uint256)
    {
        return powers[_governor];
    }

    function supportsInterface(bytes4 interfaceID)
        external
        pure
        returns (bool)
    {
        return
            interfaceID ==
            this.powerOf.selector ^
                this.totalPower.selector ^
                this.required.selector ^
                this.setGovernor.selector;
    }
}

interface ScammInterface {
    function addStable(address addr) external returns (bool);

    function changeFee(uint256 newFeeRate) external returns (bool);
}
