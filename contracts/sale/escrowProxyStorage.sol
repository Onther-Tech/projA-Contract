// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract escrowProxyStorage {

    struct UserInfoAmount {
        uint256 inputamount;
        uint256 totaloutputamount;
        uint256 inputTime;
        uint256 startTime;
        uint256 endTime;
        uint256 monthlyReward;
    }

    struct UserInfoClaim {
        uint256 claimTime;
        uint256 claimAmount;
    }

    struct WhiteList {
        uint256 amount;
    }

    uint256 rate;
    uint256 totalgetAmount;

    address getAddress;

    bool public pauseProxy;

    IERC20 public saleToken;
    IERC20 public getToken;

    mapping (address => UserInfoAmount) public usersAmount;

    mapping (address => UserInfoClaim) public usersClaim;

    mapping (address => WhiteList) public usersWhite;

    mapping(uint256 => address) public proxyImplementation;

    mapping(address => bool) public aliveImplementation;

    mapping(bytes4 => address) public selectorImplementation;

}