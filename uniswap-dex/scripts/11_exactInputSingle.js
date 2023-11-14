const {
  WETH_ADDRESS, FACTORY_ADDRESS, SWAP_ROUTER_ADDRESS, 
  NFT_DESCRIPTOR_ADDRESS, POSITION_DESCRIPTOR_ADDRESS, 
  POSITION_MANAGER_ADDRESS, TETHER_ADDRESS, USDC_ADDRESS, WRAPPED_BITCOIN_ADDRESS,
  POOL_USDT_USDC_500
} = require('./addresses.js');


const {
  NonfungiblePositionManager_Contract, Factory_Contract, Usdt_Contract, Usdc_Contract,
  PoolContract, SwapRouter_Contract
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

    return {
      tickSpacing: tickSpacing,
      fee: fee,
      liquidity: liquidity,
      sqrtPriceX96: slot0[0],
      tick: slot0[1],
    }
  }



async function main(){
    const [owner, signer2,signer3, signer4] = await ethers.getSigners();

    await Usdt_Contract.connect(signer2).approve(SWAP_ROUTER_ADDRESS, ethers.utils.parseEther('10'))
    



    const poolContract = PoolContract(POOL_USDT_USDC_500);
    const poolData = await getPoolData(poolContract)


    // const amountIn = 9;
    const amountIn = ethers.utils.parseEther('1')
    params = {
        tokenIn: TETHER_ADDRESS,
        tokenOut: USDC_ADDRESS,
        fee: poolData.fee,
        recipient: signer2.address,
        deadline: Math.floor(Date.now() / 1000) + (60 * 10),
        amountIn: amountIn.toString(),
        amountOutMinimum: 0,
        sqrtPriceLimitX96:0
      }


    const tx = await SwapRouter_Contract.connect(signer2).exactInputSingle(
        params,
        { gasLimit: '30000000' }
    )
    const receipt = await tx.wait()
    console.log("receipt is: ", receipt);

}

/*
npx hardhat run --network localhost scripts/11_exactInputSingle.js
*/


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });                  