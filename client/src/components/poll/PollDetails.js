import React, { useContext } from 'react'
import { OrganizationContext } from '../OrganizationDetails'

export default function PollDetails({ poll }) {
    // const { tokenList, isAdmin } = useContext(OrganizationContext);

    // const votersLeft = tokenList.length - poll.voters.length;

    return (
        <div>
            <div>{poll.id}</div>
            <div>{poll.issue}</div>
            <div>{poll.options}</div>
            {/* <div>Voters left: {votersLeft}</div> */}

        </div>
    )
}
