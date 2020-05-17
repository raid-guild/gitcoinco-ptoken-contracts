pragma solidity ^0.6.0;

import "@nomiclabs/buidler/console.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract PToken is ERC20, ERC20Burnable, Ownable {
    using SafeMath for uint256;

    uint256 public cost;
    
    event Initialized(PToken token, uint256 cost, uint256 supply);
    
    event Purchased(PToken token, address buyer, uint256 amountPaid, uint256 amountReceived);
    
    event Redeemed(PToken token, address seller, uint256 amountRedeemed);
    
    event Burned(PToken token, address owner, uint256 amountBurned);
    
    constructor(string memory _name, string memory _symbol, uint256 _cost, uint256 _initialSupply) ERC20(_name, _symbol) public {
        cost = _cost;
        _mint(address(this), _initialSupply);
        
        emit Initialized(this, _cost, _initialSupply);
    }
    
    function purchase(uint256 amount) public payable {
        require(msg.value == cost.mul(amount.div(10**18)));

        address payable owner = payable(owner());
        owner.transfer(msg.value);
        this.transfer(msg.sender, amount);
        
        emit Purchased(this, msg.sender, msg.value, amount);
    }
    
    function redeem(uint256 amount) public {
        transfer(address(this), amount);
        
        emit Redeemed(this, msg.sender, amount);
    }
    
    function burn(uint256 amount) public virtual override onlyOwner {
        _burn(address(this), amount);
        
        emit Burned(this, msg.sender, amount);
    }
    
    function burnFrom(address account, uint256 amount) public virtual override onlyOwner {
        require(false, "PToken: burnFrom disabled");
    }
}
