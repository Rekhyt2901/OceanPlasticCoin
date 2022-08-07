// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.15;
import "./AlexCoin.sol";

contract AlexCoinSale {
    address admin;
    uint256 public tokenPrice;
    AlexCoin public coinContract;
    uint256 public tokensSold;
    bool public open;

    event Sell(address _buyer, uint256 _amount, uint256 _price);

    constructor(uint256 _tokenPrice, AlexCoin _coinContract) {
        admin = msg.sender;
        tokenPrice = _tokenPrice;
        coinContract = _coinContract;
        tokensSold = 0;
        open = true;
    }

    function buyTokens(uint256 _amount) public payable{
        require(open, "Sale is not open anymore");
        require(msg.value == _amount * tokenPrice, "not correct value sent");
        require((coinContract.balanceOf(address(this))) >= _amount, "not enough tokens left for sale");
        require(coinContract.transfer(msg.sender, _amount), "Transfer was not successful");
        tokensSold += _amount;
        emit Sell(msg.sender, _amount, tokenPrice);
    }

    function endSale() public {
        require(msg.sender == admin);
        require(coinContract.transfer(admin, coinContract.balanceOf(address(this))));
        open = false;
    }
}