const { OpenSeaSDK, Network } =  require('opensea-js');
(async ()=>{
    const Web3 = require('web3');
    // const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
    const web3 = new Web3(new Web3.providers.HttpProvider('https://eth-goerli.g.alchemy.com/v2/[API_KEY]'))
    web3.eth.getBlockNumber().then((result) => {
        console.log("Latest Ethereum Block is ",result);
      });
      const privateKey = '5.....................................................e';
      const account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
      web3.eth.accounts.wallet.add(account);
      web3.eth.defaultAccount = account.address;
      console.log(web3.eth.defaultAccount);
      const openseaSDK = new OpenSeaSDK(web3, {
        networkName: Network.Goerli,
        apiKey: "902095ff636b442b83d9dc83f9d0c83c"
      })
    // // Get address
    // const accounts = await web3.eth.getAccounts()
    // console.dir(accounts)
    // // get balance
    // const balance = await web3.eth.getBalance(accounts[0])
    // console.log(`balance : ${balance}`)
})()
