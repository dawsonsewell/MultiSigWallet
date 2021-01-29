const { expectRevert } = require('@openzeppelin/test-helpers');
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
       value: 1000 // this is 1000 wei that is going to be sent in the tx
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

  // the below test tests for the 'happy path' where the function works as intended
  // i.e the createTransfer funciton is called by an address present in onlyApprover
  it(
    'Should create transfers', // we are testing the createTransfer function of Wallet.sol
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
      // assert that each attribute of transfers created by the createTransfer function is as expected
      assert(transfers.length === 1);
      assert(transfers[0].id === '0');
      assert(transfers[0].amount === '100');
      assert(transfers[0].to === accounts[5]);
      assert(transfers[0].approvals === '0');
      assert(transfers[0].sent === false);
    }
  );

  // when running tests to see if they work. We can test only one 'it'
  // by running it.only() --> this will speed up testing b/c it will only run the it.only statement and not run the other 'it' statements present in the test truffle file
  it(
    'Should NOT create transfer if sender is not approved',
    async () => {
      // the accounts[6] will not be present in the onlyApprover array
      // test if this produces the correct error
      // the expectRevert function is an easy way to test 'require' funcitons in the smart contract being tested
      await expectRevert(
        wallet.createTransfer(100, accounts[5], {from: accounts[6]}),
        "Sorry, only approvers can use this function"
      );

    }
  );

  it('Should increment approvals',
    async () => {
      // first we need to create a transfer
      await wallet.createTransfer(100, accounts[5], {from: accounts[0]});
      // then we need to approve the transfer by giving the
      // approveTransfer() function the id of the transfer from
      // one of the addresses associated with the approvers
      await wallet.approveTransfer(0, {from: accounts[0]});
      // then we need to get the transfer to check that approvals are now equal to 1 instead of zero
      const transfers = await wallet.getTransfers();
      // we also need to check that all the ether is still in the smart contract account and not sent
      assert(transfers[0].approvals === '1');
      // we must also check that the sent status is false b/c to send a tx we need two approvals
      assert(transfers[0].sent === false);
      const balance = await web3.eth.getBalance(wallet.address);
      // since no eth has been sent yet, we should still have the original amount of eth in the wallet.address set in beforeEach --> which is 1000 wei
      assert(balance === '1000');
    }

  );

  it('Should send transfer if quorum is reached',
    async () => {
      // need to convert account balance to a usable number for js
      // since eth is converted to wei, we will have trouble dealing with
      // very large numbers with js so we need to use web3.utils.toBN
      const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(accounts[6]));
      assert(web3.utils.isBN(balanceBefore)); // --> when only asserting this line it works
      await wallet.createTransfer(100, accounts[6], {from: accounts[0]});
      await wallet.approveTransfer(0, {from: accounts[0]});
      await wallet.approveTransfer(0, {from: accounts[1]});
      const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(accounts[6]));
      // Need to check if the balance after minus the balance before is equal to the transfer amount
      // the below assertion takes into account gas fees paid by running tests
      assert(balanceAfter.sub(balanceBefore).toNumber() === 100);;
      assert(web3.utils.isBN(balanceAfter));
      const transfers = await wallet.getTransfers();
      assert(transfers[0].approvals === '2');
      assert(transfers[0].sent === true);


      // const balance = await web3.eth.getBalance(wallet.address);
      // console.log(balance); // shows the amount of wei left for sending via future transactions
    }
  );

  it('Should NOT approve transfer if sender is not approved',
    async () => {
      await wallet.createTransfer(100, accounts[6], {from: accounts[0]});
      await expectRevert(
        wallet.approveTransfer(0, {from: accounts[5]}),
        "Sorry, only approvers can use this function"
      );
    }
  );

  it('Should NOT approve transfer if transfer is already sent',
    async () => {
      await wallet.createTransfer(100, accounts[6], {from: accounts[0]});
      await wallet.approveTransfer(0, {from: accounts[0]});
      await wallet.approveTransfer(0, {from: accounts[1]});
      await expectRevert(
        wallet.approveTransfer(0, {from: accounts[2]}),
        'Transfer has already been sent'
      );
    }
  );

  it('Should NOT approve transfer twice',
    async () => {
      await wallet.createTransfer(100, accounts[5], {from: accounts[0]});
      await wallet.approveTransfer(0, {from: accounts[0]});
      await expectRevert(
        wallet.approveTransfer(0, {from: accounts[0]}),
        'Cannot approve transfer twice'
      );
    }
  );

});
