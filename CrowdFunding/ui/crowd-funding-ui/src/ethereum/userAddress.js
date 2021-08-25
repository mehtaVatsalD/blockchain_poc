import web3 from "./web3";

const getUserAddressToUse = async () => {
    const address = await web3.eth.requestAccounts()
    return address;
};

export default getUserAddressToUse;