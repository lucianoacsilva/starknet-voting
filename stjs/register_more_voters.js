const { Account, RpcProvider, Contract, CallData } = require("starknet");
const { accounts } = require("./accounts.json");

(async () => {
    
    // initialize provider
    const provider = new RpcProvider({ nodeUrl: 'https://starknet-sepolia.infura.io/v3/4deda563b65c4a7c92f5c57b43cd4b29' });
    // initialize existing pre-deployed account 0 of Devnet
    const privateKey = '0x074a5773cc5fe14b48001a4a0249ed45420dc21cd89b072e69079d62456ce04e';
    const accountAddress = '0x07932bfde40a0aa7ece16a2972bd6b4df86b864916d4b5f4fbf2f68aa334ef74';

    const sender = new Account(provider, accountAddress, privateKey);
    const contractAddress = "0x7e94fc03608c6f5eb44bad8787b68461c41f3fcc6137904d8ee1d6bfca29b7";

    const compressedContract = await provider.getClassAt(contractAddress);
    const voteContract = new Contract(compressedContract.abi, contractAddress, provider);
    //console.log(voteContract.abi)
    voteContract.connect(sender);

    const startTime = Date.now();
    const registerVotersTx = await voteContract.register_voters(
        accounts.map(account => account.address).slice(0,500)
    );

    console.log("Time: ", (Date.now() - startTime)/1000);
    console.log("Hash: ", registerVotersTx.transaction_hash);
    
    const txHash = (await provider.waitForTransaction(registerVotersTx.transaction_hash)).transaction_hash;

    console.log("Tx successfull with hash ", txHash);

    
})()