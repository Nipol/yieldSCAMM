// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@nomiclabs/buidler/console.sol";

contract Greeter {
    string greeting;
    uint256 public number;

    constructor(string memory _greeting) public {
        console.log("Deploying a Greeter with greeting:", _greeting);
        greeting = _greeting;
    }

    function greet() public view returns (string memory) {
        return greeting;
    }

    function setGreeting(string memory _greeting) public {
        console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);
        greeting = _greeting;
    }

    function setNumber(uint256 _number) public {
        number = _number;
    }
}