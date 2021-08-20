import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import React from 'react'
import PollDetails from './PollDetails'
import PollDecided from './PollDecided'

export default function PollList({ polls }) {    

    return (
        <Grid 
            container
            direction="column"
            alignItems="center"
            spacing={3}
        >
            <Box mt={3}/>
            {polls.map(poll => {
                return (
                    <Grid 
                        item 
                        key={poll.id}
                        /* These are all so annoying lol. would
                        love to just have a fluid design without
                        nitpicking each section but i'm chillen. 
                        still got a lot to learn when it comes
                        to CSS */
                        xs={7}
                        sm={6}
                        md={5}
                        lg={8}
                    >
                        {
                            poll.result === '-1'
                            &&
                            <PollDetails
                                poll={poll}
                            />
                        }
                        {
                            poll.result === '-2'
                            &&
                            <Typography
                                variant="h5"
                            >
                                Poll ID: {poll.id} has been deleted
                            </Typography>
                        }
                        {
                            poll.result >= 0
                            &&
                            <PollDecided
                                poll={poll}
                            />
                        }
                        <br/>
                    </Grid>
                )
            })}
        </Grid>
    )
}
