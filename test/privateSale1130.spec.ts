import { BigNumber } from "@ethersproject/bignumber";
const { time, BN } = require("@openzeppelin/test-helpers");

const { AddressZero, MaxUint256 } = require("@ethersproject/constants");
const { ethers, network } = require('hardhat')
const chai = require('chai')
const { solidity } = require('ethereum-waffle')
const { expect } = chai

chai.use(solidity)

describe("token deploy", () => {
    const BASE_TEN = 10
    const decimals = 18    
    const tokenSupply = 100000000;
    const bigTokenSupply = BigNumber.from(tokenSupply).mul(BigNumber.from(BASE_TEN).pow(decimals))
    const privateSaleAmount = 12500000;
    const bigPrivateSaleAmount = BigNumber.from(privateSaleAmount).mul(BigNumber.from(BASE_TEN).pow(decimals))
    const baiscTonBalance1 = 1000;
    const account1TonAmount = BigNumber.from(baiscTonBalance1).mul(BigNumber.from(BASE_TEN).pow(decimals))
    const baiscTonBalance2 = 3000;
    const account2TonAmount = BigNumber.from(baiscTonBalance2).mul(BigNumber.from(BASE_TEN).pow(decimals))
    const baiscTonBalance3 = 6000;
    const account3TonAmount = BigNumber.from(baiscTonBalance3).mul(BigNumber.from(BASE_TEN).pow(decimals))

    const oneday = 86400

    let tonPrice = 20000
    let domPrice = 16

    let tokenOwner: any
    let erc20Owner: any
    let privateOwner: any

    let token: any
    let prov: any
    let domToken: any
    let erc20token: any
    let tonToken: any
    let deployEscrow: any
    let privateSale: any
    let getTONOnwer: any

    let account1 : any
    let account2 : any
    let account3 : any
    let account4 : any

    let saleStartTime : any
    let saleEndTime : any
    let firstClaimTime : any
    let claimStartTime : any

    let buyNowTime : any
    let buyInputTime : any
    let buyStartTime : any
    let buyEndTime : any

    let buyInputTime2 : any
    let buyStartTime2 : any
    let buyEndTime2 : any

    let buyInputTime3 : any
    let buyStartTime3 : any
    let buyEndTime3 : any

    let nowTime: any
    let fisrtClaimTime : any
    let claimTime1: any
    let claimTime2: any
    let claimTime3: any

    let account1first = 62500
    let bigAccount1first = BigNumber.from(account1first).mul(BigNumber.from(BASE_TEN).pow(decimals))
    let account1Total = 1250000
    let bigAccount1Total = BigNumber.from(account1Total).mul(BigNumber.from(BASE_TEN).pow(decimals))
    
    let account2first = 187500
    let bigAccount2first = BigNumber.from(account2first).mul(BigNumber.from(BASE_TEN).pow(decimals))
    let account2Total = 3750000
    let bigAccount2Total = BigNumber.from(account2Total).mul(BigNumber.from(BASE_TEN).pow(decimals))
    
    let account3first = 375000
    let bigAccount3first = BigNumber.from(account3first).mul(BigNumber.from(BASE_TEN).pow(decimals))
    let account3Total = 7500000
    let bigAccount3Total = BigNumber.from(account3Total).mul(BigNumber.from(BASE_TEN).pow(decimals))

    //시나리오
    //TON = 20,000원 , DoM = 16원 => 1TON = 1,250 DoM
    //privateSaleTotalAmount = 12,500,000 DoM,  fisrtClaimTotalAmount = 625,000, 나머지 = 11,875,000, 매달 = 989,583.3333333~
    //account1 = 1000TON 삼, firstClaim = 62,500, 매달 98,958.33333, totalAmount = 1,250,000
    //account2 = 30000TON 삼, fisrtClaim = 187,500, 매달 296,874.99999, totalAmount = 3,750,000
    //account3 = 6000TON 삼, fisrtClaim = 375,000, 매달 593,749.999998, totalAmount = 7,500,000
    //saleStartTime = nowblock + 10, saleEndTime = startTime + 1day, fisrtClaimTime = endTime + 1day, claimTime = endTime + 180day
    before(async () => {
        [ tokenOwner, erc20Owner, privateOwner, account1, account2, account3, account4, getTONOnwer ] = await ethers.getSigners();
        token = await ethers.getContractFactory("DOC");
        // console.log(tokenFactory)
        prov = ethers.getDefaultProvider();

        domToken = await token.deploy("domToken", "DoM", bigTokenSupply, tokenOwner.address);

        erc20token = await ethers.getContractFactory("ERC20Mock");
        tonToken = await erc20token.connect(erc20Owner).deploy("testTON", "TON");

        deployEscrow = await ethers.getContractFactory("PrivateSale");
        privateSale = await deployEscrow.connect(privateOwner).deploy(domToken.address, tonToken.address, getTONOnwer.address)
        // console.log(privateSale)
        await domToken.transfer(privateSale.address, bigPrivateSaleAmount);
        await tonToken.connect(erc20Owner).transfer(account1.address, account1TonAmount)
        await tonToken.connect(erc20Owner).transfer(account2.address, account2TonAmount)
        await tonToken.connect(erc20Owner).transfer(account3.address, account3TonAmount)

        // await ethers.provider.send("evm_increaseTime", [10]) // add 10 seconds
        // await ethers.provider.send("evm_mine", []) // force mine the next block
        // await ethers.provider.send('evm_setNextBlockTimestamp', [abc]);
        // await ethers.provider.send('evm_mine');
    })

    describe('privateSale test', () => {
        describe("privateSale setting", () => {
            it('balance check', async () => {
                let tx = await tonToken.balanceOf(account1.address)
                let tx2 = await tonToken.balanceOf(account2.address)
                let tx3 = await tonToken.balanceOf(account3.address)
                let tx4 = await domToken.balanceOf(account1.address)
                let tx5 = await domToken.balanceOf(account2.address)
                let tx6 = await domToken.balanceOf(account3.address)
                let tx7 = await domToken.balanceOf(privateSale.address)
                let tx8 = await tonToken.balanceOf(getTONOnwer.address)

                expect(tx).to.be.equal(account1TonAmount)
                expect(tx2).to.be.equal(account2TonAmount)
                expect(tx3).to.be.equal(account3TonAmount)
                expect(tx4.toString()).to.be.equal('0')
                expect(tx5.toString()).to.be.equal('0')
                expect(tx6.toString()).to.be.equal('0')
                expect(tx7.toString()).to.be.equal(bigPrivateSaleAmount)
                expect(tx8.toString()).to.be.equal('0')
            })

            it('settingAll caller is not owner', async () => {
                let blocktime = Number(await time.latest());
                // console.log(blocktime);
                saleStartTime = blocktime + 10;
                saleEndTime = saleStartTime + oneday;
                firstClaimTime = saleEndTime + oneday;
                claimStartTime = saleEndTime + (oneday*180);

                expect(privateSale.connect(account1).settingAll(
                    [saleStartTime,saleEndTime,firstClaimTime,claimStartTime],
                    domPrice,
                    tonPrice
                )).to.be.revertedWith('Ownable: caller is not the owner')
            })

            it('settingAll caller is owner', async () => {
                let blocktime = Number(await time.latest());
                // console.log(blocktime);
                saleStartTime = blocktime + 10;
                saleEndTime = saleStartTime + oneday;
                firstClaimTime = saleEndTime + oneday;
                claimStartTime = saleEndTime + (oneday*180);

                await privateSale.connect(privateOwner).settingAll(
                    [saleStartTime,saleEndTime,firstClaimTime,claimStartTime],
                    domPrice,
                    tonPrice
                )

                expect(await privateSale.saleStartTime()).to.be.equal(saleStartTime)
                expect(await privateSale.saleEndTime()).to.be.equal(saleEndTime)
                expect(await privateSale.firstClaimTime()).to.be.equal(firstClaimTime)
                expect(await privateSale.claimStartTime()).to.be.equal(claimStartTime)
                expect(await privateSale.saleTokenPrice()).to.be.equal(domPrice)
                expect(await privateSale.getTokenPrice()).to.be.equal(tonPrice)
            })
        })

        describe("whitelist setting", () => {
            it("buy before whitelisting", async () => {
                let buy1 = privateSale.connect(account1).buy(account1TonAmount)
                await expect(buy1).to.be.revertedWith("privaSale period end")
                let buy2 = privateSale.connect(account2).buy(account2TonAmount)
                await expect(buy2).to.be.revertedWith("privaSale period end")
                let buy3 = privateSale.connect(account3).buy(account3TonAmount)
                await expect(buy3).to.be.revertedWith("privaSale period end")            
            })

            it("buy before whitelisting", async () => {
                await ethers.provider.send('evm_setNextBlockTimestamp', [saleStartTime]);
                await ethers.provider.send('evm_mine');
                let buy1 = privateSale.connect(account1).buy(account1TonAmount)
                await expect(buy1).to.be.revertedWith("need to add whiteList amount")
                let buy2 = privateSale.connect(account2).buy(account2TonAmount)
                await expect(buy2).to.be.revertedWith("need to add whiteList amount")
                let buy3 = privateSale.connect(account3).buy(account3TonAmount)
                await expect(buy3).to.be.revertedWith("need to add whiteList amount")            
            })

            it("addwhitelist", async () => {
                await privateSale.connect(privateOwner).addwhitelist(
                    account1.address,
                    account1TonAmount
                )
                let tx = await privateSale.usersWhite(account1.address)
                expect(tx).to.be.equal(account1TonAmount);
            })

            it("addWhiteListArray", async () => {
                await privateSale.connect(privateOwner).addWhiteListArray(
                    [account2.address,account3.address],
                    [account2TonAmount,account3TonAmount]
                )
                let tx2 = await privateSale.usersWhite(account2.address)
                expect(tx2).to.be.equal(account2TonAmount);
                let tx3 = await privateSale.usersWhite(account3.address)
                expect(tx3).to.be.equal(account3TonAmount);
            })
        })

        describe("buy test", () => {
            it("buy caller is not whitelist", async () => {
                expect(privateSale.connect(account4).buy(account1TonAmount)
                ).to.be.revertedWith("need to add whiteList amount");     
            })

            it("buy caller is whitelist but more amount", async () => {
                expect(privateSale.connect(account1).buy(account2TonAmount)
                ).to.be.revertedWith("need to add whiteList amount");     
            })

            it("buy caller is whitelist and exact amount before approve", async () => {
                expect(privateSale.connect(account1).buy(account1TonAmount)
                ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");    
            })

            it("buy caller is whitelist and exact amount for account1", async () => {
                await tonToken.connect(account1).approve(privateSale.address,account1TonAmount)
                await privateSale.connect(account1).buy(account1TonAmount);
                
                let tx = await privateSale.usersAmount(account1.address);
                expect(tx.totaloutputamount).to.be.equal(bigAccount1Total);
                expect(tx.firstReward).to.be.equal(bigAccount1first); 
            })

            it("buy caller is whitelist and exact amount for account2, account3", async () => {
                await tonToken.connect(account2).approve(privateSale.address,account2TonAmount)
                await privateSale.connect(account2).buy(account2TonAmount);
                
                let tx = await privateSale.usersAmount(account2.address);
                expect(tx.totaloutputamount).to.be.equal(bigAccount2Total);
                expect(tx.firstReward).to.be.equal(bigAccount2first); 

                await tonToken.connect(account3).approve(privateSale.address,account3TonAmount)
                await privateSale.connect(account3).buy(account3TonAmount);
                
                let tx2 = await privateSale.usersAmount(account3.address);
                expect(tx2.totaloutputamount).to.be.equal(bigAccount3Total);
                expect(tx2.firstReward).to.be.equal(bigAccount3first); 
            })
        })

        describe("claim test", () => {
            it("firstClaim before fisrClaimtime", async () => {
                expect(privateSale.connect(account1).firstClaim()
                ).to.be.revertedWith("need the fisrClaimtime");    
            })
            it("firstClaim after fisrClaimtime", async () => {
                await ethers.provider.send('evm_setNextBlockTimestamp', [firstClaimTime+1]);
                await ethers.provider.send('evm_mine');

                let balance = await domToken.balanceOf(account1.address);
                expect(balance).to.be.equal(0)

                await privateSale.connect(account1).firstClaim();
                let balance2 = await domToken.balanceOf(account1.address);
                // console.log(Number(balance2))
                let user1 = await privateSale.usersAmount(account1.address);
                expect(user1.firstReward).to.be.equal(balance2)
            })

            it("firstClaim about account2, account3", async () => {
                let acc2balance = await domToken.balanceOf(account2.address);
                expect(acc2balance).to.be.equal(0)

                let acc3balance = await domToken.balanceOf(account2.address);
                expect(acc3balance).to.be.equal(0)

                await privateSale.connect(account2).firstClaim();
                await privateSale.connect(account3).firstClaim();
                let acc2balance2 = await domToken.balanceOf(account2.address);
                let user2 = await privateSale.usersAmount(account2.address);
                expect(user2.firstReward).to.be.equal(acc2balance2)
                let acc3balance2 = await domToken.balanceOf(account2.address);
                let user3 = await privateSale.usersAmount(account2.address);
                expect(user3.firstReward).to.be.equal(acc3balance2)
            })

            it("reply firstClaim", async () => {
                expect(privateSale.connect(account2).firstClaim()
                ).to.be.revertedWith("already getFirstreward");    
            })

            it("claim 1month about account1, account2", async () => {
                await ethers.provider.send('evm_setNextBlockTimestamp', [claimStartTime+1]);
                await ethers.provider.send('evm_mine');

                await privateSale.connect(account1).claim();
                await privateSale.connect(account2).claim();
                
                let user1 = await privateSale.usersAmount(account1.address);
                let user2 = await privateSale.usersAmount(account2.address);
                let acc1balance = await domToken.balanceOf(account1.address);
                let acc2balance = await domToken.balanceOf(account2.address);
                
                expect(Number(user1.firstReward)+Number(user1.monthlyReward)).to.be.equal(Number(acc1balance))
                expect(Number(user2.firstReward)+Number(user2.monthlyReward)).to.be.equal(Number(acc2balance))
            })

            it("claim 2month about account1, account3", async () => {
                let after1month = claimStartTime + (oneday*30)
                await ethers.provider.send('evm_setNextBlockTimestamp', [after1month]);
                await ethers.provider.send('evm_mine');

                await privateSale.connect(account1).claim();
                await privateSale.connect(account3).claim();

                let user1 = await privateSale.usersAmount(account1.address);
                let user3 = await privateSale.usersAmount(account3.address);
                let acc1balance = await domToken.balanceOf(account1.address);
                let acc3balance = await domToken.balanceOf(account3.address);

                let user1monthlyReward = Number(user1.monthlyReward)
                let user3monthlyReward = Number(user3.monthlyReward)
                let user1Reward = user1monthlyReward * 2
                let user3Reward = user3monthlyReward * 2

                expect(user1Reward+Number(user1.firstReward)).to.be.equal(Number(acc1balance))
                expect(user3Reward+Number(user3.firstReward)).to.be.equal(Number(acc3balance))
            })

            it("claim 6month about account2, account3", async () => {
                let after5month = claimStartTime + ((oneday*30)*5)
                await ethers.provider.send('evm_setNextBlockTimestamp', [after5month]);
                await ethers.provider.send('evm_mine');

                await privateSale.connect(account2).claim();
                await privateSale.connect(account3).claim();

                let user2 = await privateSale.usersAmount(account2.address);
                let user3 = await privateSale.usersAmount(account3.address);
                let acc2balance = await domToken.balanceOf(account2.address);
                let acc3balance = await domToken.balanceOf(account3.address);

                let user2monthlyReward = Number(user2.monthlyReward)
                let user3monthlyReward = Number(user3.monthlyReward)
                let user2Reward = user2monthlyReward * 6
                let user3Reward = user3monthlyReward * 6

                expect(user2Reward+Number(user2.firstReward)).to.be.equal(Number(acc2balance))
                expect(user3Reward+Number(user3.firstReward)).to.be.equal(Number(acc3balance))
            })

            it("claim 10month abount account1", async () => {
                let after9month = claimStartTime + ((oneday*30)*9)
                await ethers.provider.send('evm_setNextBlockTimestamp', [after9month]);
                await ethers.provider.send('evm_mine');

                await privateSale.connect(account1).claim();

                let user1 = await privateSale.usersAmount(account1.address);
                let acc1balance = await domToken.balanceOf(account1.address);

                let user1monthlyReward = Number(user1.monthlyReward)
                let user1Reward = user1monthlyReward * 10

                expect(user1Reward+Number(user1.firstReward)).to.be.equal(Number(acc1balance))
            })

            it("claim 12month about account1, account2, account3", async () => {
                let after11month = claimStartTime + ((oneday*30)*11)
                await ethers.provider.send('evm_setNextBlockTimestamp', [after11month]);
                await ethers.provider.send('evm_mine');

                await privateSale.connect(account1).claim();
                await privateSale.connect(account2).claim();
                await privateSale.connect(account3).claim();

                let user1 = await privateSale.usersAmount(account1.address);
                let user2 = await privateSale.usersAmount(account2.address);
                let user3 = await privateSale.usersAmount(account3.address);
                let acc1balance = await domToken.balanceOf(account1.address);
                let acc2balance = await domToken.balanceOf(account2.address);
                let acc3balance = await domToken.balanceOf(account3.address);

                // console.log(Number(user1.totaloutputamount))
                // console.log(Number(user2.totaloutputamount))
                // console.log(Number(user3.totaloutputamount))

                // let user1monthlyReward = Number(user1.monthlyReward)
                // let user2monthlyReward = Number(user2.monthlyReward)
                // let user3monthlyReward = Number(user3.monthlyReward)
                // let user1Reward = user1monthlyReward * 9
                // let user2Reward = user2monthlyReward * 6
                // let user3Reward = user3monthlyReward * 6
                
                // expect(user1Reward+Number(user1.firstReward)).to.be.equal(Number(acc1balance))
                // expect(user2Reward+Number(user2.firstReward)).to.be.equal(Number(acc2balance))
                // expect(user3Reward+Number(user3.firstReward)).to.be.equal(Number(acc3balance))
                expect(Number(user1.totaloutputamount)).to.be.equal(Number(acc1balance))
                expect(Number(user2.totaloutputamount)).to.be.equal(Number(acc2balance))
                expect(Number(user3.totaloutputamount)).to.be.equal(Number(acc3balance))
            })
        })

    })
})