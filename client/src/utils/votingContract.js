import VotingContract from '../contracts/VotingContract.json';

const getVotingContract = async (web3, contractAddr) => {
    return new web3.eth.Contract(
        VotingContract.abi,
        contractAddr
    )
}

const createVotingContract = async (name, currentAddress, web3, tokenAddr) => {
    const contract = await new web3.eth.Contract(
        VotingContract.abi
    )
    contract.deploy({
        data: VotingContract.bytecode,
        arguments: [name, tokenAddr]
    })
    .send({
        from: currentAddress
    })
    .then(async deployedContract => {
        await deployedContract.methods
            .generateAdmin(deployedContract.options.address)
            .send({from: currentAddress});
    })
    .catch(err => {
        console.error(err);
    })

}

export { getVotingContract, createVotingContract };