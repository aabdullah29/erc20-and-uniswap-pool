/** @type import('hardhat/config').HardhatUserConfig */

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const GOERLI_PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const GETH_NETWORK_CONFIG = {
  chainId: 96969,
  url: "http://localhost:8545", // Adjust the RPC endpoint accordingly
  // accounts: {
  //   mnemonic: "your-mnemonic-here", // Replace with your actual mnemonic
  // },
};

module.exports = {
  solidity: "0.8.17",

  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },

  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY],
    },

    geth: GETH_NETWORK_CONFIG, // Custom network named 'pipcoin'
  },
};
