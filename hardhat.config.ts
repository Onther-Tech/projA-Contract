require("@nomiclabs/hardhat-waffle");
require("dotenv/config");
require("@nomiclabs/hardhat-etherscan");

require('@nomiclabs/hardhat-truffle4');
require("solidity-coverage");
require('chai/register-should');


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    // hardhat: {},
    coverage: {
      url: 'http://127.0.0.1:8555',
      gas: 0xfffffffffff,
      gasPrice: 0x01,
    },
    // rinkeby: {
    //   url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
    //   accounts: [ `${process.env.RINKEBY_PRIVATE_KEY}` ]
    // }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  solidity: {
    version: '0.8.0',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  }
};