import React from 'react'
import { Link } from 'react-router-dom'

export default function OrganizationList({ tokenURIs }) {
    return (
        <div>
            {tokenURIs.map(uri => (
                <div key={uri}>
                    <Link
                        to={`/organizations/${uri}`}
                    >
                        {uri}
                    </Link>
                </div>
            ))}
        </div>
    )
}
