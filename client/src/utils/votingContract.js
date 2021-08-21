import VotingContract from '../contracts/VotingContract.json';
import Web3 from 'web3';

const getVotingContract = async (web3, contractAddr) => {
    return new web3.eth.Contract(
        VotingContract.abi,
        contractAddr
    )
}

const createVotingContract = (name, currentAddress, web3, tokenAddr) => {
    return new Promise( async (resolve, reject) => {
        const contract = await new web3.eth.Contract(
            VotingContract.abi,
        )
        contract
            .deploy({
                data: VotingContract.bytecode,
                arguments: [name, tokenAddr]
            })
            .send({
                from: currentAddress
            })
            .then(async deployedContract => {
                await deployedContract.methods
                    .generateAdmin(deployedContract.options.address)
                    .send({from: currentAddress})
                    .then(() => {
                        resolve(true);
                    })
                    .catch((err) => {
                        console.error(err)
                        reject(false);
                    })
            })
            .catch(err => {
                console.error(err);
                reject(false);
            })    
    })
}

export { getVotingContract, createVotingContract };