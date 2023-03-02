# Clone unicwapV3


**Step by step guideline for clone the uniswapV3:**


## 1. create hardhat project
```
mkdir [project-name]
cd [project-name]
npm init
npm install --save-dev hardhat
npx hardhat
then select [Create an empty hardhat.config.js]
```

## 2. add dependencies in `package.json`
```
"dependencies": {
    "@openzeppelin/contracts": "3.4.2-solc-0.7",
    "@nomiclabs/hardhat-ethers": "^2.1.1",
    "@nomiclabs/hardhat-waffle": "^2.0.3",
    "@uniswap/lib": "^4.0.1-alpha",
    "@uniswap/v2-core": "1.0.1",
    "@uniswap/v3-core": "1.0.0",
    "@uniswap/v3-periphery": "^1.0.1",
    "@uniswap/v3-sdk": "^3.9.0",
    "axios": "^1.2.4",
    "base64-sol": "1.0.1",
    "bignumber.js": "^9.1.0",
    "ethereum-waffle": "^3.4.4",
    "ethers": "^5.7.1",
    "web3-eth": "^1.8.2"
  },
```

## 3. create interface for wrappe ether 
`contracts/interfaces/IWETH.sol`

## 4. create some ERC20 tokens for deploy and swap on our cloned uniswapV3:
```
contracts/Tether.sol
contracts/UsdcCoin.sol
contracts/WrappedBitcoin.sol
```

## 5. run hardhat node 
`npx hardhat node`
<br>
<br>
we can fork the any network and can use the existing contracts or we can deploy our cloned contract: <br>
fork mainnet `npx hardhat node --fork https://eth-mainnet.g.alchemy.com/v2/ZvmdipXxS6C0HUcHs7MqZCnWVt-0m3rr`<br>
fork goerli `npx hardhat node --fork https://eth-goerli.g.alchemy.com/v2/Pk45XQqmiWuKjwka4DYOOxeE4Ia8Wtix --fork-block-number 8374286` <br>



## 6. run deploy script 1:
`npx hardhat run --network localhost scripts/01_deployContracts.js` in this script use `uniswapV3 npm packages` and deploy these contracts and save their addresses in `scripts/addresses.js`<br>


**NOTE:** <br> We can use uniswapV3 contract from uniswap github and then compile these contract and deploy them:<br>
if we use uniswap github contracts then we follow these steps before the deploy: <br>
- `git clone https://github.com/Uniswap/v3-periphery.git` and past contracts directory into our `contracts`
- `git clone https://github.com/Uniswap/v3-core.git` and past contracts directory into our `contracts`

- set the `hardhat.config.js` compiler settings according to the current configuration:

- run `npx hardhat compile` three time for these contracts with differen compilor settings: (comment these lines one by one): 
    1. return paths.filter(p => p.includes("v3-core"));
    2. return paths.filter(p => p.includes("v3-periphery"));
    3. return paths.filter(p => p.includes("contracts") && !p.includes("v3-core"));
    4. compilers: [CORE_COMPILER_SETTINGS],
    5. compilers: [DEFAULT_COMPILER_SETTINGS],


<br>
<br>
<br>


**After that use the byte code of these contracts and deploy them (we can use the bytes code from uniswapV3 node packges and from our own compiled contracts)**

  1. **WETH9:**  simple `WETH` contract deploy because uniswapV3 use the WETH address.

  2. **UniswapV3Factory:** `UniswapV3Factory` is part of v3-core contracts deploy witout any constructor perameter and it's use for create new pools and that pools maintain their state and liquidity in their on state variables.

  3. **SwapRouter:** `SwapRouter` is part of v3-periphery contracts deploy with passing the `UniswapV3Factory` and `WETH` address and it's use for swap between different tokens and `SwapRouter` internaly call that specific `UniswapV3Pool` contract which is the pasrt of v3-core


  4. **NFTDescriptor:** `NFTDescriptor` is part of v3-periphery contracts deploy witout any constructor perameter and it's use for deploy `NonfungibleTokenPositionDescriptor` and also use for fee, convert some values to strings.

  5. **NonfungibleTokenPositionDescriptor:** `NonfungibleTokenPositionDescriptor` is part of v3-periphery contracts deploy with passing the `WETH` address and it's use for manage the metadata.

  6. **NonfungiblePositionManager:**  `NonfungiblePositionManager` is part of v3-periphery contracts deploy with passing the `UniswapV3Factory`, `WETH` and `NonfungibleTokenPositionDescriptor` address and it's use for create new pool and manage the existing pool.



## 7. run deploy script 2:
`npx hardhat run --network localhost scripts/02_deployTokens.js` in this script we deploy 3 tokens Tether, Usdc and WrappedBitcoin. After deploying these contracts save their addresses in `scripts/addresses.js`<br>


## 8. create instance of all deployed contracts:
In `scripts/contractInstances.js` script fetch all the ABIs from artifacts and fetch the all deployed contracts addresses and create the instance for each contract then use these instance in all scripts.



