const CreatorContract = artifacts.require("./CreatorContract.sol");
const VotingContract = artifacts.require("./VotingContract");
const { expectRevert } = require('@openzeppelin/test-helpers');

contract("VotingContract_Poll", (accounts) => {
    let vc;
    let cc;
    let contractAddr;
    let account1;
    let account2;
    let account3;
    let address0 = "0x0000000000000000000000000000000000000000";

    beforeEach(async () => {
        cc = await CreatorContract.deployed();
        account1 = accounts[0];
        account2 = accounts[1];
        account3 = accounts[2];
        // Creates first VotingContract
        const newContract = await cc.createContract("First Organization", {from: account1});
        // Retrieves VotingContract address 
        contractAddr = newContract.receipt.logs[0].args[0];
        // Fetches creates VotingContract
        vc = await VotingContract.at(contractAddr);
        await vc.approveVoters([account2, account3]);
    })

    it("Successfully creates polls", async () => {
        const pollIssue = "First Poll";
        const pollIssue2 = "Second Poll";
        const pollOptions = ["Henry", "Michael", "Trevor"];
        const pollOptions2 = ["Forman", "Bubba", "Biggie"];
        const tx = await vc.createPoll(pollIssue, pollOptions, {from: account1})
        const tx2 = await vc.createPoll(pollIssue2, pollOptions2, {from: account1})
        const pollId = tx.receipt.logs[0].args[0];
        const pollId2 = tx2.receipt.logs[0].args[0];

        const newPoll = (await vc.getPoll(pollId))[0];
        const newPoll2 = (await vc.getPoll(pollId2))[0];

        assert(newPoll.issue === pollIssue,
            "Poll1 issue not saved correctly");
        assert(newPoll.id.toString() === pollId.toString(),
            "Poll1 ID not saved correctly");
        assert(newPoll.options[0] === pollOptions[0],
            "Poll1 options[0] not saved correctly");        
        assert(newPoll.options[1] === pollOptions[1],
            "Poll1 options[1] not saved correctly");        
        assert(newPoll.options[2] === pollOptions[2],
            "Poll1 options[2] not saved correctly");        
        assert(newPoll.results.length.toString() === pollOptions.length.toString(),
            "Poll1 results array not saved correctly");
        assert(newPoll.decided === false,
            "Poll1 decided not set to false");

        assert(newPoll2.issue === pollIssue2,
            "Poll2 issue not saved correctly");
        assert(newPoll2.id.toString() === pollId2.toString(),
            "Poll2 ID not saved correctly");
        assert(newPoll2.options[0] === pollOptions2[0],
            "Poll2 options[0] not saved correctly");        
        assert(newPoll2.options[1] === pollOptions2[1],
            "Poll2 options[1] not saved correctly");        
        assert(newPoll2.options[2] === pollOptions2[2],
            "Poll2 options[2] not saved correctly");        
        assert(newPoll2.results.length.toString() === pollOptions2.length.toString(),
            "Poll2 results array not saved correctly");
        assert(newPoll2.decided === false,
            "Poll2 decided not set to false");    
    })

    it("Does NOT create poll if not admin", async () => {
        const pollIssue = "First Poll";
        const pollOptions = ["Henry", "Michael", "Trevor"];
        await expectRevert(
            vc.createPoll(pollIssue, pollOptions, {from: account2}),
            "Only admin may perform this action"
        );
    })

    it("Does NOT create poll if invalid string passed", async () => {
        const pollOptions = ["Henry", "Michael", "Trevor"];
        await expectRevert(
            vc.createPoll("", pollOptions, {from: account1}),
            "String parameter must be of a valid length"
        );
    })
    it("Does NOT create poll if invalid array passed", async () => {
        const pollIssue = "First Poll";
        await expectRevert(
            vc.createPoll(pollIssue, [], {from: account1}),
            "Options parameter must not be empty"
        );
    })

    it("Votes correctly", async () => {
        const pollIssue = "First Poll";
        const pollOptions = ["Henry", "Michael", "Trevor"];
        const tx = await vc.createPoll(pollIssue, pollOptions, {from: account1})
        const pollId = tx.receipt.logs[0].args[0];

        const voteTx = await vc.vote(pollId, 2, {from: account1});
        const newPoll = (await vc.getPoll(pollId))[0];
        
        assert(newPoll.result.toString() === '-1', 
            "Decided() was prematurely called");
    })
})