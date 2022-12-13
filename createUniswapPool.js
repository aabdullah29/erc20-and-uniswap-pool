
const { ethers } = require('ethers');
const axios = require('axios');
require('dotenv').config();

// 
const UNISWAP_V3_FACTORY_ADDRESS = '0x1F98431c8aD98523631AE4a59f267346ea31F984';

const GOERLI_PROVIDER = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_URL_GOERLI);
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// deployed contract addresss
const ABT1 = '0x516538D612a292C55042F340186ffF4AF3bDeba3';
const ABT2 = '0x6fa292Ac5f300c84e007873bBaa052570b5390C4';

const wallet = new ethers.Wallet(PRIVATE_KEY);
const connectedWallet = wallet.connect(GOERLI_PROVIDER);


async function main() {

    const apiKey = process.env.ETHERSCAN_API_KEY;
    const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${UNISWAP_V3_FACTORY_ADDRESS}&apikey=${apiKey}`
    const res = await axios.get(url);
    const abi = JSON.parse(res.data.result); 
    // console.log("abi: ", abi);
    // console.log("GOERLI_PROVIDER: ", GOERLI_PROVIDER);

    const factoryContract = new ethers.Contract(
        UNISWAP_V3_FACTORY_ADDRESS,
        abi,
        GOERLI_PROVIDER
    );

    const tx = await factoryContract.connect(connectedWallet).createPool(
        ABT1,
        ABT2,
        500
    );

    const recepit = await tx.wait();
    console.log("recepit: ", recepit);

    const newPoolAddress = await factoryContract.getPool(
        ABT1,
        ABT2,
        500
    );

    console.log("newPoolAddress: ", newPoolAddress);

}


// (await main())();
main();
