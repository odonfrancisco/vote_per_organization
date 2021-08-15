import React, { useState, useContext } from 'react'
import EditToken from './EditToken';
import { OrganizationContext } from './OrganizationDetails';

export default function OrganizationEdit({ name, approveAddress }) {
    const [editName, setName] = useState(name);
    // const [editTokenList, setTokenList] = useState(tokenList);
    const [newAddress, setNewAddress] = useState();
    const { tokenList } = useContext(OrganizationContext);
    
    // Edit token access. delete, generate, appointAdmin
    // Edit name
    
    return (
        <div>
            <input
                type="text"
                value={editName}
                onChange={e => setName(e.target.value)}
            />
            <br/>
            <label>
                Approve an address
            </label>
            <input 
                type="text"
                value={newAddress}
                onChange={e => setNewAddress(e.target.value)}
            />
            <button
                onClick={() => {
                    approveAddress(newAddress)
                    setNewAddress('');
                }}
            >
                Approve
            </button>
            {tokenList.map(token => {
                return (
                    <div key={token}>
                        <EditToken token={token}/>
                    </div>
                )
            })}
        </div>
    )
}
