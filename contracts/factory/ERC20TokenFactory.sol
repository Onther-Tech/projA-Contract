// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { AutoTokens } from "../tokens/AutoTokens.sol";
import { IERC20TokenFactory } from "../interfaces/IERC20TokenFactory.sol";

contract ERC20TokenFactory is IERC20TokenFactory {
    //실제코드에서는 필요없음 테스트용
    event Created(
        address token
    );

    function create(
        string memory _name, 
        string memory _symbol, 
        uint256 _initialSupply,
        address _owner
    ) external override returns (address) {
        AutoTokens token =
            new AutoTokens(_name, _symbol,_initialSupply, _owner);

        emit Created(address(token));

        return address(token);
    }

}
