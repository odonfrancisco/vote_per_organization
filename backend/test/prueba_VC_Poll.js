const CreatorContract = artifacts.require("./CreatorContract.sol");
const VotingContract = artifacts.require("./VotingContract");
const { expectRevert } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');

contract("VotingContract_Poll", (accounts) => {
    let vc;
    let cc;
    let contractAddr;
    let account1;
    let account2;
    let account3;
    let address0 = "0x0000000000000000000000000000000000000000";

    beforeEach(async () => {
        // cc = await CreatorContract.deployed();
        account1 = accounts[1];
        account2 = accounts[1];
        account3 = accounts[2];
        // Creates first VotingContract
        // const newContract = await cc.createContract("First Organization", {from: account1});
        // Retrieves VotingContract address 
        // contractAddr = newContract.receipt.logs[0].args[0];
        /* Stores VotingContract as variable. This is a temporary solution
        until I find a better way to retrieve the created VotingContract...
        Not sure if this is the correct way to retrieve it 
        but it works for now ;) */ 
        // const votingContract = new web3.eth.Contract(VotingContract.abi, contractAddr);
        vc = await VotingContract.deployed();
        // vc = votingContract.methods;
    })

    it("Successfully creates polls", async () => {
        const pollIssue = "First Poll";
        const pollIssue2 = "Second Poll";
        const pollOptions = ["Henry", "Michael", "Trevor"];
        const pollOptions2 = ["Forman", "Bubba", "Biggie"];
        const tx = await vc.createPoll(pollIssue)
        const tx2 = await vc.createPoll(pollIssue2)
        const pollId = tx.receipt.logs[0].args[0];
        const pollId2 = tx2.receipt.logs[0].args[0];
        for(let i = 0; i < pollOptions.length; i++){
            /* Need to add each option separately
            because solidity doesn't let me 
            add them inside of a for loop for some reason
            which i don't understand yet. still have a 
            lot to learn */
            await vc.addOption(pollId, pollOptions[i])
            /* Similar issue to above, although it's weird that i can't
            add the result integer to corresponding spot
            inside of addOption(). weird shit but i will eventually
            learn. just gotta keep building */ 
            await vc.addOptionResult(pollId)
        }
        // These comments are how I keep myself sane lol
        for(let i = 0; i < pollOptions2.length; i++){
            await vc.addOption(pollId2, pollOptions2[i])
            await vc.addOptionResult(pollId2)
        }        
        /* WTF??? two lines below are not returning
        the 3 arrays inside the poll object. weird */ 
        // const newPoll = await vc.polls(pollId);
        // const newPoll2 = await vc.polls(pollId2);
        const polls = await vc.getPolls();
        const newPoll = polls[pollId];
        const newPoll2 = polls[pollId2];

        assert(newPoll.issue === pollIssue,
            "Poll1 issue not saved correctly");
        assert(newPoll.id === pollId,
            "Poll1 ID not saved correctly");
        assert(newPoll.options[0] === pollOptions[0],
            "Poll1 options[0] not saved correctly");        
        assert(newPoll.options[1] === pollOptions[1],
            "Poll1 options[1] not saved correctly");        
        assert(newPoll.options[2] === pollOptions[2],
            "Poll1 options[2] not saved correctly");        
        assert(newPoll.results.length === pollOptions.length,
            "Poll1 results array not saved correctly");
        assert(newPoll.decided === false,
            "Poll1 decided not set to false");

        assert(newPoll2.issue === pollIssue2,
            "Poll2 issue not saved correctly");
        assert(newPoll2.id === pollId2,
            "Poll2 ID not saved correctly");
        assert(newPoll2.options[0] === pollOptions2[0],
            "Poll2 options[0] not saved correctly");        
        assert(newPoll2.options[1] === pollOptions2[1],
            "Poll2 options[1] not saved correctly");        
        assert(newPoll2.options[2] === pollOptions2[2],
            "Poll2 options[2] not saved correctly");        
        assert(newPoll2.results.length === pollOptions2.length,
            "Poll2 results array not saved correctly");
        assert(newPoll2.decided === false,
            "Poll2 decided not set to false");    
    })

    it("Does NOT create poll if not admin", async () => {
        const pollIssue = "First Poll";
        await expectRevert(
            vc.createPoll(pollIssue),
            "Only admin may perform this action"
        );
    })

    it("Does NOT create poll if invalid string passed", async () => {
        await expectRevert(
            vc.createPoll(""),
            "String parameter must be of a valid length"
        );

    })

    it("Does NOT add options or optionResults if not admin", async () => {
        const pollIssue = "First Poll";
        const pollOptions = ["Henry", "Michael", "Trevor"];
        const tx = await vc.createPoll(pollIssue)
        const pollId = tx.receipt.logs[0].args[0];
        await expectRevert(
            vc.addOption(pollId, pollOptions[0]),
            "Only admin may perform this action"
        );
        await expectRevert(
            vc.addOptionResult(pollId),
            "Only admin may perform this action"
        );
    })

    it("Does NOT add option if empty string is passed", async () => {
        const pollIssue = "First Poll";
        const tx = await vc.createPoll(pollIssue)
        const pollId = tx.receipt.logs[0].args[0];
        await expectRevert(
            vc.addOption(pollId, ""),
            "String parameter must be of a valid length"
        );
    })

    it("Does NOT add OptionResult if passing invalid pollId", async () => {
        const pollIssue = "First Poll";
        const pollOptions = ["Henry", "Michael", "Trevor"];
        const tx = await vc.createPoll(pollIssue)
        const pollId = tx.receipt.logs[0].args[0];
        vc.addOption(pollId, pollOptions[0])
        await expectRevert(
            vc.addOptionResult(pollId + 1),
            "Must pass a valid poll ID"
        );
    })

    it("Does NOT add OptionResult if yet to add option", async () => {
        const pollIssue = "First Poll";
        const tx = await vc.createPoll(pollIssue)
        const pollId = tx.receipt.logs[0].args[0];
        await expectRevert(
            vc.addOptionResult(pollId),
            "May not add an OptionResult until you add an option"
        );
    })

    it.only("Votes correctly", async () => {
        const pollIssue = "First Poll";
        const pollOptions = ["Henry", "Michael", "Trevor"];
        const tx = await vc.createPoll(pollIssue)
        const pollId = tx.receipt.logs[0].args[0];
        for(let i = 0; i < pollOptions.length; i++){
            /* Need to add each option separately
            because solidity doesn't let me 
            add them inside of a for loop for some reason
            which i don't understand yet. still have a 
            lot to learn */
            await vc.addOption(pollId, pollOptions[i])
            /* Similar issue to above, although it's weird that i can't
            add the result integer to corresponding spot
            inside of addOption(). weird shit but i will eventually
            learn. just gotta keep building */ 
            await vc.addOptionResult(pollId)
        }
        let polls = await vc.getPolls();
        let newPoll = polls[pollId];
        
        console.log(newPoll);

        const voteTx = await vc.vote(pollId, 2)
        polls = await vc.getPolls();
        newPoll = polls[pollId];
        
        console.log("|| AFTER VOTE ||")
        console.log(newPoll)

        
    })

})