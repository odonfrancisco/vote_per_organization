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

    event Debug(
        string description
    );

    // Admin can create multiple polls for their organization to vote on
    /* I wanted to have a mapping of uint => OptionStruct
    but could NOT get it to work so I'm working with a 
    more rudimentary approached. While not as sophisticated,
    it works and that's what makes me happy. This is my first
    real capstone project so I can't try and get too fancy */ 
    /* ^ this was when i was testing with a web3 instance of 
    votingContract. Now that I can test with an articfacts instance,
    i might attempt this */
    struct Poll {
        uint id;
        // issue on which voters are deciding on
        string issue;
        // Not even sure i need this votersArr tbh...
        uint[] voters;
        string[] options;
        uint[] results;
        // If -1, no result has been determined.
        // If other number, index of option won.
        int result;
    }

    struct TokenRef {
        uint tokenId;
        address owner;
        bool isAdmin;
    }
    
    string public name;
    uint[] public tokenIds;
    bool adminExists;
    Poll[] polls;
    mapping(uint => TokenRef) approvedTokens;
    // stores whether token has voted in a particular poll
    // mapping(tokenId => mapping(pollId => bool))
    mapping(uint => mapping(uint => bool)) public hasVoted;
    AccessToken accessToken;
    

    constructor(string memory _name, address tokenAddr) {
        name = _name;
        accessToken = AccessToken(tokenAddr);
    }

    function getPoll(uint pollId) external view returns(Poll memory) {
        require(pollId < polls.length, "Invalid poll id");
        return polls[pollId];
    }

    function getPolls() external view onlyApproved() returns(Poll[] memory ) {
        return polls;
    }

    function getTokenRef(uint tokenId) external view returns(TokenRef memory){
        TokenRef memory tokenRef = approvedTokens[tokenId];
        require(tokenRef.owner != address(0), "Invalid TokenID");
        return tokenRef;
    }

    function getTokenId(address owner) internal view returns(int) {
        uint balanceOf = accessToken.balanceOf(owner);
        int tokenId = -1;
        for(uint i = 0; i < balanceOf; i++){
            uint currentTokenId = accessToken.tokenOfOwnerByIndex(owner, i);
            if(approvedTokens[currentTokenId].owner == owner){
                tokenId = int(accessToken.tokenOfOwnerByIndex(owner, i));
            }
        }
        return tokenId;
    }

    function getTokenIds() external view returns(uint[] memory) {
        return tokenIds;
    }

    function changeName(string memory newName) external {
        name = newName;
    }

    /* Would like the ability to generateAdmin within constructor but 
    because i need the votingContract's address in string format (for the tokenURI), 
    don't think it'll be possible */
    function generateAdmin(string memory contractAddr) external {
        require(!adminExists, "Admin already exists for this contract");
        uint tokenId = accessToken.mintToken(msg.sender, contractAddr);
        TokenRef memory ar = TokenRef(
            tokenId,
            msg.sender,
            true
        );
        approvedTokens[tokenId] = ar;
        adminExists = true;
        tokenIds.push(tokenId);
        emit TokenCreated(tokenId, msg.sender, accessToken.tokenURI(tokenId));
    }


    function generateAccessToken(address approved, string memory contractAddr) 
        external 
        onlyAdmin()
        validAddress(approved) {
            bool hasToken; 
            uint balanceOf = accessToken.balanceOf(approved);
            for(uint i = 0; i < balanceOf; i++){
                uint currentTokenId = accessToken.tokenOfOwnerByIndex(approved, i);
                if(approvedTokens[currentTokenId].owner == approved){
                    hasToken = true;
                }
            }
            
            /* Need to fix this check. Will make it so that address may only
            have one access token per voting contract*/
            require(!hasToken, 
                "An address may only own one Access Token");
            uint tokenId = accessToken.mintToken(approved, contractAddr);
            TokenRef memory ar = TokenRef(
                tokenId,
                approved,
                false
            );
            approvedTokens[tokenId] = ar;
            tokenIds.push(tokenId);
            emit TokenCreated(tokenId, approved, accessToken.tokenURI(tokenId));
    }

    function removeApprovedVoter(address unapproved) external onlyAdmin() validAddress(unapproved) {                
        require(unapproved != msg.sender, "Admin may not be removed from approved list");
        
        // checks if unapproved has an access token
        int tokenId = getTokenId(unapproved);

        require(approvedTokens[uint(tokenId)].owner != address(0), 
            "Cannot remove a non-existing token");


        uint tokenIndex;
        for(uint i = 0; i < tokenIds.length; i++){
            if(tokenIds[i] == uint(tokenId)){
                tokenIndex = i;
            }
        }
        tokenIds[tokenIndex] = tokenIds[tokenIds.length - 1];
        tokenIds.pop();

        delete approvedTokens[uint(tokenId)];
        accessToken.burn(uint(tokenId));
    }

    /* This updates who is the current admin. there may only be 
    one admin per VotingContract */
    // Purposely requiring that newAdmin already holds an access token
    function updateAdmin(address newAdmin) external onlyAdmin() validAddress(newAdmin) {
        require(newAdmin != msg.sender, "Cannot replace admin with same address");

        // Saves newAdmin's current tokenId
        int tokenId = getTokenId(newAdmin);
        // checks if newAdmin has an access token
        bool newAdminIsApproved = tokenId > 0;
        require(newAdminIsApproved, 
            "New admin must have an access token");

        // Saves current admin's tokenId
        int adminTokenId = getTokenId(msg.sender);

        // newAdmin is added only if they are already an approved voter
        // redundant check after the above require statement 
        if(newAdminIsApproved){
            accessToken.transferToken(msg.sender, newAdmin, uint(adminTokenId));
            accessToken.transferToken(newAdmin, msg.sender, uint(tokenId));

            approvedTokens[uint(adminTokenId)].owner = newAdmin;
            approvedTokens[uint(tokenId)].owner = msg.sender;
        }
    }

    function createPoll(string calldata issue, string[] memory _options) 
        external 
        onlyAdmin()
        stringLength(issue) {
            require(_options.length > 0, 
                "Options parameter must not be empty");
            Poll memory p;
            p.id = polls.length;
            p.issue = issue;
            p.options = _options;
            p.result = -1;
            p.results = new uint[](_options.length);
            
            polls.push(p);
            
            emit PollCreated(p.id, p.issue);
    }

    /* poll will not _actually_ be deleted in order to discourage
    admin from carelessly creating polls. poll data will be erased
    but replaced with deleted-sig values */
    function deletePoll(uint pollId) external onlyAdmin() {
        // Need to require that poll hasn't already been decided
        require(pollId < polls.length,
            "Must pass a valid poll ID");
        string memory deletedPollSignature = "__??//::";
        /* I don't really need this right? solidity will automatically
        receive pollId as an unsigned int... */
        // require(pollId > 0,
        //     "Poll ID must be greater than 0");
        Poll memory p;
        p.id = pollId;
        p.issue = deletedPollSignature;
        p.result = -2;

        polls[pollId] = p;
    }

    function vote(uint pollId, uint optionId) external onlyApproved() {
        require(pollId < polls.length, 
            "Must pass a valid poll ID");
        Poll storage p = polls[pollId];
        require(optionId < p.options.length, 
            "Must pass a valid option ID");
        require(p.result == -1, 
            "Cannot cast vote on an already decided poll");

        uint tokenId = uint(getTokenId(msg.sender)); 
        require(!hasVoted[tokenId][pollId], 
            "Cannot vote on same poll twice");

        p.voters.push(tokenId);
        p.results[optionId]++;
        hasVoted[tokenId][pollId] = true;
        bool decided = false;

        if(p.voters.length == tokenIds.length){
            decided = decideResult(pollId);
        }
        
        emit VoteCasted(pollId, optionId, msg.sender, decided);
    }

    /* Should I require that a valid Poll ID is passed? 
    Would be redundant since vote() (the function that calls this)
    already checks for a valid pollId  */
    /* ^ I should require valid Poll ID if i ever decide to make poll
    self-decide at a particular time frame */
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
        if(p.voters.length != tokenIds.length) {
            return false;
        }

        uint mostVotes = p.results[p.options.length - 1];
        uint winners;
        uint[] memory winnerIndexes = new uint[](p.options.length);
        for(uint i = 0; i < p.results.length; i++){
            /* "should" always work since this function won't be called
            until someone casts a vote. will consider adding a check */ 
            if(p.results[i] >= mostVotes) {
                winnerIndexes[winners] = i;
                mostVotes = p.results[i];
                winners++;
            }
        }
        // winners should _technically_ always be greater than 0
        if(winners == 1) {
            p.result = int(winnerIndexes[0]);
            return true;
        // Do i need this else statement?
        } else {
            string[] memory newOptions = new string[](winners);
            p.results = new uint[](winners);
            uint[] memory votersArr;
            p.voters = votersArr;
            for(uint i = 0; i < winners; i++){
                newOptions[i] = p.options[winnerIndexes[i]];
            }
            for(uint i = 0; i < tokenIds.length; i++){
                hasVoted[tokenIds[i]][pollId] = false;
            }
            p.options = newOptions;

            return false;
        }
    }

    modifier onlyApproved() {
        int tokenId = getTokenId(msg.sender);
        require(approvedTokens[uint(tokenId)].owner == msg.sender,
            "Must hold an access token to perform this action");
        _;
    }

    modifier onlyAdmin() {
        int tokenId = getTokenId(msg.sender);
        // ensures user has a valid tokenId
        require(uint(tokenId) >= 0,
            "Only admin may perform this action");
        // admin tokenID will always be the first lmnt in tokenIds array
        require(uint(tokenId) == tokenIds[0], 
            "Only admin may perform this action");
        require(approvedTokens[uint(tokenId)].isAdmin == true,
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