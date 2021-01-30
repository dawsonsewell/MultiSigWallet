// first we need to import Web3
import Web3 from 'web3';
// then we need to import the contract artifact
import Wallet from './contracts/Wallet.json';

const getWeb3 = () => {
  // this is where your local truffle blockchain deployed
  return new Web3('http://localhost:9545')
};

const getWallet = async web3 => {
  const networkId = await web3.eth.net.getId();
  const contractNetwork = Wallet.networks[networkId];
  return new web3.eth.Contract(
    Wallet.abi,
    contractNetwork && contractNetwork.address
  );
};

export { getWeb3, getWallet }
