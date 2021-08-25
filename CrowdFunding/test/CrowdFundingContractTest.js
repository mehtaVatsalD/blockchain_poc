const CrowdFundingContract = artifacts.require('TestCrowdFunding');

contract('Testing CrowFundingContract', async function(accounts) { 
    
    const ONE_ETHER = 1000000000000000000;

    const ONGOING = 0;
    const SUCCEEDED = 1;
    const PAID = 2;
    const FAILED = 3;
    const ROLLBACKED = 4;

    const stateMap = {
        0: "ONGOING",
        1: "SUCCEEDED",
        2: "PAID",
        3: "FAILED",
        4: "ROLLBACKED",
    };


    let contractInstance;
    let contractOwner;
    let beneficiary;
    let fundingPerson1;

    beforeEach(async () => {
        contractOwner = accounts[0];
        beneficiary = accounts[1];
        fundingPerson1 = accounts[2];
        fundingPerson2 = accounts[3];
        contractInstance = await CrowdFundingContract.new(
            'Blockchain startup crowd funding',
            60,
            3,
            beneficiary,
            {
                from: contractOwner
            }
        );

        contractInstance.StateChangeEvent(async (error, event) => {
            if(error) {
                console.log(error);
                return;
            }
            const oldStateKey = event.args.oldState;
            const newStateKey = event.args.newState;
            console.log("State change: " + stateMap[oldStateKey] + " --> " +  stateMap[newStateKey]);
        })
    });

    it('Testing constructor is working correctly', async () => {
        let crowdFundingName = await contractInstance.crowdFundingName();
        expect(crowdFundingName).to.equals('Blockchain startup crowd funding');

        let targetAmountInWei = await contractInstance.targetAmountInWei();
        expect(targetAmountInWei.toString()).to.deep.equals((3*ONE_ETHER).toString());

        let beneficiaryInContract = await contractInstance.beneficiary();
        expect(beneficiaryInContract).to.equals(beneficiary);

        let crowdFundingState = await contractInstance.crowdFundingState();
        expect(crowdFundingState.valueOf().toNumber()).to.equals(ONGOING);

        let deadline = await contractInstance.deadlineTime();
        expect(deadline.toNumber()).to.equals(60*60);

    });

    it('Contributing to crowd funding', async () => {
        await contractInstance.contributeForFunding({
            from: contractOwner,
            value: 0.2*ONE_ETHER
        });
        await checkForAccountContribution(contractOwner, 0.2, 0.2, false);

        await contractInstance.contributeForFunding({
            from: fundingPerson1,
            value: 0.5*ONE_ETHER
        });
        await checkForAccountContribution(fundingPerson1, 0.5, 0.7, false);

        await contractInstance.contributeForFunding({
            from: fundingPerson1,
            value: 0.3*ONE_ETHER
        });
        await checkForAccountContribution(fundingPerson1, 0.8, 1.0, false);

        await contractInstance.contributeForFunding({
            from: fundingPerson2,
            value: 2.5*ONE_ETHER
        });
        await checkForAccountContribution(fundingPerson2, 2.5, 3.5, true);
    });

    it('Cannot contribute after deadline', async () => {
        await contractInstance.setTime(3602);
        try {
            await contractInstance.contributeForFunding({
               from: fundingPerson2,
               value: 0.1*ONE_ETHER
            });
            expect.fail();
        }
        catch (error) {
            expect(error.reason).to.equals("Cannot contribute after deadline.");
        }
    });

    it('Cannot complete crowd funding before deadline', async () => {
        try {
            await contractInstance.finishCrowdFunding();
            expect.fail();
        }
        catch(error) {
            expect(error.reason).to.equals("Cannot complete crowd funding before deadline.");
        }
    });

    it('Checking for successful funding to beneficiary', async () => {
        let fundingBalance = await getBalanceInEthers(fundingPerson1);
        let beneficiaryBalance = await getBalanceInEthers(beneficiary);
        let gasAmount = await contributeAndGetGasUsed(fundingPerson1, 3);

        let newFundingBalance = await getBalanceInEthers(fundingPerson1);
        expect(newFundingBalance + gasAmount).to.be.closeTo(fundingBalance - 3, 0.0001);

        await contractInstance.setTime(3602);
        await contractInstance.finishCrowdFunding();
        let crowdFundingState = await contractInstance.crowdFundingState({
            from: contractOwner
        });
        expect(crowdFundingState.valueOf().toNumber()).to.equals(PAID);

        let newBeneficiaryBalance = await getBalanceInEthers(beneficiary); 
        expect(newBeneficiaryBalance.toString()).to.equals((beneficiaryBalance + 3).toString());
        

    });

    it('Checking for rollback funds back to funding parties', async () => {
        let fundingBalance1 = await getBalanceInEthers(fundingPerson1);
        let fundingBalance2 = await getBalanceInEthers(fundingPerson2);
        let beneficiaryBalance = await getBalanceInEthers(beneficiary);

        let gasAmountPerson1 = await contributeAndGetGasUsed(fundingPerson1, 1);
        let gasAmountPerson2 = await contributeAndGetGasUsed(fundingPerson2, 1);
        

        let newFundingBalance1 = await getBalanceInEthers(fundingPerson1);
        let newFundingBalance2 = await getBalanceInEthers(fundingPerson2);
        expect(newFundingBalance1 + gasAmountPerson1).to.be.closeTo(fundingBalance1 - 1, 0.0001);
        expect(newFundingBalance2 + gasAmountPerson2).to.be.closeTo(fundingBalance2 - 1, 0.0001);        

        await contractInstance.setTime(3602);
        await contractInstance.finishCrowdFunding({
            from: contractOwner
        });

        let crowdFundingState = await contractInstance.crowdFundingState();
        expect(crowdFundingState.valueOf().toNumber()).to.equals(ROLLBACKED);

        let newBeneficiaryBalance = await getBalanceInEthers(beneficiary);
        expect(newBeneficiaryBalance).to.be.closeTo(beneficiaryBalance, 0.0001);

        newFundingBalance1 = await getBalanceInEthers(fundingPerson1);
        newFundingBalance2 = await getBalanceInEthers(fundingPerson2);
        expect(newFundingBalance1 + gasAmountPerson1).to.be.closeTo(fundingBalance1, 0.0001);
        expect(newFundingBalance2 + gasAmountPerson2).to.be.closeTo(fundingBalance2, 0.0001);        
        
    });

    it('check Funding event is emmited', async ()=> {
        contractInstance.FundingEvent(
            async (error, event) => {
                console.log("Got funding event.")
                expect(event.args.fundingParty).to.equals(fundingPerson1);
                expect(event.args.amountInEthers.toString()).to.equals((0.2*ONE_ETHER).toString());
            }
        );
        let receipt = await contractInstance.contributeForFunding({
            from: fundingPerson1,
            value: 0.2*ONE_ETHER
        });
        let count = 0;
        const logsArr = receipt.receipt.logs;
        let fundinEventLog;
        for(let i = 0; i<logsArr.length; i++) {
            if(logsArr[i].event == 'FundingEvent') {
                count++;
                fundinEventLog = logsArr[i];
            }
        }
        //only one event emmitted 
        expect(count).to.equals(1);
        expect(fundinEventLog.args.fundingParty).to.equals(fundingPerson1);
        expect(fundinEventLog.args.amountInEthers.toString()).to.equals((0.2*ONE_ETHER).toString());



    });

    async function checkForAccountContribution(account, accountContribution, totalContribution, targetAchieved) {
        let contributionDone = await contractInstance.accountContribution(account);
        expect(contributionDone.toString()).to.equals((accountContribution*ONE_ETHER).toString());

        let totalContributionDone = await contractInstance.totalFundingCollected();
        expect(totalContributionDone.toString()).to.equals((totalContribution*ONE_ETHER).toString());

        let isTargetAchieved = await contractInstance.targetAchieved();
        expect(isTargetAchieved).to.equals(targetAchieved);
    }

    async function contributeAndGetGasUsed(account, ethers) {
        let receipt = await contractInstance.contributeForFunding({
            from: account,
            value: ethers*ONE_ETHER
        });
        let gasUsed = receipt.receipt.gasUsed;

        const tx = await web3.eth.getTransaction(receipt.tx);
        const gasPrice = tx.gasPrice;

        return Number(((gasPrice*gasUsed)/ONE_ETHER).toFixed(6));
    }

    async function getBalanceInEthers(account) {
        let balance = Number(await web3.eth.getBalance(account));
        return Number((balance/ONE_ETHER).toFixed(6));
    }
    

});

