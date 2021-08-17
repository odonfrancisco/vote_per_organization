import React, { useState, useEffect, useContext } from 'react'
import { OrganizationContext } from '../organization/OrganizationDetails'


export default function PollDetails({ poll }) {
    const [showEditPoll, setShowEditPoll] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const { 
        tokenList, 
        isAdmin, 
        deletePoll, 
        submitVote,
        checkHasVoted
    } = useContext(OrganizationContext);
    const votersLeft = tokenList.length - poll.voters.length;

    /* this is gonna be rendered way too many times. not sure 
    how to only render with [] as dependency while also rendering every time
    user changes their selected account */
    useEffect(() => {
        const init = async () => {
            const hasVoted = await checkHasVoted(poll.id);
            setHasVoted(hasVoted);
        }
        init();
    })

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

    const ShowOptions = () => {
        const disabled = {
            disabled: hasVoted
        }
        return(
            poll.options.map((option, i) => {
                return (
                    <button
                        key={i}
                        onClick={() => {
                            submitVote(poll.id, i);
                        }}
                        {...disabled}
                    >
                        {option}
                    </button>
                )
            })
        )
    }

    return (
        <div>
            <div>{poll.id}</div>
            <div>{poll.issue}</div>
            <div>{ <ShowOptions/> }</div>
            <div>Voters left: {votersLeft}</div>
            {/* Buttons to vote */}
            {isAdmin && poll.result === '-1' && <EditPollButton/> }
            {isAdmin && poll.result === '-1' && showEditPoll && <DeletePollButton/> }

        </div>
    )
}
