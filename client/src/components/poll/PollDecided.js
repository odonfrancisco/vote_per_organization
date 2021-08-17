import React from 'react'

export default function PollDecided({ poll }) {
    return (
        <div>
            <div>
                {poll.id}
            </div>
            <div>
                {poll.issue}
            </div>
            <div>
                The winner of {poll.issue} is {poll.options[poll.result]}
            </div>
            
        </div>
    )
}
