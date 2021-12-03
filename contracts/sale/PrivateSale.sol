// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PrivateSale is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    struct UserInfoAmount {
        uint256 inputamount;
        uint256 totaloutputamount;
        uint256 inputTime;
        uint256 monthlyReward;
        uint256 firstReward;
    }

    struct UserInfoClaim {
        uint256 claimTime;
        uint256 claimAmount;
        uint256 fistClaimAmount;
        uint256 firstClaimTime;
    }

    struct WhiteList {
        uint256 amount;
    }

    event addList(
        address account,
        uint256 amount
    );

    event delList(
        address account,
        uint256 amount
    );

    event Buyinfo(
        address user,
        uint256 inputAmount,
        uint256 totalOutPutamount,
        uint256 inputTime,
        uint256 monthlyReward,
        uint256 firstReward
    );

    event FirstClaiminfo(
        address user,
        uint256 claimAmount,
        uint256 claimTime
    );

    event Claiminfo(
        address user,
        uint256 claimAmount,
        uint256 claimTime
    );

    event Withdrawinfo(
        address user,
        uint256 withdrawAmount
    );
    
    address public getTokenOwner;       //받은 ton을 받을 주소
    uint256 public totalGetAmount;      //총 TON받은양
    uint256 public totalSaleAmount;     //총 판매토큰

    uint256 public saleStartTime;           //sale시작 시간
    uint256 public saleEndTime;             //sale끝 시간

    uint256 public firstClaimTime;           //초기 claim 시간

    uint256 public claimStartTime;  //6개월 뒤 claim시작 시간
    uint256 public claimEndTime;    //claim시작시간 + 1년

    uint256 public saleTokenPrice;  //판매토큰가격
    uint256 public getTokenPrice;   //받는토큰가격(TON)

    IERC20 public saleToken;        //판매할 token주소
    IERC20 public getToken;         //TON 주소

    mapping (address => UserInfoAmount) public usersAmount;
    mapping (address => UserInfoClaim) public usersClaim;
    mapping (address => WhiteList) public usersWhite;


    /// @dev basic setting
    /// @param _saleTokenAddress saleTokenAddress (contract have token)
    /// @param _getTokenAddress getTokenAddress (TON)
    /// @param _getTokenOwner get TON transfer to wallet
    constructor(address _saleTokenAddress, address _getTokenAddress, address _getTokenOwner) {
        saleToken = IERC20(_saleTokenAddress);
        getToken = IERC20(_getTokenAddress);
        getTokenOwner = _getTokenOwner;
    }

    /// @dev calculator the SaleAmount(input TON how many get the anotherToken)
    /// @param _amount input the TON amount
    function calculSaleToken(uint256 _amount)
        public
        view
        returns (uint256)
    {
        uint256 tokenSaleAmount = _amount*getTokenPrice/saleTokenPrice;
        return tokenSaleAmount;
    }

    /// @dev calculator the getAmount(want to get _amount how many input the TON?)
    /// @param _amount input the anotherTokenAmount
    function calculGetToken(uint256 _amount)
        public
        view
        returns (uint256)
    {
        uint256 tokenGetAmount = _amount*saleTokenPrice/getTokenPrice;
        return tokenGetAmount;
    }

    function changeTokenAddress(address _saleToken, address _getToken) external onlyOwner {
        saleToken = IERC20(_saleToken);
        getToken = IERC20(_getToken);
    }

    function changeGetAddress(address _address) external onlyOwner {
        getTokenOwner = _address;
    }

    function settingAll(
        uint256[4] calldata _time,
        uint256 _saleTokenPrice,
        uint256 _getTokenPrice
    ) external onlyOwner {
        settingPrivateTime(_time[0],_time[1],_time[2],_time[3]);
        setTokenPrice(_saleTokenPrice,_getTokenPrice);
    }

    function settingPrivateTime(
        uint256 _startTime,
        uint256 _endTime,
        uint256 _firstTime,
        uint256 _claimTime
    ) public onlyOwner {
        settingSaleTime(_startTime,_endTime);
        settingFisrtClaimTime(_firstTime);
        settingClaimTime(_claimTime);
    }

    function settingSaleTime(uint256 _startTime,uint256 _endTime) public onlyOwner {
        saleStartTime = _startTime;
        saleEndTime = _endTime;
    }

    function settingFisrtClaimTime(uint256 _claimTime) public onlyOwner {
        firstClaimTime = _claimTime;
    }

    function settingClaimTime(uint256 _time) public onlyOwner {
        claimStartTime = _time;
        claimEndTime = _time + 360 days;
    }

    function setTokenPrice(uint256 _saleTokenPrice, uint256 _getTokenPrice)
        public
        onlyOwner
    {
        saleTokenPrice = _saleTokenPrice;
        getTokenPrice = _getTokenPrice;
    }

    function claimAmount(
        address _account
    ) external view returns (uint256) {
        UserInfoAmount memory user = usersAmount[_account];

        require(user.inputamount > 0, "user isn't buy");
        require(block.timestamp > claimStartTime, "need to time for claim");
        
        UserInfoClaim memory userclaim = usersClaim[msg.sender];

        uint difftime = block.timestamp - claimStartTime;
        uint monthTime = 30 days;

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
        uint256 _usertotaloutput,
        uint256 _fisrtReward
    ) internal view returns (uint256) {
        uint difftime = _nowtime- claimStartTime;
        uint monthTime = 30 days;

        if (difftime < monthTime) {
            uint period = 1;
            uint256 reward = (_monthlyReward*period)-_preclaimamount;
            return reward;
        } else {
            uint period = (difftime/monthTime)+1;
            if (period >= 12) {
                uint256 reward = _usertotaloutput-_preclaimamount-_fisrtReward;
                return reward; 
            } else {
                uint256 reward = (_monthlyReward*period)-_preclaimamount;
                return reward;
            }
        }
    }
    
    function addwhitelist(address _account,uint256 _amount) external onlyOwner {
        WhiteList storage userwhite = usersWhite[_account];
        userwhite.amount = userwhite.amount + _amount;

        emit addList(_account, _amount);
    }

    function addWhiteListArray(address[] calldata _account, uint256[] calldata _amount) external onlyOwner {
        for(uint i = 0; i < _account.length; i++) {
            WhiteList storage userwhite = usersWhite[_account[i]];
            userwhite.amount = userwhite.amount + _amount[i];

            emit addList(_account[i], _amount[i]);
        }
    }

    function delwhitelist(address _account, uint256 _amount) external onlyOwner {
        WhiteList storage userwhite = usersWhite[_account];
        userwhite.amount = userwhite.amount - _amount;

        emit delList(_account, _amount);
    }

    function buy(
        uint256 _amount
    ) external {
        require(saleStartTime != 0 && saleEndTime != 0, "need to setting saleTime");
        require(block.timestamp >= saleStartTime && block.timestamp <= saleEndTime, "privaSale period end");
        WhiteList storage userwhite = usersWhite[msg.sender];
        require(userwhite.amount >= _amount, "need to add whiteList amount");
        _buy(_amount);
        userwhite.amount = userwhite.amount - _amount;
    }

    function _buy(
        uint256 _amount
    )
        internal
    {
        UserInfoAmount storage user = usersAmount[msg.sender];

        uint256 tokenSaleAmount = calculSaleToken(_amount);
        uint256 tokenBalance = saleToken.balanceOf(address(this));

        require(
            tokenBalance >= tokenSaleAmount,
            "don't have token amount"
        );

        uint256 tokenAllowance = getToken.allowance(msg.sender, address(this));
        require(tokenAllowance >= _amount, "ERC20: transfer amount exceeds allowance");

        getToken.safeTransferFrom(msg.sender, address(this), _amount);
        getToken.safeTransfer(getTokenOwner, _amount);

        user.inputamount = user.inputamount+_amount;
        user.totaloutputamount = user.totaloutputamount+tokenSaleAmount;
        user.firstReward = user.totaloutputamount*625/12500;
        user.monthlyReward = (user.totaloutputamount-user.firstReward)/12;
        user.inputTime = block.timestamp;

        totalGetAmount = totalGetAmount+_amount;
        totalSaleAmount = totalSaleAmount+tokenSaleAmount;

        emit Buyinfo(
            msg.sender, 
            user.inputamount, 
            user.totaloutputamount,
            user.inputTime,
            user.monthlyReward,
            user.firstReward
        );
    }

    // function claim() public {
    //     require(firstClaimTime != 0 && saleEndTime != 0, "need to setting Time");
    //     require(block.timestamp > saleEndTime && block.timestamp > firstClaimTime, "need the fisrClaimtime");
    //     if(block.timestamp < claimStartTime) {
    //         firstClaim();
    //     } else if(claimStartTime<block.timestamp){
    //         _claim();
    //     }
    // }


    function firstClaim() public {
        require(firstClaimTime != 0 && saleEndTime != 0, "need to setting Time");
        require(block.timestamp > saleEndTime && block.timestamp > firstClaimTime, "need the fisrClaimtime");
        
        UserInfoAmount storage user = usersAmount[msg.sender];
        UserInfoClaim storage userclaim = usersClaim[msg.sender];

        require(user.inputamount > 0, "need to buy the token");
        require(userclaim.fistClaimAmount == 0, "already getFirstreward");

        userclaim.fistClaimAmount = userclaim.fistClaimAmount + user.firstReward;
        userclaim.firstClaimTime = block.timestamp;

        saleToken.safeTransfer(msg.sender, user.firstReward);

        emit FirstClaiminfo(msg.sender, userclaim.fistClaimAmount, userclaim.firstClaimTime);
    }

    function claim() external {
        require(block.timestamp >= claimStartTime, "need the time for claim");

        UserInfoAmount storage user = usersAmount[msg.sender];
        UserInfoClaim storage userclaim = usersClaim[msg.sender];

        require(user.inputamount > 0, "need to buy the token");
        require(!(user.totaloutputamount == (userclaim.claimAmount+userclaim.fistClaimAmount)), "already getAllreward");

        if(userclaim.fistClaimAmount == 0) {
            firstClaim();
        }

        uint256 giveTokenAmount = calculClaimAmount(block.timestamp, userclaim.claimAmount, user.monthlyReward, user.totaloutputamount, userclaim.fistClaimAmount);
    
        require(user.totaloutputamount - userclaim.claimAmount >= giveTokenAmount, "user is already getAllreward");
        require(saleToken.balanceOf(address(this)) >= giveTokenAmount, "dont have saleToken in pool");

        userclaim.claimAmount = userclaim.claimAmount + giveTokenAmount;
        userclaim.claimTime = block.timestamp;

        saleToken.safeTransfer(msg.sender, giveTokenAmount);

        emit Claiminfo(msg.sender, userclaim.claimAmount, userclaim.claimTime);
    }


    function withdraw(uint256 _amount) external onlyOwner {
        require(
            saleToken.balanceOf(address(this)) >= _amount,
            "dont have token amount"
        );
        saleToken.safeTransfer(msg.sender, _amount);

        emit Withdrawinfo(msg.sender, _amount);
    }

}
