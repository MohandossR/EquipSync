import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import TechnicianDashboard from './pages/technician/Dashboard';
import JobDetail from './pages/technician/JobDetail';
import CreateRequest from './pages/customer/CreateRequest';
import RequestList from './pages/customer/RequestList';
import RequestDetail from './pages/customer/RequestDetail';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 font-sans">
        <nav className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center">
          <div className="font-bold text-xl tracking-wider">EquipSync</div>
          <div className="flex gap-4 text-sm font-medium">
            <Link to="/technician" className="hover:underline">Technician Portal</Link>
            <Link to="/customer/requests" className="hover:underline">Customer Portal</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/technician" element={<TechnicianDashboard />} />
          <Route path="/technician/job/:id" element={<JobDetail />} />
          <Route path="/customer/create" element={<CreateRequest />} />
          <Route path="/customer/requests" element={<RequestList />} />
          <Route path="/customer/request/:id" element={<RequestDetail />} />
          <Route path="*" element={<TechnicianDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
