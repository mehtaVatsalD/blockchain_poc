// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract payments{
    
    address payable owner;
    
    constructor(){
        owner = payable(msg.sender);
    }
    
    function getBalance() external view returns (uint){
        return address(this).balance;
    }
    
    function receiveFunds() external payable {
        require(msg.value > 0);
        //no need for below line to receive funds in this contract
        // payable(this).transfer(msg.value);
    }
    
    function sendFunds(uint amountInEther) external payable {
        payable(0xfA1b227a94AB9FBfD3bf4F88B1B247A3A5eA1620).transfer(amountInEther * (10 ** 18));
    }
    
    function getBalanceBackAndDestroy() external{
        owner.transfer(address(this).balance);
        selfdestruct(owner);
    }
    
    receive () external payable {}
    
}
