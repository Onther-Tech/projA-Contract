
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
    const tokenSupply = 500000000 * (10**18);
    const privateSaleAmount = 100000000 * (10**18);

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


    before(async () => {
        [ tokenOwner, erc20Owner, escrowOwner, account1, account2, account3 ] = await ethers.getSigners();
        token = await ethers.getContractFactory("DOC");
        // console.log(tokenFactory)
        prov = ethers.getDefaultProvider();

        docToken = await token.deploy("DocToken", "DOC", tokenSupply, tokenOwner.address);

        erc20token = await ethers.getContractFactory("ERC20Mock");
        tonToken = await erc20token.connect(erc20Owner).deploy("testTON", "TON");

        deployEscrow = await ethers.getContractFactory("tokenEscrow");
        escrow = await deployEscrow.connect(escrowOwner).deploy()
    })

    describe('privateSale test', () => {
        
        
    })
})