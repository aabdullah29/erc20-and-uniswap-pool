
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ABToken1 is ERC20{

    constructor() ERC20("ABT1", "AB Token 1") {
        _mint(msg.sender, 2500 * 10**18);
    }
}