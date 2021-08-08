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
    
        assert(await vc.name() === "First Organization",
          "VC name not saved correctly");
        assert(await accessRef.isAdmin === true,
          "VC TokenRef.admin not saved correctly");
        assert(await accessRef.tokenId.toString() 
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
    
        assert(await accessRef.isAdmin === false,
          "VC TokenRef. admin not saved correctly");
        assert(await accessRef.tokenId.toString() 
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

    it("Successfully removes an approved voter", async () => {
        const balanceOfAccount2 = (await accessToken.balanceOf(account2)).words[0];
        let tokenId;
        for(let i = 0; i < balanceOfAccount2; i++){
          const currentTokenId = (await accessToken.tokenOfOwnerByIndex(account2, i)).words[0];
          if(currentTokenId.toString() === (await vc.getAccessRef(currentTokenId)).tokenId.toString()){
            tokenId = currentTokenId;
          }
        }
        // Removes voter's access token
        await vc.removeApprovedVoter(account2, {from: account1});

        const tokenExists = await accessToken.checkExists(tokenId);
        const tokenRef = (await vc.getAccessRef(tokenId));

        assert(!tokenExists, "Access token not burned correctly");
        assert(tokenRef.owner !== account2, "Token Ref owner not deleted correctly");
        assert(tokenRef.tokenId !== tokenId, "Token Ref tokenId not deleted correctly")
    })

    it("Does NOT remove approved voter if invalid address is passed", async () => {   
        await expectRevert(
            vc.removeApprovedVoter(address0, {from: account1}),
            "A valid address must be passed"
        );
    })

    it("Does NOT remove approved voter if not called by admin", async () => {
        await expectRevert(
            vc.removeApprovedVoter(account1, {from: account2}),
            "Only admin may perform this action"
        );
    })

    it("Does NOT remove admin from approved voter list", async () => {
        await expectRevert(
            vc.removeApprovedVoter(account1, {from: account1}),
            "Admin may not be removed from approved list"
        );
    })
    
    it("Successfully replaces admin address", async () => {
        const oldAdmin = account1;
        const newAdmin = account2;
        await vc.generateAccessToken(newAdmin, vc.address, {from: oldAdmin});

        const balanceOfOldAdmin = (await accessToken.balanceOf(oldAdmin)).words[0];
        // Token Id WITH admin access
        let adminTokenId;
        for(let i = 0; i < balanceOfOldAdmin; i++){
          const currentTokenId = (await accessToken.tokenOfOwnerByIndex(oldAdmin, i)).words[0];
          if(currentTokenId.toString() === (await vc.getAccessRef(currentTokenId)).tokenId.toString()){
            adminTokenId = currentTokenId;
          }
        }
        const balanceOfNewAdmin = (await accessToken.balanceOf(newAdmin)).words[0];
        // Token ID WITHOUT admin access
        let approvedTokenId;
        for(let i = 0; i < balanceOfNewAdmin; i++){
          const currentTokenId = (await accessToken.tokenOfOwnerByIndex(newAdmin, i)).words[0];
          if(currentTokenId.toString() === (await vc.getAccessRef(currentTokenId)).tokenId.toString()){
            approvedTokenId = currentTokenId;
          }
        }
        await vc.updateAdmin(newAdmin, {from: account1});        
        const adminTokenHolder = await accessToken.ownerOf(adminTokenId);
        const accessTokenHolder = await accessToken.ownerOf(approvedTokenId);

        assert(adminTokenHolder === newAdmin, 
          "Admin token not transfered to New admin");
        assert(accessTokenHolder === oldAdmin, 
          "Old admin still has admin token")
    })
    
    it("Does NOT replace admin if not called by admin", async () => {
        // In an earlier test, account2 became admin
        await expectRevert(
            vc.updateAdmin(account2, {from: account1}),
            "Only admin may perform this action"
        );
    })

    it("Does NOT replace admin if using same address as admin", async () => {
        // In an earlier test, account2 became admin
        await expectRevert(
            vc.updateAdmin(account2, {from: account2}),
            "Cannot replace admin with same address"
        );
    })

    it("Does NOT replace admin if newAdmin is not already an approved user", async () => {
        // In an earlier test, account2 became admin
        await expectRevert(
            vc.updateAdmin(account3, {from: account2}),
            "New admin must have an access token"
        );
    })

    it("Does NOT replace admin if newAdmin address is invalid", async () => {
        // In an earlier test, account2 became admin
        await expectRevert(
            vc.updateAdmin(address0, {from: account2}),
            "A valid address must be passed"
        );
    })
    
})