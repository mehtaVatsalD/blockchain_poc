import { Component } from "react";
import { Table, TableBody } from "semantic-ui-react";
import { Button, Form, Header } from "semantic-ui-react";
import contractInstanceFetcherMethod from "../ethereum/crowdfundingContract";
import getUserAddressToUse from "../ethereum/userAddress";
import web3 from "../ethereum/web3";
import history from "../history";

const ONGOING = 0;
const SUCCEEDED = 1;
const PAID = 2;
const FAILED = 3;
const ROLLBACKED = 4;

const ONE_ETHER = 1000000000000000000;

const contractStateMap = {
    0: "ONGOING",
    1: "SUCCEEDED",
    2: "PAID",
    3: "FAILED",
    4: "ROLLBACKED",
}

class Campaigns extends Component {


    constructor(props) {
        super(props);
        this.state = {
            currentCampaign: {
                name: "N/A",
                targetAmount: 0,
                totalCollected: 0,
                campaignFinished: false,
                deadline: new Date(0),
                isBeneficiary: false,
                state: -1
            },
            yourContributionTillNow: 0,
            contractAddress: props.match.params.address,
            amountToContribute: "2"
        }

        this.getCurentCampaign = this.getCurentCampaign.bind(this);
        this.onContribute = this.onContribute.bind(this);
        this.onFinishCampaign = this.onFinishCampaign.bind(this);
        
    }

    getCurentCampaign = async (instance) => {
        const campainName = await instance.methods.crowdFundingName().call();
        const crowdFundingState = await instance.methods.crowdFundingState().call();
        const deadlineTime = await instance.methods.deadlineTime().call();
        const deadline = new Date(deadlineTime*1000);
        const campaignFinished = new Date() > deadline;
        const totalFundingCollected = await instance.methods.totalFundingCollected().call();
        const targetAmountInWei = await instance.methods.targetAmountInWei().call();
        const beneficiary = await instance.methods.beneficiary().call();
        const userAddress = await getUserAddressToUse();
        const contractOwner = await instance.methods.contractOwner().call();
        return {
            name: campainName,
            targetAmount: targetAmountInWei/ONE_ETHER,
            totalCollected: totalFundingCollected/ONE_ETHER,
            campaignFinished: campaignFinished,
            deadline: deadline,
            isBeneficiary: beneficiary.toLowerCase() === userAddress[0].toLowerCase(),
            state: crowdFundingState,
            userAddress: userAddress[0],
            contractOwner: contractOwner
        }
    }

    subscribeToStateChangeEvent(instance) {
        instance.events.StateChangeEvent({
            from: "latest"
        }, 
        (error, result) => {
            console.log(result);
            console.log(error);
        });
    }

    subscribeToFundingEvent(instance) {
        instance.events.FundingEvent({
            from: "latest"
        }, 
        (error, result) => {
            console.log(result);
            console.log(error);
        });
    }

    async componentDidMount() {
        let instance;
        try {
            instance = contractInstanceFetcherMethod(this.state.contractAddress);
            console.log(instance);
        }
        catch (error) {
            history.push("/");
            return;
        }
        if(instance === undefined) {
            history.push("/");
            return;
        }
        const currentCampaign = await this.getCurentCampaign(instance);
        const yourContributionTillNow = await instance.methods.accountContribution(currentCampaign.userAddress).call();
        this.setState({
            currentCampaign: currentCampaign,
            contractInstance: instance,
            yourContributionTillNow: yourContributionTillNow/ONE_ETHER
        });
        this.subscribeToFundingEvent(instance);
        this.subscribeToStateChangeEvent(instance);
    }

    onContribute = async () => {
        const instance = this.state.contractInstance;
        const userAddress = this.state.currentCampaign.userAddress;
        console.log(this.state.amountToContribute);
        const amountInWei = await web3.utils.toWei(
            this.state.amountToContribute,
            "ether"
        );
        await instance.methods.contributeForFunding().send({
            from: userAddress,
            value: amountInWei
        });

        const currentCampaign = await this.getCurentCampaign(instance);
        const yourContributionTillNow = await instance.methods.accountContribution(currentCampaign.userAddress).call();
        this.setState({
            currentCampaign: currentCampaign,
            yourContributionTillNow: yourContributionTillNow/ONE_ETHER
        });
    }

