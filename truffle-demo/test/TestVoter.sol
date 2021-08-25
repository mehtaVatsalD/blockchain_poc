// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "truffle/Assert.sol";
import "../contracts/Voting.sol";

contract TestVoting {
    function testVoteForAnOption() public{
        Voting voting = new Voting();
        voting.addVotingOption("feku");
        voting.addVotingOption("pappu");
        voting.addVotingOption("khasu");
        voting.startVoting();

        voting.vote("khasu");

        uint[] memory votes = voting.getVoteCount();
        uint[] memory expected = new uint[](3);
        expected[0] = 0;
        expected[1] = 0;
        expected[2] = 1;
        Assert.equal(votes, expected, "Khasu's vote didn't increase.");
    }
}