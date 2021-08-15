import React, { useState } from 'react'

export default function PollCreate({ createPoll }) {
    const [pollName, setPollName] = useState('');
    const [option, setOption] = useState('');
    const [pollOptions, setPollOptions] = useState([]);
    
    return (
        <div>
            <h5>{pollOptions.map((e, i) => {
                if(i < pollOptions.length -1){
                    return `${e}, `
                }
                return `${e}`
            })}</h5>
            <br/>
            <label>New Poll </label>
            <input 
                type="text"
                onChange={e => setPollName(e.target.value)}
                value={pollName}
            />
            <br/>
            <form>
                <label>Poll Options </label>
                <input
                    type="text"
                    onChange={e => setOption(e.target.value)}
                    value={option}
                />
                <button
                    onClick={e => {
                        e.preventDefault();
                        setPollOptions(prevOptions => [...prevOptions, option]);
                        setOption('');
                    }}
                >
                    +
                </button>
            </form>

            <br/>
            
            <button onClick={() => {
                createPoll(pollName, pollOptions);
                setPollName('');
                setOption('');
                setPollOptions([]);
            }}>
                Submit
            </button>
        </div>
    )
}
    