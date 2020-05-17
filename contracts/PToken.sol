pragma solidity ^0.6.0;

import "@nomiclabs/buidler/console.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract PToken is ERC20, Ownable {
    using SafeMath for uint256;

    uint256 public cost;

    event Initialized(PToken token, address owner, uint256 cost, uint256 supply);

    event Purchased(PToken token, address buyer, uint256 amountPaid, uint256 amountReceived);

    event Redeemed(PToken token, address seller, uint256 amountRedeemed);

    event CostUpdated(PToken token, address owner, uint256 newCost);

    event Minted(PToken token, address owner, uint256 amountMinted);

    event Burned(PToken token, address owner, uint256 amountBurned);

    constructor(string memory _name, string memory _symbol, uint256 _cost, uint256 _initialSupply) ERC20(_name, _symbol) public {
        cost = _cost;
        _mint(address(this), _initialSupply);

        emit Initialized(this, msg.sender, _cost, _initialSupply);
    }

    function purchase(uint256 _amount) public payable {
        require(msg.value == cost.mul(_amount.div(10**18)), "PToken: Incorrect value sent");

        address payable owner = payable(owner());
        owner.transfer(msg.value);
        this.transfer(msg.sender, _amount);

        emit Purchased(this, msg.sender, msg.value, _amount);
    }

    function redeem(uint256 _amount) public {
        transfer(address(this), _amount);

        emit Redeemed(this, msg.sender, _amount);
    }

    function updateCost(uint256 _newCost) public onlyOwner {
        cost = _newCost;

        emit CostUpdated(this, msg.sender, _newCost);
    }

    function mint(uint256 _amount) public onlyOwner {
        _mint(address(this), _amount);

        emit Minted(this, msg.sender, _amount);
    }

    function burn(uint256 _amount) public onlyOwner {
        _burn(address(this), _amount);

        emit Burned(this, msg.sender, _amount);
    }
}
