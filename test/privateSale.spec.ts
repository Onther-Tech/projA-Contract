
import { BigNumber } from "@ethersproject/bignumber";
import { PathArraySupportOption } from "prettier";
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

    const oneday = 86400

    let acc1MonthReward = 100000;
    let acc2MonthReward = 108333;
    let acc3MonthReward = 91666;
    
    let acc1TotalReward = 1200000;
    let acc2TotalReward = 1300000;
    let acc3TotalReward = 1100000;

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

    let account1 : any
    let account2 : any
    let account3 : any
    let account4 : any

    let buyNowTime : any
    let buyStartTime : any

    //doc가격 10원, ton가격 10000원 1000배차이 -> ton 1 = doc 1000
    //TON 1200개 넣으면 1200000개 DOC 얻음 -> 한달에 100000 개씩
    before(async () => {
        [ tokenOwner, erc20Owner, escrowOwner, account1, account2, account3, account4 ] = await ethers.getSigners();
        token = await ethers.getContractFactory("DOC");
        // console.log(tokenFactory)
        prov = ethers.getDefaultProvider();

        docToken = await token.deploy("DocToken", "DOC", tokenSupply, tokenOwner.address);

        erc20token = await ethers.getContractFactory("ERC20Mock");
        tonToken = await erc20token.connect(erc20Owner).deploy("testTON", "TON");

        deployEscrow = await ethers.getContractFactory("tokenEscrow");
        escrow = await deployEscrow.connect(escrowOwner).deploy(docToken.address, tonToken.address, 1000)

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
                let tx = await tonToken.balanceOf(account1.address)
                let tx2 = await tonToken.balanceOf(account2.address)
                let tx3 = await tonToken.balanceOf(account3.address)
                let tx4 = await docToken.balanceOf(account1.address)
                let tx5 = await docToken.balanceOf(account2.address)
                let tx6 = await docToken.balanceOf(account3.address)
                let tx7 = await docToken.balanceOf(escrow.address)

                expect(tx.toString()).to.be.equal('1200')
                expect(tx2.toString()).to.be.equal('1300')
                expect(tx3.toString()).to.be.equal('1100')
                expect(tx4.toString()).to.be.equal('0')
                expect(tx5.toString()).to.be.equal('0')
                expect(tx6.toString()).to.be.equal('0')
                expect(tx7.toString()).to.be.equal('100000000')
            })

            it('time function test', async () => {
                let currentTime = Number(await time.latest());
                let startTime = Number(await escrow.startTimeCalcul(currentTime))
                let timeCheck = startTime-currentTime
                let diffTime = oneday * 180
                expect(diffTime).to.be.equal(timeCheck)

                let endTime = await escrow.endTimeCalcul(Number(startTime.toString()))
                let timeCheck2 = Number(endTime.toString()) - Number(startTime.toString())
                let diffTime2 = oneday * 360
                expect(diffTime2).to.be.equal(timeCheck2)
            })

            it('account1, account2, account3 buy', async () => {
                await tonToken.connect(account1).approve(escrow.address, baiscTonBalance1)
                await tonToken.connect(account2).approve(escrow.address, baiscTonBalance2)
                await tonToken.connect(account3).approve(escrow.address, baiscTonBalance3)

                let tx = await tonToken.balanceOf(account1.address)
                let tx2 = await tonToken.balanceOf(account2.address)
                let tx3 = await tonToken.balanceOf(account3.address)
                let tx4 = await tonToken.balanceOf(escrowOwner.address)

                buyNowTime = Number(await time.latest());
                buyStartTime = Number(await escrow.startTimeCalcul(buyNowTime))
                await escrow.connect(account1).buy(baiscTonBalance1)
                await escrow.connect(account2).buy(baiscTonBalance2)
                await escrow.connect(account3).buy(baiscTonBalance3)

                let tx5 = await tonToken.balanceOf(account1.address)
                let tx6 = await tonToken.balanceOf(account2.address)
                let tx7 = await tonToken.balanceOf(account3.address)
                let tx8 = await tonToken.balanceOf(escrowOwner.address)

                expect(tx.toString()).to.be.equal('1200')
                expect(tx2.toString()).to.be.equal('1300')
                expect(tx3.toString()).to.be.equal('1100')
                expect(tx4.toString()).to.be.equal('0')

                //after buy
                expect(tx5.toString()).to.be.equal('0')
                expect(tx6.toString()).to.be.equal('0')
                expect(tx7.toString()).to.be.equal('0')
                expect(tx8.toString()).to.be.equal('3600')
            })

        })
        describe("claim test", () => {
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

            it("dont buy dont claim ", async () => {
                let tx = escrow.connect(account4).claim();
                await expect(tx).to.be.revertedWith("need to buy the token")
            })

            it('claim before 6 months of buy', async () => {
                let tx = escrow.connect(account1).claim();
                await expect(tx).to.be.revertedWith("need the time for claim")
                
                let tx2 = escrow.connect(account2).claim();
                await expect(tx2).to.be.revertedWith("need the time for claim")

                let tx3 = escrow.connect(account3).claim();
                await expect(tx3).to.be.revertedWith("need the time for claim")
            })

            it('claim After 6 months of buy', async () => {
                await time.increase(time.duration.days(181));
                await escrow.connect(account1).claim();
                await escrow.connect(account2).claim();
                
                let tx = Number(await docToken.balanceOf(account1.address))
                expect(tx).to.be.equal(acc1MonthReward)

                let tx2 = Number(await docToken.balanceOf(account2.address))
                expect(tx2).to.be.equal(acc2MonthReward)
            })

            it('claim After 7 months of buy', async () => {
                await time.increase(time.duration.days(30));
                await escrow.connect(account1).claim();
                await escrow.connect(account3).claim();
                let period = 2
                let acc1Reward = acc1MonthReward * period
                let acc3Reward = acc3MonthReward * period
                
                let tx = Number(await docToken.balanceOf(account1.address))
                expect(tx).to.be.equal(acc1Reward)

                let tx2 = Number(await docToken.balanceOf(account3.address))
                expect(tx2).to.be.equal(acc3Reward)
            })

            it('claim After 8 months of buy', async () => {
                await time.increase(time.duration.days(30));
                await escrow.connect(account1).claim();
                await escrow.connect(account2).claim();
                let period = 3
                let acc1Reward = acc1MonthReward * period
                let acc2Reward = acc2MonthReward * period

                let tx = Number(await docToken.balanceOf(account1.address))
                expect(tx).to.be.equal(acc1Reward)
                let tx2 = Number(await docToken.balanceOf(account2.address))
                expect(tx2).to.be.equal(acc2Reward)
            })

            it('claim After 9 months of buy', async () => {
                await time.increase(time.duration.days(30));
                await escrow.connect(account1).claim();
                let period = 4
                let acc1Reward = acc1MonthReward * period
                
                let tx = Number(await docToken.balanceOf(account1.address))
                expect(tx).to.be.equal(acc1Reward)
            })

            it('claim After 10 months of buy', async () => {
                await time.increase(time.duration.days(30));
                await escrow.connect(account1).claim();
                let period = 5
                let acc1Reward = acc1MonthReward * period
                
                let tx = Number(await docToken.balanceOf(account1.address))
                expect(tx).to.be.equal(acc1Reward)
            })

            it('claim After 11 months of buy', async () => {
                await time.increase(time.duration.days(30));
                await escrow.connect(account1).claim();
                await escrow.connect(account2).claim();
                await escrow.connect(account3).claim();
                
                let period = 6
                let acc1Reward = acc1MonthReward * period
                let acc2Reward = acc2MonthReward * period
                let acc3Reward = acc3MonthReward * period
                
                let tx = Number(await docToken.balanceOf(account1.address))
                expect(tx).to.be.equal(acc1Reward)
                let tx2 = Number(await docToken.balanceOf(account2.address))
                expect(tx2).to.be.equal(acc2Reward)
                let tx3 = Number(await docToken.balanceOf(account3.address))
                expect(tx3).to.be.equal(acc3Reward)
            })

            it('claim After 12 months of buy', async () => {
                await time.increase(time.duration.days(30));
                await escrow.connect(account1).claim();
                let period = 7
                let acc1Reward = acc1MonthReward * period
                
                let tx = Number(await docToken.balanceOf(account1.address))
                expect(tx).to.be.equal(acc1Reward)
            })

            it('claim After 13 months of buy', async () => {
                await time.increase(time.duration.days(30));
                await escrow.connect(account1).claim();
                let period = 8
                let acc1Reward = acc1MonthReward * period
                
                let tx = Number(await docToken.balanceOf(account1.address))
                expect(tx).to.be.equal(acc1Reward)
            })

            it('claim After 14 months of buy', async () => {
                await time.increase(time.duration.days(30));
                await escrow.connect(account1).claim();
                let period = 9
                let acc1Reward = acc1MonthReward * period
                
                let tx = Number(await docToken.balanceOf(account1.address))
                expect(tx).to.be.equal(acc1Reward)
            })

            it('claim After 15 months of buy', async () => {
                await time.increase(time.duration.days(30));
                await escrow.connect(account1).claim();
                await escrow.connect(account2).claim();

                let period = 10
                let acc1Reward = acc1MonthReward * period
                let acc2Reward = acc2MonthReward * period
                
                let tx = Number(await docToken.balanceOf(account1.address))
                expect(tx).to.be.equal(acc1Reward)
                let tx2 = Number(await docToken.balanceOf(account2.address))
                expect(tx2).to.be.equal(acc2Reward)
            })

            it('claim After 16 months of buy', async () => {
                await time.increase(time.duration.days(30));
                await escrow.connect(account1).claim();
                await escrow.connect(account3).claim();

                let period = 11
                let acc1Reward = acc1MonthReward * period
                let acc3Reward = acc3MonthReward * period
                
                let tx = Number(await docToken.balanceOf(account1.address))
                expect(tx).to.be.equal(acc1Reward)
                let tx2 = Number(await docToken.balanceOf(account3.address))
                expect(tx2).to.be.equal(acc3Reward)
            })

            it('claim After 17 months of buy', async () => {
                await time.increase(time.duration.days(30));
                await escrow.connect(account1).claim();
                
                let tx = Number(await docToken.balanceOf(account1.address))
                expect(tx).to.be.equal(acc1TotalReward)
            })

            it('claim After 18 months of buy', async () => {
                await time.increase(time.duration.days(30));
                let tx = escrow.connect(account1).claim();                
                await expect(tx).to.be.revertedWith("already getAllreward")

                await escrow.connect(account2).claim();                
                let tx2 = Number(await docToken.balanceOf(account2.address))
                expect(tx2).to.be.equal(acc2TotalReward)
            })

            it('claim After 19 months of buy', async () => {
                await time.increase(time.duration.days(30));
                let tx = escrow.connect(account2).claim();                
                await expect(tx).to.be.revertedWith("already getAllreward")

                await escrow.connect(account3).claim();                
                let tx2 = Number(await docToken.balanceOf(account3.address))
                expect(tx2).to.be.equal(acc3TotalReward)
            })

            it('claim After 20 months of buy', async () => {
                await time.increase(time.duration.days(30));
                let tx = escrow.connect(account3).claim();                
                await expect(tx).to.be.revertedWith("already getAllreward")
            })
        })
    })
})