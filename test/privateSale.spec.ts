import { BigNumber } from "@ethersproject/bignumber";
const { time, BN } = require("@openzeppelin/test-helpers");

const { AddressZero, MaxUint256 } = require("@ethersproject/constants");
const { ethers, network } = require('hardhat')
const chai = require('chai')
const { solidity } = require('ethereum-waffle')
const { expect } = chai

chai.use(solidity)

describe("token deploy", () => {
    const tokenSupply = 500000000;
    const privateSaleAmount = 100000000;
    const baiscTonBalance1 = 1200;
    const baiscTonBalance2 = 1300;
    const baiscTonBalance3 = 1100;
    const totalTonBalance = baiscTonBalance1 + baiscTonBalance2 + baiscTonBalance3;

    const oneday = 86400
    
    let rate = 917.5 * (1e6);
    // let rate = 917.5;
    let rate2 = rate / (1e6);
    
    let acc1TotalReward = baiscTonBalance1 * rate2;
    let acc2TotalReward = baiscTonBalance2 * rate2;
    let acc3TotalReward = baiscTonBalance3 * rate2;

    let acc1MonthReward = Math.floor(acc1TotalReward / 12);
    let acc2MonthReward = Math.floor(acc2TotalReward / 12);
    let acc3MonthReward = Math.floor(acc3TotalReward / 12);

    let tokenOwner: any
    let erc20Owner: any
    let escrowOwner: any

    let token: any
    let prov: any
    let docToken: any
    let erc20token: any
    let tonToken: any
    let deployEscrow: any
    let escrow: any
    let getTONOnwer: any

    let account1 : any
    let account2 : any
    let account3 : any
    let account4 : any

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
    let claimTime1: any
    let claimTime2: any
    let claimTime3: any

    //doc가격 10원, ton가격 10000원 1000배차이 -> ton 1 = doc 1000
    //TON 1200개 넣으면 1200000개 DOC 얻음 -> 한달에 100000 개씩
    before(async () => {
        [ tokenOwner, erc20Owner, escrowOwner, account1, account2, account3, account4, getTONOnwer ] = await ethers.getSigners();
        token = await ethers.getContractFactory("DOC");
        // console.log(tokenFactory)
        prov = ethers.getDefaultProvider();

        docToken = await token.deploy("DocToken", "DOC", tokenSupply, tokenOwner.address);

        erc20token = await ethers.getContractFactory("ERC20Mock");
        tonToken = await erc20token.connect(erc20Owner).deploy("testTON", "TON");

        deployEscrow = await ethers.getContractFactory("tokenEscrow");
        escrow = await deployEscrow.connect(escrowOwner).deploy(docToken.address, tonToken.address, getTONOnwer.address)
        // console.log(escrow)
        await docToken.transfer(escrow.address, privateSaleAmount);
        await tonToken.connect(erc20Owner).transfer(account1.address, baiscTonBalance1)
        await tonToken.connect(erc20Owner).transfer(account2.address, baiscTonBalance2)
        await tonToken.connect(erc20Owner).transfer(account3.address, baiscTonBalance3)

        // await ethers.provider.send("evm_increaseTime", [10]) // add 10 seconds
        // await ethers.provider.send("evm_mine", []) // force mine the next block
    })

    describe('privateSale test', () => {
        describe("buy test", () => {
            it('balance check', async () => {
                let tx = Number(await tonToken.balanceOf(account1.address))
                let tx2 = Number(await tonToken.balanceOf(account2.address))
                let tx3 = Number(await tonToken.balanceOf(account3.address))
                let tx4 = await docToken.balanceOf(account1.address)
                let tx5 = await docToken.balanceOf(account2.address)
                let tx6 = await docToken.balanceOf(account3.address)
                let tx7 = await docToken.balanceOf(escrow.address)
                let tx8 = await tonToken.balanceOf(getTONOnwer.address)

                expect(tx).to.be.equal(baiscTonBalance1)
                expect(tx2).to.be.equal(baiscTonBalance2)
                expect(tx3).to.be.equal(baiscTonBalance3)
                expect(tx4.toString()).to.be.equal('0')
                expect(tx5.toString()).to.be.equal('0')
                expect(tx6.toString()).to.be.equal('0')
                expect(tx7.toString()).to.be.equal('100000000')
                expect(tx8.toString()).to.be.equal('0')

            })

            it('buy before setting the rate', async () => {
                let buy1 = escrow.connect(account1).buy(baiscTonBalance1)
                await expect(buy1).to.be.revertedWith("need to setting the rate")
            })

            it('setting the rate caller is not owner', async () => {
                let tx = escrow.connect(account1).rateChange(rate)
                await expect(tx).to.be.revertedWith("Ownable: caller is not the owner")
            })

            it('setting the rate caller is owner', async () => {
                await escrow.connect(escrowOwner).rateChange(rate)
                let tx = await escrow.rate();
                console.log(tx.toString())
                expect(tx).to.be.equal(rate)
            })

            it('buy before setting the saleStartTime && saleEndTime', async () => {
                let buy1 = escrow.connect(account1).buy(baiscTonBalance1)
                await expect(buy1).to.be.revertedWith("need to setting saleTime")
            })

            it('setting the saleStartTime caller is not owner', async () => {
                let blocktime = Number(await time.latest());
                let tx = escrow.connect(account1).settingSaleStartTime(blocktime)
                await expect(tx).to.be.revertedWith("Ownable: caller is not the owner")
            })

            it('setting the saleStartTime', async () => {
                let blocktime = Number(await time.latest());
                await escrow.connect(escrowOwner).settingSaleStartTime(blocktime)
                let tx = await escrow.saleStartTime();
                expect(tx).to.be.equal(blocktime)
            })

            it('buy after setting the saleStartTime before setting saleEndTime', async () => {
                let buy1 = escrow.connect(account1).buy(baiscTonBalance1)
                await expect(buy1).to.be.revertedWith("need to setting saleTime")
            })

            it('setting the saleEndTime caller is not owner', async () => {
                let blocktime = Number(await time.latest());
                let endTime = blocktime + 86400
                let tx = escrow.connect(account1).settingSaleEndTime(endTime)
                await expect(tx).to.be.revertedWith("Ownable: caller is not the owner")
            })

            it('setting the saleEndTime', async () => {
                let blocktime = Number(await time.latest());
                let endTime = blocktime + 86400
                await escrow.connect(escrowOwner).settingSaleEndTime(endTime)
                let tx = await escrow.saleEndTime();
                expect(tx).to.be.equal(endTime)
            })

            it('buy before addwhiteList', async () => {
                let buy1 = escrow.connect(account1).buy(baiscTonBalance1)
                await expect(buy1).to.be.revertedWith("need to add whiteList amount")
                let buy2 = escrow.connect(account2).buy(baiscTonBalance2)
                await expect(buy2).to.be.revertedWith("need to add whiteList amount")
                let buy3 = escrow.connect(account3).buy(baiscTonBalance3)
                await expect(buy3).to.be.revertedWith("need to add whiteList amount")
            })

            it('call addwhiteList dont owner', async () => {
                let tx = escrow.connect(account1).addwhitelist(account1.address, baiscTonBalance1)
                await expect(tx).to.be.revertedWith("Ownable: caller is not the owner")
                let tx2 = escrow.connect(account2).addwhitelist(account2.address, baiscTonBalance2)
                await expect(tx2).to.be.revertedWith("Ownable: caller is not the owner")
                let tx3 = escrow.connect(account3).addwhitelist(account3.address, baiscTonBalance3)
                await expect(tx3).to.be.revertedWith("Ownable: caller is not the owner")
            })

            it('call addwhiteList owner', async () => {
                let tx = await escrow.connect(escrowOwner).addwhitelist(account1.address, baiscTonBalance1)
                
                await expect(tx).to.emit(escrow, 'addList').withArgs(
                    account1.address,
                    baiscTonBalance1 
                )

                let tx2 = await escrow.connect(escrowOwner).addwhitelist(account2.address, baiscTonBalance2)

                await expect(tx2).to.emit(escrow, 'addList').withArgs(
                    account2.address,
                    baiscTonBalance2 
                )

                let tx3 = await escrow.connect(escrowOwner).addwhitelist(account3.address, baiscTonBalance3)

                await expect(tx3).to.emit(escrow, 'addList').withArgs(
                    account3.address,
                    baiscTonBalance3 
                )
            })

            it('call delwhitelist dont owner', async () => {
                let tx = escrow.connect(account1).delwhitelist(account1.address, baiscTonBalance1)
                await expect(tx).to.be.revertedWith("Ownable: caller is not the owner")
            })

            it('call delwhitelist owner', async () => {
                let tx = await escrow.connect(escrowOwner).delwhitelist(account1.address, baiscTonBalance1)
                
                await expect(tx).to.emit(escrow, 'delList').withArgs(
                    account1.address,
                    baiscTonBalance1 
                )

                let tx2 = await escrow.connect(escrowOwner).addwhitelist(account1.address, baiscTonBalance1)
                
                await expect(tx2).to.emit(escrow, 'addList').withArgs(
                    account1.address,
                    baiscTonBalance1 
                )
            })

            it('call chagneGetAddress not owner', async () => {
                let tx = escrow.connect(account1).changeGetAddress(account1.address)
                await expect(tx).to.be.revertedWith("Ownable: caller is not the owner")
            })

            it('call chagneGetAddress owner', async () => {
                await escrow.connect(escrowOwner).changeGetAddress(account1.address)
                let tx = await escrow.getTokenOwner();
                expect(account1.address).to.be.equal(tx)

                await escrow.connect(escrowOwner).changeGetAddress(getTONOnwer.address)
                let tx2 = await escrow.getTokenOwner();
                expect(getTONOnwer.address).to.be.equal(tx2)
            })
            
            it('buy before approve', async () => {
                let buy1 = escrow.connect(account1).buy(baiscTonBalance1)
                await expect(buy1).to.be.revertedWith("ERC20: transfer amount exceeds allowance")
                let buy2 = escrow.connect(account2).buy(baiscTonBalance2)
                await expect(buy2).to.be.revertedWith("ERC20: transfer amount exceeds allowance")
                let buy3 = escrow.connect(account3).buy(baiscTonBalance3)
                await expect(buy3).to.be.revertedWith("ERC20: transfer amount exceeds allowance")
            })

            it('account1, account2, account3 approve & buy & event', async () => {
                await tonToken.connect(account1).approve(escrow.address, baiscTonBalance1)
                await tonToken.connect(account2).approve(escrow.address, baiscTonBalance2)
                await tonToken.connect(account3).approve(escrow.address, baiscTonBalance3)

                let tx = Number(await tonToken.balanceOf(account1.address))
                let tx2 = Number(await tonToken.balanceOf(account2.address))
                let tx3 = Number(await tonToken.balanceOf(account3.address))
                let tx4 = await tonToken.balanceOf(getTONOnwer.address)

                buyNowTime = Number(await time.latest());
                buyInputTime = (buyNowTime + 1).toString();
                buyInputTime2 = (buyNowTime + 2).toString();
                buyInputTime3 = (buyNowTime + 3).toString();

                let buy1 = await escrow.connect(account1).buy(baiscTonBalance1)
                let buy2 = await escrow.connect(account2).buy(baiscTonBalance2)
                let buy3 = await escrow.connect(account3).buy(baiscTonBalance3)

                await expect(buy1).to.emit(escrow, 'Buyinfo').withArgs(
                    account1.address, 
                    baiscTonBalance1, 
                    acc1TotalReward, 
                    buyInputTime,
                    acc1MonthReward
                )

                await expect(buy2).to.emit(escrow, 'Buyinfo').withArgs(
                    account2.address, 
                    baiscTonBalance2, 
                    acc2TotalReward, 
                    buyInputTime2,
                    acc2MonthReward
                )

                await expect(buy3).to.emit(escrow, 'Buyinfo').withArgs(
                    account3.address, 
                    baiscTonBalance3, 
                    acc3TotalReward, 
                    buyInputTime3,
                    acc3MonthReward
                )


                let tx5 = await tonToken.balanceOf(account1.address)
                let tx6 = await tonToken.balanceOf(account2.address)
                let tx7 = await tonToken.balanceOf(account3.address)
                let tx8 = Number(await tonToken.balanceOf(getTONOnwer.address))

                expect(tx).to.be.equal(baiscTonBalance1)
                expect(tx2).to.be.equal(baiscTonBalance2)
                expect(tx3).to.be.equal(baiscTonBalance3)
                expect(tx4.toString()).to.be.equal('0')

                //after buy
                expect(tx5.toString()).to.be.equal('0')
                expect(tx6.toString()).to.be.equal('0')
                expect(tx7.toString()).to.be.equal('0')
                expect(tx8).to.be.equal(totalTonBalance)
            })

            it("buy after buy", async () => {
                let buy1 = escrow.connect(account1).buy(baiscTonBalance1)
                await expect(buy1).to.be.revertedWith("need to add whiteList amount")
            })  

        })
        describe("claim & event test", () => {
            it('balance Check', async () => {
                let tx = await docToken.balanceOf(account1.address)
                expect(tx.toString()).to.be.equal('0')

                let tx2 = await docToken.balanceOf(account2.address)
                expect(tx2.toString()).to.be.equal('0')

                let tx3 = await docToken.balanceOf(account3.address)
                expect(tx3.toString()).to.be.equal('0')

                let tx4 = await docToken.balanceOf(escrow.address)
                expect(tx4.toString()).to.be.equal('100000000')
            })

            it("dont buy dont claim", async () => {
                let tx = escrow.connect(account4).claim();
                await expect(tx).to.be.revertedWith("need to buy the token")
            })

            it("setting the claim time caller is not owner", async () => {
                let blocktime = Number(await time.latest());
                let claimTime = blocktime + 15552000
                let tx = escrow.connect(account1).settingClaimTime(claimTime)
                await expect(tx).to.be.revertedWith("Ownable: caller is not the owner")
            })

            it("setting the claim time caller is owner", async () => {
                let blocktime = Number(await time.latest());
                let claimTime = blocktime + 15552000
                let claimEndTime = claimTime + 31104000
                await escrow.connect(escrowOwner).settingClaimTime(claimTime)
                let tx = await escrow.claimStartTime()
                await expect(tx).to.be.equal(claimTime)
                let tx2 = await escrow.claimEndTime()
                await expect(tx2).to.be.equal(claimEndTime)
            })

            it('claim & claimAmount before 6 months of buy', async () => {
                let tx = escrow.connect(account1).claim();
                await expect(tx).to.be.revertedWith("need the time for claim")
                
                let tx2 = escrow.connect(account2).claim();
                await expect(tx2).to.be.revertedWith("need the time for claim")

                let tx3 = escrow.connect(account3).claim();
                await expect(tx3).to.be.revertedWith("need the time for claim")

                let tx4 = escrow.claimAmount(account1.address);
                await expect(tx4).to.be.revertedWith("need to time for claim")
                
                let tx5 = escrow.claimAmount(account4.address);
                await expect(tx5).to.be.revertedWith("user isn't buy")
            })

            it('claim & claimAmount After 6 months of buy', async () => {
                await time.increase(time.duration.days(181));
                nowTime = Number(await time.latest())+1;
                let claim1 = await escrow.connect(account1).claim();
                let claim2 = await escrow.connect(account2).claim();

                
                let tx = Number(await docToken.balanceOf(account1.address))
                let tx2 = Number(await escrow.claimAmount(account1.address))
                // let monthReward = Math.floor(acc1MonthReward/(1e6))*(1e6)
                // expect(tx).to.be.equal(Math.floor(acc1MonthReward/(1e6)))
                expect(tx).to.be.equal(tx2)

                await expect(claim1).to.emit(escrow, 'Claiminfo').withArgs(
                    account1.address, 
                    tx2,
                    nowTime
                )

                let tx3 = Number(await docToken.balanceOf(account2.address))
                let tx4 = Number(await escrow.claimAmount(account2.address))
                // let monthReward2 = Math.floor(acc2MonthReward/(1e6))*(1e6)
                // expect(tx3).to.be.equal(Math.floor(acc2MonthReward/(1e6)))
                expect(tx4).to.be.equal(tx3)

                await expect(claim2).to.emit(escrow, 'Claiminfo').withArgs(
                    account2.address, 
                    tx4,
                    nowTime+1
                )
            })

            it('claim After 7 months of buy', async () => {
                await time.increase(time.duration.days(30));
                nowTime = Number(await time.latest())+1;
                let claim1 = await escrow.connect(account1).claim();
                let claim2 = await escrow.connect(account3).claim();
                let period = 2
                let acc1Reward = acc1MonthReward * period 
                let acc3Reward = acc3MonthReward * period 
                // let acc1Reward = Math.floor(acc1MonthReward * period / (1e6))
                // let acc3Reward = Math.floor(acc3MonthReward * period / (1e6))
                // let monthReward1 = acc1Reward*(1e6)
                // let monthReward3 = acc3Reward*(1e6)

                let tx = Number(await docToken.balanceOf(account1.address))
                // console.log(tx)
                expect(tx).to.be.equal(acc1Reward)

                await expect(claim1).to.emit(escrow, 'Claiminfo').withArgs(
                    account1.address, 
                    acc1Reward,
                    nowTime
                )

                let tx2 = Number(await docToken.balanceOf(account3.address))
                // console.log(tx2)
                expect(tx2).to.be.equal(acc3Reward)

                await expect(claim2).to.emit(escrow, 'Claiminfo').withArgs(
                    account3.address, 
                    acc3Reward,
                    nowTime+1
                )
            })

            it('claim After 8 months of buy', async () => {
                await time.increase(time.duration.days(30));
                nowTime = Number(await time.latest())+1;
                let claim1 = await escrow.connect(account1).claim();
                let claim2 = await escrow.connect(account2).claim();
                let period = 3
                let acc1Reward = acc1MonthReward * period
                let acc2Reward = acc2MonthReward * period 
                // let acc1Reward = Math.floor(acc1MonthReward * period / (1e6))
                // let acc2Reward = Math.floor(acc2MonthReward * period / (1e6))
                // let monthReward1 = acc1Reward*(1e6)
                // let monthReward2 = acc2Reward*(1e6)

                let tx = Number(await docToken.balanceOf(account1.address))
                expect(tx).to.be.equal(acc1Reward)

                await expect(claim1).to.emit(escrow, 'Claiminfo').withArgs(
                    account1.address, 
                    acc1Reward,
                    nowTime
                )

                let tx2 = Number(await docToken.balanceOf(account2.address))
                expect(tx2).to.be.equal(acc2Reward)

                await expect(claim2).to.emit(escrow, 'Claiminfo').withArgs(
                    account2.address, 
                    acc2Reward,
                    nowTime+1
                )
            })

            it('claim After 9 months of buy', async () => {
                await time.increase(time.duration.days(30));
                nowTime = Number(await time.latest())+1;
                let claim1 = await escrow.connect(account1).claim();
                let period = 4
                let acc1Reward = acc1MonthReward * period
                // let acc1Reward = Math.floor(acc1MonthReward * period / (1e6))
                // let monthReward1 = acc1Reward*(1e6)
                
                let tx = Number(await docToken.balanceOf(account1.address))
                expect(tx).to.be.equal(acc1Reward)

                await expect(claim1).to.emit(escrow, 'Claiminfo').withArgs(
                    account1.address, 
                    acc1Reward,
                    nowTime
                )
            })

            it('claim After 10 months of buy', async () => {
                await time.increase(time.duration.days(30));
                nowTime = Number(await time.latest())+1;
                let claim1 = await escrow.connect(account1).claim();
                let period = 5
                let acc1Reward = acc1MonthReward * period
                // let acc1Reward = Math.floor(acc1MonthReward * period / (1e6))
                // let monthReward1 = acc1Reward*(1e6)
                
                let tx = Number(await docToken.balanceOf(account1.address))
                expect(tx).to.be.equal(acc1Reward)

                await expect(claim1).to.emit(escrow, 'Claiminfo').withArgs(
                    account1.address, 
                    acc1Reward,
                    nowTime
                )
            })

            it('claim After 11 months of buy', async () => {
                await time.increase(time.duration.days(30));
                nowTime = Number(await time.latest())+1;

                let claim1 = await escrow.connect(account1).claim();
                let claim2 = await escrow.connect(account2).claim();
                let claim3 = await escrow.connect(account3).claim();
                
                let period = 6
                let acc1Reward = acc1MonthReward * period 
                let acc2Reward = acc2MonthReward * period 
                let acc3Reward = acc3MonthReward * period 
                // let acc1Reward = Math.floor(acc1MonthReward * period / (1e6))
                // let acc2Reward = Math.floor(acc2MonthReward * period / (1e6))
                // let acc3Reward = Math.floor(acc3MonthReward * period / (1e6))
                // let monthReward1 = acc1Reward*(1e6)
                // let monthReward2 = acc2Reward*(1e6)
                // let monthReward3 = acc3Reward*(1e6)
                
                let tx = Number(await docToken.balanceOf(account1.address))
                expect(tx).to.be.equal(acc1Reward)

                await expect(claim1).to.emit(escrow, 'Claiminfo').withArgs(
                    account1.address, 
                    acc1Reward,
                    nowTime
                )
                
                let tx2 = Number(await docToken.balanceOf(account2.address))
                expect(tx2).to.be.equal(acc2Reward)

                await expect(claim2).to.emit(escrow, 'Claiminfo').withArgs(
                    account2.address, 
                    acc2Reward,
                    nowTime+1
                )

                let tx3 = Number(await docToken.balanceOf(account3.address))
                expect(tx3).to.be.equal(acc3Reward)

                await expect(claim3).to.emit(escrow, 'Claiminfo').withArgs(
                    account3.address, 
                    acc3Reward,
                    nowTime+2
                )
            })

            it('claim After 12 months of buy', async () => {
                await time.increase(time.duration.days(30));
                nowTime = Number(await time.latest())+1; 
                let claim1 = await escrow.connect(account1).claim();
                let period = 7
                let acc1Reward = acc1MonthReward * period
                // let acc1Reward = Math.floor(acc1MonthReward * period / (1e6))
                // let monthReward1 = acc1Reward*(1e6)
                
                let tx = Number(await docToken.balanceOf(account1.address))
                expect(tx).to.be.equal(acc1Reward)

                await expect(claim1).to.emit(escrow, 'Claiminfo').withArgs(
                    account1.address, 
                    acc1Reward,
                    nowTime
                )
            })

            it('claim After 13 months of buy', async () => {
                await time.increase(time.duration.days(30));
                nowTime = Number(await time.latest())+1;
                let claim1 = await escrow.connect(account1).claim();
                let period = 8
                let acc1Reward = acc1MonthReward * period 
                // let acc1Reward = Math.floor(acc1MonthReward * period / (1e6))
                // let monthReward1 = acc1Reward*(1e6)
                
                let tx = Number(await docToken.balanceOf(account1.address))
                expect(tx).to.be.equal(acc1Reward)

                await expect(claim1).to.emit(escrow, 'Claiminfo').withArgs(
                    account1.address, 
                    acc1Reward,
                    nowTime
                )
            })

            it('claim After 14 months of buy', async () => {
                await time.increase(time.duration.days(30));
                nowTime = Number(await time.latest())+1;
                let claim1 = await escrow.connect(account1).claim();
                let period = 9
                let acc1Reward = acc1MonthReward * period 
                // let acc1Reward = Math.floor(acc1MonthReward * period / (1e6))
                // let monthReward1 = acc1Reward*(1e6)
                
                let tx = Number(await docToken.balanceOf(account1.address))
                expect(tx).to.be.equal(acc1Reward)

                await expect(claim1).to.emit(escrow, 'Claiminfo').withArgs(
                    account1.address, 
                    acc1Reward,
                    nowTime
                )
            })

            it('claim After 15 months of buy', async () => {
                await time.increase(time.duration.days(30));
                nowTime = Number(await time.latest())+1;
                let claim1 = await escrow.connect(account1).claim();
                let claim2 = await escrow.connect(account2).claim();

                let period = 10
                let acc1Reward = acc1MonthReward * period 
                let acc2Reward = acc2MonthReward * period 
                // let acc1Reward = Math.floor(acc1MonthReward * period / (1e6))
                // let acc2Reward = Math.floor(acc2MonthReward * period / (1e6))
                // let monthReward1 = acc1Reward*(1e6)
                // let monthReward2 = acc2Reward*(1e6)
                
                let tx = Number(await docToken.balanceOf(account1.address))
                expect(tx).to.be.equal(acc1Reward)

                await expect(claim1).to.emit(escrow, 'Claiminfo').withArgs(
                    account1.address, 
                    acc1Reward,
                    nowTime
                )

                let tx2 = Number(await docToken.balanceOf(account2.address))
                expect(tx2).to.be.equal(acc2Reward)

                await expect(claim2).to.emit(escrow, 'Claiminfo').withArgs(
                    account2.address, 
                    acc2Reward,
                    nowTime+1
                )
            })

            it('claim After 16 months of buy', async () => {
                await time.increase(time.duration.days(30));
                nowTime = Number(await time.latest())+1;
                let claim1 = await escrow.connect(account1).claim();
                let claim3 = await escrow.connect(account3).claim();

                let period = 11
                let acc1Reward = acc1MonthReward * period
                let acc3Reward = acc3MonthReward * period 
                // let acc1Reward = Math.floor(acc1MonthReward * period / (1e6))
                // let acc3Reward = Math.floor(acc3MonthReward * period / (1e6))
                // let monthReward1 = acc1Reward*(1e6)
                // let monthReward3 = acc3Reward*(1e6)
                
                let tx = Number(await docToken.balanceOf(account1.address))
                expect(tx).to.be.equal(acc1Reward)

                await expect(claim1).to.emit(escrow, 'Claiminfo').withArgs(
                    account1.address, 
                    acc1Reward,
                    nowTime
                )

                let tx2 = Number(await docToken.balanceOf(account3.address))
                expect(tx2).to.be.equal(acc3Reward)

                await expect(claim3).to.emit(escrow, 'Claiminfo').withArgs(
                    account3.address, 
                    acc3Reward,
                    nowTime+1
                )
            })

            it('claim After 17 months of buy', async () => {
                await time.increase(time.duration.days(30));
                nowTime = Number(await time.latest())+1;

                let claim1 = await escrow.connect(account1).claim();
                
                let tx = Number(await docToken.balanceOf(account1.address))
                let accReward1 = acc1TotalReward
                // let accReward1 = acc1TotalReward / (1e6)
                expect(tx).to.be.equal(accReward1)

                await expect(claim1).to.emit(escrow, 'Claiminfo').withArgs(
                    account1.address, 
                    acc1TotalReward,
                    nowTime
                )
            })

            it('claim After 18 months of buy', async () => {
                await time.increase(time.duration.days(30));
                
                let tx = escrow.connect(account1).claim();                
                await expect(tx).to.be.revertedWith("already getAllreward")
                
                nowTime = Number(await time.latest())+1;
                let claim1 = await escrow.connect(account2).claim();           

                let tx2 = Number(await docToken.balanceOf(account2.address))
                let accReward2 = acc2TotalReward 
                // let accReward2 = Math.floor(acc2TotalReward / (1e6))
                // let accTotalReward2 = accReward2 * (1e6)

                expect(tx2).to.be.equal(accReward2)

                await expect(claim1).to.emit(escrow, 'Claiminfo').withArgs(
                    account2.address, 
                    acc2TotalReward,
                    nowTime
                )
                
            })

            it('claim After 19 months of buy', async () => {
                await time.increase(time.duration.days(30));
                
                let tx = escrow.connect(account2).claim();                
                await expect(tx).to.be.revertedWith("already getAllreward")
                
                nowTime = Number(await time.latest())+1;
                let claim1 = await escrow.connect(account3).claim(); 

                let tx2 = Number(await docToken.balanceOf(account3.address))
                let accReward3 = acc3TotalReward 
                // let accReward3 = Math.floor(acc3TotalReward / (1e6))
                // let accTotalReward3 = accReward3 * (1e6)

                expect(tx2).to.be.equal(accReward3)

                await expect(claim1).to.emit(escrow, 'Claiminfo').withArgs(
                    account3.address, 
                    acc3TotalReward,
                    nowTime
                )
            })

            it('claim After 20 months of buy', async () => {
                await time.increase(time.duration.days(30));
                let tx = escrow.connect(account3).claim();                
                await expect(tx).to.be.revertedWith("already getAllreward")
            })
        })

        describe("withdraw & event", () => {
            it('not owner not withdraw', async () => {
                let tx = Number(await docToken.balanceOf(escrow.address))
                let tx2 = escrow.connect(account1).withdraw(tx)
                await expect(tx2).to.be.revertedWith("Ownable: caller is not the owner")
            })

            it('owner can withdraw and event', async () => {
                let tx = Number(await docToken.balanceOf(escrow.address))
                let tx2 = await escrow.connect(escrowOwner).withdraw(tx)
                let tx3 = Number(await docToken.balanceOf(escrowOwner.address))
                expect(tx3).to.be.equal(tx)

                await expect(tx2).to.emit(escrow, 'Withdrawinfo').withArgs(
                    escrowOwner.address, 
                    tx
                )
            })
        })
    })
})