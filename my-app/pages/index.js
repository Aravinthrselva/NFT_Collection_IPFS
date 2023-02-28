import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import {useState, useEffect, useRef} from 'react';
import {providers, Contract, utils} from 'ethers';
import Web3Modal from 'web3modal';
import { NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI } from '@/constants';



export default function Home() {

  const[walletConnected, setWalletConnected] = useState(false);

  const[loading, setLoading] = useState(false);

 // tokenIdsMinted keeps track of the number of tokenIds that have been minted
  const[tokenIdsMinted, setTokenIdsMinted] = useState("0")

  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();


// publicMint: Mint an NFT

const publicMint = async() => {
 try {
    console.log("public mint..")

    const signer = await getProviderOrSigner(true);

    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);

    const tx = await nftContract.mint({
        // value signifies the cost of one LW3Punks which is "0.01" eth.
        // We are parsing `0.01` string to ether using the utils library from ethers.js
        value: utils.parseEther("0.01"),
    });
    setLoading(true);
    // wait for the transaction to get mined
    await tx.wait();

    setLoading(false);
    window.alert("You minted a Web3 Punk, Welcome")
  
 } catch (err) {
    console.error(err);
 }
}


//gets the number of tokenIds that have been minted
const getTokenIdsMinted = async() => {
  try {
    const provider = await getProviderOrSigner();
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider);

    const _tokenIdsMinted = await nftContract.tokenIds();

    console.log("Token_Ids_Minted :", _tokenIdsMinted.toString());

   //_tokenIds is a `Big Number`. We need to convert the Big Number to a string    
    setTokenIdsMinted(_tokenIdsMinted.toString());

  } catch (err) {
    console.error(err);
  }
}


const getProviderOrSigner = async(needSigner = false) => {
  // Connect to Metamask
  // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
  const provider = await web3ModalRef.current.connect();
  const web3Provider = new providers.Web3Provider(provider);

  const {chainId} = await web3Provider.getNetwork();

  if(chainId !== 80001) {
    window.alert("Please Connect to Polygon-mumbai network");
    throw new Error("Not connected to Polygon-mumbai");
  }

  if(needSigner) {
    const signer =  web3Provider.getSigner();
    return signer;
  }

  return web3Provider;
};


//Connects the MetaMask wallet
const connectWallet  = async() => {
 try {
  // Get the provider from web3Modal, which in our case is MetaMask
  // When used for the first time, it prompts the user to connect their wallet
  await getProviderOrSigner();
  setWalletConnected(true); 

 } catch (err) {

  console.error(err);
 }
}




  useEffect(() => {
    if(!walletConnected) {

      web3ModalRef.current = new Web3Modal({
        network: "mumbai",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getTokenIdsMinted();

// set an interval to get the number of token Ids minted every 5 seconds
      setInterval(async function() {
        await getTokenIdsMinted();
      }, 5*1000);

    }
  }, [walletConnected])


const renderButton = () => {
  if(!walletConnected) {
    return (
      <button className={styles.button} onClick={connectWallet}>
        Connect Wallet
      </button>
    );
  }
    if(loading) {
      return (
        <button className={styles.button}>
          Loading...
        </button>
      ); 
    }
  
    return (
      <button className={styles.button} onClick={publicMint}>
        Public Mint
      </button>
     );
    
}


  return (
    <div>
      <Head>
        <title>Web3 Punks</title>
        <meta name="description" content="Web3 Punks NFT Dapp using IPFS" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}> Home of Web3 Punks </h1>
          <div className={styles.description}>
            We are the builders
          </div>
          <div className={styles.description}>
            {tokenIdsMinted}/10 Minted
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./LW3Punks/3.png"/>
        </div>
      </div>
      <footer className={styles.footer}> Made with 💚 by AvantGard</footer>
    </div>
  );
}
