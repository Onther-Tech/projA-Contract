const { ethers } = require('hardhat')
const { BigNumber } = require("ethers")


async function main() {
    const [deployer] = await ethers.getSigners()
    
    console.log("Deploying contract with the account :", deployer.address)
    
    //DOC deploy
    const BASE_TEN = 10
    const decimals = 18
    const name = "Dooropen"
    const symbol = "DOC"
    let supplyAmount = 500000000
    const initialSupply = BigNumber.from(supplyAmount).mul(BigNumber.from(BASE_TEN).pow(decimals))
    let ownerAddress = "0x6E1c4a442E9B9ddA59382ee78058650F1723E0F6"

    const tokenDOC = await ethers.getContractFactory('DOC')
    const token = await tokenDOC.deploy(name, symbol, initialSupply, ownerAddress)
    console.log("DOC Address: ", token.address)
    let docAddress = token.address;
    await token.deployed()

    //tokenEscrow deploy
    let tonAddress = "0x44d4F5d89E9296337b8c48a332B3b2fb2C190CD0"

    const tokenEscrow = await ethers.getContractFactory('tokenEscrowMock')
    const escrow = await tokenEscrow.deploy(docAddress, tonAddress)
    await escrow.deployed()
    
    await escrow.connect(deployer).transferOwnership(ownerAddress)
    console.log("escrow Address : ", escrow.address)
    console.log("finish")

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });