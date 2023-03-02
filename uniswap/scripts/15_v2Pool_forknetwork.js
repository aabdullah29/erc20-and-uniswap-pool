// npx hardhat node --fork https://eth-goerli.g.alchemy.com/v2/Pk45XQqmiWuKjwka4DYOOxeE4Ia8Wtix --fork-block-number 8374286
// npx hardhat node --fork https://eth-mainnet.g.alchemy.com/v2/ZvmdipXxS6C0HUcHs7MqZCnWVt-0m3rr

const { ethers} = require("hardhat");
const { Contract, BigNumber } = require("ethers");
const { Token } = require('@uniswap/sdk-core');
const WETH9 = require("../WETH9.json")

//onst { Pool, Position, nearestUsableTick } = require('@uniswap/v3-sdk');


const {
  WETH_ADDRESS, FACTORY_ADDRESS, SWAP_ROUTER_ADDRESS, 
  NFT_DESCRIPTOR_ADDRESS, POSITION_DESCRIPTOR_ADDRESS, 
  POSITION_MANAGER_ADDRESS, TETHER_ADDRESS, USDC_ADDRESS, WRAPPED_BITCOIN_ADDRESS,
  POOL_USDT_USDC_500, POOL_WBTC_USDC_500, 
} = require('./addresses.js');

const {
  NonfungiblePositionManager_Contract, Factory_Contract, Usdt_Contract, Usdc_Contract,
  WBTC_Contract, PoolContract, SwapRouter_Contract
} = require('./contractInstances');




const V2_FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
const V2_SWAP_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

const V3_SWAP_ROUTER_ADDRESS = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
const V3_FACTORY_ADDRESS = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
const V3_POSITION_MANAGER_ADDRESS= '0xC36442b4a4522E871399CD717aBDD847Ab11FE88';

const WETH = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6';
const DAI = '0x5C221E77624690fff6dd741493D735a17716c26B';


const artifacts = {
  V2_SwapRouter: require("../artifacts/contracts/v2-periphery/IUniswapV2Router02.sol/IUniswapV2Router02.json"), 
  V2_Factory: require("../artifacts/contracts/v2-core/IUniswapV2Factory.sol/IUniswapV2Factory.json"),
  V3_SwapRouter: require("../artifacts/contracts/v3-periphery/SwapRouter.sol/SwapRouter.json"),
  V3_Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
  V3_Factory: require("../artifacts/contracts/v3-core/UniswapV3Factory.sol/UniswapV3Factory.json"),
  V3_NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  V2_IUniswapV2Pair: require("../artifacts/contracts/v2-core/IUniswapV2Pair.sol/IUniswapV2Pair.json"),
};



