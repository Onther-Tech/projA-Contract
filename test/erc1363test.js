const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { shouldSupportInterfaces } = require('./ERC1363test/introspection/SupportsInterface.behavior');

const { ethers, network } = require('hardhat')

const ERC1363Receiver = artifacts.require('ERC1363ReceiverMock');
const ERC1363Spender = artifacts.require('ERC1363SpenderMock');

const autoToken = artifacts.require('AutoTokens');

describe("erc1363 test", () =>{
    const name = "DocToken";
    const symbol = "DOC";

    const balance = new BN(10000);

    const value = new BN(100);
    const data = '0x42';
  
    const RECEIVER_MAGIC_VALUE = '0x88a7ca5c';
    const SPENDER_MAGIC_VALUE = '0x7b04a2d0';

    let spender;
    let spender2;
    let invaildspender;
    let invaildspender2;

    let receiver;
    let invaildreceiver;
    let invaildreceiver2;
    
    before(async () => {
        [ tokenOwner, account1, account2, account3 ] = await ethers.getSigners();
        
        this.token = await autoToken.new(name, symbol, balance, tokenOwner.address);

        const spenderContract = await ERC1363Spender.new(SPENDER_MAGIC_VALUE, false);
        spender = spenderContract.address;
        // console.log(spender)

        // const spenderContract2 = await ERC1363Spender.new(SPENDER_MAGIC_VALUE, false);
        // spender2 = spenderContract2.address;
        // console.log(spender2)

        const invaildSpenderContract = await ERC1363Spender.new(data, false);
        invaildspender = invaildSpenderContract.address

        const invaildSpenderContract2 = await ERC1363Spender.new(SPENDER_MAGIC_VALUE, true);
        invaildspender2 = invaildSpenderContract2.address

        const receiverContract = await ERC1363Receiver.new(RECEIVER_MAGIC_VALUE, false);
        receiver = receiverContract.address;

        const invaildReceiverContract = await ERC1363Receiver.new(data, false)
        invaildreceiver = invaildReceiverContract.address;
        
        const invaildReceiverContract2 = await await ERC1363Receiver.new(SPENDER_MAGIC_VALUE, true);
        invaildreceiver2 = invaildReceiverContract2.address;
    })
    
    describe("erc20 function test", () =>  {
        it("basic erc20", async () => {
            let tx = await this.token.symbol();
            let tx2 = await this.token.name();
            let tx3 = await this.token.balanceOf(tokenOwner.address);
            let tx4 = await this.token.balanceOf(account1.address);

            expect(tx).to.be.equal(symbol)
            expect(tx2).to.be.equal(name)
            expect(tx3.words[0]).to.be.equal(balance.words[0])
            expect(tx4.words[0]).to.be.equal(0)
        })
        it("transfer erc20", async () => {
            await this.token.transfer(account1.address, 2000, { from: tokenOwner.address })
            let tx = await this.token.balanceOf(tokenOwner.address);
            let tx2 = await this.token.balanceOf(account1.address);
            expect(tx.words[0]).to.be.equal((10000-2000))
            expect(tx2.words[0]).to.be.equal(2000)
        })
        it("approve and allownance erc20", async () => {
            await this.token.approve(account2.address, 1000, { from: account1.address })
            let tx = await this.token.allowance(account1.address, account2.address)
            expect(tx.words[0]).to.be.equal(1000)
        })
        it("transferFrom erc20", async () => {
            await this.token.transferFrom(account1.address, account2.address, 1000, {from: account2.address})
            let tx = await this.token.balanceOf(account1.address);
            let tx2 = await this.token.balanceOf(account2.address);
            expect(tx.words[0]).to.be.equal(1000)
            expect(tx2.words[0]).to.be.equal(1000)
        })
    })

    describe("approveAndCall test", () => {
        const approveAndCallWithData = function (spender, value, opts) {
            return this.token.methods['approveAndCall(address,uint256,bytes)'](spender, value, data, opts);
        };

        describe("without data", () => {
            it("approveAndCall", async () => {
                await this.token.approveAndCall(spender, 400, {from: account1.address})
    
                let tx = await this.token.allowance(account1.address, spender)
                expect(tx.words[0]).to.be.equal(400)
            })

            it('emits an approval event', async () => {
                const { logs } = await this.token.approveAndCall(spender, 400, {from: account1.address})
                // console.log(logs[0].args)
                let receipt = logs[0].args
                // console.log(receipt[2])
                expectEvent.inLogs(logs, 'Approval', {
                    owner: account1.address,
                    spender: spender,
                    value: receipt[2],
                });
            });

            it('approveSafely test', async () => {
                const receipt = await this.token.approveAndCall(spender, 400, {from: tokenOwner.address})
                // console.log(receipt.logs[0].args[2])

                await expectEvent.inTransaction(receipt.tx, ERC1363Spender, 'Approved', {
                    sender: tokenOwner.address,
                    amount: receipt.logs[0].args[2],
                    data: null,
                });
            })

            describe('revert test', () => {
                it('spender is not contract test', async () => {
                    let tx = this.token.approveAndCall(account2.address, 400, {from: account1.address})
                    await expect(tx).to.be.revertedWith('ERC1363: _checkAndCallApprove reverts')
                })
                it('bytescode wrong test', async () => {
                    let tx = this.token.approveAndCall(invaildspender, 400, {from: account1.address})
                    await expect(tx).to.be.revertedWith('ERC1363: _checkAndCallApprove reverts')
                })
                it('spender contract bool true test', async () => {
                    let tx = this.token.approveAndCall(invaildspender2, 400, {from: account1.address})
                    await expect(tx).to.be.revertedWith('ERC1363SpenderMock: throwing')
                })
            })
        })

        describe("with data", () => {
            it("approveAndCall", async () => {
                await approveAndCallWithData.call(this, spender, 500, { from: account1.address }); 

                let tx = await this.token.allowance(account1.address, spender)
                expect(tx.words[0]).to.be.equal(500)
            })

            it('emits an approval event', async () => {
                const { logs } = await approveAndCallWithData.call(this, spender, 500, { from: account1.address });

                expectEvent.inLogs(logs, 'Approval', {
                    owner: account1.address,
                    spender: spender,
                    value: logs[0].args[2],
                });
            });

            it('approveSafely test', async () => {
                const receipt = await approveAndCallWithData.call(this, spender, 500, { from: tokenOwner.address });
                // console.log(receipt.logs[0].args[2])

                await expectEvent.inTransaction(receipt.tx, ERC1363Spender, 'Approved', {
                    sender: tokenOwner.address,
                    amount: receipt.logs[0].args[2],
                    data: data,
                });
            })

            describe('revert test', () => {
                it('spender is not contract test', async () => {
                    let tx = this.token.methods['approveAndCall(address,uint256,bytes)'](account2.address, 400, data, {from: account1.address})
                    await expect(tx).to.be.revertedWith('ERC1363: _checkAndCallApprove reverts')
                })
                it('bytescode wrong test', async () => {
                    let tx = this.token.methods['approveAndCall(address,uint256,bytes)'](invaildspender, 400, data, {from: account1.address})
                    await expect(tx).to.be.revertedWith('ERC1363: _checkAndCallApprove reverts')
                })
                it('spender contract bool true test', async () => {
                    let tx = this.token.methods['approveAndCall(address,uint256,bytes)'](invaildspender2, 400, data, {from: account1.address})
                    await expect(tx).to.be.revertedWith('ERC1363SpenderMock: throwing')
                })
            })
        })
  
    })

    describe("transferAndCall test", () => {
        const transferAndCallWithData = function (to, value, opts) {
            return this.token.methods['transferAndCall(address,uint256,bytes)'](to, value, data, opts);
        };

        describe("without data", () => {
            it("balance Check", async () => {
                let tx = await this.token.balanceOf(tokenOwner.address)
                let tx2 = await this.token.balanceOf(account1.address)
                let tx3 = await this.token.balanceOf(account2.address)
                // console.log(tx)
                // console.log(tx2)
                // console.log(tx3)
                expect(tx.words[0]).to.be.equal(8000)
                expect(tx2.words[0]).to.be.equal(1000)
                expect(tx3.words[0]).to.be.equal(1000)
            })

            it("transferAndCall", async () => {
                await this.token.transferAndCall(receiver, 100, {from: account1.address})
                let tx = await this.token.balanceOf(account1.address)
                let tx2 = await this.token.balanceOf(receiver)

                expect(tx.words[0]).to.be.equal(900)
                expect(tx2.words[0]).to.be.equal(100)     
            })

            it('emits an Transfer event', async () => {
                const { logs } = await this.token.transferAndCall(receiver, 100, {from: account1.address})
                // console.log(logs[0].args)
                let receipt = logs[0].args
                // console.log(receipt[2])
                expectEvent.inLogs(logs, 'Transfer', {
                    from: account1.address,
                    to: receiver,
                    value: receipt[2],
                });
            });

            it('onTransferReceived test', async () => {
                const receipt = await this.token.transferAndCall(receiver, 100, {from: tokenOwner.address})
                // console.log(receipt.logs[0].args[2])

                await expectEvent.inTransaction(receipt.tx, ERC1363Receiver, 'Received', {
                    operator: tokenOwner.address,
                    sender: tokenOwner.address,
                    amount: receipt.logs[0].args[2],
                    data: null,
                });
            })

            describe('revert test', () => {
                it('spender is not contract test', async () => {
                    let tx = this.token.transferAndCall(account2.address, 100, {from: account1.address})
                    await expect(tx).to.be.revertedWith('ERC1363: _checkAndCallTransfer revert')
                })
                it('bytescode wrong test', async () => {
                    let tx = this.token.transferAndCall(invaildreceiver, 100, {from: account1.address})
                    await expect(tx).to.be.revertedWith('ERC1363: _checkAndCallTransfer revert')
                })
                it('spender contract bool true test', async () => {
                    let tx = this.token.transferAndCall(invaildreceiver2, 100, {from: account1.address})
                    await expect(tx).to.be.revertedWith('ERC1363ReceiverMock: throwing')
                }) 
            })
        })

        describe("with data", () => {
            it("balance Check", async () => {
                await this.token.transfer(account1.address, 200, {from: tokenOwner.address})
                let tx = await this.token.balanceOf(tokenOwner.address)
                let tx2 = await this.token.balanceOf(account1.address)
                let tx3 = await this.token.balanceOf(account2.address)
                let tx4 = await this.token.balanceOf(receiver)

                expect(tx.words[0]).to.be.equal(7700)
                expect(tx2.words[0]).to.be.equal(1000)
                expect(tx3.words[0]).to.be.equal(1000)
                expect(tx4.words[0]).to.be.equal(300)
            })

            it("transferAndCall", async () => {
                await transferAndCallWithData.call(this, receiver, 100, { from: account1.address }); 
                let tx = await this.token.balanceOf(account1.address)
                let tx2 = await this.token.balanceOf(receiver)

                expect(tx.words[0]).to.be.equal(900)
                expect(tx2.words[0]).to.be.equal(400)   
            })

            it('emits an transfer event', async () => {
                const { logs } = await transferAndCallWithData.call(this, receiver, 100, { from: account1.address });

                expectEvent.inLogs(logs, 'Transfer', {
                    from: account1.address,
                    to: receiver,
                    value: logs[0].args[2],
                });
            });

            it('onTransferReceived test', async () => {
                const receipt = await transferAndCallWithData.call(this, receiver, 100, { from: tokenOwner.address });
                // console.log(receipt.logs[0].args[2])

                await expectEvent.inTransaction(receipt.tx, ERC1363Receiver, 'Received', {
                    operator: tokenOwner.address,
                    sender: tokenOwner.address,
                    amount: receipt.logs[0].args[2],
                    data: data,
                });
            })

            describe('revert test', () => {
                it('spender is not contract test', async () => {
                    let tx = this.token.methods['transferAndCall(address,uint256,bytes)'](account2.address, 100, data, {from: account1.address})
                    await expect(tx).to.be.revertedWith('ERC1363: _checkAndCallTransfer reverts')
                })
                it('bytescode wrong test', async () => {
                    let tx = this.token.methods['transferAndCall(address,uint256,bytes)'](invaildreceiver, 100, data, {from: account1.address})
                    await expect(tx).to.be.revertedWith('ERC1363: _checkAndCallTransfer reverts')
                })
                it('spender contract bool true test', async () => {
                    let tx = this.token.methods['transferAndCall(address,uint256,bytes)'](invaildreceiver2, 100, data, {from: account1.address})
                    await expect(tx).to.be.revertedWith('ERC1363ReceiverMock: throwing')
                })
            })
        })
    })


})