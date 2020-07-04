# Gitcoin Personal Tokens Contracts

Smart contracts for Gitcoin personal token functionality

## Deployed Contracts

The current personal token factory contracts are deployed on Rinkeby and Mainnet at the addresses below.

- Rinkeby: [0x80D50970599E33d0D5D436A649C25b729666A015](https://rinkeby.etherscan.io/address/0x80D50970599E33d0D5D436A649C25b729666A015)
- Mainnet: TBD

## Development

1. Install dependencies with `yarn`
2. Run tests with `npm test`

## Deployment

To deploy a new factory contract:

1. Create a file called `.env` with the following contents:
   ```bash
   INFURA_ID=yourInfuraId
   MNEMONIC_RINKEBY="your mnemonic for development"
   MNEMONIC_MAINNET="your mnemonic for production"
   ```
2. Open `buidler.config.js` and configure the object for the network you want to deploy to
   1. If you want to change the gas price, derivation path, or other paramters, see the [Buidler docs](https://buidler.dev/config/#networks-configuration) for details
3. Run `npm run deploy-dev` or `npm run deploy-prod` to compile and deploy the contracts to the desired network
4. Once deployment is complete, be sure to update this README with the new deployment address, and verify the contract on Etherscan
