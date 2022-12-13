
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ABToken2 is ERC20{

    constructor() ERC20("ABT2", "AB Token 2") {
        _mint(msg.sender, 3500 * 10**18);
    }
}