    onFinishCampaign = async () => {
        const instance = this.state.contractInstance;
        const userAddress = this.state.currentCampaign.userAddress;
        await instance.methods.finishCrowdFunding().send({
            from: userAddress
        });
        const currentCampaign = await this.getCurentCampaign(instance);
        const yourContributionTillNow = await instance.methods.accountContribution(currentCampaign.userAddress).call();
        this.setState({
            currentCampaign: currentCampaign,
            yourContributionTillNow: yourContributionTillNow/ONE_ETHER
        });
    }

    

    render() {

        const getFinishCrowdFundingForm = () => {
            if(
                // this.state.currentCampaign.campaignFinished && 
                this.state.currentCampaign.userAddress === this.state.currentCampaign.contractOwner
            ) {
                if(this.state.currentCampaign.state == ONGOING) {
                    return (
                        <div style={{marginTop: 20}}>
                            <Header as='h1'>Want to finish campaign?</Header>
    
                            <Form>
                                <Button
                                    type="submit"
                                    onClick={this.onFinishCampaign}
                                >
                                    Finish Campaign
                                </Button>
                            </Form>
    
                        </div>
                    );
                }
                return (
                    <div style={{marginTop: 20}}>
                        <Header as='h1'>Deadline is over. Want to finish campaign?</Header>
                        <h4>Campaign is finished!</h4>
                    </div>
                );
                
            }
        }

        const getContributionForm = (isCampaignFinished) => {
            if(!isCampaignFinished) {
                return (
                    <div>
                        <Header as='h1'>Want to contribute?</Header>

                        <Form>
                            <Form.Input
                                label="Contribution Amount"
                                type="number"
                                value={this.state.amountToContribute}
                                onChange={(e) => {
                                    this.setState({
                                        amountToContribute: e.target.value
                                    })
                                }}
                            />
                            <Button
                                type="submit"
                                onClick={this.onContribute}
                            >
                                Contribute
                            </Button>
                        </Form>
                    </div>
                );
            }
            else {
                return (
                    <div>
                        <Header as='h1'>Want to contribute?</Header>
                        <h4>Campaign is finished. You cannot contribute now!</h4>
                    </div>
                )
            }
            
        }

        return (
            <div>
                <Table celled padded color="blue" striped>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Name</Table.HeaderCell>
                            <Table.HeaderCell>Value</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <TableBody>
                        <Table.Row>
                            <Table.Cell>
                                Campaign name
                            </Table.Cell>
                            <Table.Cell>
                                {this.state.currentCampaign.name
                                }
                            </Table.Cell>
                        </Table.Row>

                        <Table.Row>
                            <Table.Cell>
                                Target amount
                            </Table.Cell>
                            <Table.Cell>
                                {this.state.currentCampaign.targetAmount
                                } ETH
                            </Table.Cell>
                        </Table.Row>

                        <Table.Row>
                            <Table.Cell>
                                Total amount collected
                            </Table.Cell>
                            <Table.Cell>
                                {this.state.currentCampaign.totalCollected
                                } ETH
                            </Table.Cell>
                        </Table.Row>

                        <Table.Row>
                            <Table.Cell>
                                Is deadline over?
                            </Table.Cell>
                            <Table.Cell>
                                {this.state.currentCampaign.campaignFinished.toString()
                                }
                            </Table.Cell>
                        </Table.Row>

                        <Table.Row>
                            <Table.Cell>
                                Deadline
                            </Table.Cell>
                            <Table.Cell>
                                {this.state.currentCampaign.deadline.toString()
                                }
                            </Table.Cell>
                        </Table.Row>

                        <Table.Row>
                            <Table.Cell>
                                Are you beneficiary
                            </Table.Cell>
                            <Table.Cell>
                                {this.state.currentCampaign.isBeneficiary.toString()}
                            </Table.Cell>
                        </Table.Row>

                        <Table.Row>
                            <Table.Cell>
                                Your total contribution
                            </Table.Cell>
                            <Table.Cell>
                                {this.state.yourContributionTillNow} ETH
                            </Table.Cell>
                        </Table.Row>

                        <Table.Row>
                            <Table.Cell>
                                Contract state
                            </Table.Cell>
                            <Table.Cell>
                                {contractStateMap[this.state.currentCampaign.state]}
                            </Table.Cell>
                        </Table.Row>

                    </TableBody>
                </Table>
                    
                {getContributionForm(this.state.currentCampaign.campaignFinished)}
                {getFinishCrowdFundingForm()}
                
            </div>
        )
    }

}

export default Campaigns;