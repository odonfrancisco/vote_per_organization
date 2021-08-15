import React from 'react'
import PollDetails from './PollDetails'

export default function PollList({ polls }) {
    
    return (
        <div>
            {polls.map(poll => {
                return (
                    <PollDetails
                        key={poll.id}
                        poll={poll}
                    />
                )
            })}
        </div>
    )
}
