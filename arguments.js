const { BigNumber } = require("ethers")

const BASE_TEN = 10
const decimals = 18
const name = "Dooropen"
const symbol = "DOC"
let supplyAmount = 500000000
const initialSupply = BigNumber.from(supplyAmount).mul(BigNumber.from(BASE_TEN).pow(decimals))

//DOC토큰 owner 계정
let ownerAddress = "0xc575848f69C710dA33A978384114010bdb15f4db"


// let contractAddress  = "0xb109f4c20BDb494A63E32aA035257fBA0a4610A4"

// await hre.run("verify:verify", {
//     address: contractAddress,
//     constructorArguments: [
//       name,
//       symbol,
//       initialSupply,
//       ownerAddress
//     ],
// });

module.exports = [
    name,
    symbol,
    initialSupply,
    ownerAddress
];