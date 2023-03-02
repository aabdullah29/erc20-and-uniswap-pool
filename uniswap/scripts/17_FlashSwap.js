const { Contract, ContractFactory, utils, BigNumber } = require("ethers")
const WETH9 = require("../WETH9.json")

const {
  WETH_ADDRESS, FACTORY_ADDRESS, SWAP_ROUTER_ADDRESS, 
  NFT_DESCRIPTOR_ADDRESS, POSITION_DESCRIPTOR_ADDRESS, 
  POSITION_MANAGER_ADDRESS, TETHER_ADDRESS, USDC_ADDRESS, WRAPPED_BITCOIN_ADDRESS
} = require('./addresses.js');


const {
  NonfungiblePositionManager_Contract, Factory_Contract, Usdt_Contract, Usdc_Contract
} = require('./contractInstances');



async function getTokensBalance(address){
  console.log("TETHER blance: ", (await Usdt_Contract.balanceOf(address)).toString());
  console.log("USDC balance: ", (await Usdc_Contract.balanceOf(address)).toString());
} 

const artifacts = {
  FlashSwap: require("../artifacts/contracts/FlashSwap.sol/FlashSwap.json"),
};

(async()=>{
  const [owner, signer] = await ethers.getSigners();

  const FlashSwap = new ContractFactory(artifacts.FlashSwap.abi, artifacts.FlashSwap.bytecode, owner);
  const flashSwap = await FlashSwap.deploy(SWAP_ROUTER_ADDRESS, FACTORY_ADDRESS, WETH_ADDRESS);

  console.log("flashSwap address: ", flashSwap.address);
  console.log("swapRouter address: ", await flashSwap.swapRouter());
  await Usdt_Contract.connect(signer).transfer(flashSwap.address, 100);
  await Usdc_Contract.connect(signer).transfer(flashSwap.address, 100);
  await getTokensBalance(flashSwap.address);


  const FlashParams = {
    token0: TETHER_ADDRESS,
    token1: USDC_ADDRESS,
    fee1: 500,
    amount0: 1000, 
    amount1: 1000, 
    fee2: 3000
}


  var tx =  await flashSwap.connect(owner).initFlash(FlashParams, { gasLimit: '30000000' });
  console.log("EventFlashSwap event: ", (await tx.wait()).events.filter(event => event.event === 'EventFlashSwap').map(e => e.args));
  await getTokensBalance(flashSwap.address);

})()


/*

npx hardhat run --network localhost scripts/01_deployContracts.js
npx hardhat run --network localhost scripts/02_deployTokens.js
npx hardhat run --network localhost scripts/03_deployPools.js
npx hardhat run --network localhost scripts/04_mintPosition.js
clear
npx hardhat run --network localhost scripts/17_FlashSwap.js

*/