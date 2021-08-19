// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IERC20TokenFactory {
    function create(string memory _name, string memory _symbol, uint256 _initialSupply, address _owner) external returns (address);
}