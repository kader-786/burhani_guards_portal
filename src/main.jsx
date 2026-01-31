import React from 'react'
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './pages/App.jsx';
import './index.scss'
import Auth from './firebase/auth.jsx';
import Login from './firebase/login.jsx';
import AuthGuard from './firebase/authGuard.jsx';
import Error404 from './container/custompages/error404/error404.jsx';
import Dashboard from './container/dashboard/dashboard.jsx';
import Authenticationlayout from './pages/authenticationlayout.jsx';
import TeamMaster from './container/master/teammaster/TeamMaster.jsx';
import MiqaatMaster from './container/master/miqaatmaster/MiqaatMaster.jsx';
import Duties from '././container/back office/Duties.jsx';
import VenueMaster from './container/master/venuemaster/venuemaster.jsx';
import MuminMaster from './container/master/muminmaster/MuminMaster.jsx';
import RoleMaster from './container/master/rolemaster/RoleMaster.jsx';
import AttendanceReport from './container/reports/attendancereport/AttendanceReport.jsx';
import MiqaatIncharge from './container/back office/MiqaatIncharge.jsx';
 

window.global = window; // Polyfill for global

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.Fragment>
    <BrowserRouter>
        <Routes>
          {/* Public Routes - Login */}
          <Route path={`${import.meta.env.BASE_URL}`} element={<Auth />}>
            <Route index element={<Login />} />
            <Route path={`${import.meta.env.BASE_URL}firebase/login`} element={<Login />} />
          </Route>
          
          {/* Protected Routes - Wrapped with AuthGuard */}
          <Route path={`${import.meta.env.BASE_URL}`} element={<AuthGuard><App /></AuthGuard>}>
            <Route path={`${import.meta.env.BASE_URL}dashboard`} element={<Dashboard />} />
            <Route path={`${import.meta.env.BASE_URL}master/teammaster`} element={<TeamMaster />} />
            <Route path={`${import.meta.env.BASE_URL}master/miqaatmaster`} element={<MiqaatMaster />} />
            <Route path={`${import.meta.env.BASE_URL}master/venuemaster`} element={<VenueMaster />} />
            <Route path={`${import.meta.env.BASE_URL}master/membermaster`} element={<MuminMaster />} />
            <Route path={`${import.meta.env.BASE_URL}backoffice/duties`} element={<Duties />} />
            <Route path={`${import.meta.env.BASE_URL}master/rolemaster`} element={<RoleMaster />} />
            <Route path={`${import.meta.env.BASE_URL}reports/attendancereport`} element={<AttendanceReport />} />
            <Route path={`${import.meta.env.BASE_URL}backoffice/miqaatincharge`} element={<MiqaatIncharge />} />
          </Route>
          
          {/* Public Routes - Error Pages */}
          <Route path={`${import.meta.env.BASE_URL}`} element={<Authenticationlayout />}>
            <Route path={`${import.meta.env.BASE_URL}custompages/error-404`} element={<Error404 />} />
          </Route>
        </Routes>
    </BrowserRouter>
  </React.Fragment>
);