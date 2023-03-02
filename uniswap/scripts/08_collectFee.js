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


const { Token } = require('@uniswap/sdk-core')
const { Pool, Position, nearestUsableTick } = require('@uniswap/v3-sdk')
const { ethers } = require("hardhat")

async function getPoolData(poolContract) {
  const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ])
  console.log("Tick Spacing", await poolContract.tickSpacing() )
  console.log("Fee",await poolContract.fee())
  console.log("Liquidity", await poolContract.liquidity())
  console.log("Slot 0",await poolContract.slot0() )

  return {
    tickSpacing: tickSpacing,
    fee: fee,
    liquidity: liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  }
}


async function main(){
    
    const [owner, signer2] = await ethers.getSigners();
    const provider = waffle.provider;

    const poolContract = PoolContract(POOL_USDT_USDC_500);

    const poolData = await getPoolData(poolContract)
    console.log("POOL DATA", poolData);

    params = {
    tokenId: 1,
    recipient:   signer2.address,
    amount0Max:  1,
    amount1Max:  1,
    }
 
    const gasLimit = 238520
    const tx = await NonfungiblePositionManager_Contract.connect(signer2).collect(params, {gasLimit})

    // Collect
    console.log("Collect logs: ", (await tx.wait()).events.find(event => event.event === 'Collect').args);
}

/*
npx hardhat run --network localhost scripts/08_collectFee.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
   