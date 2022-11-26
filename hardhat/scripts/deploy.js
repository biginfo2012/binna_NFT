const { ethers } = require("hardhat");
const { WHITELIST_CONTRACT_ADDRESS, METADATA_URL } = require("../constants");

async function main() {

  // Address of the whitelist contract that you deployed in the previous module
  const whitelistContract = WHITELIST_CONTRACT_ADDRESS;
  // URL from where we can extract the metadata for a Crypto Dev NFT
  const metadataURL = METADATA_URL;

  const contract = await ethers.getContarctFactory("BinnaDevs");

  const deployedContract = await contract.deploy(metadataURL, whitelistContract);

  await deployedContract.deployed();

  console.log(`BinnaDevs Contract Address => ${deployedContract}`);
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
