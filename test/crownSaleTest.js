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

    const tokenSupply = new BN('1e22');
    // const value = new BN('1e18');

    const balance = new BN(10000);
    const rate = new BN(1);

    const expectedTokenAmount = rate.mul(balance);

    const data = '0x42';

    let docTokenAddress;
    let erc20TokenAddress;
    let crowdSaleContract;


    before(async () => {
        [ tokenOwner, anoTokenOwner, crownOwner, account1, account2, account3 ] = await ethers.getSigners();
        
        this.Doctoken = await autoToken.new(name, symbol, balance, tokenOwner.address);
        docTokenAddress = this.Doctoken.address

        this.erc20Token = await ERC20Token.new(name2, symbol2);
        erc20TokenAddress = this.erc20Token.address

        this.notAcceptedErc1363Token = await ERC1363.new(name3, symbol3, anoTokenOwner.address, balance);

        this.crowdsale = await Crowdsale.new(rate, crownOwner.address, this.erc20Token.address, this.Doctoken.address);
        crowdSaleContract = this.crowdsale;

        await this.erc20Token.transfer(crowdSaleContract.address, tokenSupply)
    })

    describe("unspecified test", () => {
        it('requires a non-null ERC20 token', async () => {
            await expectRevert.unspecified(
                Crowdsale.new(rate, crownOwner.address, ZERO_ADDRESS, docTokenAddress),
            );
        });

        it('requires a non-zero rate', async () => {
            await expectRevert.unspecified(
                Crowdsale.new(0, crownOwner.address, erc20TokenAddress, docTokenAddress),
            );
        });

        it('requires a non-null wallet', async () => {
            await expectRevert.unspecified(
                Crowdsale.new(rate, ZERO_ADDRESS, erc20TokenAddress, docTokenAddress),
            );
          });
        
        it('requires a non-null ERC1363 token', async () => {
            await expectRevert(
                Crowdsale.new(rate, crownOwner.address, docTokenAddress, ZERO_ADDRESS),
                'ERC1363Payable: acceptedToken is zero address',
            );
        });
    })

    describe("payableCrownSale test", () => {
        describe("basic test", () => {
            it('has rate', async () => {
                let tx = await this.crowdsale.rate();
                expect(tx.words[0]).to.be.equal(rate.words[0])
            });
          
            it('has wallet', async () => {
                let tx = await this.crowdsale.wallet()
                expect(tx).to.be.equal(crownOwner.address)
            });
          
            it('has token', async () => {
                let tx = await this.crowdsale.token()
                expect(tx).to.be.equal(erc20TokenAddress)
            });
        })

        describe("balance check", () => {
            it("erc1363 check", async () => {
                let tx = await this.Doctoken.balanceOf(tokenOwner.address)
                let tx2 = await this.Doctoken.balanceOf(crowdSaleContract.address)
                console.log("erc1363(tokenOwner) :", tx.words[0])
                console.log("erc1363(crowdSaleContract) :", tx2.words[0])
            })
            it("erc20 check", async () => {
                let tx = await this.erc20Token.balanceOf(tokenOwner.address)
                let tx2 = await this.erc20Token.balanceOf(crowdSaleContract.address)
                console.log("erc20(tokenOwner) :", tx.words[0])
                console.log("erc20(crowdSaleContract) :", tx2.words[0])
            })
        })

        describe("approveAndCall test", () => {
            const approveAndCallWithData = function (spender, value, opts) {
                return this.Doctoken.methods['approveAndCall(address,uint256,bytes)'](spender, value, data, opts);
            };

            describe("without data", () => {
                it("approveAndCall test", async () => {
                    await this.Doctoken.approveAndCall(crowdSaleContract.address, 100, { from: tokenOwner.address })
                    let tx = await this.Doctoken.balanceOf(tokenOwner.address)
                    let tx2 = await this.Doctoken.balanceOf(crowdSaleContract.address)
                    console.log("erc1363(tokenOwner) :", tx.words[0])
                    console.log("erc1363(crowdSaleContract) :", tx2.words[0])
                    let tx3 = await this.erc20Token.balanceOf(tokenOwner.address)
                    let tx4 = await this.erc20Token.balanceOf(crowdSaleContract.address)
                    console.log("erc20(tokenOwner) :", tx3.words[0])
                    console.log("erc20(crowdSaleContract) :", tx4.words[0])
                })
            })
        })
    })
})
