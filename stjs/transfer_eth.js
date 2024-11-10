(async () => {
    const { Account, RpcProvider, Contract } = require("starknet");

    // initialize provider
    const provider = new RpcProvider({ nodeUrl: 'https://starknet-sepolia.infura.io/v3/1bc8c51edac6463eaebc92a80761f076' });
    // initialize existing pre-deployed account 0 of Devnet

    const address = "0x07932bfde40a0aa7ece16a2972bd6b4df86b864916d4b5f4fbf2f68aa334ef74";

    const account = new Account(provider, address, "0x074a5773cc5fe14b48001a4a0249ed45420dc21cd89b072e69079d62456ce04e");

    const compressedContract = await provider.getClassAt("0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d");

    const ethContract = new Contract(compressedContract.abi, "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d", provider);

    ethContract.connect(account);

    //const transferTx = await ethContract.transfer("0x3df225744da0722de4f13fd35546229b33f2f6776d31e51c0c13cc8144e60a6", 100);
    console.log("Transferência realizada com sucesso!");
    const balanceInitial = await ethContract.balanceOf("0x3df225744da0722de4f13fd35546229b33f2f6776d31e51c0c13cc8144e60a6");
    console.log("Saldo: ", balanceInitial)

    // const result = await voteContract.get_vote_status();
    // console.log("Result:");
    // console.log(result)

    // const isRegistered = await voteContract.voter_can_vote("0x07932bfde40a0aa7ece16a2972bd6b4df86b864916d4b5f4fbf2f68aa334ef74");

    // console.log("Is registered? ", isRegistered)

    
})()