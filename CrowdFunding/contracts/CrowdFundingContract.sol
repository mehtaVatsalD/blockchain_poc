//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./AbstractCrowdFundingContract.sol";

contract CrowdFunding is AbstractCrowdFunding{

    constructor(
        string memory _crowdFundingName,
        uint _fundingTimeInMinutes,
        uint _targetAmountInEthers,
        address _beneficiary
    )
    AbstractCrowdFunding(
        _crowdFundingName,
        _fundingTimeInMinutes,
        _targetAmountInEthers,
        _beneficiary
    ) {}

    function getCurrentTime() internal view override returns (uint) {
        return block.timestamp;
    }

}