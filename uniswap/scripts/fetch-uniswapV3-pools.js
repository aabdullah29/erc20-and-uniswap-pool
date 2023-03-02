const axois = require("axios");
const URL = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";
query = `{
pools(orderBy : volumeUSD, orderDirection: desc , first :50){
id, volumeUSD, liquidity, feeTier, totalValueLockedUSD, token0{ id, symbol, name, decimals derivedETH }
token1{id, symbol, name, decimals derivedETH }
token0Price token1Price txCount }
}`;



const fetchPool = async () => {
  var { data } = await axois.post(URL, { query: query });
  var { data } = data;
  //console.log("data",data)
  for (let i = 0; i < data.pools.length; i++) {
    console.log(`\ncount ${i}`, data.pools[i]);
  }
  //return data
};
fetchPool();
