const ConversionUtil = artifacts.require('ConversionUtils');
const CrowdFunding = artifacts.require('CrowdFunding');
const TestCrowdFunding = artifacts.require('TestCrowdFunding');

module.exports = async (deployer) => {
    await deployer.deploy(ConversionUtil);
    await deployer.link(ConversionUtil, CrowdFunding);
    await deployer.link(ConversionUtil, TestCrowdFunding);
}