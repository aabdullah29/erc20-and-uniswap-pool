
## code structure:
1. create new and empty hardhat project `npx hardhat`
2. set configuration in `hardhat.config.js` file
3. create two erc20 contracts using openzeppelin in `contracts` folder
4. write deploy scripts for both in `scripts` folder
5. write ALCHEMY_API and PRIVATE_KEY in `.env` file
6. deploy contracts using deploy scripts
7. create script for uniswap pool in `createUniswapPool.js` file

8. create uniswap v2 pool
9. migerate uniswap v3 to v3



## start project:

`npx hardhat`
`npx hardhat compile`

## deploy contract:

`npx hardhat run scripts/deployABToken1.js --network goerli`
`npx hardhat run scripts/deployABToken2.js --network goerli`



## verify contract:
`npx hardhat compile --force`
`npx hardhat verify --contract contracts/ABToken1.sol:ABToken1  0x516538D612a292C55042F340186ffF4AF3bDeba3 --network goerli`
`npx hardhat verify --contract contracts/ABToken2.sol:ABToken2  0x6fa292Ac5f300c84e007873bBaa052570b5390C4 --network goerli`

`npx hardhat verify --network goerli 0x516538D612a292C55042F340186ffF4AF3bDeba3`
`npx hardhat verify --network goerli 0x6fa292Ac5f300c84e007873bBaa052570b5390C4`

- AB Token 1 is deployed at:  0x516538D612a292C55042F340186ffF4AF3bDeba3
- AB Token 2 is deployed at:  0x6fa292Ac5f300c84e007873bBaa052570b5390C4


## uniswap:
`UNISWAP_V3_FACTORY_ADDRESS = '0x1F98431c8aD98523631AE4a59f267346ea31F984'`




