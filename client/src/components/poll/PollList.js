import React from 'react'
import PollDetails from './PollDetails'

export default function PollList({ polls }) {
    
    return (
        <div>
            <br/>
            {polls.map(poll => {
                return (
                    <div key={poll.id}>
                        {
                            poll.result !== '-2'
                            &&
                            <PollDetails
                                poll={poll}
                            />
                        }
                        {
                            poll.result === '-2'
                            &&
                            <div>
                                This poll has been deleted
                            </div>
                        }
                        <br/>
                    </div>
                )
            })}
        </div>
    )
}
