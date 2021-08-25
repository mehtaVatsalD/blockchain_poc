//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "./libraries/utils/ConversionUtils.sol";

abstract contract AbstractCrowdFunding {

    using ConversionUtils for uint;

    event FundingEvent (
        address indexed fundingParty,
        uint amountInWei
    );

    event StateChangeEvent (
        CrowdFundingState oldState,
        CrowdFundingState newState
    );

    enum CrowdFundingState {
        ONGOING,
        SUCCEEDED,
        PAID,
        FAILED,
        ROLLBACKED
    }

    address public contractOwner;
    string public crowdFundingName;
    uint public deadlineTime;
    uint public targetAmountInWei;
    address public beneficiary;
    CrowdFundingState public crowdFundingState;

    mapping(address => uint) public accountContribution;
    address[] private contributors;
    uint public totalFundingCollected;
    bool public targetAchieved;

    constructor (
        string memory _crowdFundingName,
        uint _fundingTimeInMinutes,
        uint _targetAmountInEthers,
        address _beneficiary
    ) {
        contractOwner = msg.sender;
        crowdFundingName = _crowdFundingName;
        deadlineTime = getCurrentTime() + _fundingTimeInMinutes.getSecondsFromMinutes(1);
        targetAmountInWei = _targetAmountInEthers.getWiesFromEthers(1);
        beneficiary = _beneficiary;
        crowdFundingState = CrowdFundingState.ONGOING;
    }

    modifier crowdFundingInState(CrowdFundingState crowdFundingStateRequired) {
        require(crowdFundingStateRequired == crowdFundingState, 'Crowd funding not in expected state.');
        _;
    }

    function contributeForFunding() external payable crowdFundingInState(CrowdFundingState.ONGOING) {
        require(beforeDeadline(), 'Cannot contribute after deadline.');

        require(msg.value > 0, 'It would be good if we can get more than 0 funding!');

        if(accountContribution[msg.sender] == 0) {
            contributors.push(msg.sender);
        }

        accountContribution[msg.sender] += msg.value;
        emit FundingEvent(msg.sender, msg.value);

        if(totalFundingCollected >= targetAmountInWei) {
            targetAchieved = true;
        }
    }

    function finishCrowdFunding() external crowdFundingInState(CrowdFundingState.ONGOING) {
        // require(!beforeDeadline(), 'Cannot complete crowd funding before deadline.');
        require(msg.sender == contractOwner, "Only campaign creater can finsh crowd funding.");
        if (targetAchieved) {
            emit StateChangeEvent(crowdFundingState, CrowdFundingState.SUCCEEDED);
            crowdFundingState = CrowdFundingState.SUCCEEDED;
            payToBeneficiary();
        }
        else {
            emit StateChangeEvent(crowdFundingState, CrowdFundingState.FAILED);
            crowdFundingState = CrowdFundingState.FAILED;
            rollBackFundsToContributors();
        }
    }

    function payToBeneficiary() public payable crowdFundingInState(CrowdFundingState.SUCCEEDED) {
        emit StateChangeEvent(crowdFundingState, CrowdFundingState.PAID);
        crowdFundingState = CrowdFundingState.PAID;
        bool sent = payable(beneficiary).send(totalFundingCollected);
        if(!sent) {
            emit StateChangeEvent(crowdFundingState, CrowdFundingState.FAILED);
            crowdFundingState = CrowdFundingState.FAILED;
            rollBackFundsToContributors();
        }
    }

    function rollBackFundsToContributors() public payable crowdFundingInState(CrowdFundingState.FAILED){
        emit StateChangeEvent(crowdFundingState, CrowdFundingState.ROLLBACKED);
        crowdFundingState = CrowdFundingState.ROLLBACKED;
        bool sent;
        for(uint i=0; i<contributors.length; i++) {
            sent = payable(contributors[i]).send(accountContribution[contributors[i]]);
            if(!sent) {
                crowdFundingState = CrowdFundingState.FAILED;
                revert();
            }
        }
    }

    function beforeDeadline() private view returns (bool) {
        if(getCurrentTime() < deadlineTime) {
            return true;
        }
        return false;
    }

    function getCurrentTime() internal view virtual returns (uint);

}