import { useEffect, useRef, useState } from 'react'
import { Contract, providers, utils } from "ethers";
import Error from 'next/error';
import Web3Modal from "web3modal";

import styles from '../styles/Home.module.css'
import Footer from '../components/Footer'
import Main from '../components/Main'
import Meta from '../components/Meta'
import { abi, NFT_CONTRACT_ADDRESS } from "../constants";

export default function Home() {

  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // presaleStarted keeps track of whether the presale has started or not
  const [presaleStarted, setPresaleStarted] = useState(false);
  // presaleEnded keeps track of whether the presale ended
  const [presaleEnded, setPresaleEnded] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // checks if the currently connected MetaMask wallet is the owner of the contract
  const [isOwner, setIsOwner] = useState(false);
  // tokenIdsMinted keeps track of the number of tokenIds that have been minted
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();

  /**
   * Returns a Provider (if you pass an argument of true, it will return a signer)
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    const provider = await web3ModalRef.current.connect();
    // use provider as a node to connect to the blockchain
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Goerli network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      // this will return the private key to sign the transaction.
      return signer;
    }
    return web3Provider;
  };

  //  connectWallet: Connects the MetaMask wallet
  const connectWallet = async () => {
    try {
      // connect to a node
      await getProviderOrSigner();
      // updated the state 'walletConnect'
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  // getOwner: calls the contract to retrieve the owner
  const getOwner = async () => {
    try {
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);

      // call the owner function from the contract
      const _owner = await nftContract.owner();
      // We will get the signer now to extract the address of the currently connected MetaMask account
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();

      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  //  startPresale: starts the presale for the NFT Collection
  const startPresale = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      // call the startPresale from the contract
      const tx = await nftContract.startPresale();
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      // set the presale started to true
      await checkIfPresaleStarted();
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * checkIfPresaleStarted: checks if the presale has started by quering the `presaleStarted`
   * variable in the contract
   */
  const checkIfPresaleStarted = async () => {
    try {
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // call the presaleStarted from the contract
      const _presaleStarted = await nftContract.presaleStarted();

      if (!_presaleStarted) {
        await getOwner();
      }
      setPresaleStarted(_presaleStarted);
      return _presaleStarted;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  /**
   * checkIfPresaleEnded: checks if the presale has ended by quering the `presaleEnded`
   * variable in the contract
   */
  const checkIfPresaleEnded = async () => {
    try {
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);

      // call the presaleEnded from the contract
      const _presaleEnded = await nftContract.presaleEnded();
      // _presaleEnded is a Big Number, so we are using the lt(less than function) instead of `<`
      // Date.now()/1000 returns the current time in seconds
      // We compare if the _presaleEnded timestamp is less than the current time
      // which means presale has ended
      const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000));
      if (hasEnded) {
        setPresaleEnded(true);
      } else {
        setPresaleEnded(false);
      }
      return hasEnded;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  //  presaleMint: Mint an NFT during the presale
  const presaleMint = async () => {
    try {
       // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      const tx = await nftContract.presaleMint({ value: utils.parseEther("0.01") });
      
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);

      window.alert("You successfully minted a Binna Dev!");
    } catch (err) {
      console.error(err);
    }
  };

  //  publicMint: Mint an NFT after the presale
  const publicMint = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
     
      const tx = await nftContract.mint({ value: utils.parseEther("0.01") });
      
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      window.alert("You successfully minted a Binna Dev!");
    } catch (err) {
      console.error(err);
    }
  };
  
  // getTokenIdsMinted: gets the number of tokenIds that have been minted
  const getTokenIdsMinted = async () => {
    try {
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // call the tokenIds from the contract
      const _tokenIds = await nftContract.tokenIds();
      //_tokenIds is a `Big Number`. We need to convert the Big Number to a string
      setTokenIdsMinted(_tokenIds.toString());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();

      // Check if presale has started and ended
      const _presaleStarted = checkIfPresaleStarted();
      if (_presaleStarted) {
        checkIfPresaleEnded();
      }
      getTokenIdsMinted();

      // Set an interval which gets called every 3 seconds to check presale has ended
      const presaleEndedInterval = setInterval(async function () {
        const _presaleStarted = await checkIfPresaleStarted();
        if (_presaleStarted) {
          const _presaleEnded = await checkIfPresaleEnded();
          if (_presaleEnded) {
            clearInterval(presaleEndedInterval);
          }
        }
      }, 3 * 1000);

      // set an interval to get the number of token Ids minted every 3 seconds
      setInterval(async function () {
        await getTokenIdsMinted();
      }, 3 * 1000);
    }
  }, [walletConnected]);

  //  renderButton: Returns a button based on the state of the dapp
  const renderButton = () => {
    // If wallet is not connected, return a button which allows the user to connect their wallet
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }

    // If we are currently waiting for something, return a loading button
    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }

    // If connected user is the owner, and presale hasnt started yet, allow them to start the presale
    if (isOwner && !presaleStarted) {
      return (
        <button className={styles.button} onClick={startPresale}>
          Start Presale!
        </button>
      );
    }

    // If connected user is not the owner but presale hasn't started yet, tell them that
    if (!presaleStarted) {
      return (
        <div>
          <div className={styles.description}>Presale hasn&apos;t started!</div>
        </div>
      );
    }

    // If presale started, but hasn't ended yet, allow for minting during the presale period
    if (presaleStarted && !presaleEnded) {
      return (
        <div>
          <div className={styles.description}>
            Presale has started!!! If your address is whitelisted, Mint a Binna
            Dev 🥳
          </div>
          <button className={styles.button} onClick={presaleMint}>
            Presale Mint 🚀
          </button>
        </div>
      );
    }

    // If presale started and has ended, its time for public minting
    if (presaleStarted && presaleEnded) {
      return (
        <button className={styles.button} onClick={publicMint}>
          Public Mint 🚀
        </button>
      );
    }
  };

  return (
    <div>
      <Meta />
      <Main tokenIdsMinted={tokenIdsMinted} renderButton={renderButton} />
      <Footer />
    </div>
  )
}
