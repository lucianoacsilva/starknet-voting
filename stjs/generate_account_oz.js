const {
  Account,
  constants,
  ec,
  json,
  stark,
  RpcProvider,
  hash,
  CallData,
} = require("starknet");

const fs = require("fs");

const generateAccount = async () => {
  // new Open Zeppelin account v0.8.1
  // Generate public and private key pair.
  const privateKey = stark.randomAddress();
  console.log("New OZ account:\nprivateKey=", privateKey);
  const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
  console.log("publicKey=", starkKeyPub);

  const OZaccountClassHash =
    "0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f";
  // Calculate future address of the account
  const OZaccountConstructorCallData = CallData.compile({
    publicKey: starkKeyPub,
  });
  const OZcontractAddress = hash.calculateContractAddressFromHash(
    starkKeyPub,
    OZaccountClassHash,
    OZaccountConstructorCallData,
    0
  );
  console.log("Precalculated account address=", OZcontractAddress);

  return {
    publicKey: starkKeyPub,
    privateKey,
    address: OZcontractAddress
  };
}

(async () => {
  

  // initialize provider
  const provider = new RpcProvider({
    nodeUrl:
      "https://starknet-sepolia.infura.io/v3/1bc8c51edac6463eaebc92a80761f076",
  });
  // initialize existing pre-deployed account 0 of Devnet
  // connect provider (Mainnet or Sepolia)

  const someArray = Array(10000).fill(0);


  const accountsObj = {
    accounts: await Promise.all(someArray.map(async elem => await generateAccount()))
  };

  fs.writeFileSync('accounts.json', JSON.stringify(accountsObj, null, 2));
  
})();
