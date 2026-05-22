import React from 'react'
import AdminNavbar from '../components/AdminNavbar'
import WholeContantDashbaord from '../components/WholeContantDashboard'
import { Helmet } from "react-helmet-async";

const AdminDashboard = () => {
  return (
    <>
     <Helmet>
        <title>Izel Studio - Admin Dashboard</title>
      </Helmet>
    <div>
      <AdminNavbar />
      <WholeContantDashbaord />
    </div>
    </>
  )
}

export default AdminDashboard
