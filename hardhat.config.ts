require('chai/register-should');
require('@nomiclabs/hardhat-ganache');
require('@nomiclabs/hardhat-truffle5');
require('solidity-coverage');
require('dotenv/config');
require('@nomiclabs/hardhat-etherscan')

//typescript test need
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");


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
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [ `${process.env.RINKEBY_PRIVATE_KEY}` ]
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [ `${process.env.MAINNET_PRIVATE_KEY}` ]
    }
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