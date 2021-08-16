import React, { useState ,useContext } from 'react'
import { OrganizationContext } from '../organization/OrganizationDetails'


export default function PollDetails({ poll }) {
    const [showEditPoll, setShowEditPoll] = useState(false);
    const { tokenList, isAdmin, deletePoll } = useContext(OrganizationContext);

    const votersLeft = tokenList.length - poll.voters.length;

    const EditPollButton = () => {
        return(
            <button
                onClick={() => {
                    setShowEditPoll(showEditPoll => !showEditPoll);
                }}
            >
                {/* should put poll issue in bold */}
                {showEditPoll ? `Hide Edit ${poll.issue}` : `Edit ${poll.issue}`}
            </button>
        )
    }
    const DeletePollButton = () => {
        return(
            <button
                onClick={() => {
                    deletePoll(poll.id);
                    setShowEditPoll(false);
                }}
            >
                Delete {poll.issue}
            </button>
        )
    }

    return (
        <div>
            <div>{poll.id}</div>
            <div>{poll.issue}</div>
            <div>{poll.options}</div>
            <div>Voters left: {votersLeft}</div>
            {/* Buttons to vote */}
            {isAdmin && <EditPollButton/>}
            {isAdmin && showEditPoll && <DeletePollButton/>}

        </div>
    )
}
