import web3 from "./web3";
import crowdfundingAbi from "./crowdfundingAbi";

function getCrowdfundingContractInstance(contractAddress) {
    return new web3.eth.Contract(crowdfundingAbi, contractAddress);
}

export default getCrowdfundingContractInstance;