import React, { useEffect, useState } from 'react';
import { getWeb3, getWallet } from './utils.js';
import Header from './header.js';
import NewTransfer from './NewTransfer.js';
import TransferList from './TransferList.js';

function App() {
  const [web3, setWeb3] = useState(undefined);
  // need to store array of local addresses created by our blockchain
  const [accounts, setAccounts] = useState(undefined);
  // And we need a contract instance of our wallet
  const [wallet, setWallet] = useState(undefined);
  const [approvers, setApprovers] = useState([]);
  const [quorum, setQuorum] = useState(undefined);
  // we need to fetch transfer values
  const [transfers, setTransfers] = useState([]);

  // now we need to initialize our state

  useEffect(() => {
    const init = async () => {
      // get web3
      const web3 = getWeb3();
      // then get accounts created by Ganache
      const accounts = await web3.eth.getAccounts();
      // then get wallet
      const wallet = await getWallet(web3);
      // get approvers
      const approvers = await wallet.methods.getApprovers().call();
      const quorum = await wallet.methods.quorum().call();
      const transfers = await wallet.methods.getTransfers().call();

      // Now we set all those variables when we have them
      // the below code updates the state of React
      setWeb3(web3);
      setAccounts(accounts);
      setWallet(wallet);
      setApprovers(approvers);
      setQuorum(quorum);
      setTransfers(transfers);

    };
    init();
  }, []);

  // function takes the transfer object coming from transfer html form in NewTransfer.js
  // this function is the one that calls the createTransfer funciton of the Wallet.sol smart contract
        // the createTransfer functions needs the amount being sent and the address being sent to
  const createTransfer = transfer => {
    wallet.methods
      .createTransfer(transfer.amount, transfer.to)
      .send({from: accounts[0], gas: 1000000});
  }

  const approveTransfer = transferId => {
    wallet.methods.approveTransfer(transferId)
      .send({from: accounts[0]});
  }

  if(
    typeof web3 === 'undefined'
    || typeof accounts === 'undefined'
    || typeof wallet === 'undefined'
    || typeof approvers === 'undefined'
    || typeof quorum === 'undefined'
  ) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      MutliSig Dapp
        <Header approvers={approvers} quorum={quorum} />
        <NewTransfer createTransfer={createTransfer} />
        <TransferList transfers={transfers} approveTransfer={approveTransfer}/>
    </div>
  );
}

export default App;
