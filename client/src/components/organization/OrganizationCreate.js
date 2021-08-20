import Grid from '@material-ui/core/Grid';
import Modal from '@material-ui/core/Modal';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button';
import SendIcon from '@material-ui/icons/Send';

import React, { useState } from 'react'

// all the code between here
function rand() {
    return Math.round(Math.random() * 20) - 10;
  }
  
function getModalStyle() {
    const top = 50 + rand();
    const left = 50 + rand();

    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
    };
}

const useStyles = makeStyles((theme) => ({
    paper: {
        position: 'absolute',
        width: 400,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));
/* and here was pasted from material UI docs. I do not consider myself a CSS
expert by any means but am open to digging deep and learning CSS + tailwind css */


export default function OrganizationCreate({ 
    createOrganization }) {
        const [name, setName] = useState('');
        const [buttonDisabled, setButtonDisabled] = useState(true);
        const [modalOpen, setModalOpen] = useState(false);
        const [modalStyle] = useState(getModalStyle);
        const classes = useStyles();
        
        const handleOrganizationCreate = async () => {
            setButtonDisabled(true);
            // setModalOpen(false);
            /* Redundant check for valid name length.
            although the way it's currently set up, this
            check won't be needed. but just in case */
            if(name.length < 1) return;
            if(!(await createOrganization(name))){
                setButtonDisabled(false);
            }
        }
        
        const handleModalOpen = () => {
            setModalOpen(true);
        }

        const handleModalClose = () => {
            setModalOpen(false);
            setButtonDisabled(false);
        }

        const modalBody = (
            <div style={modalStyle} className={classes.paper}>
                <h2 id="simple-modal-title">Please read fully before creating <i>{name}</i></h2>
                <p id="simple-modal-description">
                    Please note that in order to create <b><i>{name}</i></b>, you will 
                    need to confirm two transactions.
                    <br/><br/> 
                    The first confirmation will be to create the organization
                    contract itself,and the second will be to appoint you as admin. 
                    <br/><br/>
                    If you do not confirm the second transaction, you will NOT have 
                    access to your created organization and there will be no way 
                    to retrieve set organization
                </p>
                <Grid container justifyContent="space-around">
                    <Grid item>
                        <Button
                            variant="contained"
                            onClick={handleOrganizationCreate}
                        >
                            <b>{name}</b>
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            onClick={handleModalClose}
                        >
                            Cancel
                        </Button>
                    </Grid>
                </Grid>
            </div>
        )

        return (
            <Box pt={8}>
                <Modal
                    open={modalOpen}
                    onClose={handleModalClose}
                >
                    {modalBody}
                </Modal>
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
                            onChange={e => {
                                setName(e.target.value)
                                if(e.target.value.length > 0){
                                    setButtonDisabled(false);
                                } else {
                                    setButtonDisabled(true);
                                }
                            }}
                        />
                    </Grid>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="primary"
                            endIcon={<SendIcon/>}
                            {...{disabled: buttonDisabled}}
                            onClick={() => {
                                handleModalOpen();
                                setButtonDisabled(true);
                            }}
                        >
                            Create
                        </Button>
                    </Grid>
                </Grid>

            </Box>

        )
}
