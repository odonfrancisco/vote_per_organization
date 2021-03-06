const VotingContract = artifacts.require("./VotingContract");
const AccessToken = artifacts.require("AccessToken");
const { expectRevert } = require('@openzeppelin/test-helpers');

contract("VotingContract_Poll", (accounts) => {
    let vc;
    let accessToken;
    let account1;
    let account2;
    let account3;
    let account4;
    const address0 = "0x0000000000000000000000000000000000000000";
    const deletedPollSignature = "__??//::";

    const pollIssue = "First Poll";
    const pollIssue2 = "Second Poll";
    const pollOptions = ["Henry", "Michael", "Trevor"];
    const pollOptions2 = ["Forman", "Bubba", "Biggie"];
    let pollId;
    let pollId2;

    before(async () => {
        vc = await VotingContract.deployed();
        accessToken = await AccessToken.deployed();
        account1 = accounts[0];
        account2 = accounts[1];
        account3 = accounts[2];
        account4 = accounts[3];
    })

    it("Successfully creates polls", async () => {
        const tx = await vc.createPoll(pollIssue, pollOptions, {from: account1})
        const tx2 = await vc.createPoll(pollIssue2, pollOptions2, {from: account1})
        pollId = tx.receipt.logs[0].args[0];
        pollId2 = tx2.receipt.logs[0].args[0];
        const newPoll = await vc.getPoll(pollId);
        const newPoll2 = await vc.getPoll(pollId2);

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
        assert(newPoll.result.toString() === '-1',
            "Poll1 result not set to -1");

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
        assert(newPoll2.result.toString() === '-1',
            "Poll2 result not set to -1");    
    })

    it("Does NOT create poll if not admin", async () => {
        await expectRevert(
            vc.createPoll(pollIssue, pollOptions, {from: account2}),
            "Only admin may perform this action"
        );
    })

    it("Does NOT create poll if invalid string passed", async () => {
        await expectRevert(
            vc.createPoll("", pollOptions, {from: account1}),
            "String parameter must be of a valid length"
        );
    })

    it("Does NOT create poll if invalid array passed", async () => {
        await expectRevert(
            vc.createPoll(pollIssue, [], {from: account1}),
            "Options parameter must not be empty"
        );
    })

    it("Successfully deletes a poll", async () => {
        const tx = await vc.createPoll("I should be deleted", pollOptions, {from: account1})
        const pollId = tx.receipt.logs[0].args[0];
        await vc.deletePoll(pollId, {from: account1});
        const pollAfterDelete = await vc.getPoll(pollId);

        assert(pollAfterDelete.issue === deletedPollSignature,
            "Deleted-poll issue not saved correctly");
        assert(pollAfterDelete.result === '-2',
            "Deleted-poll result not saved as -2");
        assert(pollAfterDelete.options.length === 0,
            "Deleted-poll options not saved correctly");
    })

    it("Does NOT delete poll if not admin", async () => {
        await expectRevert(
            vc.deletePoll(pollId, {from: account2}),
            "Only admin may perform this action"
        );
    })

    it("Does NOT delet poll if invalid pollId is passed", async () => {
        await expectRevert(
            vc.deletePoll(999, {from: account1}),
            "Must pass a valid poll ID"
        );
    })

    it("Retrieves all polls", async () => {
        const polls = await vc.getPolls();

        assert(polls[pollId].issue === pollIssue,
            "Poll1 issue not saved correctly");
        assert(polls[pollId].id.toString() === pollId.toString(),
            "Poll1 ID not saved correctly");
        assert(polls[pollId].options[0] === pollOptions[0],
            "Poll1 options[0] not saved correctly");        
        assert(polls[pollId].options[1] === pollOptions[1],
            "Poll1 options[1] not saved correctly");        
        assert(polls[pollId].options[2] === pollOptions[2],
            "Poll1 options[2] not saved correctly");        
        assert(polls[pollId].results.length.toString() === pollOptions.length.toString(),
            "Poll1 results array not saved correctly");
        assert(polls[pollId].result.toString() === '-1',
            "Poll1 result not set to -1");

        assert(polls[pollId2].issue === pollIssue2,
            "Poll2 issue not saved correctly");
        assert(polls[pollId2].id.toString() === pollId2.toString(),
            "Poll2 ID not saved correctly");
        assert(polls[pollId2].options[0] === pollOptions2[0],
            "Poll2 options[0] not saved correctly");        
        assert(polls[pollId2].options[1] === pollOptions2[1],
            "Poll2 options[1] not saved correctly");        
        assert(polls[pollId2].options[2] === pollOptions2[2],
            "Poll2 options[2] not saved correctly");        
        assert(polls[pollId2].results.length.toString() === pollOptions2.length.toString(),
            "Poll2 results array not saved correctly");
        assert(polls[pollId2].result.toString() === '-1',
            "Poll2 result not set to -1");    
    })

    it("Votes correctly", async () => {
        await vc.vote(pollId, pollOptions.length - 1, {from: account1});
        const newPoll = (await vc.getPoll(pollId));
        
        assert(newPoll.result.toString() === '-1', 
            "Decided() was prematurely called");
    })

    it("Does NOT vote if not an approved voter" , async () => {
        await expectRevert(
            vc.vote(pollId, pollOptions.length - 2, {from: accounts[5]}),
            "Must hold an access token to perform this action"
        );
    })

    it("Does NOT vote if invalid pollId is passed", async () => {
        await expectRevert(
            vc.vote(999, pollOptions.length - 1, {from: account2}),
            "Must pass a valid poll ID"
        );
    })

    it("Does NOT vote if invalid optionId is passed", async () => {
        await expectRevert(
            vc.vote(pollId, pollOptions.length, {from: account2}),
            "Must pass a valid option ID"
        );
    })

    it("Does NOT vote on an already decided poll", async () => {
        const tx = await vc.createPoll(pollIssue, pollOptions, {from: account1})
        const pollId = tx.receipt.logs[0].args[0];

        await vc.vote(pollId, pollOptions.length - 3, {from: account1});
        await vc.vote(pollId, pollOptions.length - 3, {from: account2});
        await vc.vote(pollId, pollOptions.length - 3, {from: account3});
        await vc.vote(pollId, pollOptions.length - 3, {from: account4})

        await expectRevert(
            vc.vote(pollId, pollOptions.length - 3, {from: account1}),
            "Cannot cast vote on an already decided poll"
        );
    })

    it("Does NOT let account vote on same poll twice", async () => {
        await vc.vote(pollId, pollOptions.length - 3, {from: account2});

        await expectRevert(
            vc.vote(pollId, pollOptions.length - 3, {from: account2}),
            "Cannot vote on same poll twice"
        );
    })

    /* should include test which transfers one accessToken to a
    different account, new account tries to vote and is unsuccessful
    because that particular NFT alreadf voted on poll */
})