const { Account, RpcProvider, Contract } = require("starknet");
const fs = require("fs");
const { results } = require("../100txs/results.json");


const searchTxReceiptWithRetries = async (sender, txHash) => {
    return await sender.getTransactionReceipt(txHash)
        .catch(async (error) => await searchTxReceiptWithRetries(sender, txHash))
}

(async () => {

    // initialize provider
    const provider = new RpcProvider({ nodeUrl: 'https://starknet-sepolia.infura.io/v3/4deda563b65c4a7c92f5c57b43cd4b29' });
    // initialize existing pre-deployed account 0 of Devnet

    const sender = new Account(provider, "0x06c8fc58c3d7a09760ac090b6ceebf86174e5537e0cd949ec53de5f45bc29d1f", "0x02a9e9f77a29ac80ecd2bac48e5b7865f3c4012a4717559a7c36aabe5d192f80");
    
    const receipts = (await Promise.allSettled(
        results.map(async result => await searchTxReceiptWithRetries(sender, result.execution.tx_hash))
    )).map(tx => tx.value);

    console.log("Nulos: ", receipts.filter(rec => !rec).length);
    fs.writeFileSync("receipts.json", JSON.stringify({ receipts }));
    //console.log("Recibo: ", receipts);
})()