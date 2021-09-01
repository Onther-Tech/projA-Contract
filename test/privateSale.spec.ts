
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
    const baiscTonBalance = 1200;

    const oneday = 86400

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

    //doc가격 10원, ton가격 10000원 1000배차이 -> ton 1 = doc 1000
    before(async () => {
        [ tokenOwner, erc20Owner, escrowOwner, account1, account2, account3 ] = await ethers.getSigners();
        token = await ethers.getContractFactory("DOC");
        // console.log(tokenFactory)
        prov = ethers.getDefaultProvider();

        docToken = await token.deploy("DocToken", "DOC", tokenSupply, tokenOwner.address);

        erc20token = await ethers.getContractFactory("ERC20Mock");
        tonToken = await erc20token.connect(erc20Owner).deploy("testTON", "TON");

        deployEscrow = await ethers.getContractFactory("tokenEscrow");
        escrow = await deployEscrow.connect(escrowOwner).deploy(docToken.address, tonToken.address, 1000)

        await docToken.transfer(escrow.address, privateSaleAmount);
        await tonToken.connect(erc20Owner).transfer(account1.address, baiscTonBalance)
        await tonToken.connect(erc20Owner).transfer(account2.address, baiscTonBalance)
        await tonToken.connect(erc20Owner).transfer(account3.address, baiscTonBalance)

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
                // let tx8 = await tonToken.balanceOf(erc20Owner.address)
                // console.log(tx8.toString())
                expect(tx.toString()).to.be.equal('1200')
                expect(tx2.toString()).to.be.equal('1200')
                expect(tx3.toString()).to.be.equal('1200')
                expect(tx4.toString()).to.be.equal('0')
                expect(tx5.toString()).to.be.equal('0')
                expect(tx6.toString()).to.be.equal('0')
                expect(tx7.toString()).to.be.equal('100000000')
            })
            it('time test', async () => {
                // let blockTime = await ethers.provider.getBlock()
                // console.log(blockTime)
                let currentTime = Number(await time.latest());
                console.log(currentTime)
                let startTime = await escrow.startTimeCalcul(currentTime)
                console.log(Number(startTime.toString()));
                let timeCheck = Number(startTime.toString())-currentTime
                let diffTime = oneday * 180
                expect(diffTime).to.be.equal(timeCheck)

                let endTime = await escrow.endTimeCalcul(Number(startTime.toString()))
                let timeCheck2 = Number(endTime.toString()) - Number(startTime.toString())
                let diffTime2 = oneday * 360
                expect(diffTime2).to.be.equal(timeCheck2)

                // await time.increase(time.duration.days(180));

                // let blockTime2 = await ethers.provider.getBlock()
                // console.log(blockTime2)

            })
            it('buy test', async () => {
                await tonToken.connect(account1).approve(escrow.address, 1200)

                let tx = await tonToken.balanceOf(account1.address)
                let tx2 = await tonToken.balanceOf(escrowOwner.address)

                await escrow.connect(account1).buy(1200)

                let tx3 = await tonToken.balanceOf(account1.address)
                let tx4 = await tonToken.balanceOf(escrowOwner.address)

                expect(tx.toString()).to.be.equal('1200')
                expect(tx2.toString()).to.be.equal('0')
                expect(tx3.toString()).to.be.equal('0')
                expect(tx4.toString()).to.be.equal('1200')
            })
        })
        
    })
})