import React, { useState, useEffect, useContext } from 'react'
import { OrganizationContext } from './OrganizationDetails'

export default function EditToken({ token }) {
    const { 
        getTokenRef,
        removeApprovedVoter,
        updateAdmin
    } = useContext(OrganizationContext);
    const [tokenRef, setTokenRef] = useState();
    
    useEffect(() => { 
        const init = async () => {
            const tokenRef = await getTokenRef(token).call();
            setTokenRef(tokenRef);
        }
        init();
    }, [])

    const tokenEditButtons = () => {
        return (
            <li>
                <button
                    onClick={removeApproved}
                >
                    Delete
                </button>
                <button
                    onClick={makeAdmin}
                >
                    Appoint As Admin
                </button>

            </li>
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
                    Token ID: {tokenRef.tokenId}
                </li>
                <li>
                    Owner: {tokenRef.owner}
                </li>
                {!tokenRef.isAdmin && tokenEditButtons()}
            </ul>
        </div>
    )
}
