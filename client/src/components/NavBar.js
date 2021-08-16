import React from 'react'
import { NavLink } from 'react-router-dom'

export default function NavBar() {
    
    return (
        <div>
            <NavLink
                to="/newOrganization"
            >
                New Organization
            </NavLink>
            <NavLink
                to="/organizations"
            >
                My Organizations
            </NavLink>
        </div>
    )
}
