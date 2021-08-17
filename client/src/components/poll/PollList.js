import React from 'react'
import PollDetails from './PollDetails'
import PollDecided from './PollDecided'

export default function PollList({ polls }) {
    
    return (
        <div>
            <br/>
            {polls.map(poll => {
                return (
                    <div key={poll.id}>
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
                            <div>
                                This poll has been deleted
                            </div>
                        }
                        {
                            poll.result >= 0
                            &&
                            <PollDecided
                                poll={poll}
                            />
                        }
                        <br/>
                    </div>
                )
            })}
        </div>
    )
}
