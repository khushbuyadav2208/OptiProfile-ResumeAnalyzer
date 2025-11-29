import React from 'react'
import Layout from './Layout'
import { NavLink } from 'react-router-dom'

const UserMenu = () => {
  return (
    <>
    <div className='text-center'></div>
   <div className="list-group">
    <h4>User Panel</h4>
  <NavLink to="/dashboard/user/orders" className="list-group-item list-group-item-action">My Orders</NavLink>
  <NavLink to="/dashboard/user/profile" className="list-group-item list-group-item-action">My profile</NavLink>
  </div>
    </>
  )
}

export default UserMenu
