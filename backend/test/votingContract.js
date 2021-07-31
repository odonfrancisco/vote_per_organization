const CreatorContract = artifacts.require("./CreatorContract.sol");
const VotingContract = require("../build/contracts/VotingContract.json"); 
const { expectRevert } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');

contract("VotingContract", (accounts) => {
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
        /* Stores VotingContract as variable. This is a temporary solution
        until I find a better way to retrieve the created VotingContract...
        Not sure if this is the correct way to retrieve it 
        but it works for now ;) */ 
        const votingContract = new web3.eth.Contract(VotingContract.abi, contractAddr);
        vc = votingContract.methods;
        // Sends eth to votingContract in order to 
        await web3.eth.sendTransaction({from: account1, to: contractAddr, value: 500000000000});
    })

    it("Contract created successfully", async () => {
        const name = await vc.name().call();
        const admin = await vc.admin().call();
        const approved = await vc.getApproved().call();


        assert(name === "First Organization", "VoterContract name not saved correctly");
        assert(admin === account1, "VoterContract admin not saved correctly");
        assert(approved.length === 1, "VoterContract approvedList not saved correctly")
        assert(approved[0] === account1, "ApprovedList[0] not added correctly");
    })

    /* Wanted to add test to ensure contract isn't created without a proper
    string length, but because it's added through the constructor, it seems
    that there is already a built in check. I had a require statement inside 
    the constructor but it doesn't seem necessary  */
    // it("Does NOT create contract if name is empty", async () => {
    //     await expectRevert(
    //         cc.createContract("", {from: account1}),
    //         expectRevert.unspecified()
    //     );
    // })

    it("Adds approved voters successfully", async () => {
        await vc.approveVoters([account2, account3]).send({from: account1});
        const approved = await vc.getApproved().call();
        
        assert(approved.length === 3, "Approved list not added correctly");
        assert(approved[0] === account1, "ApprovedList[0] not added correctly");
        assert(approved[1] === account2, "ApprovedList[1] not added correctly");
        assert(approved[2] === account3, "ApprovedList[2] not added correctly");
    })

    it("Does NOT add voters if already approved", async () => {
        await vc.approveVoters([account2, account3]).send({from: account1});
        const approved = await vc.getApproved().call();

        await vc.approveVoters([account1, account2, account3]).send({from: account1});
        const approved2 = await vc.getApproved().call();

        assert(approved.length === approved2.length, "Incorrectly added repeat addresses to approve list");
        assert(approved[0] === approved2[0], "First element in approvedList modified incorrectly");
        assert(approved[1] === approved2[1], "Second element in approvedList modified incorrectly");
        assert(approved[2] === approved2[2], "Third element in approvedList modified incorrectly");
    })

    it("Does NOT add voters if not called by admin", async () => {
        await expectRevert(
            vc.approveVoters([account3]).send({from: account2}),
            "Only admin may perform this action"
        );
    })

    it("Does NOT add voters if argument array length is 0", async () => {
        await expectRevert(
            vc.approveVoters([]).send({from: account1}),
            "Must not pass empty array of addresses"
        );
    })

    it("Does NOT add voter if address is full of 0's", async () => {
        await vc.approveVoters([address0, account2, account3]).send({from: account1});
        const approved = await vc.getApproved().call();
        let includesZero = false;

        approved.forEach(e => {
            if(e === address0){
                includesZero = true;
            }
        })

        assert(!includesZero, "Address(0) was not properly stopped from being added");
        assert(approved.length === 3, 
            "Address(0) incorrectly stopped other valid addresses from being added")
    })

    it("Successfully removes an approved voter", async () => {
        // Adds voter
        await vc.approveVoters([account2, account3]).send({from: account1});
        // Removes voter
        await vc.removeApprovedVoter(account2).send({from: account1});
        const approved = await vc.getApproved().call();
        let addressRemoved = true;

        approved.forEach(e => {
            if(e === account2){
                addressRemoved = false;
            }
        })

        assert(addressRemoved, "Address not removed from approved array");
        assert(approved.length === 2, "Address not removed from approved array");        
    })

    it("Does NOT remove approved voter if invalid address is passed", async () => {   
        await expectRevert(
            vc.removeApprovedVoter(address0).send({from: account1}),
            "A valid address must be passed"
        );
    })

    it("Does NOT remove approved voter if not called by admin", async () => {
        await expectRevert(
            vc.removeApprovedVoter(account1).send({from: account2}),
            "Only admin may perform this action"
        );
    })

    it("Does NOT remove admin from approved voter list", async () => {
        const approved = await vc.getApproved().call();
        assert(approved[0] === account1, "Admin is incorrectly not an approved user");
        await expectRevert(
            vc.removeApprovedVoter(account1).send({from: account1}),
            "Admin may not be removed from approved list"
        );
    })
    
    it("Successfully replaces admin address", async () => {
        const oldAdmin = await vc.admin().call();
        await vc.approveVoters([account2]).send({from: account1});

        await vc.updateAdmin(account2).send({from: account1});
        /* Function below should not be called like this. Ideally this would
        be called from within vc.updateAdmin() but am getting a revert error
        when msg.sender is the contract vs msg.sender is a person's address */
        const tx = await cc.updateContractAdmin(account2, account1, contractAddr);
        
        const newAdmin = await vc.admin().call();
        const newAdminArrIndex = tx.receipt.logs[0].args[1].words[0];
        const newAdminRef = await cc.contractMap(account2, newAdminArrIndex);

        assert(oldAdmin !== newAdmin, "New admin is still equal to old admin");
        assert(oldAdmin === account1, "Old admin retrieved incorrectly");
        assert(newAdmin === account2, "New admin saved incorrectly");
        assert(newAdminRef._address === contractAddr, 
            "Contract address not saved correctly for admin inside CreatorContract");
        assert(newAdminRef.name === "First Organization", 
            "Contract name not saved correctly for admin inside CreatorContract");
    })
    
    it("Does NOT replace admin if not called by admin", async () => {
        await vc.approveVoters([account2]).send({from: account1});
        await expectRevert(
            vc.updateAdmin(account2).send({from: account2}),
            "Only admin may perform this action"
        );
    })

    it("Does NOT replace admin if using same address as admin", async () => {
        await expectRevert(
            vc.updateAdmin(account1).send({from: account1}),
            "Cannot replace admin with same address"
        );
    })

    it("Does NOT replace admin if newAdmin is not already an approved user", async () => {
        await expectRevert(
            vc.updateAdmin(account2).send({from: account1}),
            "New admin must be an already approved voter"
        );
    })

    // it("Does NOT replace admin if newAdmin address is invalid");
    
})