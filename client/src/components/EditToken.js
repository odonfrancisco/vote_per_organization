import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import DeleteIcon from '@material-ui/icons/Delete'
import IconButton from '@material-ui/core/IconButton';

import React, { useState, useEffect, useContext } from 'react'
import { OrganizationContext } from './organization/OrganizationDetails'

export default function EditToken({ token }) {
    const [tokenRef, setTokenRef] = useState();
    const { 
        getTokenRef,
        removeApprovedVoter,
        updateAdmin
    } = useContext(OrganizationContext);
    
    useEffect(() => { 
        const init = async () => {
            const tokenRef = await getTokenRef(token).call();
            setTokenRef(tokenRef);
        }
        init();
    }, [])

    const tokenEditButtons = () => {
        return (
            <div>
                <IconButton
                    color="secondary"
                    variant="contained"
                    onClick={removeApproved}
                >
                    <DeleteIcon/>
                </IconButton>
                <Button
                    variant="outlined"
                    onClick={makeAdmin}
                >
                    Appoint As Admin
                </Button>

            </div>
        )
    }

    const removeApproved = () => {
        removeApprovedVoter(tokenRef.owner);
    }

    const makeAdmin = () => {
        updateAdmin(tokenRef.owner);
    }

    if(!tokenRef) return null;
    
    return (
        <div>
            <ul>
                <li>
                    <Typography>
                        Token ID: {tokenRef.tokenId}
                    </Typography>
                </li>
                <li>
                    <Typography>
                        Owner: {tokenRef.owner}
                    </Typography>
                </li>
                {!tokenRef.isAdmin && tokenEditButtons()}
            </ul>
        </div>
    )
}
