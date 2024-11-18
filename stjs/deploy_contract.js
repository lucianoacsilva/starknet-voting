const { Account, RpcProvider, Contract, CallData } = require("starknet");
const { abi } = require("../src/artifacts/voting.json");
const { accounts } = require("./accounts.json");

(async () => {
  // initialize provider
  const provider = new RpcProvider({
    nodeUrl:
      "https://starknet-sepolia.infura.io/v3/4deda563b65c4a7c92f5c57b43cd4b29",
  });

  const sender = new Account(provider, "0x06c8fc58c3d7a09760ac090b6ceebf86174e5537e0cd949ec53de5f45bc29d1f", "0x02a9e9f77a29ac80ecd2bac48e5b7865f3c4012a4717559a7c36aabe5d192f80");

  // Deploy Test contract in devnet
  // ClassHash of the already declared contract
  const testClassHash = '0xa388b128710249faa5b1dbb47a5f27d38d5c5714782ac4e0c624c4c010fcfe';

  const deployResponse = await sender.deployContract({ 
    classHash: testClassHash,
    constructorCalldata: (new CallData(abi)).compile("constructor", {
      voters: [],
      yes_init: 249558089423,
      no_init: 150858281281,
      n: 552547
    })
  });

  await provider.waitForTransaction(deployResponse.transaction_hash);

  // read abi of Test contract
  const { abi: testAbi } = await provider.getClassByHash(testClassHash);
  if (testAbi === undefined) {
    throw new Error('no abi.');
  }

  // Connect the new contract instance:
  const myTestContract = new Contract(testAbi, deployResponse.contract_address, provider);
  console.log('✅ Test Contract connected at =', myTestContract.address);
})();
