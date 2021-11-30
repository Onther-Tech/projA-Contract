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
    //DOC 토큰과 escrow 관리 계정
    let ownerAddress = "0xc575848f69C710dA33A978384114010bdb15f4db" //mainnet
    // let ownerAddress = "0x6E1c4a442E9B9ddA59382ee78058650F1723E0F6" //rinkeby

    const tokenDOC = await ethers.getContractFactory('DOC')
    const token = await tokenDOC.deploy(name, symbol, initialSupply, ownerAddress)
    console.log("DOC Address: ", token.address)
    let docAddress = token.address;  //mainnet
    await token.deployed()

    //tokenEscrow deploy
    // let tonAddress = "0x44d4F5d89E9296337b8c48a332B3b2fb2C190CD0" //rinkeby
    let tonAddress = "0x2be5e8c109e2197D077D13A82dAead6a9b3433C5" //mainnet
    // let docAddress2 = "0xb109f4c20bdb494a63e32aa035257fba0a4610a4" //rinkeby
    
    //세일로 받은 TON을 관리할 주소
    let getTonOwner = "0x642C239C9BEF6574FE3dc64B82dED55A30d0dc25" //mainnet
    // let getTonOwner = "0x195c1D13fC588C0b1Ca8A78dd5771E0eE5A2EAe4" //rinkeby
    

    const tokenEscrow = await ethers.getContractFactory('tokenEscrow')
    const escrow = await tokenEscrow.deploy(docAddress, tonAddress, getTonOwner)
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