import VotingContract from '../contracts/VotingContract.json';

const getVotingContract = async (web3, contractAddr) => {
    return new web3.eth.Contract(
        VotingContract.abi,
        contractAddr
    )
}

// Need to leverage web3.eth.contract.deploy or some shit like that
const createVotingContract = async (web3, tokenAddr) => {
    const networkId = await web3.eth.net.getId();
    const contractDeployment = await VotingContract.networks[networkId];
    return new web3.eth.Contract(
        VotingContract.abi,
        contractDeployment && contractDeployment.address
    )
}

export { getVotingContract, createVotingContract };