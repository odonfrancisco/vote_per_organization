const CreatorContract = artifacts.require("CreatorContract");
const VotingContract = artifacts.require("VotingContract");

module.exports = async function (deployer, _network, accounts) {
  await deployer.deploy(CreatorContract);
  cc = await CreatorContract.deployed();
  // const newContract = await cc.createContract("First Organization", {from: account1});

  await deployer.deploy(VotingContract, "First Organization", accounts[0], cc.address);
};
