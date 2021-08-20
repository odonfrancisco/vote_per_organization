import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button';
import SendIcon from '@material-ui/icons/Send';

import React, { useState } from 'react'

export default function OrganizationCreate({ 
    createOrganization }) {
        const [name, setName] = useState('');
        const [buttonDisabled, setButtonDisabled] = useState(false);

        return (
            <div>
                <Box mt={13}/>
                <Grid 
                    container 
                    spacing={1} 
                    justify="center"
                >
                    <Grid item>
                        <TextField
                            type="text"
                            value={name}
                            placeholder="Organization Name"
                            onChange={e => setName(e.target.value)}
                        />
                    </Grid>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="primary"
                            endIcon={<SendIcon/>}
                            {...{disabled: buttonDisabled}}
                            onClick={async () => {
                                setButtonDisabled(true);
                                if(!(await createOrganization(name))){
                                    setButtonDisabled(false);
                                }
                            }}
                        >
                            Create
                        </Button>
                    </Grid>
                </Grid>

            </div>

        )
}
