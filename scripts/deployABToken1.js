
// npx hardhat run scripts/deployABToken1.js --network goerli
// AB Token 1 is deployed at:  0x516538D612a292C55042F340186ffF4AF3bDeba3

async function main() {
    const [deployer] = await ethers.getSigners();

    const ABT1 = await ethers.getContractFactory("ABToken1", deployer); 
    const abt1 = await ABT1.deploy();
    console.log("AB Token 1 is deployed at: ", abt1.address);
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

