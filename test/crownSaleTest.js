const { BN, constants, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const { ethers, network } = require('hardhat')

const autoToken = artifacts.require('AutoTokens');
const ERC20Token = artifacts.require('ERC20Mock');
const ERC1363 = artifacts.require('ERC1363Mock');

const Crowdsale = artifacts.require('ERC1363PayableCrowdsale');


describe("crownSale test", () =>{
    const name = "DocToken";
    const symbol = "DOC";

    const name2 = "ERC20Token";
    const symbol2 = "ERC20";

    const name3 = "anoToken";
    const symbol3 = "ANO";

    const balance = new BN(10000);
    const rate = new BN(1);

    const expectedTokenAmount = rate.mul(balance);

    const data = '0x42';

    let docTokenAddress;


    before(async () => {
        [ tokenOwner, anoTokenOwner, crownOwner, account1, account2, account3 ] = await ethers.getSigners();
        
        this.Doctoken = await autoToken.new(name, symbol, balance, tokenOwner.address);
        docTokenAddress = this.Doctoken.address
        this.erc20Token = await ERC20Token.new(name2, symbol2);
        this.notAcceptedErc1363Token = await ERC1363.new(name3, symbol3, anoTokenOwner.address, balance);
    })

    describe("unspecified test", () => {
        it('requires a non-null ERC20 token', async function () {
            await expectRevert.unspecified(
                Crowdsale.new(rate, crownOwner.address, ZERO_ADDRESS, docTokenAddress),
            );
        });
    })
})
