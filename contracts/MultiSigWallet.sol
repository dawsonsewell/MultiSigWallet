pragma solidity 0.6.0;
pragma experimental ABIEncoderV2;

contract Wallet {
    // we need to make our contract able to receive ether 
    // all contracts act as a wallet and can receive ether by declaring w/o function body
    receive() external payable {}
    
    // approvers holds an array of address that can approve transactions
    address[] public approvers;
    
    // quorum is the number of approvers needed for a tx to go through
    uint public quorom; 
    
    // we need a way to transfer ether that has a unique id, specifies amount
    // of ether being sent, an address getting the ether, the number of 
    // approvers approving the tx, and a confirmation that the ether sent 
    struct Transfer {
        uint id;
        uint amount;
        address payable to;
        uint approvals;
        bool sent; // false is the default bool value 
    }
    
    // we need a way to track transfers 
    Transfer[] public transfers;
    
    // we need a mapping of who approved what 
    // this can be done using a nested mapping structure and 
    // allows one address to approve multiple transactions 
    mapping(address => mapping(uint => bool)) public approvals;
    
    // both approvers and quorom need initial values so we need a constructor 
    constructor(address[] memory _approvers, uint _quorum) public {
        approvers = _approvers; 
        quorom = _quorum;
    }
    
    // we need to create a modifier which grants access to certain functions of the 
    // smart contract 
    modifier onlyApprover() {
        bool allowed = false; 
        // need to loop through the approver[] array to see if the msg.sender address
        // is inside of the array making is a valid approver
        for(uint i = 0; i < approvers.length; i++) {
            if(approvers[i] == msg.sender) {
                allowed = true;
            }
        }
        require(allowed == true, "Sorry, only approvers can use this function");
        _;
    }
    
    // we need to create a function that lists all the approvers 
    function getApprovers() external view returns(address[] memory) {
        return approvers;
    }
    
    // we need to create a funciton that lists all the transfers 
    // we need to return a struct from a function so we need a special 
    // pragme statement to do this 'pragma experimental ABIEncoderV2'
    function getTransfers() external view returns(Transfer[] memory) {
        return transfers;
    }
    
    // the function below has the code for creating transfers that takes 
    // the amount being transferred and the address the sender wants to 
    // send ether to 
    function createTransfer(uint amount, address payable to) external onlyApprover() {
        // first we need to reference our transfers mapping at the correct id
        // and then initiate our struct with appropriate parameters 
        transfers.push(Transfer(
            transfers.length, 
            amount, 
            to, 
            0, 
            false
            ));
    }
    
    function approveTransfer(uint id) external onlyApprover() {
        // first check if the tx has been sent -- does not make sense to approve 
        // a tx that has already been sent 
        require(transfers[id].sent == false, "Transfer has already been sent");
        // need to check if approver already approved the tx
        require(approvals[msg.sender][id] == false, "Cannot approve a transfer twice");
        
        // now we need to set the approval from the msg.sender address to true 
        approvals[msg.sender][id] == true;
        
        // after tx is approved by msg.sender we need to increment the approvals 
        // value of the transfers struct array associated with the transfer approval
        transfers[id].approvals++;
        
        // now we need to check if tx has enough approvals to be sent 
        if(transfers[id].approvals >= quorom) {
            // first update the sent to be true than extract details of tx
            transfers[id].sent = true;
            // sets the payable address the tx is sending eth to 
            address payable to = transfers[id].to;
            //  get the amount of the tx
            uint amount = transfers[id].amount;
            // finally make the transfer to appropriate address 
            // the .transfer method is a solidity method attached to every payable address
            to.transfer(amount);
        }
    }
}









