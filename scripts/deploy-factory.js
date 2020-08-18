// We require the Buidler Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
// When running the script with `buidler run <script>` you'll find the Buidler
// Runtime Environment's members available in the global scope.
const bre = require('@nomiclabs/buidler');

async function main() {
  // Buidler always runs the compile task when running scripts through it.
  // If this runs in a standalone fashion you may want to call compile manually
  // to make sure everything is compiled
  // await bre.run('compile');

  // We get the contract to deploy
  const PTokenFactoryFactory = await ethers.getContractFactory('PTokenFactory');
  const PTokenFactory = await PTokenFactoryFactory.deploy();
  await PTokenFactory.deployed();

  console.log('PTokenFactory deployed to:', PTokenFactory.address);

  if (bre.network.name === 'localhost') {
    const MockDAIFactory = await ethers.getContractFactory('MockDAI');
    const MockDAI = await MockDAIFactory.deploy();
    await MockDAI.deployed();
    console.log('MockDAI deployed to:', MockDAI.address);

    // Drip the owner one DAI
    await MockDAI.faucet();
    const owner = await new ethers.Wallet(bre.network.config.accounts[0]);
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
