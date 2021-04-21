// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract MultiSigWallet{
    
    address payable owner;
    address payable toSendFundsTo;
    address[] approvers;
    
    mapping(address => bool) validApproverMapping;
    mapping(address => bool) hasApproverApprovedFundTransfer;
    
    uint minRequiredApprovers;
    uint approvalsObtained;
    
    constructor(address[] memory _approvers, address payable _toSendFundsTo, uint _minRequiredApprovers) payable {
        require(_approvers.length >= _minRequiredApprovers, "Less approvers provided than minimum required.");
        owner = payable(msg.sender);
        approvers = _approvers;
        toSendFundsTo = _toSendFundsTo;
        minRequiredApprovers = _minRequiredApprovers;
        
        for(uint i=0; i<approvers.length; i++) {
            validApproverMapping[approvers[i]] = true;
        }
        
    }
    
    function approve() external {
        address sender = msg.sender;
        require(validApproverMapping[sender], "Not a valid approver.");
        require(!hasApproverApprovedFundTransfer[sender], "Already approved by approver");
        hasApproverApprovedFundTransfer[sender] = true;
        approvalsObtained++;
        
        if(approvalsObtained == minRequiredApprovers){
            toSendFundsTo.transfer(address(this).balance);
            selfdestruct(owner);
        }
    }
    
    function reject() external {
        address sender = msg.sender;
        require(validApproverMapping[sender], "Not a valid approver.");
        selfdestruct(owner);
    }
    
    function getBalance() external view returns (uint){
        return address(this).balance;
    }
    
    function getApprovalsObtainedNumber() external view returns(uint) {
        return approvalsObtained;
    }
    
    function modifyApprovers(address[] memory _approvers, uint _minRequiredApprovers) external {
        require(_approvers.length >= _minRequiredApprovers, "Less approvers provided than minimum required.");
        require(msg.sender == owner, "Not Authorized to change approvers! Only contract owner can do that.");
        for(uint i=0; i<approvers.length; i++){
            hasApproverApprovedFundTransfer[approvers[i]] = false;
        }
        approvalsObtained = 0;
        minRequiredApprovers = _minRequiredApprovers;
        approvers = _approvers;
        for(uint i=0; i<approvers.length; i++) {
            validApproverMapping[approvers[i]] = true;
        }
    }
    
    function modifyBeneficiary(address payable _toSendFundsTo) external {
        require(msg.sender == owner, "Not Authorized to change approvers! Only contract owner can do that.");
        toSendFundsTo = _toSendFundsTo;
        for(uint i=0; i<approvers.length; i++){
            hasApproverApprovedFundTransfer[approvers[i]] = false;
        }
        approvalsObtained = 0;
    }
    
    
    
}
