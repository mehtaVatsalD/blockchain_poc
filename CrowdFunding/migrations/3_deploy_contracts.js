const CrowdFunding = artifacts.require('CrowdFunding');
module.exports = async (deployer, network, accounts) => {
    await deployer.deploy(CrowdFunding, "Blockchain research to adapt to quantum computing", 60, 10, accounts[1]);
}