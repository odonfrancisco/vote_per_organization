import React, { useState, useContext } from 'react'
import EditToken from '../EditToken';
import { OrganizationContext } from './OrganizationDetails';

export default function OrganizationEdit({ name, approveAddress, changeName }) {
    const [editName, setName] = useState(name);
    // const [editTokenList, setTokenList] = useState(tokenList);
    const [newAddress, setNewAddress] = useState('');
    const { tokenList } = useContext(OrganizationContext);
    
    // Edit token access. delete, generate, appointAdmin
    // // want to add a popup when click 'appoint admin' so user is SURE
    // // they want to give up admin rights
    /* could potentially add a feature to let admin specify a name
    per approved address */
    
    return (
        <div>
            <input
                type="text"
                value={editName}
                onChange={e => setName(e.target.value)}
            />
            <button
                onClick={() => {
                    changeName(editName);
                }}
            >
                Change Name
            </button>
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
