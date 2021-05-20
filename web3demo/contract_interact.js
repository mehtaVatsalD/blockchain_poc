const fs = require('fs');
const Web3 = require('web3');

const inquirer = require('inquirer')

const questions = [
    {
      type: 'password',
      name: 'pswd',
      message: "Enter password to unlock account"
    }
  ];



const web3 = createWeb3InstanceAndConnectToGethClient();
const sender = '0x0fcbe17c1d8f3c9a9b2440404403bb761753335b';

const abiString = fs.readFileSync('votingAbi.json', 'UTF-8');
const abi = JSON.parse(abiString);
const contractAddress = JSON.parse(fs.readFileSync('contractAddresses.json', 'UTF-8'))['Voting'];

const contractInstance = new web3.eth.Contract(abi, contractAddress);

sendTransactions()
    .then(() => {
        console.log("Done!");
    })
    .catch((error) => {
        console.log(`${error}`);
    });
    

function createWeb3InstanceAndConnectToGethClient(){
    let web3 = new Web3();
    web3.setProvider(
      new web3.providers.HttpProvider("http://localhost:8545")  
    );
    return web3;
}

async function getPasswordToUnlock() {
    let ans = await inquirer.prompt(questions);
    return ans['pswd'];
}

async function sendTransactions(){
    let password = await getPasswordToUnlock();
    web3.eth.personal.unlockAccount(sender, password, 100);
    console.log("Adding tea option");
    await contractInstance.methods.addVotingOption("tea")
                        .send({
                            from: sender
                        });
    console.log("Adding coffee option");
    await contractInstance.methods.addVotingOption("coffee")
                        .send({
                            from: sender
                        });
    console.log("Starting voting");
    await contractInstance.methods.startVoting()
                        .send({
                            from: sender,
                            gas: 5000000
                        });
    console.log("------------------CURRENT_STATE------------------");
    await callMethods();
    console.log("-------------------------------------------------");
    console.log("Voting for coffee");
    await contractInstance.methods.vote("coffee")
                        .send({
                            from: sender
                        });
    console.log("------------------CURRENT_STATE------------------");
    await callMethods();
    console.log("-------------------------------------------------");
    web3.eth.personal.lockAccount(sender);
}

async function callMethods(){
    console.log("All options");
    let op = await contractInstance.methods.getOptions()
                        .call();
    console.log(JSON.stringify(op));

    console.log("Vote Count");
    op = await contractInstance.methods.getVoteCount()
                        .call();
    console.log(JSON.stringify(op));
}

