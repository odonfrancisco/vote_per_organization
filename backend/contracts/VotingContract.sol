// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.6;

import "./CreatorContract.sol";

contract VotingContract {

    /* I figure having this event is good practice
    but i'm not sure if there are more things I should 
    include to make it a complete event or whatever.
    Still just a young padawan. */
    event PollCreated(
        uint id,
        string issue
    );

    event OptionAdded(
        string opt
    );

    event VoteCasted(
        uint pollId,
        uint optionId,
        address voter,
        bool decided
    );

    event AdminUpdated(
        uint contractIndex
    );

    event Debug(
        string description
    );

    // Admin can create multiple polls for their organization to vote on
    /* I wanted to have a mapping of uint => OptionStruct
    but could NOT get it to work so I'm working with a 
    more rudimentary approached. While not as sophisticated,
    it works and that's what makes me happy. This is my first
    real capstone project so I can't try and get too fancy */ 
    struct Poll {
        uint id;
        // issue on which voters are deciding on
        string issue;
        address[] voters;
        string[] options;
        uint[] results;
        // If -1, no result has been determined.
        // If other number, index of option won.
        int result;
        bool decided;
    }

    string public name;
    address public admin;
    uint numPolls;
    // array of approved addresses
    // Not sure if to keep this public. Don't think i'll need it to be
    address[] public approved;
    mapping(uint => Poll) public polls;
    // stores whether voter has voted in a particular poll
    // mapping(voterAddress => mapping(pollId => bool))
    mapping(address => mapping(uint => bool)) hasVoted;
    /* Stores CreatorContract to update the reference to votingContract name
    as well as admin rights if necessary */
    CreatorContract public creatorContract;
    

    constructor(string memory _name, address _admin, address _creator) {
        name = _name;
        admin = _admin;
        creatorContract = CreatorContract(_creator);
        approved.push(admin);
    }

    function getPoll(uint pollId) external view returns(Poll[1] memory) {
        /* Using this as a workaround to retrieve a particular, 
        since Poll doesn't return arrays within struct when 
        call mapping polls() function. Would like to know 
        if there's a better way to accomplish this */
        Poll[1] memory pollArr = [polls[pollId]];
        return pollArr;
    }

    function getApproved() external view returns(address[] memory) {
        return approved;
    }

    // Should I add a limit to the approvedList array?
    function approveVoters(address[] memory approvedList) external onlyAdmin() {
        /* I want to create a modifier for this since
        createPoll also requires a non-empty array, but 
        they are arrays of different types. */
        require(approvedList.length > 0, "Must not pass empty array of addresses");
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
            the unapprovedIndex element as i do above or if i 
            can just skip straight to replacing it as i do below */
            approved[unapprovedIndex] = approved[approved.length - 1];
            /* then removes last element from array to ensure the replacer 
            approved address doesn't show up twice in array */
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
            /* should wait until creatorContract.updateContractAdmin() returns success
            before assigning admin */
            admin = newAdmin;
            /* Not sure how I feel about passing msg.sender as a parameter vs
            calling the function AS msg.sender. I'd prefer to do that. If you're 
            reading this it means I need help lol. Would just like to know 
            how to call updateContractAdmin AS msg.sender instead of sending it 
            as a parameter */ 
            /* I believe the solution to this ^ would be to use tx.origin inside
            CreatorContract. Have yet to try */
            uint contractIndex = creatorContract.updateContractAdmin(newAdmin, msg.sender, address(this));
            emit AdminUpdated(contractIndex);
        }
    }

    function createPoll(string calldata issue, string[] memory _options) 
        external 
        onlyAdmin()
        stringLength(issue) {
            require(_options.length > 0, 
                "Options parameter must not be empty");
            Poll storage p = polls[numPolls];
            p.id = numPolls;
            p.issue = issue;
            p.options = _options;
            p.result = -1;
            for(uint i = 0; i < _options.length; i++){
                p.results.push(0);
            }
            
            emit PollCreated(p.id, p.issue);
            numPolls++;
    }

    function vote(uint pollId, uint optionId) external onlyApproved() {
        require(pollId < numPolls, 
            "Must pass a valid poll ID");
        Poll storage p = polls[pollId];

        require(optionId < p.options.length, 
            "Must pass a valid option ID");
        require(!p.decided, 
            "Cannot cast vote on an already decided poll");
        require(!hasVoted[msg.sender][pollId], 
            "Cannot vote on same poll twice");


        p.voters.push(msg.sender);
        p.results[optionId]++;
        hasVoted[msg.sender][pollId] = true;

        decideResult(pollId);
        
        emit VoteCasted(pollId, optionId, msg.sender, decideResult(pollId));
    }

    /* Should I require that a valid Poll ID is passed? 
    Would be redundant since vote() (the function that calls this)
    already checks for a valid pollId  */
    function decideResult(uint pollId) internal returns(bool) {
        Poll storage p = polls[pollId];
        // Not sure if i should use a require, or the IF statement as I currently am
        // require(!p.decided, "This poll has already been decided");
        if(p.decided) {
            return p.decided;
        }

        /* Not sure if i want this. What if admin wants to decide a vote before
        all approved vote? What if admin wants poll to be open
        only during a particular time period? */
        // require(p.voters.length == approved.length, "All approved addresses must vote");
        if(p.voters.length != approved.length) {
            // Return p.decided since it should be false;
            return p.decided;
        }

        uint mostVotes;
        uint winnerIndex;
        for(uint i = 0; i < p.results.length; i++){
            /* "should" always work since this function won't be called
            until someone casts a vote. will consider adding a check */ 
            if(p.results[i] > mostVotes) {
                winnerIndex = i;
            }
        }
        p.result = int(winnerIndex);
        p.decided = true;

        return p.decided;
    }

    modifier onlyApproved() {
        bool isApproved = false;
        for(uint i=0; i < approved.length; i++){
            if(approved[i] == msg.sender){
                isApproved = true;
            }
        }
        require(isApproved, "Only approved addresses may perform this action");
        _;
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

    modifier stringLength(string calldata str) {
        require(bytes(str).length > 0, 
            "String parameter must be of a valid length");
        _;
    }    
}