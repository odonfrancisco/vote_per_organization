import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import React from 'react'
import { Link } from 'react-router-dom'

const LOCAL_STORAGE_KEY = 'vote_per_org.';

export default function OrganizationList({ tokenURIs }) {

    const TokenUriList = () => {

        if(tokenURIs.length === 0){
            return (
                <Typography>
                    Your wallet doesn't have any access tokens yet. 
                    <br/>
                    Please create an organization or wait for your 
                    administrator to grant access to your organization
                </Typography>
            )
        }
        
        return tokenURIs.map(uri => {
            const storageKey = LOCAL_STORAGE_KEY + uri;
            const orgName = localStorage.getItem(storageKey) || uri;
            
            return (<Grid item key={uri}>
                <Button
                    style={{
                        fontSize: '120%'
                    }}
                >
                    <Link
                        style={{textDecoration: 'none'}}
                        to={`/organizations/${uri}`}
                    >
                        {orgName}
                    </Link>
                </Button>
            </Grid>
            )
        })
    }
    
    return (
        <Box pt={4}>
            <Grid 
                container
                direction="column"
                alignItems="center"
            >
                <TokenUriList/>
            </Grid>
        </Box>
    )
}
