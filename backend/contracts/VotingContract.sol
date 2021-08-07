// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.6;

import "./AccessToken.sol";

contract VotingContract {

    /* I figure having these events is good practice
    but i'm not sure if there are more things I should 
    include to make it a complete event or whatever.
    Still just a young padawan. */
    event TokenCreated (
        uint tokenId,
        address owner,
        string contractAddr
    );

    event PollCreated(
        uint id,
        string issue
    );

    event VoteCasted(
        uint pollId,
        uint optionId,
        address voter,
        bool decided
    );

    // event AdminUpdated(
    //     uint contractIndex
    // );

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
        uint[] voters;
        string[] options;
        uint[] results;
        // If -1, no result has been determined.
        // If other number, index of option won.
        int result;
    }

    struct AccessRef {
        uint tokenId;
        address owner;
        bool isAdmin;
    }
    
    string public name;
    bool adminExists;
    uint numPolls;
    uint numTokens;
    mapping(uint => Poll) public polls;
    mapping(uint => AccessRef) public approvedTokens;
    // stores whether token has voted in a particular poll
    // mapping(tokenId => mapping(pollId => bool))
    mapping(uint => mapping(uint => bool)) hasVoted;
    AccessToken public accessToken;
    

    constructor(string memory _name, address tokenAddr) {
        name = _name;
        accessToken = AccessToken(tokenAddr);
    }

    function getAccessRef(uint tokenId) external view returns(AccessRef memory){
        return approvedTokens[tokenId];
    }

    function getPoll(uint pollId) external view returns(Poll[1] memory) {
        /* Using this as a workaround to retrieve a particular, 
        since Poll doesn't return arrays within struct when 
        call mapping polls() function. Would like to know 
        if there's a better way to accomplish this */
        Poll[1] memory pollArr = [polls[pollId]];
        return pollArr;
    }

    function generateAdmin(string memory contractAddr) external {
        require(!adminExists, "Admin already exists for this contract");
        uint tokenId = accessToken.mintToken(msg.sender, contractAddr);
        AccessRef memory ar = AccessRef(
            tokenId,
            msg.sender,
            true
        );
        approvedTokens[tokenId] = ar;
        adminExists = true;
        numTokens++;
        emit TokenCreated(tokenId, msg.sender, accessToken.tokenURI(tokenId));
    }


    function generateAccessToken(address approved, string memory contractAddr) 
        external 
        onlyAdmin()
        validAddress(approved) {
            uint balanceOf = accessToken.balanceOf(approved);
            /* Need to fix this check. Will make it so that address may only
            have one access token per voting contract*/
            require(balanceOf == 0, 
            "An address may only own one Access Token");
            uint tokenId = accessToken.mintToken(approved, contractAddr);
            AccessRef memory ar = AccessRef(
                tokenId,
                approved,
                false
            );
            approvedTokens[tokenId] = ar;
            numTokens++;
            emit TokenCreated(tokenId, approved, accessToken.tokenURI(tokenId));
    }

    // function removeApprovedVoter(address unapproved) external onlyAdmin() validAddress(unapproved) {                
    //     require(unapproved != admin, "Admin may not be removed from approved list");
        
    //     uint unapprovedIndex;
    //     bool foundIndex = false;
        
    //     for(uint i = 0; i < approved.length; i++){
    //         if(approved[i] == unapproved){
    //             unapprovedIndex = i;
    //             foundIndex = true;
    //             // stops forLoop if found index of unapproved
    //             break;
    //         }
    //     }

    //     if(foundIndex){
    //         delete approved[unapprovedIndex];
    //         // replaces deleted spot with last element of array
    //         /* I questionn whether i need to explicitly delete
    //         the unapprovedIndex element as i do above or if i 
    //         can just skip straight to replacing it as i do below */
    //         approved[unapprovedIndex] = approved[approved.length - 1];
    //         /* then removes last element from array to ensure the replacer 
    //         approved address doesn't show up twice in array */
    //         approved.pop();
    //     }
    // }

    /* This updates who is the current admin. there may only be 
    one admin per VotingContract */
    // Purposely requiring that newAdmin already holds an access token
    function updateAdmin(address newAdmin) external onlyAdmin() validAddress(newAdmin) {
        require(newAdmin != msg.sender, "Cannot replace admin with same address");

        bool newAdminIsApproved = false;
        uint balanceOf = accessToken.balanceOf(newAdmin);
        // Saves newAdmin's current tokenId
        uint tokenId;
        // checks if newAdmin has an access token
        for(uint i = 0; i < balanceOf; i++){
            uint currentTokenId = accessToken.tokenOfOwnerByIndex(newAdmin, i);
            if(approvedTokens[currentTokenId].owner == newAdmin){
                tokenId = currentTokenId;
                newAdminIsApproved = true;
            }
        }
        require(newAdminIsApproved, 
            "New admin must have an access token");

        uint adminBalanceOf = accessToken.balanceOf(msg.sender);
        // Saves current admin's tokenId
        uint adminTokenId;
        for(uint i = 0; i < adminBalanceOf; i++){
            uint currentTokenId = accessToken.tokenOfOwnerByIndex(msg.sender, i);
            if(approvedTokens[currentTokenId].owner == msg.sender){
                adminTokenId = currentTokenId;
            }
        }

        // newAdmin is added only if they are already an approved voter
        // redundant check after the above require statement 
        if(newAdminIsApproved){
            accessToken.transferToken(msg.sender, newAdmin, adminTokenId);
            accessToken.transferToken(newAdmin, msg.sender, tokenId);

            approvedTokens[adminTokenId].owner = newAdmin;
            approvedTokens[tokenId].owner = msg.sender;
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
            p.results = new uint[](_options.length);
            
            emit PollCreated(p.id, p.issue);
            numPolls++;
    }

    function vote(uint pollId, uint optionId) external onlyApproved() {
        require(pollId < numPolls, 
            "Must pass a valid poll ID");
        Poll storage p = polls[pollId];
        require(optionId < p.options.length, 
            "Must pass a valid option ID");
        require(p.result == -1, 
            "Cannot cast vote on an already decided poll");

        uint balanceOf = accessToken.balanceOf(msg.sender);
        uint tokenId; 
        for(uint i = 0; i < balanceOf; i++){
            uint currentTokenId = accessToken.tokenOfOwnerByIndex(msg.sender, i);
            if(approvedTokens[currentTokenId].owner == msg.sender){
                tokenId = currentTokenId;
            }
        }
        require(!hasVoted[tokenId][pollId], 
            "Cannot vote on same poll twice");

        p.voters.push(tokenId);
        p.results[optionId]++;
        hasVoted[tokenId][pollId] = true;
        
        emit VoteCasted(pollId, optionId, msg.sender, decideResult(pollId));
    }

    /* Should I require that a valid Poll ID is passed? 
    Would be redundant since vote() (the function that calls this)
    already checks for a valid pollId  */
    // Need to handle draws.
    /* On draw, I think i should reset poll, but only with the top options
    (if 3 options got highest vote, then those three options remain, rest leave) */
    function decideResult(uint pollId) internal returns(bool) {
        Poll storage p = polls[pollId];
        // Not sure if i should use a require, or the IF statement as I currently am
        // require(!p.decided, "This poll has already been decided");
        if(p.result != -1) {
            return false;
        }

        /* Not sure if i want this. What if admin wants to decide a vote before
        all approved vote? What if admin wants poll to be open
        only during a particular time period? */
        // require(p.voters.length == approved.length, "All approved addresses must vote");
        if(p.voters.length != numTokens) {
            return false;
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

        return true;
    }

    modifier onlyApproved() {
        uint balanceOf = accessToken.balanceOf(msg.sender);
        require(balanceOf == 1,
        "Must hold an access token to perform this action");
        _;
    }

    modifier onlyAdmin() {
        uint balanceOf = accessToken.balanceOf(msg.sender);
        require(balanceOf > 0,
            "Only admin may perform this action");
        uint tokenId; 
        for(uint i = 0; i < balanceOf; i++){
            uint currentTokenId = accessToken.tokenOfOwnerByIndex(msg.sender, i);
            if(approvedTokens[currentTokenId].owner == msg.sender){
                tokenId = currentTokenId;
            }
        }
        require(approvedTokens[tokenId].isAdmin == true,
            "Only admin may perform this action");
        _;
    }

    modifier validAddress(address _address) {
        require(_address != address(0),"A valid address must be passed");
        _;
    }

    modifier stringLength(string calldata str) {
        require(bytes(str).length > 0, 
            "String parameter must be of a valid length");
        _;
    }    
}