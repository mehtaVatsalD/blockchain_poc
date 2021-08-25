const Voting = artifacts.require('Voting');

contract('PreStartingVoting', async function(accounts) {

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

contract('PostStartingVoting', async function(accounts) {

	let voting;
	let account;
	let otherAccount;

	beforeEach(async function() {
		account = accounts[0];
		otherAccount = accounts[1];
		voting = await Voting.new();
		await voting.addVotingOption('feku');
		await voting.addVotingOption('pappu');
		await voting.addVotingOption('khasu');
		await voting.startVoting();
	});

	it('initial no votes for any options', async function() {
		let voteCounts = await voting.getVoteCount();
		expect(toNumbers(voteCounts)).to.deep.equals([0, 0, 0]);
	});

	it('should be able to vote candidate', async function() {
		await voting.vote('feku', {from: account});

		let votes = await voting.getVoteCountForGivenOptionName('feku');
		expect(votes.toNumber()).to.equals(1);

		let voteCounts = await voting.getVoteCount();
		expect(toNumbers(voteCounts)).to.deep.equals([1, 0, 0]);
	});

	it('cannot vote twice from same account', async function() {
		try{
			await voting.vote('feku', {from: account});
			await voting.vote('pappu', {from: account});
			expect.fail();
		}
		catch(error) {
			expect(error.reason).to.equals("Voter has already voted.");
		}
		
		let voteCounts = await voting.getVoteCount();
		expect(toNumbers(voteCounts)).to.deep.equals([1, 0, 0]);
	});

	it('other account can vote', async function() {
		await voting.vote('feku', {from: account});
		await voting.vote('pappu', {from: otherAccount});

		let votes = await voting.getVoteCountForGivenOptionName('feku');
		expect(votes.toNumber()).to.equals(1);

		votes = await voting.getVoteCountForGivenOptionName('pappu');
		expect(votes.toNumber()).to.equals(1);
		
		let voteCounts = await voting.getVoteCount();
		expect(toNumbers(voteCounts)).to.deep.equals([1, 1, 0]);
	});

	it('cannot vote random option', async function() {
		try{
			await voting.vote('lalu', {from: account});
			expect.fail();
		}
		catch(error) {
			expect(error.reason).to.equals("Invalid option name provided for voting.");
		}
		
		let voteCounts = await voting.getVoteCount();
		expect(toNumbers(voteCounts)).to.deep.equals([0, 0, 0]);
	});

	it('cannot add option after voting started', async function() {
		try {
			await voting.addVotingOption('lalu');
			expect.fail();
		}
		catch(error) {
			expect(error.reason).to.equals("Voting has already started. Cannot add option now!");
		}

		let options = await voting.getOptions();
		expect(options).to.deep.equals(['feku', 'pappu', 'khasu']);
	});

	it('start voting after voting already started', async function() {
		try {
			await voting.startVoting();
			expect.fail();
		}
		catch(error) {
			expect(error.reason).to.equals("Voting has already started. Cannot start again!");
		}
	});

	function toNumbers(bigNumbers) {
		return bigNumbers.map(num => num.toNumber());
	}


});