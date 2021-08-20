// Styling
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
// React
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router'
// Web3 utility functions
import { getVotingContract } from '../../utils/votingContract';
import { addTokenToWallet } from '../../utils/getWeb3';
// Components
import OrganizationEdit from './OrganizationEdit';
import PollList from '../poll/PollList';
import PollCreate from '../poll/PollCreate';

export const OrganizationContext = React.createContext();

const LOCAL_STORAGE_KEY = 'vote_per_org.';

export default function OrganizationDetails({ web3, accessToken }) {
    const [votingContract, setVotingContract] = useState();
    const [name, setName] = useState();
    const [polls, setPolls] = useState();
    const [tokenId, setTokenId] = useState();
    const [tokenList, setTokenList] = useState();
    const [isAdmin, setIsAdmin] = useState();
    const [currentAddress, setCurrentAddress] = useState();
    const [createNewPoll, setCreateNewPoll] = useState(false);
    const [editOrg, setEditOrg] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const contractAddr = useParams().address;

    useEffect(() => {
        const init = async () => {
            const acctArray = await window.ethereum.request({method: 'eth_accounts'});
            const currentAddress = acctArray[0];
            const contract = await getVotingContract(web3, contractAddr);
            const name = await contract.methods.name().call();
            const polls = await contract.methods.getPolls().call({from: currentAddress});
            const tokenId = await getCurrentToken(currentAddress);
            if(!tokenId) return;
            const tokenList = await contract.methods.getTokenIds().call();
            const tokenRef = await contract.methods.getTokenRef(tokenId).call();

            // console.log('polls');
            // console.log(tokenList);
            
            setCurrentAddress(currentAddress);
            setVotingContract(contract);
            setName(name);
            setPolls(polls);
            setTokenId(tokenId);
            setTokenList(tokenList);
            setIsAdmin(tokenRef.isAdmin);
            localStorage.setItem(LOCAL_STORAGE_KEY + contractAddr, name);
        }
        init();
        /* Adding web3 here because need to refresh this component
        when App.js refreshes. Not sure i like this method but it works
        for now. */
    }, [refresh, web3])
    
    const getCurrentToken = async currentAddress => {
        // const currentAddress = web3.currentProvider.selectedAddress;
        const balanceOf = await accessToken.methods.balanceOf(currentAddress).call();
        let tokenId = undefined;
        for(let i = 0; i < balanceOf; i++){
            const currentTokenId = await accessToken.methods.tokenOfOwnerByIndex(currentAddress, i).call();
            const tokenURI = await accessToken.methods.tokenURI(currentTokenId).call();
            if(tokenURI === contractAddr){
                tokenId = currentTokenId;
            }
        }
        return tokenId;
    }

    const checkHasVoted = async pollId => {
        const hasVoted = polls[pollId].voters.includes(tokenId);
        return hasVoted;
    }

    const changeName = async newName => {
        const tx = await votingContract.methods
            .changeName(newName)
            .send({from: currentAddress})
            .then(async () => {
                /* shouldn't i be returning the new votingContract name 
                from .then() instead of calling for methods.name()? */
                const name = await votingContract.methods.name().call({from: currentAddress});
                setName(name);        
            })
            .catch(err => {
                console.error(err);
            })
    }
    
    const approveAddress = async newAddress => {
        const tx = await votingContract.methods
            /* Need to pass contractAddr so that smart contract can retrieve
            contract as string and pass to accessToken in order to save address
            as tokenURI */
            .generateAccessToken(newAddress, contractAddr)
            .send({from: currentAddress})
            .then(async () => {
                // should i add {from: currentAddress} inside call()?
                const tokenList = await votingContract.methods.getTokenIds().call();
                setTokenList(tokenList);        
            })
            .catch(err => {
                console.error(err);
            })
        // Need to somehow add the accessToken to users' metamask. not sure how yet
        // ^ Will do this on app.js useEffect
    }

    const removeApprovedVoter = async unapprovedVoter => {
        const tx = await votingContract.methods
            .removeApprovedVoter(unapprovedVoter)
            .send({from: currentAddress})
            .then(async () => {
                const tokenList = await votingContract.methods.getTokenIds().call();
                setTokenList(tokenList);        
            })
            .catch(err => {
                console.error(err);
            })
    }

    const updateAdmin = async newAdmin => {
        await votingContract.methods
            .updateAdmin(newAdmin)
            .send({from: currentAddress})
            .then(() => {
                /* How i decided to refresh the whole page when admin is updated.
                it works well but i wonder if there's a better way to accomplish this */
                setRefresh(refresh => !refresh);
            })
            .catch(err => {
                console.error(err);
            })
    }

    const createPoll = async (newName, options) => {
        /* I'm saving transaction as variable in case i'm looking to
        do something with the received event... not sure what just yet */

        const tx = await votingContract.methods
            .createPoll(newName, options)
            .send({from: currentAddress})
            .then(async event => {
                votingContract.methods.getPolls().call({from: currentAddress})
                    .then(polls => {
                        setPolls(polls);
                        setCreateNewPoll(false);                
                    })
                    .catch(err => {
                        console.error(err);
                    });
            })
            .catch(err => {
                console.error(err);
            });
    }

    /* am NOT handling errors correctly. definitely need to test
    for if user rejects the transaction */
    const deletePoll = async pollId => {
        await votingContract.methods
            .deletePoll(pollId)
            .send({from: currentAddress})
            .then(async () => {
                const polls = await votingContract.methods.getPolls().call({from: currentAddress});
                setPolls(polls);        
            })
            .catch(err => {
                console.error(err);
            })
    }

    const submitVote = async (pollId, optionId) => {
        let success = false;
        await votingContract.methods
            .vote(pollId, optionId)
            .send({from: currentAddress})
            .then(() => {
                success = true;
            })
            .catch(err => {
                console.error(err);
            });
        if(!success) {
            return success;
        }
        /* Feel like i should either be receiving poll list/individual poll
        from vc.vote().then(), instead of calling vc.getPolls() after vote() */
        await votingContract.methods.getPolls().call({from: currentAddress})
            .then(polls => {
                /* This is to handle the case in which the poll ends in a draw.
                if ends in draw, should automatically re-enable the vote buttons 
                for user who made poll end in a tie. */
                if(polls[pollId].result === '-1' && polls[pollId].voters.length === 0){
                    success = false;
                }
                setPolls(polls);
            })
            .catch(err => {
                console.error(err);
            });
        return success;
    }

    const PollCreationButton = () => {
        return (
            <Button
                variant="contained"
                onClick={() => {
                    setCreateNewPoll(createNewPoll => !createNewPoll);
                    setEditOrg(false);
                }}
            >
                {createNewPoll ? 'Hide Poll Creation' : 'Create New Poll'}
            </Button>
        )
    }

    const OrganizationEditButton = () => {
        return (
            <Button
                variant="contained"
                onClick={() => {
                    setEditOrg(editOrg => !editOrg)
                    setCreateNewPoll(false);
                }}
            >
                {editOrg ? 'Hide Organization Edit' : `Edit ${name}`}
            </Button>
        )
    }

    /* So apparently this is necessary in order to prevent
    main return from returning until everythnig is initialized correctly.
    was getting error inside of PollList that polls is undefined since it was 
    rendering before OrganizationDetails component had fully rendered */
    /* There's gotta be a better way to prevent app from rendering until fully loaded.
    a 'loading' state variable maybe? */
    if(!tokenList) return null;

    /* Should i have different contexts? I feel like i should
    like one for admin shits, another for poll editing, another
    for token editing, etc */
    const orgContextValue = {
        isAdmin,
        tokenList,
        getTokenRef: votingContract.methods.getTokenRef,
        updateAdmin,
        removeApprovedVoter,
        deletePoll,
        submitVote,
        checkHasVoted,
        currentAddress,
        checkValidAddress: web3.utils.isAddress
    }
    
    return (
        <OrganizationContext.Provider value={orgContextValue}>
            <div>
                <Grid container justifyContent="space-between">
                    <Grid item>
                        <Typography variant="h3">{name}</Typography>
                    </Grid>
                    <Grid item>
                        <Button
                            onClick={() => {
                                addTokenToWallet(accessToken._address);
                            }}
                        >
                            <Typography>
                                Add Token To Wallet
                            </Typography>
                        </Button>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item>
                        {isAdmin && <PollCreationButton/>}
                    </Grid>
                    <Grid item>
                        {isAdmin && <OrganizationEditButton/>}
                    </Grid>
                </Grid>
                {isAdmin && createNewPoll 
                    && <PollCreate createPoll={createPoll}/>}
                {isAdmin && editOrg 
                    && <OrganizationEdit 
                        name={name} 
                        approveAddress={approveAddress}
                        changeName={changeName}
                        />
                }
                <PollList
                    polls={polls}
                />
            </div>
        </OrganizationContext.Provider>
    )
}
