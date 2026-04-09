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
import DutiesAllottedBackoffice from './container/reports/dutiesallotted/DutiesAllottedBackoffice.jsx';
import DutiesAllottedMumbai from './container/reports/dutiesallotted/DutiesAllottedMumbai.jsx';
import DutiesAllottedMarol from './container/reports/dutiesallotted/DutiesAllottedMarol.jsx';
import DutiesAllottedMumbra from './container/reports/dutiesallotted/DutiesAllottedMumbra.jsx';
import DutyChart from './container/reports/dutychart/DutyChart.jsx';
import InchargeAttendanceReport from './container/reports/inchargeattendancereport/InchargeAttendanceReport.jsx';
import DutiesSummaryReportBackoffice from './container/reports/dutiessummaryreport/dutiessummaryreport-backoffice.jsx';
import InchargeDutiesSummaryReport from './container/reports/inchargeduteissummaryreport/inchargedutiessummaryreport.jsx';
import LavazamMaster from './container/master/lavazammaster/LavazamMaster.jsx';
import MemberLavazam from './container/back office/MemberLavazam.jsx';
import BulkUpdate from './container/back office/BulkUpdate.jsx';
import LavazamReport from './container/reports/lavazamreport/LavazamReport.jsx';
import MembersReport from './container/reports/membersreport/MembersReport.jsx';

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
          <Route path={`${import.meta.env.BASE_URL}backoffice/locationincharge`} element={<MiqaatIncharge />} />
          {/* Duties Allotted Reports */}
          <Route path={`${import.meta.env.BASE_URL}reports/dutiesallotedbackoffice`} element={<DutiesAllottedBackoffice />} />
          <Route path={`${import.meta.env.BASE_URL}reports/dutiesallotedmumbai`} element={<DutiesAllottedMumbai />} />
          <Route path={`${import.meta.env.BASE_URL}reports/dutiesallotedmarol`} element={<DutiesAllottedMarol />} />
          <Route path={`${import.meta.env.BASE_URL}reports/dutiesallotedmumbra`} element={<DutiesAllottedMumbra />} />
          <Route path={`${import.meta.env.BASE_URL}reports/dutychart`} element={<DutyChart />} />
          <Route path={`${import.meta.env.BASE_URL}reports/inchargeattendancereport`} element={<InchargeAttendanceReport />} />
          {/* <Route path={`${import.meta.env.BASE_URL}reports/dutiessummaryreport`} element={<DutiesSummaryReport />} /> */}
          <Route path={`${import.meta.env.BASE_URL}reports/dutiessummaryreport`} element={<DutiesSummaryReportBackoffice />} />
          <Route path={`${import.meta.env.BASE_URL}reports/inchargedutiessummaryreport`} element={<InchargeDutiesSummaryReport />} />
          <Route path={`${import.meta.env.BASE_URL}master/lavazammaster`} element={<LavazamMaster />} />
          <Route path={`${import.meta.env.BASE_URL}backoffice/memberlavazam`} element={<MemberLavazam />} />
          <Route path={`${import.meta.env.BASE_URL}backoffice/bulkupdate`} element={<BulkUpdate />} />
          <Route path={`${import.meta.env.BASE_URL}reports/lavazamreport`} element={<LavazamReport />} />
          <Route path={`${import.meta.env.BASE_URL}reports/membersreport`} element={<MembersReport />} />
        </Route>

        {/* Public Routes - Error Pages */}
        <Route path={`${import.meta.env.BASE_URL}`} element={<Authenticationlayout />}>
          <Route path={`${import.meta.env.BASE_URL}custompages/error-404`} element={<Error404 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.Fragment>
);