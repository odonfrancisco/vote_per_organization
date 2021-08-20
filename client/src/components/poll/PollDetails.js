import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@material-ui/core/styles';

import React, { useState, useEffect, useContext } from 'react'
import { OrganizationContext } from '../organization/OrganizationDetails'


export default function PollDetails({ poll }) {
    const [showEditPoll, setShowEditPoll] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const { 
        tokenList, 
        isAdmin, 
        deletePoll, 
        submitVote,
        checkHasVoted
    } = useContext(OrganizationContext);
    const votersLeft = tokenList.length - poll.voters.length;

    /* this is gonna be rendered way too many times. not sure 
    how to only render with [] as dependency while also rendering every time
    user changes their selected account */
    useEffect(() => {
        const init = async () => {
            const hasVoted = await checkHasVoted(poll.id);
            setHasVoted(hasVoted);
        }
        init();
    }, [])

    const EditPollButton = () => {
        return(
            <Button
                variant="contained"
                onClick={() => {
                    setShowEditPoll(showEditPoll => !showEditPoll);
                }}
            >
                {/* should put poll issue in bold */}
                {showEditPoll ? `Hide Edit ${poll.issue}` : `Edit ${poll.issue}`}
            </Button>
        )
    }
    const DeletePollButton = () => {
        return(
            <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                    deletePoll(poll.id);
                    setShowEditPoll(false);
                }}
            >
                Delete {poll.issue}
            </Button>
        )
    }

    const ShowOptions = () => {
        let disabled = {
            disabled: hasVoted
        }
        return(
            poll.options.map((option, i) => {
                return (
                    <Button
                        key={i}
                        variant="outlined"
                        onClick={async () => {
                            setHasVoted(true);
                            if(!(await submitVote(poll.id, i))){
                                setHasVoted(false);
                            }
                        }}
                        {...disabled}
                    >
                        <Typography
                            variant="button"
                        >
                            {option}
                        </Typography>
                    </Button>
                )
            })
        )
    }

    let theme = createTheme();
    theme = responsiveFontSizes(theme);

    return (
        <ThemeProvider theme={theme}>
            <Typography variant="h4">{poll.issue}</Typography>
            <Typography variant="h6">Voters left: {votersLeft}</Typography>
            <Grid
                container
                direction="column"
                rowspacing={1}
            > 
                { <ShowOptions/> } 
            </Grid>
            <br/>
            {isAdmin && poll.result === '-1' && <EditPollButton/> }
            {isAdmin && poll.result === '-1' && showEditPoll && <DeletePollButton/> }
        </ThemeProvider>
    )
}
