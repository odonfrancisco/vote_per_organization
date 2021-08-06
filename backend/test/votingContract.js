const VotingContract = artifacts.require("./VotingContract");
const AccessToken = artifacts.require("AccessToken");
const { expectRevert } = require('@openzeppelin/test-helpers');

contract("VotingContract", (accounts) => {
    let vc;
    let accessToken;
    let account1;
    let account2;
    let account3;
    let address0 = "0x0000000000000000000000000000000000000000";

    beforeEach(async () => {
        vc = await VotingContract.deployed();
        accessToken = await AccessToken.deployed();
        account1 = accounts[0];
        account2 = accounts[1];
        account3 = accounts[2];
    })

    it("should successfully create contract", async () => {
        const tokenId = 0;
        const accessRef = await vc.getAccessRef(tokenId);
        const tokenOwnerRef = await vc.getOwnerToken({from: account1});
    
        assert(await vc.name() === "First Organization",
          "VC name not saved correctly");
        assert(await accessRef.isAdmin === true,
          "VC TokenRef.admin not saved correctly");
        assert(await accessRef.tokenId.toString() 
          === tokenId.toString(),
          "VC TokenRef.tokenId not saved correctly");
        assert(await tokenOwnerRef.isAdmin === true,
          "VC TokenRef.admin not saved correctly");
        assert(await tokenOwnerRef.tokenId.toString() 
          === tokenId.toString(),
          "VC TokenRef.tokenId not saved correctly");
    })

    it("should NOT generate admin a second time", 
      async () => {
        await expectRevert(
            vc.generateAdmin(vc.address),
            "Admin already exists for this contract"
        );
    });

    it("should generate access token correctly", async () => {
        const tx = await vc.generateAccessToken(
          account2, vc.address, {from: account1});
        const tokenId = tx.receipt.logs[0].args[0].words[0];
        const tokenOwner = tx.receipt.logs[0].args[1];
        const tokenURI = tx.receipt.logs[0].args[2];
        const accessRef = await vc.getAccessRef(tokenId);
        const tokenOwnerRef = await vc.getOwnerToken({from: account2});
    
        assert(await accessRef.isAdmin === false,
          "VC TokenRef. admin not saved correctly");
        assert(await accessRef.tokenId.toString() 
          === tokenId.toString(),
          "VC TokenRef.tokenId not saved correctly");
        assert(await tokenOwnerRef.isAdmin === false,
          "VC TokenRef.admin not saved correctly");
        assert(await tokenOwnerRef.tokenId.toString() 
          === tokenId.toString(),
          "VC TokenRef.tokenId not saved correctly");
        assert(tokenOwner === account2,
          "Token owner not saved correctly");
        assert(tokenURI === vc.address,
          "TokenURI not saved correctly");        
    });
    
    
    it("should NOT generate access token for same address twice", 
      async () => {
        await expectRevert(
            vc.generateAccessToken(account2, vc.address, {from: account1}),
            "An address may only own one Access Token"
        )
    });

    it("should NOT generate access token if not called by admin", 
      async () => {
        await expectRevert(
            vc.generateAccessToken(account3, vc.address, {from: account2}),
            "Only admin may perform this action"
        )
    });

    it("Does NOT generate access token if address is full of 0's", async () => {
        await expectRevert(
            vc.generateAccessToken(address0, vc.address, {from: account1}),
            "A valid address must be passed"
        )
    })

    // it("Successfully removes an approved voter", async () => {
    //     // Adds voter
    //     await vc.approveVoters([account2, account3], {from: account1});
    //     // Removes voter
    //     await vc.removeApprovedVoter(account2, {from: account1});
    //     const approved = await vc.getApproved();
    //     let addressRemoved = true;

    //     approved.forEach(e => {
    //         if(e === account2){
    //             addressRemoved = false;
    //         }
    //     })

    //     assert(addressRemoved, "Address not removed from approved array");
    //     assert(approved.length === 2, "Address not removed from approved array");        
    // })

    // it("Does NOT remove approved voter if invalid address is passed", async () => {   
    //     await expectRevert(
    //         vc.removeApprovedVoter(address0, {from: account1}),
    //         "A valid address must be passed"
    //     );
    // })

    // it("Does NOT remove approved voter if not called by admin", async () => {
    //     await expectRevert(
    //         vc.removeApprovedVoter(account1, {from: account2}),
    //         "Only admin may perform this action"
    //     );
    // })

    // it("Does NOT remove admin from approved voter list", async () => {
    //     const approved = await vc.getApproved();
    //     assert(approved[0] === account1, "Admin is incorrectly not an approved user");
    //     await expectRevert(
    //         vc.removeApprovedVoter(account1, {from: account1}),
    //         "Admin may not be removed from approved list"
    //     );
    // })
    
    // it("Successfully replaces admin address", async () => {
    //     const oldAdmin = await vc.admin();
    //     await vc.approveVoters([account2], {from: account1});

    //     const tx = await vc.updateAdmin(account2, {from: account1});        
    //     const newAdmin = await vc.admin();
    //     const newAdminArrIndex = tx.receipt.logs[0].args[0];
    //     const newAdminRef = await cc.contractMap(account2, newAdminArrIndex);

    //     assert(oldAdmin !== newAdmin, "New admin is still equal to old admin");
    //     assert(oldAdmin === account1, "Old admin retrieved incorrectly");
    //     assert(newAdmin === account2, "New admin saved incorrectly");
    //     assert(newAdminRef._address === contractAddr, 
    //         "Contract address not saved correctly for admin inside CreatorContract");
    //     assert(newAdminRef.name === "First Organization", 
    //         "Contract name not saved correctly for admin inside CreatorContract");
    // })
    
    // it("Does NOT replace admin if not called by admin", async () => {
    //     await vc.approveVoters([account2], {from: account1});
    //     await expectRevert(
    //         vc.updateAdmin(account2, {from: account2}),
    //         "Only admin may perform this action"
    //     );
    // })

    // it("Does NOT replace admin if using same address as admin", async () => {
    //     await expectRevert(
    //         vc.updateAdmin(account1, {from: account1}),
    //         "Cannot replace admin with same address"
    //     );
    // })

    // it("Does NOT replace admin if newAdmin is not already an approved user", async () => {
    //     await vc.removeApprovedVoter(account2, {from: account1});
    //     await expectRevert(
    //         vc.updateAdmin(account2, {from: account1}),
    //         "New admin must be an already approved voter"
    //     );
    // })

    // it("Does NOT replace admin if newAdmin address is invalid", async () => {
    //     await expectRevert(
    //         vc.updateAdmin(address0, {from: account1}),
    //         "A valid address must be passed"
    //     );
    // })
    
})