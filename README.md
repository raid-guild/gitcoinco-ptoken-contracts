# Gitcoin Personal Tokens Contracts

Smart contracts for Gitcoin personal token functionality.

## Deployed Contracts

The current personal token factory contracts are deployed on Rinkeby at [0xa5c4Fab38a1Ad6847cEF558C112B536c0E3Cc6Ad](https://etherscan.io/address/0xa5c4Fab38a1Ad6847cEF558C112B536c0E3Cc6Ad)

## Development

1. Install dependencies with `yarn`
2. Run tests with `yarn test`

## Deployment

To deploy a new factory contract:

1. Create a file called `.env` with the following contents:
   ```bash
   INFURA_ID=yourInfuraId
   MNEMONIC_RINKEBY="your mnemonic for development"
   MNEMONIC_MAINNET="your mnemonic for production"
   ETHERSCAN_API_KEY=yourEtherscanApiKey
   ```
2. Open `hardhat.config.js` and configure the object for the network you want to deploy to
   1. If you want to change the gas price, derivation path, or other paramters, see the [Hardhat docs](https://hardhat.org/config/#networks-configuration) for details
3. Run `yarn run deploy-dev` or `yarn run deploy-prod` to compile and deploy the contracts to the desired network
4. Once deployment is complete, be sure to update this README with the new deployment address, and verify the contract on Etherscan
