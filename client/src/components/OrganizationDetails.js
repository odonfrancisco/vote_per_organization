import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { getVotingContract } from '../utils/votingContract';
import PollList from './poll/PollList';
import PollCreate from './poll/PollCreate';
import OrganizationEdit from './OrganizationEdit';

export const OrganizationContext = React.createContext();

export default function OrganizationDetails({ web3, accessToken }) {
    const [votingContract, setVotingContract] = useState();
    const [name, setName] = useState();
    const [polls, setPolls] = useState();
    const [tokenId, setTokenId] = useState();
    const [tokenList, setTokenList] = useState();
    const [isAdmin, setIsAdmin] = useState();
    const [createNewPoll, setCreateNewPoll] = useState(false);
    const [editOrg, setEditOrg] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const contractAddr = useParams().address
    const currentAddress = web3.currentProvider.selectedAddress;

    useEffect(() => {
        const init = async () => {
            const contract = await getVotingContract(web3, contractAddr);
            const name = await contract.methods.name().call();
            const polls = await contract.methods.getPolls().call();
            const tokenId = await getCurrentToken();
            if(!tokenId) return;
            const tokenList = await contract.methods.getTokenIds().call();
            const tokenRef = await contract.methods.getTokenRef(tokenId).call();

            // console.log('polls');
            // console.log(tokenList);
            
            setVotingContract(contract);
            setName(name);
            setPolls(polls);
            setTokenId(tokenId);
            setTokenList(tokenList);
            setIsAdmin(tokenRef.isAdmin);
        }
        init();
    }, [refresh])

    const getCurrentToken = async () => {
        // const currentAddress = web3.currentProvider.selectedAddress;
        const balanceOf = await accessToken.methods.balanceOf(currentAddress).call();
        let tokenId = undefined;
        for(let i = 0; i < balanceOf; i++){
            const currentTokenId = await accessToken.methods.tokenOfOwnerByIndex(currentAddress, i).call();
            const tokenURI = await accessToken.methods.tokenURI(currentTokenId).call();
            if(tokenURI == contractAddr){
                tokenId = currentTokenId;
            }
        }
        return tokenId;
    }

    const createPoll = async (newName, options) => {
        const tx = await votingContract.methods
            .createPoll(newName, options)
            .send({from: currentAddress});
        console.log('name & options');
        // If tx.events.PollCreated, then poll was created successfully
        // Need to handle event if not generate correctly
        console.log(tx.events.PollCreated);
        console.log(options);
        const polls = await votingContract.methods.getPolls().call();
        setPolls(polls);
    }

    const approveAddress = async newAddress => {
        const tx = await votingContract.methods
            /* Need to pass contractAddr so that smart contract can retrieve
            contract as string and pass to accessToken in order to save address
            as tokenURI */
            .generateAccessToken(newAddress, contractAddr)
            .send({from: currentAddress});
        const tokenList = await votingContract.methods.getTokenIds().call();
        setTokenList(tokenList);
        // Need to somehow add the accessToken to users' metamask. not sure how yet
    }

    const removeApprovedVoter = async unapprovedVoter => {
        const tx = await votingContract.methods
            .removeApprovedVoter(unapprovedVoter)
            .send({from: currentAddress})
        const tokenList = await votingContract.methods.getTokenIds().call();
        setTokenList(tokenList);
    }

    const updateAdmin = async newAdmin => {
        await votingContract.methods
            .updateAdmin(newAdmin)
            .send({from: currentAddress})
        /* How i decided to refresh the whole page when admin is updated.
        it works well but i wonder if there's a better way to accomplish this */
        setRefresh(true);
    }

    const pollCreationButton = () => {
        return (
            <button
                onClick={() => setCreateNewPoll(createNewPoll => !createNewPoll)}
            >
                {createNewPoll ? 'Hide Poll Creation' : 'Create New Poll'}
            </button>
        )
    }

    const organizationEditButton = () => {
        return (
            <button
                onClick={() => setEditOrg(editOrg => !editOrg)}
            >
                {editOrg ? 'Hide Organization Edit' : `Edit ${name}`}
            </button>
        )
    }

    /* So apparently this is necessary in order to prevent
    main return from returning until everythnig is initialized correctly.
    was getting error inside of PollList that polls is undefined since it was 
    rendering before OrganizationDetails component had fully rendered */
    /* There's gotta be a better way to prevent app from rendering until fully loaded.
    a 'loading' state variable maybe? */
    if(!tokenList) return null;

    const orgContextValue = {
        isAdmin,
        tokenList,
        getTokenRef: votingContract.methods.getTokenRef,
        removeApprovedVoter,
        updateAdmin
    }
    
    return (
        <OrganizationContext.Provider value={orgContextValue}>
            <div>
                <h1>{name}</h1>
                {isAdmin && pollCreationButton()}
                {isAdmin && organizationEditButton()}
                {isAdmin && createNewPoll && <PollCreate createPoll={createPoll}/>}
                {isAdmin && editOrg && 
                    <OrganizationEdit 
                        name={name} 
                        approveAddress={approveAddress}
                    />
                }
                <PollList
                    polls={polls}
                />
            </div>
        </OrganizationContext.Provider>
    )
}