## 9. Create new pool and add liqudity:
After deploying the contract now our DEX is running now we will do these tasks one by one:

#### 1. create new pool: 
run `npx hardhat run --network localhost scripts/03_deployPools.js` in this script we use `NonfungiblePositionManager` Contract and use `createAndInitializePoolIfNecessary` method of this contract for creating two pools with different fool fee and this method get the signer and these perametters:
  1. token 0 address
  2. token 1 address
  3. pool fee
  4. encodePriceSqrt in bytes
  
#### 2. fetch the pool address:
in privious script we use `V3Factory Contract` for getiing the pool address and we use `getPool` method of that contract and it take these perametters:
  1. token 0 address
  2. token 1 address
  3. pool fee

#### 3. mint new possition and provide liqudity:
run `npx hardhat run --network localhost scripts/04_mintPosition.js` in this script we use `Usdt and Usdc` contracts instance for giving the token approval to `v3 possition manager` and use two `Pool Contracts` instance that we deploy in perivious script for getting the pool info and we will set the protocole fee using the `setFeeProtocol` method of each pool and we use `NonfungiblePositionManager Contract` and use the `mint` method of this contract that will mint the new possition and provide liquid in both pools and return the NFT according to our liqudity, this `mint` method get the signer and get these perams:
  1. token 0 address
  2. token 1 address
  3. pool fee
  4. tickLower value
  5. tickUpper value
  6. token 0 amount for Desired liqudity
  7. token 1 amount for Desired liqudity
  8. token 0 min liqudity amount
  9. token 1 min liqudity amount
  10. recipient address that will receive the NFT
  11. deadline for this transaction

#### 4. increase liqudity in existing pool:
run `npx hardhat run --network localhost scripts/05_increaseLiquidity.js` in this script we use `Usdt and Usdc` contracts instance for giving the token approval to `v3 possition manager` and use `Pool Contract` instance for getting the pool info and we use `NonfungiblePositionManager Contract` and use the `increaseLiquidity` method of this contract that will increase the liqudity in that existing pool and this method get the signer and these perams:
  1. NFT tokenId
  2. token 0 amount for Desired liqudity
  3. token 1 amount for Desired liqudity
  4. token 0 min liqudity amount
  5. token 1 min liqudity amount
  6. deadline for this transaction


#### 5. check the liqudity of that pool:
run `npx hardhat run --network localhost scripts/06_checkLiquidity.js` in this script we use `Pool Contract` instance for getting the pool info by using these methods:
  1. `token0()` for getting token 0 address
  2. `token1()` for getting token 1 address
  3. `tickSpacing()` for getting the tick range
  4. `fee()` for getting the pool fee
  5. `liquidity()` for checking the available liquidity
  6. `slot0()` for getting the state variable slot0

#### 6. decrease liqudity in existing pool: 
run `npx hardhat run --network localhost scripts/07_decreaseLiquidity.js`in this script we use `Pool Contract` instance for getting the pool info and we use `NonfungiblePositionManager Contract` and use the `decreaseLiquidity` method of this contract that will decrease the liqudity in that existing pool and this method get the signer and these perams:
  1. NFT tokenId
  2. liquidity amount that we want to get back
  4. token 0 min liqudity amount
  5. token 1 min liqudity amount
  6. deadline for this transaction

#### 7. burn existing possition: 
run `npx hardhat run --network localhost scripts/10_burnPosition.js` in this script we use `Pool Contract` instance for getting the pool info and we use `NonfungiblePositionManager Contract` and use the `burn` method of this contract that will burn liqudity possition in that existing pool and this method get the signer and these perams:
  1. NFT tokenId





## 10. Swap using exactInputSingle and exactOutputSingle:

#### 1. swap: 
run `npx hardhat run --network localhost scripts/11_exactInputSingle.js` in this script we use `Usdt Contract` instance for give the approval to `SWAP_ROUTER_ADDRESS` and use `Pool Contract` for getting the pool info and use `SwapRouter Contract` and instance and it's method `exactInputSingle` and `exactOutputSingle` for swap the tokens these methods get the signer and also get these perams:
  1. tokenIn address that we will give
  2. tokenOut address that we want to buy
  3. liqudity fee
  4. recipient address that will receive that tokens
  5. deadline lime
  6. amountIn the amount of the tokenIn
  7. amountOutMinimum the minimum amount that we want to get
  8. sqrtPriceLimitX96


#### 2. collect pool fee: 
run `npx hardhat run --network localhost scripts/08_collectFee.js` in this script we use `Pool Contract` instance for getting the pool info and we use `NonfungiblePositionManager Contract` and use the `collect` method of this contract that will collect liqudity fee and this method get the signer and these perams:
  1. tokenId is the nft id that we get after providing the liqudity
  2. recipient is the address that will get the fee amount
  3. amount0Max is the max fee amount of token 0
  4. amount1Max is the max fee amount of token 1




## 11. create an other pool and swap using multihope:

