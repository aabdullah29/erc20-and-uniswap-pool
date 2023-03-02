


async function getApi() {
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=tether%2Cunagii-usd-coin%2Ctether-usd-celer%2Cbinance-wrapped-btc%2Cuniswap%2Cmatic%2C1inch%2Csolana&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true&precision=4");

    var data = await response.json()
    //console.log(data)
    return data;
}

async function main(){
    let val = await getApi();
    let {uniswap, tether} = val;
    console.log("here--------",uniswap.usd, "HERE", tether.usd)

}



main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
   