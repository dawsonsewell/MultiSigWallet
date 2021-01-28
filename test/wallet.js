const Wallet = artifacts.require('Wallet');

// accounts lets us access 10 ether account addresses with pre-funded ether
// which is automatically created by the Truffle framework
contract("Wallet", (accounts) => {

  let wallet; // will point to our smart contract on the blockchain

  // we need a beforeEach block that will be executed before each of our tests
  beforeEach(async () => {
    // when we initialize our new Wallet, we need to provide the
    // data our constructor will use in the smart contract
    // we are testing
    // The code below gives account addresses that are approvers, and the
    // quorum value
    wallet = await Wallet.new(
      [accounts[0], accounts[1], accounts[2]], // 3 of 10 truffle generated addresses are approvers
      2 // this is the quorum value representing # of approvers needed for a tx
    );

    // Now we need to send ether to the addresses using web3 -- Truffle
    // automatically creates a web3 object when initialized
    await web3.eth.sendTransaction(
      {
       from: accounts[0],
       to: wallet.address,
       value: 1000 // this is 1000 wei
      }
   );

  });

  // each test we write will be inside an 'it' block
  // when each it block is executed, the beforeEach is already executed
  // meaning we already have a smart contract deployed with an address and ether inside it
  // in this case we can interact with our contract throught the 'wallet' variable
  it(
    'Should have corerct approvers and quorum', // comment referencing what is being tested
    async () => {
      const approvers = await wallet.getApprovers(); // we call the variable containing our smart contract, then call the function we want access to from that contract as a method which returns it's data and we store that as a variable
      const quorum = await wallet.quorum();
      assert(approvers.length === 3);
      assert(approvers[0] === accounts[0]);
      assert(approvers[1] === accounts[1]);
      assert(approvers[2] === accounts[2]);
      assert(quorum.toNumber() === 2); // if the number is too big for js you can get around this problem like this --> quorum.toString() === '2'
    }
  );

  it(
    'Should create transfers',
    async () => {
      // starting with the {} it adds where the transfer is being sent from
      // this function creates a transaction receipt so we do not need to
      // store the result in a variable like in the previous test
      // the transfer has to be created by an account address inside
      // of onlyApprover to be created
      await wallet.createTransfer(100, accounts[5], {from: accounts[0]});
      // now we need to verify that our transfer was actually created
      const transfers = await wallet.getTransfers();
      // assert the Transfer array in transfers is the expected length -- which in this case is 1
      assert(transfers.length === 1);
      assert(transfers[0].id === '0');
      assert(transfers[0].amount === '100');
      assert(transfers[0].to === accounts[5]);
      assert(transfers[0].approvals === '0');
      assert(transfers[0].sent === false);
    }
  );

});
