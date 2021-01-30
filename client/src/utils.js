// first we need to import Web3
import Web3 from 'web3';
// then we need to import the contract artifact
import Wallet from './contracts/Wallet.json';

const getWeb3 = () => {
  // this is where your local truffle blockchain deployed
  // return new Web3('http://localhost:9545')
  return new Promise((resolve, reject) => {
    window.addEventListener('load', async () => {
      if(window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.enable();
          resolve(web3);
        } catch(error) {
          reject(error);
        }
      } else if(window.web3) {
        resolve(window.web3);
      } else {
        reject('Must install Metamask');
      }
    });
  });
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
