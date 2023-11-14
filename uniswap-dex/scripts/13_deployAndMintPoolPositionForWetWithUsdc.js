const {
  WETH_ADDRESS, FACTORY_ADDRESS, SWAP_ROUTER_ADDRESS, 
  NFT_DESCRIPTOR_ADDRESS, POSITION_DESCRIPTOR_ADDRESS, 
  POSITION_MANAGER_ADDRESS, TETHER_ADDRESS, USDC_ADDRESS, WRAPPED_BITCOIN_ADDRESS,
  POOL_USDT_USDC_500
} = require('./addresses.js');


const {
  NonfungiblePositionManager_Contract, Factory_Contract, Usdt_Contract, Usdc_Contract,
  WBTC_Contract, PoolContract, SwapRouter_Contract
} = require('./contractInstances');


const { BigNumber } = require("ethers")
const { Token } = require('@uniswap/sdk-core')
const { Pool, Position, nearestUsableTick } = require('@uniswap/v3-sdk')
const { ethers } = require("hardhat")



// deploy pool
const bn = require('bignumber.js')
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })

function encodePriceSqrt(reserve1, reserve0) {
  return BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  )
}


async function deployPool(token0, token1, fee, price) {
  
  const [owner] = await ethers.getSigners();
  await NonfungiblePositionManager_Contract.connect(owner).createAndInitializePoolIfNecessary(
    token0,
    token1,
    fee,
    price,
    { gasLimit: 5000000 }
  )
  const poolAddress = await Factory_Contract.connect(owner).getPool(
    token0,
    token1,
    fee,
  )
  return poolAddress
}



// mint possition

async function getPoolData(poolContract) {
  const [token0, token1, tickSpacing, fee, liquidity, slot0] = await Promise.all([
    poolContract.token0(),
    poolContract.token1(),
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ])
  console.log("token0: ", token0 )
  console.log("token1: ", token1 )
  console.log("Tick Spacing: ", tickSpacing)
  console.log("Fee: ", fee)
  console.log("Liquidity: ", liquidity)
  console.log("Slot 0: ", slot0)

  return {
    token0: token0,
    token1: token1,
    tickSpacing: tickSpacing,
    fee: fee,
    liquidity: liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  }
}



async function mintNewPossition(signer, poolContract) {

  await WBTC_Contract.connect(signer).approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther('10000'));
  await Usdc_Contract.connect(signer).approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther('10000'));

  const poolData = await getPoolData(poolContract);

  const WBTC = new Token(31337, WRAPPED_BITCOIN_ADDRESS, 18, 'WBTC', 'WrappedBitcoin');
  const UsdcToken = new Token(31337, USDC_ADDRESS, 18, 'USDC', 'UsdCoin');

  const pool = new Pool(
    WBTC,
    UsdcToken,
    poolData.fee,
    poolData.sqrtPriceX96.toString(),
    poolData.liquidity.toString(),
    poolData.tick
  );

  const tickLower = nearestUsableTick(poolData.tick, poolData.tickSpacing) - poolData.tickSpacing * 2;
  const tickUpper = nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 2;


  const position = new Position({
    pool: pool,
    liquidity: ethers.utils.parseEther('1000'),
    tickLower: tickLower,
    tickUpper: tickUpper,
  })

  const { amount0: amount0Desired, amount1: amount1Desired} = position.mintAmounts

  params = {
    token0: poolData.token0,
    token1: poolData.token1,
    fee: poolData.fee,
    tickLower: tickLower,
    tickUpper: tickUpper,
    amount0Desired: amount0Desired.toString(),
    amount1Desired: amount1Desired.toString(),
    amount0Min: 0,
    amount1Min: 0,
    recipient: signer.address,
    deadline: Math.floor(Date.now() / 1000) + (60 * 10)
  }


  const tx = await NonfungiblePositionManager_Contract.connect(signer).mint(
    params,
    { gasLimit: '1000000' }
  )

  const receipt = await tx.wait()
  const event1 = await receipt.events[6];
  console.log("EVENT1 args: ", event1.args)
  let tokenId = event1.args[0]
  console.log("TokenId: ", tokenId)
}




async function main() {

  const [owner, signer2] = await ethers.getSigners();

  let wbtcUsdc500 = await deployPool(WRAPPED_BITCOIN_ADDRESS, USDC_ADDRESS, 500, encodePriceSqrt(1, 1))
  console.log('\nWBTC_USDC_500= ', `'${wbtcUsdc500}'\n`)
  // wbtcUsdc500 = "0xD8Dc8176F0fC3668527445463bCb6089AbC2CD82";

  // setFeeProtocol
  const poolContract = PoolContract(wbtcUsdc500);
  const tx =  await poolContract.connect(owner).setFeeProtocol(10, 10);
  console.log("set protocolFees logs: ", (await tx.wait()).events.find(event => event.event === 'SetFeeProtocol').args);

  await mintNewPossition(signer2, poolContract);
}

/*
npx hardhat run --network localhost scripts/01_deployContracts.js
npx hardhat run --network localhost scripts/02_deployTokens.js
npx hardhat run --network localhost scripts/03_deployPools.js
npx hardhat run --network localhost scripts/04_mintPosition.js
npx hardhat run --network localhost scripts/05_increaseLiquidity.js

clear
npx hardhat run --network localhost scripts/11_exactInputSingle.js

npx hardhat run --network localhost scripts/01_deployContracts.js
npx hardhat run --network localhost scripts/02_deployTokens.js
npx hardhat run --network localhost scripts/13_deployAndMintPoolPositionForWetWithUsdc.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });