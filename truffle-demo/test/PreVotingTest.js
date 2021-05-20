const Voting = artifacts.require('Voting');

contract('Vote', async function(accounts) {

	let voting;

	beforeEach(async function() {
		voting = await Voting.new();
	});

	it('No options initially', async function() {
		let options = await voting.getOptions();
		expect(options).to.deep.equals([]);
	});

	it('should be able add option', async function() {
		await voting.addVotingOption('feku');
		await voting.addVotingOption('pappu');
		await voting.addVotingOption('khasu');
		let options = await voting.getOptions();
		expect(options).to.deep.equals(['feku', 'pappu', 'khasu']);
	});

	it('should be able start voting', async function() {
		await voting.addVotingOption('feku');
		await voting.addVotingOption('pappu');
		await voting.addVotingOption('khasu');
		await voting.startVoting();
		await voting.vote('khasu');
		votes = await voting.getVoteCountForGivenOptionName('khasu');
		expect(votes.toNumber()).to.equals(1);
		
		let voteCounts = await voting.getVoteCount();
		expect(toNumbers(voteCounts)).to.deep.equals([0, 0, 1]);
	});

	

	function toNumbers(bigNumbers) {
		return bigNumbers.map(num => num.toNumber());
	}


});