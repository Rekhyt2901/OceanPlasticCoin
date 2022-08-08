// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.15;

contract AlexCoin {
    uint256 public totalSupply;
    string public name;
    string public symbol;
    string public standard;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint)) public allowance;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    constructor() {
        totalSupply = 100000000;
        name = "AlexCoin";
        symbol = "ALEX";
        standard = "Alex Coin v1.0";
        balanceOf[msg.sender] = totalSupply;

    }
    
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);
        require(_to != address(0));

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_to != address(0));
        require(allowance[_from][msg.sender] >= _value);
        require(balanceOf[_from] >= _value);

        allowance[_from][msg.sender] -= _value;
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(_from, _to, _value);
        emit Approval(_from, msg.sender, allowance[_from][msg.sender]);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        require(_spender != address(0));
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function increaseAllowance(address _spender, uint256 _addedValue) public returns (bool success) {
        require(_spender != address(0));
        allowance[msg.sender][_spender] += _addedValue;
        emit Approval(msg.sender, _spender, allowance[msg.sender][_spender]);
        return true;
    }

    function decreaseAllowance(address _spender, uint256 _subtractedValue) public returns (bool success) {
        require(_spender != address(0));
        require(allowance[msg.sender][_spender] >= _subtractedValue);
        allowance[msg.sender][_spender] -= _subtractedValue;
        emit Approval(msg.sender, _spender, allowance[msg.sender][_spender]);
        return true;
    }

    /* 
        NOT DONE
    function decimals() public view returns (uint8)

    function _transfer(address sender, address recipient,uint256 amount) internal returns (bool success)
    function _mint(address account, uint256 amount) internal returns (bool success)
    function _burn(address account, uint256 amount) internal returns (bool success)
    function _approve(address owner, address spender, uint256 amount) internal returns (bool success)
    function _burnFrom(address account, uint256 amount) internal returns (bool success)
    

        DONE
    function name() public view returns (string)
    function symbol() public view returns (string)
    function totalSupply() public view returns (uint256)
    function balanceOf(address _owner) public view returns (uint256 balance)
    function transfer(address _to, uint256 _value) public returns (bool success)
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success)
    function approve(address _spender, uint256 _value) public returns (bool success)
    function allowance(address _owner, address _spender) public view returns (uint256 remaining)

    event Transfer(address indexed _from, address indexed _to, uint256 _value)
    event Approval(address indexed _owner, address indexed _spender, uint256 _value)
    */


}