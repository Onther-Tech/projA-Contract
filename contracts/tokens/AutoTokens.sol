// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/access/Ownable.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../common/AccessibleCommon.sol";


contract AutoTokens is ERC20, AccessibleCommon {
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 initialSupply
    ) ERC20(_name, _symbol) {
        _mint(msg.sender, initialSupply);

        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
    }
    
    function mint(address account, uint256 amount) external {
        require(isAdmin(msg.sender), "you're not admin");
        _mint(account,amount);
    }

    function burn(address account, uint256 amount, bool all) external {
        require(isAdmin(msg.sender), "you're not admin");
        
        if(all){
            uint256 allbalance = balanceOf(account);
            _burn(account,allbalance);
        } else {
            _burn(account,amount);
        }
    }

    //approveAndCall과 permit도 추가


}