#### 1. deploy an other pool: 
 run `npx hardhat run --network localhost scripts/13_deployAndMintPoolPositionForWetWithUsdc.js` in this script we use `Usdt and WRAPPED_BITCOIN` contracts instance for giving the token approval to `v3 possition manager` and use `NonfungiblePositionManager` Contract's method `createAndInitializePoolIfNecessary` for creating the pool and this method get the signer and perametters that we methion in `create new pool` topic then use `Pool Contract` instance for getting the pool info and we will set the protocole fee using the `setFeeProtocol` method of this contract and we use `NonfungiblePositionManager Contract` and use the `mint` method of this contract that will mint the new possition and provide liquid and return the NFT according to our liqudity this `mint` method get the signer and get perams that we methion in `mint new possition and provide liqudity` topic.

 In this script we just do to setpes using 2 methods: 
 1. deployPool and it's just deploy the new pool
 2. mintNewPossition it's mint the new position and then provide liqudity 


#### 2. swap: 
run `npx hardhat run --network localhost scripts/14_multihopeSwapUsingExactInputAndOutput.js` in this script we do these tasks:
  1. **swap using exectInputSingle:** give the token 0 or 1 and get the token 1 or 0 according to the given tokens amount
  2. **swap using exectOutputSingle:**  give the token 0 or 1 and get the token 1 or 0 according to the output amount that we give
  3. **swap using exactInputMultiHope:** give the token 0 or 1 and get the token 1 or 0 according to the given tokens amount but it will find the right pool for that output token because in this case token 0 and token 1 don't have a direct pool
  4. **swap using exactOutputMultiHope:** give the token 0 or 1 and get the token 1 or 0 according to the output amount that we give but it will find the right pool for that output token because in this case token 0 and token 1 don't have a direct pool
  5. **set protocole fee using setFeeProtocol:** set the protocol fee in this newly created pool
  6. **collect protocole fee using collectProtocol:** collect protocol fee after some swaping

#### 3. collect protocol fee: 
in previos script `14_multihopeSwapUsingExactInputAndOutput.js` we set the protocol fee using `setFeeProtocol` method of poolContract and we can get the protocole fee using the `collectProtocol` method of thet particular poolContract.



## 12. fetch uniswapV3 pools data using GraphQL:
run `npx hardhat run fetch-uniswapV3-pools.js` in this script we simpaly use GraphQL API for getting uniswap pools.



## 13. fork mainnet or goerli and swap on existing pool:
run `npx hardhat run fork-mainnet-pools.js` in this script we fork the live network and use the existing contracts addresses and existing tokens and then swap these tokens using that existing contracts and we mint a new possition in that existing poos and provide the liqudity.

We run the fork node using `npx hardhat node --fork https://eth-goerli.g.alchemy.com/v2/Pk45XQqmiWuKjwka4DYOOxeE4Ia8Wtix --fork-block-number 8374286` and use `wethContract` which availabel in this fork network then give the weth and get the `DAI` using the `exectInputSingle` method and then mint new possition and provide the liqudity using `mintNewPossition` method.



## 14. flashSwap:
run `npx hardhat run --network localhost scripts/17_FlashSwap.js` in this script we deploy `FlashSwap` contract and pass `SWAP_ROUTER_ADDRESS`, `FACTORY_ADDRESS`, `WETH_ADDRESS` to the constructor. After that we call `initFlash` function and pass the require params then it will get the loan from one pool and use it on other pool then return that loan in same transaction to the previous pool.

NOTE: `FlashSwap` will use the `flash` methor of that pool for getting the loan. 


# Some features or functions:
  1. **deployNewPool:** NonfungiblePositionManagerContract.createAndInitializePoolIfNecessary()
  2. **verifyPool:** FactoryContract.getPool()
  3. **mintNewPossition:** NonfungiblePositionManagerContract.mint()
  4. **increaseLiqudity:** NonfungiblePositionManagerContract.increaseLiquidity()
  5. **decreaseLiqudity:** NonfungiblePositionManagerContract.decreaseLiquidity()
  6. **burnPossition:** NonfungiblePositionManagerContract.burn()
  7. **getPoolData:** PoolContract. (token0, token1, tickSpacing, fee, liquidity, slot0)
  8. **collectPoolFee:** NonfungiblePositionManagerContract.collect()
  9. **setProtocolFee:** PoolContract.setFeeProtocol()
  10. **getProtocolFee:** PoolContract.protocolFees()
  11. **collectProtocolFee:** PoolContract.collectProtocol()
  12. **getNftTokenData:** NonfungiblePositionManagerContract.positions()
  13. **swapUsingExactInputSingle:** SwapRouterContract.exactInputSingle()
  14. **swapUsingExactOutputSingle:** SwapRouterContract.exactOutputSingle()
  15. **swapUsingExactInputSingle:** SwapRouterContract.exactInput()
  16. **swapUsingExactInputSingle:** SwapRouterContract.exactOutput() 
  17. **flashSwap:** FlashSwap.initFlash() 
  



