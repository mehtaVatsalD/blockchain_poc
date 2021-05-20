const fs = require('fs');
const Web3 = require('web3');
const solc = require('solc');
const inquirer = require('inquirer')

const questions = [
    {
      type: 'password',
      name: 'pswd',
      message: "Enter password to unlock account"
    }
  ];



let sender = "0x0fcbe17c1d8f3c9a9b2440404403bb761753335b";
let contract = compileContract();
// console.log(contract);
writeAbiToFile(contract);
let web3 = createWeb3InstanceAndConnectToGethClient();


deployContract(web3, contract, sender)
    .then(() => {
        console.log('Deployment completed successfully!')
    })
    .catch((error) => {
        console.log(`Failed to deploy contract: ${error}`);
    })

function writeAbiToFile(contract){
    fs.writeFileSync('votingAbi.json', JSON.stringify(contract.abi));
}

async function getPasswordToUnlock() {
    let ans = await inquirer.prompt(questions);
    return ans['pswd'];
}

async function deployContract(web3, contract, sender){
    let password = await getPasswordToUnlock();
    web3.eth.personal.unlockAccount(sender, password, 100);
    let Voting = new web3.eth.Contract(contract.abi);
    let bytecode = '0x' + contract.evm.bytecode.object;
    let gasEstimate = await web3.eth.estimateGas({
        data: bytecode
    });
    let newContract = await Voting.deploy({
        data: bytecode
    })
    .send({
        from: sender,
        gas: gasEstimate
    })
    .on('transactionHash', function(transactionHash) {
        console.log(`Transaction hash: ${transactionHash}`);
    });
    console.log(`new contract: ${newContract.options.address}`);
    let toWriteAddr = {
        'Voting':  newContract.options.address
    };
    fs.writeFileSync('contractAddresses.json', JSON.stringify(toWriteAddr));
    web3.eth.personal.lockAccount(sender);
    return newContract;
}

function compileContract(){
    let smartContractContent = fs.readFileSync('Voting.sol', 'UTF-8');
    let smartContractContentJson = {
        'Voting': {
            content: smartContractContent
        }
    }
    let solcInput = {
        language: 'Solidity',
        sources: smartContractContentJson,
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    }
    let compiledOutput = JSON.parse(solc.compile(JSON.stringify(solcInput)));
    return compiledOutput.contracts['Voting']['Voting'];
}

function createWeb3InstanceAndConnectToGethClient(){
    let web3 = new Web3();
    web3.setProvider(
      new web3.providers.HttpProvider("http://localhost:8545")  
    );
    return web3;
}