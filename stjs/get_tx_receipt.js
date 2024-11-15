const { Account, RpcProvider, Contract } = require("starknet");
const fs = require("fs");
const { hashes } = require("../python/hashes.json");




(async () => {
    const txHashes = [
        "0x692350707828ebeecddc49b392c7007dbb9e0b464cc66d7290999516b5a430d",
        "0x4441109b8a06eeb60082640cc6604d25bc44781a3a26fc7cd9016b3183792ca",
        "0x68bf6938962e686c251fd431cc8c3ba3148a8702f6be6c63dbf2c44e76e7240",
        "0x29d176093a4614d70b5a74a3bd66dfb2575315234ea38f8285bd66886de9b31",
        "0x3368485036682168cb0399812b40258bb35c6dbd9a1119c5968e5fa1131eaf6"
    ]

    const ethContractAddress = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
    const starkContractAddress = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

    // initialize provider
    const provider = new RpcProvider({ nodeUrl: 'https://starknet-sepolia.infura.io/v3/4deda563b65c4a7c92f5c57b43cd4b29' });
    // initialize existing pre-deployed account 0 of Devnet

    const sender = new Account(provider, "0x06c8fc58c3d7a09760ac090b6ceebf86174e5537e0cd949ec53de5f45bc29d1f", "0x02a9e9f77a29ac80ecd2bac48e5b7865f3c4012a4717559a7c36aabe5d192f80");
    
    const receipts = (await Promise.allSettled(
        hashes.map(async hash => await sender.getTransactionReceipt(hash))
    )).map(tx => tx.value);

    fs.writeFileSync("receipts.json", JSON.stringify({ receipts }));
    //console.log("Recibo: ", receipts);
})()