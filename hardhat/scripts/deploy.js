const { ethers } = require("hardhat");
const { WHITELIST_CONTRACT_ADDRESS, METADATA_URL } = require("../constants/index");

async function main() {

  // Address of the whitelist contract that you deployed in the previous module
  const whitelistContract = WHITELIST_CONTRACT_ADDRESS;
  // URL from where we can extract the metadata for a Crypto Dev NFT
  const metadataURL = METADATA_URL;

  const binnaDevsContract = await ethers.getContractFactory("BinnaDevs");

  const deployedBinnaDevsContract = await binnaDevsContract.deploy(metadataURL, whitelistContract);

  await deployedBinnaDevsContract.deployed();

  console.log(`BinnaDevs Contract Address => ${deployedBinnaDevsContract.address}`);
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
