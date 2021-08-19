import Typography from '@material-ui/core/Typography';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@material-ui/core/styles';

import React from 'react'

export default function PollDecided({ poll }) {

    let theme = createTheme();
    theme = responsiveFontSizes(theme);

    return (
        <ThemeProvider theme={theme}>
            <Typography variant="h4">
                {poll.issue}
            </Typography>
            <Typography variant="h6">
                The winner of {poll.issue} is {poll.options[poll.result]}
            </Typography>
            
        </ThemeProvider>
    )
}
