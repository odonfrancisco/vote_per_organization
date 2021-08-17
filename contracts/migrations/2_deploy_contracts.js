const AccessToken = artifacts.require("AccessToken");
const VotingContract = artifacts.require("VotingContract");

const pollIssue = "First Poll";
const pollIssue2 = "Second Poll";
const pollOptions = ["Henry", "Michael", "Trevor"];
const pollOptions2 = ["Forman", "Bubba", "Biggie"];


module.exports = async function (deployer, network, accounts) {
  const account1 = accounts[0];
  const account2 = accounts[1];
  const account3 = accounts[2];
  const account4 = accounts[3];
  await deployer.deploy(AccessToken);
  const token = await AccessToken.deployed();
  await deployer.deploy(
    VotingContract, 
    "First Organization", 
    token.address, 
    {from: account1}
  );
  vc = await VotingContract.deployed();
  await vc.generateAdmin(vc.address, {from: account1})
  await vc.createPoll(pollIssue, pollOptions, {from: account1})
  await vc.createPoll(pollIssue2, pollOptions2, {from: account1})
  await vc.generateAccessToken(
    account2, vc.address, {from: account1});
  await vc.generateAccessToken(
    account3, vc.address, {from: account1});
  await vc.generateAccessToken(
    account4, vc.address, {from: account1});
};
