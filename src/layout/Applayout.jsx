import React from 'react'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router-dom'


const Applayout = () => {
  return (
    <div className='flex flex-row h-screen w-full'> 
        <Sidebar/>
        <Outlet/>
    </div>
  )
}

export default Applayout
