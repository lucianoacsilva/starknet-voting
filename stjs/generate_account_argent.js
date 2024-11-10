(async () => {
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

  // initialize provider
  const provider = new RpcProvider({
    nodeUrl:
      "https://starknet-sepolia.infura.io/v3/1bc8c51edac6463eaebc92a80761f076",
  });
  //new Argent X account v0.3.0
  const argentXaccountClassHash =
    "0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f";

  // Generate public and private key pair.
  const privateKeyAX = stark.randomAddress();
  console.log("AX_ACCOUNT_PRIVATE_KEY=", privateKeyAX);
  const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);
  console.log("AX_ACCOUNT_PUBLIC_KEY=", starkKeyPubAX);

  // Calculate future address of the ArgentX account
  const AXConstructorCallData = CallData.compile({
    owner: starkKeyPubAX,
    guardian: "0",
  });
  const AXcontractAddress = hash.calculateContractAddressFromHash(
    starkKeyPubAX,
    argentXaccountClassHash,
    AXConstructorCallData,
    0
  );
  console.log("Precalculated account address=", AXcontractAddress);
})();
