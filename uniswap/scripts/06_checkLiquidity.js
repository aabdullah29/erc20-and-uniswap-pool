const {
  WETH_ADDRESS, FACTORY_ADDRESS, SWAP_ROUTER_ADDRESS, 
  NFT_DESCRIPTOR_ADDRESS, POSITION_DESCRIPTOR_ADDRESS, 
  POSITION_MANAGER_ADDRESS, TETHER_ADDRESS, USDC_ADDRESS, WRAPPED_BITCOIN_ADDRESS,
  POOL_USDT_USDC_500
} = require('./addresses.js');

const {
  NonfungiblePositionManager_Contract, Factory_Contract, Usdt_Contract, Usdc_Contract,
  PoolContract
} = require('./contractInstances');

async function getPoolData(poolContract) {
  const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ])
  console.log("Fee",await poolContract.fee())
  return {
    tickSpacing: tickSpacing,
    fee: fee,
    liquidity: liquidity.toString(),
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  }
}


async function main() {
  const provider = waffle.provider;
  const poolContract = PoolContract(POOL_USDT_USDC_500);
  const poolData = await getPoolData(poolContract);
  console.log('poolData', poolData);
}

/*
npx hardhat run --network localhost scripts/06_checkLiquidity.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });