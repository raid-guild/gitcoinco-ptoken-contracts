// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.6.7;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";

contract PToken is ERC20UpgradeSafe, OwnableUpgradeSafe {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  IERC20 public acceptedToken; // ERC20 that is used for purchasing pToken
  uint256 public price; // The amount of aToken to purchase pToken

  event Initialized(address owner, uint256 price, uint256 supply);

  event Purchased(address buyer, uint256 cost, uint256 amountReceived);

  event Redeemed(address seller, uint256 amountRedeemed);

  event PriceUpdated(address owner, uint256 newPrice);

  event Minted(address owner, uint256 amountMinted);

  event Burned(address owner, uint256 amountBurned);

  function initializePtoken(
    string memory _name,
    string memory _symbol,
    uint256 _price,
    uint256 _initialSupply,
    address _acceptedERC20
  ) public initializer {
    __Ownable_init();
    __ERC20_init(_name, _symbol);
    acceptedToken = IERC20(_acceptedERC20);
    price = _price;
    _mint(address(this), _initialSupply);

    emit Initialized(msg.sender, _price, _initialSupply);
  }

  function purchase(uint256 _amount) public {
    uint256 _allowance = acceptedToken.allowance(msg.sender, address(this));
    uint256 _cost = price.mul(_amount).div(10**18);
    require(_allowance >= _cost, "PToken: Not enough token allowance");

    acceptedToken.safeTransferFrom(msg.sender, owner(), _cost);
    require(this.transfer(msg.sender, _amount), "PToken: Transfer during purchase failed");

    emit Purchased(msg.sender, _cost, _amount);
  }

  function redeem(uint256 _amount) public {
    require(transfer(address(this), _amount), "PToken: Transfer during redemption failed");

    emit Redeemed(msg.sender, _amount);
  }

  function updatePrice(uint256 _newPrice) public onlyOwner {
    price = _newPrice;

    emit PriceUpdated(msg.sender, _newPrice);
  }

  // Allow only the owner to mint to this pool and not to other accounts
  function mint(uint256 _amount) public onlyOwner {
    _mint(address(this), _amount);

    emit Minted(msg.sender, _amount);
  }

  // Allow only the owner to burn from this pool and not other accounts
  function burn(uint256 _amount) public onlyOwner {
    _burn(address(this), _amount);

    emit Burned(msg.sender, _amount);
  }
}
