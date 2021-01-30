import React, { useEffect, useState } from 'react';
import { getWeb3, getWallet } from './utils.js';
import Header from './header.js';

function App() {
  const [web3, setWeb3] = useState(undefined);
  // need to store array of local addresses created by our blockchain
  const [accounts, setAccounts] = useState(undefined);
  // And we need a contract instance of our wallet
  const [wallet, setWallet] = useState(undefined);
  const [approvers, setApprovers] = useState([]);
  const [quorum, setQuorum] = useState(undefined);

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

      // Now we set all those variables when we have them
      setWeb3(web3);
      setAccounts(accounts);
      setWallet(wallet);
      setApprovers(approvers);
      setQuorum(quorum);

    };
    init();
  }, []);

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
    </div>
  );
}

export default App;
