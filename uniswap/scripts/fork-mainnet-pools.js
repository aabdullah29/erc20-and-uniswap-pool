// npx hardhat node --fork https://eth-goerli.g.alchemy.com/v2/Pk45XQqmiWuKjwka4DYOOxeE4Ia8Wtix --fork-block-number 8374286
// npx hardhat node --fork https://eth-mainnet.g.alchemy.com/v2/ZvmdipXxS6C0HUcHs7MqZCnWVt-0m3rr


const { ethers} = require("hardhat");
const { Contract, BigNumber } = require("ethers");
const { Token } = require('@uniswap/sdk-core');
const { Pool, Position, nearestUsableTick } = require('@uniswap/v3-sdk');



const WETH = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6';
const DAI = '0x5C221E77624690fff6dd741493D735a17716c26B';
const SWAP_ROUTER_ADDRESS = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
const FACTORY_ADDRESS = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
const POSITION_MANAGER_ADDRESS= '0xC36442b4a4522E871399CD717aBDD847Ab11FE88';


const artifacts = {
  SwapRouter: require("../artifacts/contracts/v3-periphery/SwapRouter.sol/SwapRouter.json"),
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
  UniswapV3Factory: require("../artifacts/contracts/v3-core/UniswapV3Factory.sol/UniswapV3Factory.json"),
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
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
  await tokenInContract.connect(signer).approve(SWAP_ROUTER_ADDRESS, amountIn.toString())

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


async function getTokenWETHandDAI(){
  const WETH_Token = new Token(31337, WETH, 18, 'WETH', 'Wrapped Ether');
  const DAI_Token = new Token(31337, DAI, 18, 'DAI', 'DAI');
  return {WETH_Token, DAI_Token}; 
}

async function getPositionManager(provider){
  return new ethers.Contract(
    POSITION_MANAGER_ADDRESS,
    artifacts.NonfungiblePositionManager.abi,
    provider
  );
}


async function mintNewPossition(signer, provider, poolData, tokenAContract, tokenBContract) {
  console.log("token0 Address: ", poolData.token0, "\ntoken1 Address: ", poolData.token1);
  const {WETH_Token, DAI_Token} = await getTokenWETHandDAI();
  const pool = new Pool(
    DAI_Token,
    WETH_Token,
    poolData.fee,
    poolData.sqrtPriceX96.toString(),
    poolData.liquidity.toString(),
    poolData.tick
  )

  const tickLower = nearestUsableTick(poolData.tick, poolData.tickSpacing) - poolData.tickSpacing * 1;
  const tickUpper = nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 1;
  const position = new Position({
    pool: pool,
    liquidity: 100000,
    tickLower: tickLower,
    tickUpper: tickUpper,
  })

  const { amount0: amount0Desired, amount1: amount1Desired} = position.mintAmounts
  console.log("Desired amount0: ", amount0Desired.toString(), ", amount1: ", amount1Desired.toString());

  await tokenAContract.connect(signer).approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther(amount0Desired.toString()));
  await tokenBContract.connect(signer).approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther(amount1Desired.toString()));


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

  const nonfungiblePositionManager = await getPositionManager(provider);
  const tx = await nonfungiblePositionManager.connect(signer).mint(
    params,
    { gasLimit: '1000000' }
  )

  const receipt = await tx.wait()
  // console.log("\ntx receipt: ", receipt);
  console.log("\ntx Event: ", receipt.events);
}



async function collectFee(signer, provider, tokenId, amount0Max, amount1Max){
  paramsCollectFee = {
    tokenId: tokenId,
    recipient:   signer.address,
    amount0Max: amount0Max,
    amount1Max: amount1Max,
  }

  const nonfungiblePositionManager = await getPositionManager(provider);
  const tx = await nonfungiblePositionManager.connect(signer).collect(paramsCollectFee, {gasLimit:"218520"});
  const receipt = await tx.wait();

  const event1 = await receipt.events[2];
  console.log("Event 1: ", event1)
  let value1 = event1.args[0]
  console.log("Value 1: ", value1)
  let value2 = event1.args[1]
  console.log("Value 2: ", value2)
  let value3 = event1.args[2]
  console.log("Value 3: ", value3)
  let value4 = event1.args[3]
  console.log("Value 4: ", value4)
}


async function getPosition(signer, provider, tokenId){
  const nonfungiblePositionManager = await getPositionManager(provider);
  const positions = await nonfungiblePositionManager.connect(signer).positions(tokenId, {gasLimit:"218520"});
  console.log("positions: ", positions);
}


(async ()=>{
  const wethContract = await ethers.getContractAt("IWETH", WETH);
  const daiContract = await ethers.getContractAt("IERC20", DAI);
  const [owner, signer2] = await ethers.getSigners();
  const provider = signer2.provider;

  const factory = new Contract(FACTORY_ADDRESS, artifacts.UniswapV3Factory.abi, provider);
  const poolAddress = await factory.connect(owner).getPool( WETH, DAI, 3000);
  console.log("poolAddress: ", poolAddress);

  const poolContract = new Contract(poolAddress, artifacts.UniswapV3Pool.abi, provider);
  const poolData = await getPoolData(poolContract);
  console.log("poolData: ", poolData);

  // let amountIn = 100000;
  let amountIn = ethers.utils.parseEther('2')
  // await wethContract.connect(owner).deposit({ value: amountIn });
  amountIn = (await wethContract.connect(owner).balanceOf(owner.address)).toString();
  console.log("wethContract balance: ", amountIn);

  const swaprouter = new ethers.Contract(
    SWAP_ROUTER_ADDRESS, 
    artifacts.SwapRouter.abi,
    provider,
  );

  // await exectInputSingle(owner, swaprouter, wethContract, daiContract, WETH, DAI, poolData, amountIn);
  // await exectInputSingle(owner, swaprouter, daiContract, wethContract, DAI, WETH, poolData, 1000000000000000);
  
  const tokenBBalance = (await wethContract.balanceOf(owner.address)).toString();
  const tokenABalance = (await daiContract.balanceOf(owner.address)).toString();
  console.log("WETH BAlance: ", tokenBBalance);
  console.log("DAI BAlance: ", tokenABalance);

  // await mintNewPossition(owner, provider, poolData, daiContract, wethContract);

  const tokenID = 51842;
  // await getPosition(owner, provider, tokenID);
  // await collectFee(owner, provider, tokenID, 1000, 1000,);
})()
