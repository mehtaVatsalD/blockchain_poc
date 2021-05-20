// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// pragma experimental ABIEncoderV2;
//not to use this as in web3.js and geth it might not work properly!

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
    bool votingStarted = false;

    function addVotingOption(string calldata optionToAdd) external {
        require(!votingStarted, 'Voting has already started. Cannot add option now!');
        options.push(optionToAdd);
    }

    function startVoting() external{
        require(!votingStarted, 'Voting has already started. Cannot start again!');
        votingStarted = true;

        voteCount = new uint[](options.length);
        
        for(uint i=0; i<options.length; i++) {
            validOptionsMapping[options[i]] = ValidOption({
                optionIndex: i,
                optionName: options[i],
                isValidOption: true
            });
        }
    }
    
    function vote(int optionIndex) internal {
        require(votingStarted);
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
        require(votingStarted);
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
