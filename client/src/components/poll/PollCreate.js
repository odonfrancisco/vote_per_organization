import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import AddQueue from '@material-ui/icons/AddCircleOutline'

import React, { useState } from 'react'

export default function PollCreate({ createPoll }) {
    const [pollName, setPollName] = useState('');
    const [option, setOption] = useState('');
    const [pollOptions, setPollOptions] = useState([]);
    
    return (
        <div>
            <h5>{pollOptions.map((e, i) => {
                const notLastElement = i < pollOptions.length - 1;
                if(notLastElement){
                    return `${e}, `
                }
                return `${e}`
            })}</h5>
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
                onSubmit={e => {
                    e.preventDefault();
                    setPollOptions(prevOptions => [...prevOptions, option]);
                    setOption('');
                }}
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
                    onClick={e => {
                        e.preventDefault();
                        setPollOptions(prevOptions => [...prevOptions, option]);
                        setOption('');
                    }}
                >
                    <AddQueue/>
                </IconButton>
            </form>

            <br/>
            
            <Button 
                variant="contained"
                onClick={() => {
                    createPoll(pollName, pollOptions);
                    setPollName('');
                    setOption('');
                    setPollOptions([]);
                }}>
                Submit
            </Button>
        </div>
    )
}
    