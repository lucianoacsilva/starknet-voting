(async () => {
    const { Account, RpcProvider, Contract } = require("starknet");

    // initialize provider
    const provider = new RpcProvider({ nodeUrl: 'https://starknet-sepolia.infura.io/v3/1bc8c51edac6463eaebc92a80761f076' });
    // initialize existing pre-deployed account 0 of Devnet
    const privateKey = '0x074a5773cc5fe14b48001a4a0249ed45420dc21cd89b072e69079d62456ce04e';
    const accountAddress = '0x07932bfde40a0aa7ece16a2972bd6b4df86b864916d4b5f4fbf2f68aa334ef74';

    const account = new Account(provider, accountAddress, privateKey);

    const compressedContract = await provider.getClassAt("0x066c6d9ace8e043b2f483dab802b2e0f9342c6057e503598376963b25ac104ae");

    const voteContract = new Contract(compressedContract.abi, "0x066c6d9ace8e043b2f483dab802b2e0f9342c6057e503598376963b25ac104ae", provider);
    
    const result = await voteContract.get_vote_status();
    console.log("Result:");
    console.log(result)

    const isRegistered = await voteContract.voter_can_vote("0x07932bfde40a0aa7ece16a2972bd6b4df86b864916d4b5f4fbf2f68aa334ef74");

    console.log("Is registered? ", isRegistered)

    
})()