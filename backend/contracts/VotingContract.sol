pragma solidity ^0.8.6;

import "./CreatorContract.sol";

contract VotingContract {

    // Admin can create multiple polls for their organization to vote on
    struct Poll {
        uint id;
        // issue on which voters are deciding on
        string issue;
        // num of voters yet to vote
        uint votersLeft;
        // num of casted ballots
        uint numOfVoters;
        // options to vote on decided by poll creator
        string[] options;
        // stores number of votes per option
        mapping(string => uint) results;
        // final result
        string result;
        // whether this poll is active or closed
        bool decided;
    }

    event Debug(
        string description
    );

    string public name;
    address public admin;
    Poll[] public polls;
    // array of approved addresses
    address[] public approved;
    // stores whether voter has voted in a particular poll
    // mapping(voterAddress => mapping(pollId => bool))
    mapping(address => mapping(uint => bool)) hasVoted;
    /* Stores CreatorContract to update the reference to votingContract name
    as well as admin rights if necessary */
    /* Even though it doesn't fucking work :/ for some reason I get
    an error when I call a function inside creatorContract from this 
    smartContract which modifies the state in CreatorContract */ 
    CreatorContract public creatorContract;
    

    constructor(string memory _name, address _admin, address _creator) {
        /* Added this thinking it'd be useful but it seems that the contract 
        constructor automatically does a string length check */
        // require(bytes(_name).length > 0, "Contract name must not be empty");
        name = _name;
        admin = _admin;
        creatorContract = CreatorContract(_creator);
        approved.push(admin);
    }

    receive() external payable {}

    function getApproved() external view returns(address[] memory) {
        return approved;
    }

    // Should I add a limit to the approvedList array?
    function approveVoters(address[] memory approvedList) external onlyAdmin() {
        require(approvedList.length > 0, "Must not pass empty array of addresses");
        // should do a check to ensure not adding voter who is already approved

        /* adds addresses from approvedList to approved
        while simultaneously checking for repeats */
        for(uint i = 0; i < approvedList.length; i++){
            address current = approvedList[i];
            // skips address if equal to address(0)
            if(current == address(0)) {
                continue;
            }
            bool repeat = false;
            for(uint j = 0; j < approved.length; j++){
                if(approved[j] == current) {
                    repeat = true;
                    break;
                } 
            }
            // ensures address is not a repeat before pushing to array
            if(!repeat) {
                approved.push(current);
            }
        }
    }

    function removeApprovedVoter(address unapproved) external onlyAdmin() validAddress(unapproved) {                
        require(unapproved != admin, "Admin may not be removed from approved list");
        
        uint unapprovedIndex;
        bool foundIndex = false;
        
        for(uint i = 0; i < approved.length; i++){
            if(approved[i] == unapproved){
                unapprovedIndex = i;
                foundIndex = true;
                // stops forLoop if found index of unapproved
                break;
            }
        }

        if(foundIndex){
            delete approved[unapprovedIndex];
            // replaces deleted spot with last element of array
            /* I questionn whether i need to explicitly delete
            the unapprovedIndex element or if i can just skip
            straight to replacing it as i do below */
            approved[unapprovedIndex] = approved[approved.length - 1];
            /* then removes last element from array to ensure the approved
            address doesn't show up twice in array */
            approved.pop();
        }
    }

    /* This updates who is the current admin. there may only be 
    one admin per VotingContract */
    // Purposely requiring that newAdmin is an approvedAddress for safety
    function updateAdmin(address newAdmin) external onlyAdmin() validAddress(newAdmin) {
        require(newAdmin != admin, "Cannot replace admin with same address");

        // address oldAdmin = admin;
        bool newAdminIsApproved = false;

        // checks if newAdmin is already approved
        for(uint i = 0; i < approved.length; i++){
            if(newAdmin == approved[i]){
                newAdminIsApproved = true;
            }
        }

        require(newAdminIsApproved, 
            "New admin must be an already approved voter");

        // newAdmin is added only if they are already an approved voter
        // redundant check after the above require statement 
        if(newAdminIsApproved){
            // should wait until creatorContract.updateContractAdmin() returns success
            admin = newAdmin;
            // updates who has admin access to contract on CreatorContract.sol
            /* Not sure how I feel about passing msg.sender as a parameter vs
            calling the function AS msg.sender. I'd prefer to do that. If you're 
            reading this it means I need help lol. Would just like to know 
            how to call updateContractAdmin AS msg.sender instead of sending it 
            as a parameter */ 
            /* this SHOULD be called, but i'm getting a revert error when 
            calling directly from this SmartContract, not when calling 
            as account1 or whatever. Going to look into this in the future
            but I need to move on right now or else my head will fucking explode.  */ 
            // creatorContract.updateContractAdmin(newAdmin, msg.sender, address(this));
        }
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, 
            "Only admin may perform this action");
        _;
    }

    modifier validAddress(address _address) {
        require(_address != address(0), 
            "A valid address must be passed");
        _;
    }

    
}