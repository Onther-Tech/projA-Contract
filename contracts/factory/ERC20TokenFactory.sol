// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { AutoTokens } from "../tokens/AutoTokens.sol";
import {IERC20TokenFactory} from "../interfaces/IERC20TokenFactory.sol";

contract ERC20TokenFactory is IERC20TokenFactory {
    address owner;
    constructor(
        address _owner
    ) public  {
        owner = _owner;
    }
    function create(
        string memory _name, 
        string memory _symbol, 
        uint256 _initialSupply,
        address _owner
    ) external override returns (address) {
        require(msg.sender == owner, "your not tokenFactoryOwner");
        AutoTokens token =
            new AutoTokens(_name, _symbol,_initialSupply);

        token.transferAdmin(_owner);

        return address(token);
    }

}