async function getPoolData(poolContract) {
  const [token0, token1, tickSpacing, fee, liquidity, slot0] = await Promise.all([
    poolContract.token0(),
    poolContract.token1(),
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
    
  ])
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

async function exectInputSingle(signer, swaprouter, tokenInContract, tokenOutContract, tokenIn, TokenOut, poolData, amountIn ){
  await tokenInContract.connect(signer).approve(V3_SWAP_ROUTER_ADDRESS, amountIn.toString())

  paramsExectInputSingle = {
    tokenIn: tokenIn,
    tokenOut: TokenOut,
    fee: poolData.fee,
    recipient: signer.address,
    deadline: Math.floor(Date.now() / 1000) + (60 * 10),
    amountIn: amountIn.toString(),
    amountOutMinimum: 0,
    sqrtPriceLimitX96:0
  }

  const tokenBalanceBefore = (await tokenOutContract.balanceOf(signer.address)).toString();

  const tx = await swaprouter.connect(signer).exactInputSingle(
    paramsExectInputSingle,
      { gasLimit: '30000000' }
  );
  await tx.wait();

  const tokenBalanceAfter = (await tokenOutContract.balanceOf(signer.address)).toString();
  const tokenBalanceDifference = ethers.utils.parseUnits(tokenBalanceAfter, 0)
  .sub(ethers.utils.parseUnits(tokenBalanceBefore, 0)).toString();
  console.log("paramsExectInputSingle DAI balance after: ", tokenBalanceDifference);
}

async function getTokensByWeth(signer, wethContract, tokenContract, WETH, Token, v3_swaprouter, v3_poolData, amount){
  await wethContract.connect(signer).deposit({ value: amount });
  await exectInputSingle(signer, v3_swaprouter, wethContract, tokenContract, WETH, Token, v3_poolData, amount/2);
  console.log("Token Amount Get: " ,(await getTokenBalance(wethContract, tokenContract, signer.address)).tokenA)
}

async function getTokenBalance(tokenAContract, tokenBContract, address){
  return {
    tokenA: (await tokenAContract.balanceOf(address)).toString(), 
    tokenB: (await tokenBContract.balanceOf(address)).toString(),
  };
}


async function addLiquidity(signer, swaprouter, tokenAContract, tokenBContract, tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin){
  await tokenAContract.connect(signer).approve(swaprouter.address, amountADesired.toString())
  await tokenBContract.connect(signer).approve(swaprouter.address, amountBDesired.toString())

  const tokenBalanceBefore = await getTokenBalance(tokenAContract, tokenBContract, signer.address);

  const tx = await swaprouter.connect(signer).addLiquidity(
    tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin, signer.address, Math.floor(Date.now() / 1000) + (60 * 10),
      { gasLimit: '30000000' }
  );
  await tx.wait();

  const tokenBalanceAfter = await getTokenBalance(tokenAContract, tokenBContract, signer.address);
  console.log("\ntoken balance: ", tokenBalanceBefore, "\n\n",tokenBalanceAfter);
}

(async ()=>{
  const wethContract = await ethers.getContractAt("IWETH", WETH);
  const daiContract = await ethers.getContractAt("IERC20", DAI);
  const [owner, signer2] = await ethers.getSigners();
  const provider = signer2.provider;


  const v3_factory = new Contract(V3_FACTORY_ADDRESS, artifacts.V3_Factory.abi, provider);
  const v3_poolAddress = await v3_factory.connect(owner).getPool( WETH, DAI, 3000);
  console.log("v3_poolAddress: ", v3_poolAddress);

  const v3_poolContract = new Contract(v3_poolAddress, artifacts.V3_Pool.abi, provider);
  const v3_poolData = await getPoolData(v3_poolContract);
  console.log("poolData: ", v3_poolData);

  const v3_swaprouter = new ethers.Contract(
    V3_SWAP_ROUTER_ADDRESS, 
    artifacts.V3_SwapRouter.abi,
    provider,
  );

  await getTokensByWeth(owner, wethContract, daiContract, WETH, DAI, v3_swaprouter, v3_poolData, ethers.utils.parseEther('2'));

  const balanceTokenAandB = await getTokenBalance(wethContract, daiContract, owner.address)
  console.log("\WETH and DAI balance: ", balanceTokenAandB);


  const v2_factory = new Contract(V2_FACTORY_ADDRESS, artifacts.V2_Factory.abi, provider);
  const v2_poolAddress = await v2_factory.connect(owner).getPair( WETH, DAI);
  console.log("poolAddress: ", v2_poolAddress);
  const v2_poolContract = new Contract(v2_poolAddress, artifacts.V2_IUniswapV2Pair.abi, provider);


  const v2_router = new Contract(V2_SWAP_ROUTER_ADDRESS, artifacts.V2_SwapRouter.abi, provider);
  console.log("factory:", await v2_router.factory())

  await addLiquidity(owner, v2_router, wethContract, daiContract, WETH, DAI, balanceTokenAandB.tokenA, balanceTokenAandB.tokenB, 0, 0);

  console.log("\ngetReserves: ", (await v2_poolContract.getReserves()).slice(0, 2));
  console.log("\n\nliqudity balance: ", await v2_poolContract.balanceOf(owner.address));
  

  const balanceTokenAandB_before = await getTokenBalance(wethContract, daiContract, owner.address)
  await wethContract.connect(owner).approve(V2_SWAP_ROUTER_ADDRESS, 1000)
  await v2_router.connect(owner).swapExactTokensForTokens(1000, 0, [WETH, DAI], owner.address, Math.floor(Date.now() / 1000) + (60 * 10));
  const balanceTokenAandB_after = await getTokenBalance(wethContract, daiContract, owner.address)
  console.log("\n\nWETH and DAI balance After V2 Swap: ", balanceTokenAandB_before, balanceTokenAandB_after);
})()




/*

npx hardhat run --network localhost scripts/01_deployContracts.js
npx hardhat run --network localhost scripts/02_deployTokens.js
npx hardhat run --network localhost scripts/03_deployPools.js
npx hardhat run --network localhost scripts/04_mintPosition.js
clear
npx hardhat run --network localhost scripts/15_v2Pool_forknetwork.js

*/