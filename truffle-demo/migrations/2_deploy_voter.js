const VotingContract = artifacts.require('Voting');

async function deployAndGetInstance(deployer) {
	let instanceToReturn;
	await deployer.deploy(VotingContract).then(instance => {
		instanceToReturn = instance;
	});
	return instanceToReturn;
}

module.exports = async function(deployer) {

    await deployer.deploy(VotingContract);
    let instance = await VotingContract.deployed();

    // let instance = await deployAndGetInstance(deployer);
    // OR async method above


    console.log('Adding feku option');
    await instance.addVotingOption('feku');

    console.log('Adding papu option');
    await instance.addVotingOption('papu');

    console.log('Adding khasu option');
    await instance.addVotingOption('khasu');

    console.log("Starting voting")
    await instance.startVoting();

    console.log("Contract is ready to take votes!")
}