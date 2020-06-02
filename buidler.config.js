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
    version: "0.6.8",
  },
  networks: {
    localhost: {
      url: 'http://localhost:8545',
      accounts: {
        0: "0x91938cb45eb51f9480246b3c88d82ff6a830f3328d3237997d8bb0210c07cb24",
        mnemonic: "rent where reveal first bunker hazard among strong idea risk life left"
      }
    }
  }
};
