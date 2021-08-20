import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import AddQueue from '@material-ui/icons/AddCircleOutline'

import React, { useState } from 'react'

export default function PollCreate({ createPoll }) {
    const [pollName, setPollName] = useState('');
    const [option, setOption] = useState('');
    const [pollOptions, setPollOptions] = useState([]);
    const [err, setErr] = useState('');

    const generateErrorMessage = message => {
        setErr(message);
        setTimeout(() => {
            setErr('');
        }, 3000);
    }
    
    const handleOptionAdd = event => {
        event.preventDefault();
        if(pollOptions.length > 4) {
            generateErrorMessage("Maximum of five options allowed")
            return;
        };
        if(option.length < 1) {
            generateErrorMessage("Poll option can not be empty");
            return;
        }
        setPollOptions(prevOptions => [...prevOptions, option]);
        setOption('');
    }

    const handleOptionDelete = index => {
        setPollOptions(pollOptions => {
            return pollOptions.filter((o, i) => (
                i !== index
            ))
        })
    }

    const handlePollCreate = () => {
        if(pollName.length < 1 
            || pollOptions.length < 2 ) {
                generateErrorMessage("Poll must have a name & at least two options");
                return;
            }
        createPoll(pollName, pollOptions);
        setPollName('');
        setOption('');
        setPollOptions([]);
    }

    const optionListItem = (option, index) => {
        const lastElement = index === pollOptions.length - 1;
        let optionRender = `${option}, `;
        if(lastElement){
            optionRender = `${option}`
        }
        return (
            <Button
                onClick={() => handleOptionDelete(index)}
                key={index}
            >
                <Typography>
                    {optionRender}
                </Typography>
            </Button>
        )
    }
    
    return (
        <div>
            <Box mt={3}/>
            <hr/>
            <Typography
                variant="h4"
            >
                {pollName}
            </Typography>
            <h5>{pollOptions.map(optionListItem)}</h5>
            <br/>
            {/* <label>New Poll </label> */}
            <TextField 
                placeholder="New Poll Name"
                type="text"
                onChange={e => setPollName(e.target.value)}
                value={pollName}
            />
            <br/>
            <form
                onSubmit={handleOptionAdd}
            >
                {/* <label>Poll Options </label> */}
                <TextField
                    placeholder="Poll Option"
                    type="text"
                    onChange={e => setOption(e.target.value)}
                    value={option}
                />
                <IconButton
                    variant="contained"
                    onClick={handleOptionAdd}
                >
                    <AddQueue/>
                </IconButton>
                <br/>
                
                <Typography
                    color="error"
                >
                    {err}
                </Typography>
            </form>

            <br/>
            
            <Button 
                variant="contained"
                onClick={handlePollCreate}>
                Submit
            </Button>
            <hr/>
        </div>
    )
}
    