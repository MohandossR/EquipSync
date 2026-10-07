import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import OperationsLayout from './components/OperationsLayout';
import OperationsDashboard from './pages/OperationsDashboard';
import OperationsRequestDetail from './pages/OperationsRequestDetail';

import TechnicianDashboard from './pages/technician/Dashboard';
import TechnicianJobDetail from './pages/technician/JobDetail';

import CreateRequest from './pages/customer/CreateRequest';
import RequestList from './pages/customer/RequestList';
import CustomerRequestDetail from './pages/customer/RequestDetail';
import Login from './pages/Login';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Operations Manager */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<OperationsLayout />}>
          <Route index element={<OperationsDashboard />} />
          <Route path="requests/:id" element={<OperationsRequestDetail />} />
        </Route>

        {/* Technician */}
        <Route path="/technician">
          <Route index element={<TechnicianDashboard />} />
          <Route path="job/:id" element={<TechnicianJobDetail />} />
        </Route>

        {/* Customer */}
        <Route path="/customer">
          <Route path="create" element={<CreateRequest />} />
          <Route path="requests" element={<RequestList />} />
          <Route path="request/:id" element={<CustomerRequestDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
