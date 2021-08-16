import React, { useState } from 'react'

export default function OrganizationCreate({ 
    createOrganization}) {
        const [name, setName] = useState('');

        return (
            <div>
                <label>
                    Name
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <button
                    onClick={() => {
                        createOrganization(name);
                    }}
                >
                    Create
                </button>
            </div>
        )
}
