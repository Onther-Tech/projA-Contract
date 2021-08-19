const { ethers } = require('hardhat')

async function main() {
    const [deployer] = await ethers.getSigners()
    
    console.log("Deploying contract with the account :", deployer.address)

    const tokenDOC = await ethers.getContractFactory('DOC')
    const token = await tokenDOC.deploy(100000)
    console.log("DOC Address: ", token.address)
    await token.deployed()

    const market = await ethers.getContractFactory('market')
    const marketDOC = await market.deploy()
    await marketDOC.connect(deployer).settingERC20(token.address)
    console.log("finish")

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });