
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
    let token: any
    let prov: any

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

    describe('create token test', () => {
        it("creatToken not factoryOwner", async () => {
            let tx = factory.connect(tokenOwner).create("DocToken", "DOC", 100000, tokenOwner.address)

            await expect(tx).to.be.revertedWith("your not tokenFactoryOwner")
        })

        it("creatToken is factoryOwner", async () => {
            let tx = await factory.connect(factoryOwner).create("DocToken", "DOC", 100000, tokenOwner.address)
            await tx.wait();

            console.log(tx)

        })
    })
})