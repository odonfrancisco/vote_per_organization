import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';

import React from 'react'
import { Link } from 'react-router-dom'

export default function OrganizationList({ tokenURIs }) {
    return (
        <div>
            <Box mt={7}/>
            <Grid 
                container
                direction="column"
                alignItems="center"
            >
                {tokenURIs.map(uri => (
                    <Grid item key={uri}>
                        <Button
                            style={{
                                fontSize: '120%'
                            }}
                        >
                            <Link
                                style={{textDecoration: 'none'}}
                                to={`/organizations/${uri}`}
                            >
                                {uri}
                            </Link>
                        </Button>
                    </Grid>
                ))}
            </Grid>
        </div>
    )
}
