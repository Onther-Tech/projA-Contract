// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";



contract tokenEscrow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    
    struct UserInfoAmount {
        uint256 inputamount;
        uint256 totaloutputamount;
        uint256 inputTime;
        uint256 startTime;
        uint256 endTime;
    }

    struct UserInfoClaim {
        uint256 claimTime;
        uint256 claimAmount;
    }
    
    uint256 rate;

    uint256 totalgetAmount;

    IERC20 public saleToken;
    IERC20 public getToken;

    mapping (address => UserInfoAmount) public usersAmount;
    mapping (address => UserInfoClaim) public usersClaim;

    constructor(address _saleTokenAddress, address _getTokenAddress, uint256 _rate) {
        saleToken = IERC20(_saleTokenAddress);
        getToken = IERC20(_getTokenAddress);
        rate = _rate;
    }

    function rateChange(uint256 _rate) external onlyOwner {
        rate = _rate;
    }
    function setGetToken(address _getToken) external onlyOwner {
        getToken = IERC20(_getToken);
    }

    function setSaleToken(address _saleToken) external onlyOwner {
        saleToken = IERC20(_saleToken);
    }

    function calculrate(uint256 _amount) internal view returns (uint256){
        return rate.mul(_amount);
    }

    function startTimeCalcul(uint256 _time) internal pure returns (uint256) {
        uint256 startTime = _time + 180 days;
        return startTime;
    }

    function endTimeCalcul(uint256 _time) internal pure returns (uint256) {
        uint256 endTime = _time + 360 days;
        return endTime;
    }
    
    function calculClaimAmount(uint256 _nowtime, uint256 _starttime, uint256 _preclaimamount) internal view returns (uint256) {



    }

    function buy(
        uint256 _amount
    )
        external
    {
        _buy(_amount);
    }

    function _buy(
        uint256 _amount
    )
        internal
    {
        UserInfoAmount storage user = usersAmount[msg.sender];

        uint256 giveTokenAmount = calculrate(_amount);
        uint256 tokenBalance = saleToken.balanceOf(address(this));

        require(
            tokenBalance >= giveTokenAmount,
            "don't have token amount"
        );

        uint256 tokenAllowance = getToken.allowance(msg.sender, address(this));
        require(tokenAllowance >= _amount, "ERC20: transfer amount exceeds allowance");

        getToken.safeTransferFrom(msg.sender, owner(), _amount);

        user.inputamount = user.inputamount.add(_amount);
        user.totaloutputamount = user.totaloutputamount.add(giveTokenAmount);
        user.inputTime = block.timestamp;
        user.startTime = startTimeCalcul(block.timestamp);
        user.endTime = endTimeCalcul(user.startTime);

        totalgetAmount = totalgetAmount.add(_amount);
    }

    function claim() external {
        UserInfoAmount storage user = usersAmount[msg.sender];
        UserInfoClaim storage userclaim = usersClaim[msg.sender];

        require(user.inputamount > 0, "need to buy the token");
        require(block.timestamp >= user.startTime, "need the time for claim");

        uint256 giveTokenAmount = calculClaimAmount(block.timestamp, user.startTime, userclaim.claimAmount);
    
        require(user.totaloutputamount - userclaim.claimAmount >= giveTokenAmount, "");

        userclaim.claimAmount = userclaim.claimAmount + giveTokenAmount;
        saleToken.transfer(msg.sender, giveTokenAmount);
    }


    function withdraw(uint256 _amount) external onlyOwner {
        require(
            saleToken.balanceOf(address(this)) >= _amount,
            "don't have token amount"
        );
        saleToken.transfer(msg.sender, _amount);
    }

}
