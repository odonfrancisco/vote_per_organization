import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { getVotingContract } from '../utils/votingContract';

export default function OrganizationDetails({ web3 }) {
    const [votingContract, setVotingContract] = useState();
    const contractAddr = useParams().address

    useEffect(() => {
        const init = async () => {
            const contract = await getVotingContract(web3, contractAddr);
            setVotingContract(contract);
        }
        init();
    }, [])

    console.log('voting contract details');
    console.log(votingContract.methods.name().call());
    
    return (
        <div>
            
        </div>
    )
}
