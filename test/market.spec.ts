
import { BigNumber } from "@ethersproject/bignumber";

const { AddressZero } = require("@ethersproject/constants");
const { ethers, network } = require('hardhat')
const chai = require('chai')
const { solidity } = require('ethereum-waffle')
const { expect } = chai

chai.use(solidity)

describe("token deploy", () => {
    const tokenSupply = 100000

    let docOwner: any
    let marketOwner: any

    let doc: any
    let market: any
    let prov: any

    let account1 : any
    let account2 : any
    let account3 : any

    before(async () => {
        [ docOwner, marketOwner, account1, account2, account3 ] = await ethers.getSigners();
        const docFactory = await ethers.getContractFactory("DocToken");
        console.log(docFactory)
        prov = ethers.getDefaultProvider();

        doc = await docFactory.deploy(
            tokenSupply
        );

        const marketFactory = await ethers.getContractFactory("market");
        
        market = await marketFactory.deploy();

    })

    describe('createNFT test', () => {
        it("createNFT", async () => {
            let abc = await market.connect(account1).createNFT(account1.address, "tier1")
            let bc = await market.connect(account2).createNFT(account2.address, "tier2")

            let abc2 = await market.connect(account1).ownerOf(1);
            let abc3 = await market.connect(account1).tokenURI(1);
            let abc4 = await market.connect(account1).balanceOf(account1.address);
            let bc3 = await market.connect(account2).tokenURI(2);

            console.log(abc2)
            expect(abc2).to.equal(account1.address)
            console.log(abc3)
            console.log(bc3)

            console.log(abc4.toString())
        })

        it("transferFrom NFT can owner", async () => {
            await market.connect(account1).transferFrom(account1.address, account2.address, 1)
            let abc2 = await market.connect(account1).ownerOf(1);

            expect(abc2).to.equal(account2.address)
        })

        //transferFrom을 토큰을 가지고 있는사람이 하면 okay 그러나 다른사람이 하면 이제 approve가 필요함

        it("transferFrom NFT before approve", async () => {
            let tx = market.connect(account1).transferFrom(account2.address, account1.address, 1)

            await expect(tx).to.be.revertedWith("ERC721: transfer caller is not owner nor approved")
        })

        it("transferFrom NFT after approve", async () => {
            await market.connect(account2).approve(account1.address, 1)
            let tx = await market.connect(account1).getApproved(1)
            await market.connect(account1).transferFrom(account2.address, account1.address, 1)
            let tx2 = await market.connect(account1).ownerOf(1);

            expect(tx).to.equal(tx2)
            expect(tx2).to.equal(account1.address)

        })
    })
})