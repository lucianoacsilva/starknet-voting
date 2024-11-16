const { Account, RpcProvider, Contract } = require("starknet");
const fs = require("fs");
const { results } = require("../python/results.json");




(async () => {

    const ethContractAddress = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
    const starkContractAddress = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

    // initialize provider
    const provider = new RpcProvider({ nodeUrl: 'https://starknet-sepolia.infura.io/v3/4deda563b65c4a7c92f5c57b43cd4b29' });
    // initialize existing pre-deployed account 0 of Devnet

    const sender = new Account(provider, "0x06c8fc58c3d7a09760ac090b6ceebf86174e5537e0cd949ec53de5f45bc29d1f", "0x02a9e9f77a29ac80ecd2bac48e5b7865f3c4012a4717559a7c36aabe5d192f80");
    
    const receipts = (await Promise.allSettled(
        results.map(async result => await sender.getTransactionReceipt(result.execution.tx_hash))
    )).map(tx => tx.value);

    fs.writeFileSync("receipts.json", JSON.stringify({ receipts }));
    //console.log("Recibo: ", receipts);
})()