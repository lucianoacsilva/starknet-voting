const { Account, RpcProvider, Contract, CallData } = require("starknet");
const fs = require("fs");
const { accounts } = require("./accounts.json");

const transferFunds = async ({
    provider,
    ethContract,
    starkContract,
    address
}) => {

    await provider.waitForTransaction(
        (await ethContract.transfer(address, 1004337635307097)).transaction_hash
    );
    console.log("Transferiu o ETH para o endereço: ", address);

    await provider.waitForTransaction(
        (await starkContract.transfer(address, 1004337635307097)).transaction_hash
    );
    console.log("Transferiu o STRK para o endereço: ", address);

    console.log("Transferência realizada com sucesso!");

    const balanceStark = await starkContract.balanceOf(address);
    const balanceEth = await ethContract.balanceOf(address);

    console.log(`Saldo ETH da conta ${address}: ${balanceEth}`);
    console.log(`Saldo STRK da conta ${address}: ${balanceStark}`);

    return {
        address,
        balanceStark,
        balanceEth
    }
}

const deployAccount = async ({
    provider,
    address,
    privateKey,
    publicKey,
}) => {
    const OZaccount = new Account(provider, address, privateKey);

    const { transaction_hash, contract_address } = await OZaccount.deployAccount({
        classHash: "0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f",
        constructorCalldata: CallData.compile({ publicKey }),
        addressSalt: publicKey,
    });

    await provider.waitForTransaction(transaction_hash);
    console.log('✅ New OpenZeppelin account created.\n   address =', contract_address);
}


(async () => {

    const ethContractAddress = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
    const starkContractAddress = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

    // initialize provider
    const provider = new RpcProvider({ nodeUrl: 'https://starknet-sepolia.infura.io/v3/1bc8c51edac6463eaebc92a80761f076' });
    // initialize existing pre-deployed account 0 of Devnet

    const sender = new Account(provider, "0x06c8fc58c3d7a09760ac090b6ceebf86174e5537e0cd949ec53de5f45bc29d1f", "0x02a9e9f77a29ac80ecd2bac48e5b7865f3c4012a4717559a7c36aabe5d192f80");

    const ethContract = new Contract((await provider.getClassAt(ethContractAddress)).abi, ethContractAddress, provider);
    const starkContract = new Contract((await provider.getClassAt(starkContractAddress)).abi, starkContractAddress, provider);

    ethContract.connect(sender);
    starkContract.connect(sender);
    const balances = [];

    for (let index = 0; index < accounts.length; index++) {
        balances.push(
            await transferFunds({
                provider,
                ethContract,
                starkContract,
                address: accounts[index].address
            })
        );

        await deployAccount({
            provider,
            address: accounts[index].address,
            privateKey: accounts[index].privateKey,
            publicKey: accounts[index].publicKey,
        });
    }

    console.log("Saldos: ");
    console.log(balances);
})()