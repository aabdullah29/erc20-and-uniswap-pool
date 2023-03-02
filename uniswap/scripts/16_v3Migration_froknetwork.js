// npx hardhat node --fork https://eth-goerli.g.alchemy.com/v2/Pk45XQqmiWuKjwka4DYOOxeE4Ia8Wtix --fork-block-number 8374286
// npx hardhat node --fork https://eth-mainnet.g.alchemy.com/v2/ZvmdipXxS6C0HUcHs7MqZCnWVt-0m3rr

const { ethers} = require("hardhat");
const { Contract, BigNumber } = require("ethers");
const { Pool, Position, nearestUsableTick } = require('@uniswap/v3-sdk')
const { Token } = require('@uniswap/sdk-core');
const WETH9 = require("../WETH9.json")

const Web3Eth  = require("web3-eth");
const eth = new Web3Eth('http://localhost:8545');
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
const { CompilationJobCreationErrorReason } = require("hardhat/types");


const V2_FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
const V3_SWAP_ROUTER_ADDRESS = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
const V3_FACTORY_ADDRESS = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
const V3_POSITION_MANAGER_ADDRESS = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88';
const V3MIGRATOR_ADDRESS = "0xA5644E29708357803b5A882D272c41cC0dF92B34";

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
  V3_Migrator: require("../artifacts/contracts/v3-periphery/V3Migrator.sol/V3Migrator.json")
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


// async function v3migrate(_signer, _v2_poolContract, _tokenAContract, _tokenBContract, _tokenA, _tokenB, _v3migrator, _migrateParams) {

//   //  await _v2_poolContract.connect(signer).approve(_v3migrator.address, _migrateParams.liquidity)
  

// }



async function addLiquidity(signer, swaprouter, tokenAContract, tokenBContract, tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin){
  await tokenAContract.connect(signer).approve(swaprouter.address, amountADesired.toString())

  const tx = await swaprouter.connect(signer).addLiquidity(
    tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin, signer.address, Math.floor(Date.now() / 1000) + (60 * 10),
      { gasLimit: '30000000' }
  );
  await tx.wait();

  const tokenBalanceAfter = await getTokenBalance(tokenAContract, tokenBContract, signer.address);
  console.log("\ntoken balance: ", tokenBalanceBefore, "\n\n",tokenBalanceAfter);
}



async function getEvent(tx, contractAddress, contractABI, eventName){
  eth.getTransactionReceipt(tx)
  .then((rcpt)=>{
      rcpt.logs.filter( log => log.address === contractAddress).map((log) => {
          const eventAbi = contractABI.find(event => event?.name === eventName);
          if (log.topics[0] === eth.abi.encodeEventSignature(eventAbi)){
              const tInfo = eth.abi.decodeLog(eventAbi.inputs, log.data, log.topics);
              console.log("\n\nToken Info: ", tInfo);
          }
      });
  });
}




(async ()=>{
  const wethContract = await ethers.getContractAt("IWETH", WETH);
  const daiContract = await ethers.getContractAt("IERC20", DAI);
  const [owner, signer2] = await ethers.getSigners();
  const provider = signer2.provider;

  const v3_migrator = new Contract(V3MIGRATOR_ADDRESS, artifacts.V3_Migrator.abi, provider);
  const v3_factory = new Contract(V3_FACTORY_ADDRESS, artifacts.V3_Factory.abi, provider);
  const v3_poolAddress = await v3_factory.connect(owner).getPool( WETH, DAI, 3000);
  console.log("v3_poolAddress: ", v3_poolAddress);

  const v2_factory = new Contract(V2_FACTORY_ADDRESS, artifacts.V2_Factory.abi, provider);
  const v2_poolAddress = await v2_factory.connect(owner).getPair( WETH, DAI);
 // console.log("poolAddress: ", v2_poolAddress);
  const v2_poolContract = new Contract("0x8Db6060D931E4b67343D85fb4e2355b4c96353B2", artifacts.V2_IUniswapV2Pair.abi, provider);

  const v3_poolContract = new Contract(v3_poolAddress, artifacts.V3_Pool.abi, provider);
  const v3_poolData = await getPoolData(v3_poolContract);
  console.log("poolData: ", v3_poolData);
  Math.floor(Date.now() / 1000) + (60 * 10)
  const v3_swaprouter = new ethers.Contract(
    V3_SWAP_ROUTER_ADDRESS, 
    artifacts.V3_SwapRouter.abi,
    provider,
  );

  const poolData = await getPoolData(v3_poolContract);


  MigrateParams = {
    pair: '0x8Db6060D931E4b67343D85fb4e2355b4c96353B2', //v2 pool
    liquidityToMigrate: 6212993987569,
    percentageToMigrate: 50,
    token0: DAI,
    token1: WETH,
    fee: 3000,
    tickLower: nearestUsableTick(poolData.tick, poolData.tickSpacing) - poolData.tickSpacing * 2,
    tickUpper: nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 2,
    amount0Min: 0,
    amount1Min: 0,
    recipient: owner.address,
    deadline: Math.floor(Date.now() / 1000) + (60 * 10),
    refundAsETH: false
  };

  await v2_poolContract.connect(owner).approve(v3_migrator.address, MigrateParams.liquidityToMigrate);
  let tx = await v3_migrator.connect(owner).migrate(
    MigrateParams,
    { gasLimit: '30000000'}
  );

  // tx = await tx.wait();

  // console.log("transaction data: ",tx.events.map(async event => {
  //   console.log(await event.getTransaction);
  //   console.log(await event.getTransactionReceipt);
  // }));

  // console.log("event 0: ", await tx.events[0].getTransaction);
  
  // console.log("EventFlashSwap event: ", (await tx.wait()).events.filter(event => event.event === 'IncreaseLiquidity').map(e => e.args));
  // console.log("tx: ", tx.hash);


  await getEvent(tx.hash, V3_POSITION_MANAGER_ADDRESS, artifacts.V3_NonfungiblePositionManager.abi, 'Transfer');






//  const nonfungiblePositionManager = new ethers.Contract(
//     V3_POSITION_MANAGER_ADDRESS,
//     artifacts.V3_NonfungiblePositionManager.abi,
//     provider
//   );

//   console.log("Token info", (await nonfungiblePositionManager.connect(owner).positions('10000000000000000')).toString())
})()


/*

npx hardhat run --network localhost scripts/01_deployContracts.js
npx hardhat run --network localhost scripts/02_deployTokens.js
npx hardhat run --network localhost scripts/03_deployPools.js
npx hardhat run --network localhost scripts/04_mintPosition.js
clear
npx hardhat run --network localhost scripts/16_v3Migration_froknetwork.js

*/