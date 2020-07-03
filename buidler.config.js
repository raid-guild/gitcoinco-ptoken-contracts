require("dotenv").config();
usePlugin("@nomiclabs/buidler-waffle");

// This is a sample Buidler task. To learn how to create your own go to
// https://buidler.dev/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.getAddress());
  }
});

// You have to export an object to set up your config
// This object can have the following optional entries:
// defaultNetwork, networks, solc, and paths.
// Go to https://buidler.dev/config/ to learn more
module.exports = {
  // This is a sample solc configuration that specifies which version of solc to use
  solc: {
    version: "0.6.7",
  },
  networks: {
    localhost: {
      url: "http://localhost:8545",
      accounts: {
        mnemonic: process.env.MNEMONIC_RINKEBY,
      },
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_ID}`,
      chainId: 4,
      accounts: {
        mnemonic: process.env.MNEMONIC_RINKEBY,
      },
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_ID}`,
      chainId: 1,
      accounts: {
        mnemonic: process.env.MNEMONIC_MAINNET,
      },
    },
  },
};
