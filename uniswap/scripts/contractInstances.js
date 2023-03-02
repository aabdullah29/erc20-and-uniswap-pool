const { Contract, } = require("ethers")

const {
  WETH_ADDRESS, FACTORY_ADDRESS, SWAP_ROUTER_ADDRESS, 
  NFT_DESCRIPTOR_ADDRESS, POSITION_DESCRIPTOR_ADDRESS, 
  POSITION_MANAGER_ADDRESS, TETHER_ADDRESS, USDC_ADDRESS, WRAPPED_BITCOIN_ADDRESS
} = require('./addresses.js');


const artifacts = {
  UniswapV3Factory: require("../artifacts/contracts/v3-core/UniswapV3Factory.sol/UniswapV3Factory.json"),
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
  SwapRouter: require("../artifacts/contracts/v3-periphery/SwapRouter.sol/SwapRouter.json"),
  Usdt: require("../artifacts/contracts/Tether.sol/Tether.json"),
  Usdc: require("../artifacts/contracts/UsdCoin.sol/UsdCoin.json"),
};


const provider = waffle.provider;

module.exports = {
  NonfungiblePositionManager_Contract: new Contract(POSITION_MANAGER_ADDRESS, artifacts.NonfungiblePositionManager.abi, provider),

  Factory_Contract: new Contract(FACTORY_ADDRESS, artifacts.UniswapV3Factory.abi, provider),

  Usdt_Contract: new Contract(TETHER_ADDRESS, artifacts.Usdt.abi, provider),

  Usdc_Contract: new Contract(USDC_ADDRESS, artifacts.Usdc.abi, provider),

  WBTC_Contract: new Contract(WRAPPED_BITCOIN_ADDRESS, artifacts.Usdc.abi, provider),

  PoolContract: (PoolAddress)=>{
    return new Contract(PoolAddress, artifacts.UniswapV3Pool.abi, provider)
  },

  SwapRouter_Contract: new Contract(SWAP_ROUTER_ADDRESS, artifacts.SwapRouter.abi, provider),
}
