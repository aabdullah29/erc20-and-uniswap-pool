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



const { Token } = require('@uniswap/sdk-core');
const { Pool, Position, nearestUsableTick } = require('@uniswap/v3-sdk');
const { ethers } = require("hardhat");

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

  await Usdt_Contract.connect(signer2).approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther('1000'));
  await Usdc_Contract.connect(signer2).approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther('1000'));

  const poolContract = PoolContract(POOL_USDT_USDC_500);
  const poolData = await getPoolData(poolContract);
  console.log("POOL DATA", poolData);

  const UsdtToken = new Token(31337, TETHER_ADDRESS, 18, 'USDT', 'Tether')
  const UsdcToken = new Token(31337, USDC_ADDRESS, 18, 'USDC', 'UsdCoin')

  params = {
    tokenId: ethers.utils.parseUnits("1",0),
    liquidity:   ethers.BigNumber.from("100"),
    amount0Min:   ethers.utils.parseUnits("0",0),
    amount1Min:   ethers.utils.parseUnits("0",0),
    deadline: ethers.BigNumber.from(ethers.utils.parseUnits(Math.floor(Date.now()).toString(),0).div(1000).add(ethers.utils.parseUnits('60',0).mul(10)))   
  }

  const gasLimit = 103000;
  const tx = await NonfungiblePositionManager_Contract.connect(signer2).decreaseLiquidity(
    params,
    { gasLimit: '1000000' }
  )

  console.log("HERE4", tx)
  const receipt = await tx.wait()
  const event1 = await receipt.events[1];
  let value1 = event1.args[0]
  console.log("VALUE1---------", value1)
  let value2 = event1.args[1]
  console.log("VALUE2---------", value2)
  let value3 = event1.args[2]
  console.log("VALUE3---------", value3)
  let value4 = event1.args[3]
  console.log("VALUE4---------", value4)
}

/*
npx hardhat run --network localhost scripts/07_decreaseLiquidity.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
   