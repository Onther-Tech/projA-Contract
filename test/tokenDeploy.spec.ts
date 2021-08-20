
import { BigNumber } from "@ethersproject/bignumber";

const { AddressZero } = require("@ethersproject/constants");
const { ethers, network } = require('hardhat')
const chai = require('chai')
const { solidity } = require('ethereum-waffle')
const { expect } = chai

chai.use(solidity)

describe("token deploy", () => {
    const tokenSupply = 100000

    let factoryOwner: any
    let tokenOwner: any

    let factory: any
    let tokenFactory: any
    let tokenContractAddress: any
    let prov: any
    let docToken: any

    let account1 : any
    let account2 : any
    let account3 : any

    before(async () => {
        [ factoryOwner, tokenOwner, account1, account2, account3 ] = await ethers.getSigners();
        tokenFactory = await ethers.getContractFactory("ERC20TokenFactory");
        // console.log(tokenFactory)
        prov = ethers.getDefaultProvider();

        factory = await tokenFactory.deploy(factoryOwner.address);
    })

    describe('tokenFactory test', () => {
        describe('token create test', () => {
            it("creatToken not factoryOwner", async () => {
                let tx = factory.connect(tokenOwner).create("DocToken", "DOC", 100000, tokenOwner.address)
    
                await expect(tx).to.be.revertedWith("your not tokenFactoryOwner")
            })
    
            it("creatToken is factoryOwner", async () => {
                let tx = await factory.connect(factoryOwner).create("DocToken", "DOC", 100000, tokenOwner.address)
                const receipt = await tx.wait();
    
                for (let i = 0; i < receipt.events.length; i++) {
                    // console.log('receipt.events[i].event',i, receipt.events[i].event);
                    if (
                        receipt.events[i].event == "Created" &&
                        receipt.events[i].args != null
                    ) {
                        tokenContractAddress = receipt.events[i].args.token;
                        // console.log(receipt.events[i].args)
                        // console.log("tokenContractAddress :", tokenContractAddress)
                    }
                }
    
                const codeAfter = await tokenOwner.provider.getCode(tokenContractAddress);
                expect(codeAfter).to.not.eq("0x");
    
                docToken = await ethers.getContractAt("AutoTokens",tokenContractAddress);
            })
        })

        describe('DocToken test', () => {
            describe('basic token test', () => {
                it("token name check", async () => {
                    let tx = await docToken.name();
                    expect(tx).to.be.equal("DocToken")
                })
                it("token symbol check", async () => {
                    let tx = await docToken.symbol();
                    expect(tx).to.be.equal("DOC")
                })
                it("token decimals check", async () => {
                    let tx = await docToken.decimals();
                    expect(tx).to.be.equal(18)
                })
                it("token totalSupply check", async () => {
                    let tx = await docToken.totalSupply();
                    expect(tx).to.be.equal(100000)
                })
            })

            describe("token admin test", () => {
                it("token isAdmin check", async () => {
                    let tx = await docToken.isAdmin(tokenOwner.address);                    
                    expect(tx).to.be.equal(true)

                    let tx2 = await docToken.isAdmin(account1.address);
                    expect(tx2).to.be.equal(false)
                })
                it("token addAdmin check", async () => {
                    await docToken.connect(tokenOwner).addAdmin(account1.address);
                    let tx = await docToken.isAdmin(account1.address);
                    expect(tx).to.be.equal(true)
                })
                it("token transferAdmin check", async () => {
                    await docToken.connect(account1).transferAdmin(account2.address);
                    let tx = await docToken.isAdmin(account1.address);
                    expect(tx).to.be.equal(false)

                    let tx2 = await docToken.isAdmin(account2.address);
                    expect(tx2).to.be.equal(true)
                })
                it("token removeAdmin check", async () => {
                    await docToken.connect(account2).removeAdmin(account2.address);
                    let tx2 = await docToken.isAdmin(account2.address);
                    expect(tx2).to.be.equal(false)
                })
            })
        })
    })
})