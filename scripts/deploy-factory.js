// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat');

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const PTokenFactoryFactory = await ethers.getContractFactory('PTokenFactory');
  const PTokenFactory = await PTokenFactoryFactory.deploy();
  await PTokenFactory.deployed();

  console.log('PTokenFactory deployed to:', PTokenFactory.address);

  if (hre.network.name === 'hardhat') {
    const MockDAIFactory = await ethers.getContractFactory('MockDAI');
    const MockDAI = await MockDAIFactory.deploy();
    await MockDAI.deployed();
    console.log('MockDAI deployed to:', MockDAI.address);

    // Drip the owner one DAI
    await MockDAI.faucet();
    const owner = await new ethers.Wallet(hre.network.config.accounts[0]);
    const balance = await MockDAI.balanceOf(owner.address);
    console.log("Owner's MockDAI balance:", ethers.utils.formatEther(balance));
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
