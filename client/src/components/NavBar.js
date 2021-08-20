import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { ThemeProvider, createTheme } from '@material-ui/core/styles';

import AddCircleIcon from '@material-ui/icons/AddCircle';
import FormatListBulletedIcon from '@material-ui/icons/FormatListBulleted';

import React from 'react'
import { NavLink } from 'react-router-dom'

export default function NavBar() {

    const theme = createTheme({
        palette: {
            secondary: {
                main: "#607d8b"
            }
        }
    })
    
    return (
        <ThemeProvider theme={theme}>
            <AppBar 
                color="secondary"
            >
                <Grid container alignItems="center" justifyContent="flex-end"> 
                    <Grid item xs>
                        <Box ml={3}>
                            <Typography variant="h4" style={{
                                color: '#eeeeee'
                            }}>
                                Happy Voting!
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={3}>
                        <IconButton>
                            <NavLink
                                to="/newOrganization"
                                style={{
                                    textDecoration: 'none',
                                    color: '#eeeeee'
                                }}
                            >
                                <AddCircleIcon/>
                                <Typography>
                                    New Organization
                                </Typography>
                            </NavLink>
                        </IconButton>
                    </Grid>
                    <Grid item xs={3}>
                        <IconButton>
                            <NavLink
                                to="/organizations"
                                style={{
                                    textDecoration: 'none',
                                    color: '#eeeeee'
                                }}
                            >
                                <FormatListBulletedIcon/>
                                <Typography>
                                    My Organizations
                                </Typography>
                            </NavLink>
                        </IconButton>
                    </Grid>
                </Grid>
            </AppBar>
        </ThemeProvider>
    )
}
