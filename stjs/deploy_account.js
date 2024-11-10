(async () => {
  const { Account, RpcProvider, Contract, CallData } = require("starknet");

  // initialize provider
  const provider = new RpcProvider({
    nodeUrl:
      "https://starknet-sepolia.infura.io/v3/1bc8c51edac6463eaebc92a80761f076",
  });
  // initialize existing pre-deployed account 0 of Devnet

  const AXcontractAddress =
    "0xffda98c0c28661fde9a8649b8401e5b0718ad136e4b2b1aa57b7260eb196a";
  const argentXaccountClassHash =
    "0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f";
  const accountAX = new Account(
    provider,
    AXcontractAddress,
    "0x548e1db0c2d4c296cc82df0de29df0dc3054a2cffe07a20aae51699e1180f43"
  );
  const starkKeyPubAX =
    "0x7103ecd856b54b2cf6202ef98785f37a7e027720abdb9a8bdb49c0fadd44807";
  const AXConstructorCallData = CallData.compile({
    owner: starkKeyPubAX,
    guardian: "0",
  });

  const deployAccountPayload = {
    classHash: argentXaccountClassHash,
    constructorCalldata: AXConstructorCallData,
    contractAddress: AXcontractAddress,
    addressSalt: starkKeyPubAX,
  };

  const { transaction_hash: AXdAth, contract_address: AXcontractFinalAddress } =
    await accountAX.deployAccount(deployAccountPayload);
  console.log("✅ ArgentX wallet deployed at:", AXcontractFinalAddress);

  // const isRegistered = await voteContract.voter_can_vote("0x07932bfde40a0aa7ece16a2972bd6b4df86b864916d4b5f4fbf2f68aa334ef74");

  // console.log("Is registered? ", isRegistered)
})();
