const AccessToken = artifacts.require("AccessToken");
const VotingContract = artifacts.require("VotingContract");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(AccessToken);
  const token = await AccessToken.deployed();
  await deployer.deploy(
    VotingContract, 
    "First Organization", 
    token.address, 
    {from: accounts[0]}
  );
  vc = await VotingContract.deployed();
  await vc.generateAdmin(vc.address, {from: accounts[0]})
};
