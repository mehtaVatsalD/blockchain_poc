// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

pragma experimental ABIEncoderV2;

contract Voting{
    
    struct ValidOption{
        uint optionIndex;
        string optionName;
        bool isValidOption;
    }
    
    string[] public options;
    uint[] public voteCount;
    mapping(address => bool) internal hasVoted;
    mapping(string => ValidOption) internal validOptionsMapping;
    
    constructor(string[] memory _options){
        options = _options;
        voteCount = new uint[](_options.length);
        
        for(uint i=0; i<_options.length; i++) {
            validOptionsMapping[_options[i]] = ValidOption({
                optionIndex: i,
                optionName: _options[i],
                isValidOption: true
            });
        }
    }
    
    function vote(int optionIndex) internal {
        address sender = msg.sender;
        bool senderHasVoted = hasVoted[sender];
        uint optionIndexUInt = uint(optionIndex);
        require(!senderHasVoted, "Voter has already voted.");
        require(optionIndex >= 0 && optionIndexUInt < options.length, "Invalid option index provided for voting.");
        uint oldVoteCount = voteCount[optionIndexUInt];
        voteCount[optionIndexUInt]++;
        hasVoted[sender] = true;
        assert(hasVoted[sender]);
        assert(voteCount[optionIndexUInt] - oldVoteCount == 1);
    }
    
    function vote(string calldata optionName) external {
        ValidOption memory validOption = validOptionsMapping[optionName];
        require(validOption.isValidOption, "Invalid option name provided for voting.");
        vote(int(validOption.optionIndex));
    }
    
    function getVoteCountForGivenOptionName(string calldata optionName) external view returns (uint){
        ValidOption memory validOption = validOptionsMapping[optionName];
        require(validOption.isValidOption, "Invalid option name provided for voting.");
        return voteCount[validOption.optionIndex];
        
    }
    
    function getOptions() external view returns (string[] memory){
        return options;
    }
    
    function getVoteCount() external view returns (uint[] memory) {
        return voteCount;
    }
    
}
