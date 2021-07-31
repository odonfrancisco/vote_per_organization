const CreatorContract = artifacts.require("./CreatorContract.sol");
const { expectRevert } = require('@openzeppelin/test-helpers');

contract("CreatorContract", (accounts) => {
    let cc;
    let newContract;
    let contractAddr;
    let contractIndex;
    let account1;
    let account2;
    const address0 = "0x0000000000000000000000000000000000000000";

    beforeEach(async () => {
        cc = await CreatorContract.deployed();
        account1 = accounts[0];
        account2 = accounts[1];
        newContract = await cc.createContract("First Organization", {from: account1});
        // Is there a better way of retrieving data from event?
        contractIndex = newContract.receipt.logs[0].args[1].words[0];
        contractAddr = newContract.receipt.logs[0].args[0];
    })

    it("Creates contract successfully", async () => {
        assert(typeof(cc.contractMap(account1, contractIndex)) !== undefined, 
            "Contract not created successfully");
        assert((await cc.contractMap(account1, contractIndex)).name === "First Organization", 
            "Contract name not saved correctly")
    })

    it("Does NOT create contract if name parameter empty", async () => {
        await expectRevert(
            cc.createContract("", {from: account1}),
            "String parameter must be of a valid length"
        )
    })

    it("Updates contract admin successfully", async () => {
        const originalAdminContractRefsLengthBefore = (await cc.getContractRefs(account1)).length;
        const newAdminContract = await cc.updateContractAdmin(account2, account1, contractAddr, {from: account1});
        const newAdminContractIndex = newAdminContract.receipt.logs[0].args[1].words[0];
        const originalAdminContractRefsLengthAfter = (await cc.getContractRefs(account1)).length;

        assert(originalAdminContractRefsLengthBefore 
            != originalAdminContractRefsLengthAfter,
            "Original admin contractRef not deleted correctly");
        assert(originalAdminContractRefsLengthBefore ==
            originalAdminContractRefsLengthAfter + 1,
            "Original admin contractRef not deleted correctly");
            // assert((await cc.contractMap(account1, contractIndex))._address === address0, 
        //     "Original admin contract ID not deleted correctly");
        // assert((await cc.contractMap(account1, contractIndex)).name === "",
        //     "Original admin contract Name not deleted correctly");
        assert((await cc.contractMap(account2, newAdminContractIndex))._address !== address0,
            "New admin contract ID not updated correctly");
        assert((await cc.contractMap(account2, newAdminContractIndex)).name === "First Organization",
            "New admin contract Name not updated correctly");
    })

    it("Does NOT update contract admin if not called by contract admin", async () => {
        await expectRevert(
            cc.updateContractAdmin(account2, account2, contractAddr, {from: account1}),
            "Only admin can perform this action"
        )
    })

    it("Updates contract name successfully", async () => {
        assert(typeof(cc.contractMap(account1, contractIndex)) !== undefined, 
            "Contract not created successfully");
        assert((await cc.contractMap(account1, contractIndex)).name === "First Organization", 
            "Contract name not saved correctly")

        await cc.updateContract("chreast", account1, contractAddr, {from: account1});

        assert((await cc.contractMap(account1, contractIndex)).name === "chreast", 
            "Contract name not updated correctly"
        );
    })
    
    it("Does NOT update contract if not called by admin", async () => {
        await expectRevert(
            cc.updateContract("chreast", account2, contractAddr, {from: account2}),
            "Only admin can perform this action"
        );
    })

    it("Does NOT update contract if string is empty", async () => {
        await expectRevert(
            cc.updateContract("", account1, contractAddr, {from: account1}),
            "String parameter must be of a valid length"
        );
    })
    
})