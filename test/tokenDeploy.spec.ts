
import { BigNumber } from "@ethersproject/bignumber";
const { time, BN } = require("@openzeppelin/test-helpers");

const { AddressZero, MaxUint256 } = require("@ethersproject/constants");
const { ethers, network } = require('hardhat')
const chai = require('chai')
const { solidity } = require('ethereum-waffle')
const { expect } = chai

chai.use(solidity)

describe("token deploy", () => {
    const tokenSupply = 100000

    let factoryOwner: any
    let tokenOwner: any
    let mockTokenOwner: any

    let factory: any
    let tokenFactory: any
    let ERC20Factory: any
    let tokenContractAddress: any
    let prov: any
    let docToken: any
    let mockToken: any

    let account1 : any
    let account2 : any
    let account3 : any

    let mnemonic = "announce room limb pattern dry unit scale effort smooth jazz weasel alcohol"
    let walletMnemonic : any
    let walletPrivateKey : any

    before(async () => {
        [ factoryOwner, tokenOwner, mockTokenOwner, account1, account2, account3 ] = await ethers.getSigners();
        tokenFactory = await ethers.getContractFactory("ERC20TokenFactory");
        // console.log(tokenFactory)
        prov = ethers.getDefaultProvider();

        factory = await tokenFactory.deploy(factoryOwner.address);

        ERC20Factory = await ethers.getContractFactory("ERC20Mock");

        mockToken = await ERC20Factory.connect(mockTokenOwner).deploy("MOCK", "MOC");

        let erc20balance = await mockToken.balanceOf(mockTokenOwner.address)
        console.log(erc20balance.toString())

        // walletMnemonic = ethers.Wallet.fromMnemonic(mnemonic)

        // walletPrivateKey = new ethers.Wallet(walletMnemonic.privateKey)

        // if( walletMnemonic.address === walletPrivateKey.address ) {
        //     console.log("okay")
        //     console.log(walletMnemonic.address)
        //     console.log(walletMnemonic.privateKey)
        // }

    })

    describe('tokenFactory test', () => {
        describe('token create test', () => {
            it("creatToken not factoryOwner", async () => {
                let tx = factory.connect(tokenOwner).create("DocToken", "DOC", tokenSupply, tokenOwner.address)
    
                await expect(tx).to.be.revertedWith("your not tokenFactoryOwner")
            })
    
            it("creatToken is factoryOwner", async () => {
                let tx = await factory.connect(factoryOwner).create("DocToken", "DOC", tokenSupply, tokenOwner.address)
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
                    expect(tx).to.be.equal(tokenSupply)
                })
                it("token balanceOf check", async () => {
                    let tx = await docToken.balanceOf(tokenOwner.address);
                    expect(tx).to.be.equal(100000)
                })
            })

            describe("token Role test", () => {
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
    
                describe("token minter and burner test", () => {
                    it("token addMinter check", async () => {
                        let tx = await docToken.connect(tokenOwner).isMinter(account1.address);
                        expect(tx).to.be.equal(false)
    
                        await docToken.connect(tokenOwner).addMinter(account1.address);
    
                        let tx2 = await docToken.connect(tokenOwner).isMinter(account1.address);
                        expect(tx2).to.be.equal(true)
                    })
                    it("token addBurner check", async () => {
                        let tx = await docToken.connect(tokenOwner).isBurner(account2.address);
                        expect(tx).to.be.equal(false)
    
                        await docToken.connect(tokenOwner).addBurner(account2.address);
    
                        let tx2 = await docToken.connect(tokenOwner).isBurner(account2.address);
                        expect(tx2).to.be.equal(true)
                    })
                    it("token removeMinter check", async () => {
                        let tx = await docToken.isMinter(account1.address);
                        expect(tx).to.be.equal(true)
    
                        await docToken.connect(tokenOwner).removeMinter(account1.address);
    
                        let tx2 = await docToken.isMinter(account1.address);
                        expect(tx2).to.be.equal(false)
                    })
                    it("token removeBurner check", async () => {
                        let tx = await docToken.isBurner(account2.address);
                        expect(tx).to.be.equal(true)
    
                        await docToken.connect(tokenOwner).removeBurner(account2.address);
    
                        let tx2 = await docToken.isBurner(account2.address);
                        expect(tx2).to.be.equal(false)
                    })
                })

                describe("token mint and burn test", () => {
                    it("token mint check", async () => {
                        await docToken.connect(tokenOwner).addMinter(account1.address);
                        let tx = await docToken.connect(tokenOwner).isMinter(account1.address);
                        expect(tx).to.be.equal(true)
                        let tx2 = await docToken.connect(tokenOwner).balanceOf(account1.address);
                        expect(tx2).to.be.equal(0)
                        await docToken.connect(account1).mint(account1.address, 1000)
                        let tx3 = await docToken.connect(tokenOwner).balanceOf(account1.address);
                        expect(tx3).to.be.equal(1000)
                    })

                    it("token burn check", async () => {
                        await docToken.connect(tokenOwner).addBurner(account2.address);
                        let tx = await docToken.connect(tokenOwner).isBurner(account2.address);
                        expect(tx).to.be.equal(true)
                        let tx2 = await docToken.connect(tokenOwner).balanceOf(account1.address);
                        expect(tx2).to.be.equal(1000)
                        await docToken.connect(account2).burn(account1.address, 1000)
                        let tx3 = await docToken.connect(tokenOwner).balanceOf(account1.address);
                        expect(tx3).to.be.equal(0)
                    })
                })
            })

            describe("token function test", () => {
                describe("token permit test", () => {
                    it("permit check", async () => {
                        let amount = 100
    
                        const nonce = parseInt(await docToken.nonces(tokenOwner.address))
                        const deadline = MaxUint256
                        const rawSignature = await tokenOwner._signTypedData(
                            {
                                chainId: parseInt(await network.provider.send("eth_chainId")),
                                name: "DocToken",
                                version: "DOC",
                                verifyingContract: docToken.address,
                            },
                            {
                                Permit: [
                                  { name: "owner", type: "address" },
                                  { name: "spender", type: "address" },
                                  { name: "value", type: "uint256" },
                                  { name: "nonce", type: "uint256" },
                                  { name: "deadline", type: "uint256" },
                                ],
                            },
                            {
                                owner: tokenOwner.address,
                                spender: account1.address,
                                value: amount,
                                nonce,
                                deadline,
                            }
                        );
                        const signature = ethers.utils.splitSignature(rawSignature);
                        
                        await docToken.connect(tokenOwner).permit(
                            tokenOwner.address,
                            account1.address,
                            amount,
                            deadline,
                            signature.v,
                            signature.r,
                            signature.s
                        );
                        
                        let tx = await docToken.allowance(tokenOwner.address, account1.address)
    
                        expect(tx).to.be.equal(100)
                    })
    
                    it("transferFrom check after permit", async () => {
                        let amount = 100
                        let tx = await docToken.balanceOf(account1.address)
                        expect(tx).to.be.equal(0)
    
                        await docToken.connect(account1).transferFrom(tokenOwner.address, account1.address,amount)
                        let tx2 = await docToken.balanceOf(account1.address)
                        expect(tx2).to.be.equal(amount)
                    })
                })

                describe("transfer test", () => {
                    it("transfer if user have amount", async () => {
                        let tx = await docToken.balanceOf(account1.address)
                        expect(tx).to.be.equal(100)
                        let tx2 = await docToken.balanceOf(account2.address)
                        expect(tx2).to.be.equal(0)
    
                        await docToken.connect(account1).transfer(account2.address, 100)
    
                        let tx3 = await docToken.balanceOf(account1.address)
                        expect(tx3).to.be.equal(0)
    
                        let tx4 = await docToken.balanceOf(account2.address)
                        expect(tx4).to.be.equal(100)
                    })
                    it("transfer if user have no amount", async () => {
                        let tx = await docToken.balanceOf(account1.address)
                        expect(tx).to.be.equal(0)
                        let tx2 = await docToken.balanceOf(account2.address)
                        expect(tx2).to.be.equal(100)
    
                        let tx3 = docToken.connect(account1).transfer(account2.address, 100)
                        await expect(tx3).to.be.revertedWith("ERC20: transfer amount exceeds balance")
                    })
                })

                describe("token approve and transferFrom test", () => {
                    it("transferFrom before approve", async () => {
                        let tx = docToken.connect(account1).transferFrom(account2.address, account1.address, 100)
                        await expect(tx).to.be.revertedWith("ERC20: transfer amount exceeds allowance") 
                    })
                    it("approve and allowance", async () => {
                        await docToken.connect(account2).approve(account1.address, 100)
                        let tx = await docToken.connect(account1).allowance(account2.address, account1.address)
                        expect(tx).to.be.equal(100)
                    })
                    it("transferFrom after approve", async () => {
                        let tx = await docToken.balanceOf(account1.address)
                        expect(tx).to.be.equal(0)
                        let tx2 = await docToken.balanceOf(account2.address)
                        expect(tx2).to.be.equal(100)
    
                        await docToken.connect(account1).transferFrom(account2.address, account1.address, 100)
    
                        let tx3 = await docToken.balanceOf(account1.address)
                        expect(tx3).to.be.equal(100)
    
                        let tx4 = await docToken.balanceOf(account2.address)
                        expect(tx4).to.be.equal(0)
                    })
                })

            })
            
        })
        
    })
})