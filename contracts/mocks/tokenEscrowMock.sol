// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { tokenEscrow } from "../sale/tokenEscrow.sol";


contract tokenEscrowMock is tokenEscrow {

    constructor(
        address _saleTokenAddress, 
        address _getTokenAddress
    ) tokenEscrow(_saleTokenAddress, _getTokenAddress) {
    }

    function settingClaimTime(uint256 _time) external override onlyOwner {
        claimStartTime = _time;
        claimEndTime = _time + 120 minutes;
    }

     function claimAmount(
        address _account
    ) external override view returns (uint256) {
        UserInfoAmount storage user = usersAmount[_account];

        require(user.inputamount > 0, "user isn't buy");
        require(block.timestamp > claimStartTime, "need to time for claim");
        
        UserInfoClaim storage userclaim = usersClaim[msg.sender];

        uint difftime = block.timestamp - claimStartTime;
        uint monthTime = 10 minutes;

        if (difftime < monthTime) {
            uint period = 1;
            uint256 reward = (user.monthlyReward*period)-userclaim.claimAmount;
            return reward;
        } else {
            uint period = (difftime/monthTime)+1;
            if (period >= 12) {
                uint256 reward = user.totaloutputamount-userclaim.claimAmount;
                return reward; 
            } else {
                uint256 reward = (user.monthlyReward*period)-userclaim.claimAmount;
                return reward;
            }
        }
    }

    function calculClaimAmount(
        uint256 _nowtime, 
        uint256 _preclaimamount,
        uint256 _monthlyReward,
        uint256 _usertotaloutput
    ) internal override view returns (uint256) {
        uint difftime = _nowtime- claimStartTime;
        uint monthTime = 10 minutes;

        if (difftime < monthTime) {
            uint period = 1;
            uint256 reward = (_monthlyReward*period)-_preclaimamount;
            return reward;
        } else {
            uint period = (difftime/monthTime)+1;
            if (period >= 12) {
                uint256 reward = _usertotaloutput-_preclaimamount;
                return reward; 
            } else {
                uint256 reward = (_monthlyReward*period)-_preclaimamount;
                return reward;
            }
        }
    }

}
