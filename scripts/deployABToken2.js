
// npx hardhat run scripts/deployABToken2.js --network goerli
// AB Token 2 is deployed at:  0x6fa292Ac5f300c84e007873bBaa052570b5390C4

async function main() {
    const [deployer] = await ethers.getSigners();

    const ABT2 = await ethers.getContractFactory("ABToken2", deployer); 
    const abt2 = await ABT2.deploy();
    console.log("AB Token 2 is deployed at: ", abt2.address);
}

main()
    .then(
        () => process.exit(0)
    )
    .catch(
        (error) => {
            console.log(error);
            process.exit(1);
        }
    );