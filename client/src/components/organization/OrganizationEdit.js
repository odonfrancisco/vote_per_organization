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
    const [showTokenList, setShowTokenList] = useState(false);
    const [newAddress, setNewAddress] = useState('');
    const [err, setErr] = useState('');
    const { tokenList, checkValidAddress } = useContext(OrganizationContext);

    // Edit token access. delete, generate, appointAdmin
    // // want to add a popup when click 'appoint admin' so user is SURE
    // // they want to give up admin rights
    /* could potentially add a feature to let admin specify a name
    per approved address */

    const generateErrorMessage = message => {
        setErr(message);
        setTimeout(() => {
            setErr('');
        }, 3000);
    }

    const handleAddressApproval = () => {
        if(newAddress.length < 1) {
            generateErrorMessage("Address Field must not be empty");
            return;
        }
        if(!checkValidAddress(newAddress)){
            generateErrorMessage("Must pass a valid address");
            return;
        }
        approveAddress(newAddress)
        setNewAddress('');
    }

    const TokenList = () => (
        tokenList.map(token => {
            return (
                <Grid item key={token}>
                    <EditToken token={token}/>
                </Grid>
            )
        })
    )
    
    return (
        <div>
            <Box mt={4}/>
            <hr/>
            <TextField
                type="text"
                value={editName}
                onChange={e => setName(e.target.value)}
            />
            <Button
                variant="contained"
                onClick={() => {
                    if(editName.length < 1){
                        generateErrorMessage("Name must not be empty");
                        return;
                    }
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
                onClick={handleAddressApproval}
            >
                <PersonAddIcon/>
            </IconButton>
            <Typography
                color="error"
            >
                {err}
            </Typography>

            <Grid container>
                <Grid xl={12} sm={12} item>
                    <Button
                        onClick={() => {
                            setShowTokenList(bool => !bool);
                        }}
                    >
                        {showTokenList ? 'Hide Token List' : 'Show Token List'}
                    </Button>

                </Grid>
                {showTokenList &&
                    <TokenList/>
                }
            </Grid>
            <hr/>
        </div>
    )
}
