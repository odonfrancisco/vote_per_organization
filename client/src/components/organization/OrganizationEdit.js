import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import PersonAddIcon from '@material-ui/icons/PersonAdd'

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
            <Box mt={4}/>
            <TextField
                type="text"
                value={editName}
                onChange={e => setName(e.target.value)}
            />
            <Button
                variant="contained"
                onClick={() => {
                    changeName(editName);
                }}
            >
                Change Name
            </Button>
            <Box m={2}/>
            <TextField 
                placeholder="Approve An Address"
                type="text"
                value={newAddress}
                onChange={e => setNewAddress(e.target.value)}
            />
            <IconButton
                variant="contained"
                onClick={() => {
                    approveAddress(newAddress)
                    setNewAddress('');
                }}
            >
                <PersonAddIcon/>
            </IconButton>

            <Grid container>
                {tokenList.map(token => {
                    return (
                        <Grid item key={token}>
                            <EditToken token={token}/>
                        </Grid>
                    )
                })}
            </Grid>
        </div>
    )
}
