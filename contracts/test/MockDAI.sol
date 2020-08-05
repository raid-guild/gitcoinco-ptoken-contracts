pragma solidity ^0.6.0;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol";

contract MockDAI is ERC20UpgradeSafe {
    constructor() public {
      ERC20UpgradeSafe.__ERC20_init("MockDAI", "DAI");
    }

    function faucet() public {
      _mint(msg.sender, 10**18);
    }
}
