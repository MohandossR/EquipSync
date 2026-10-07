import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OperationsLayout from './components/OperationsLayout';
import OperationsDashboard from './pages/OperationsDashboard';
import RequestDetail from './pages/RequestDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OperationsLayout />}>
          <Route index element={<OperationsDashboard />} />
          <Route path="requests/:id" element={<RequestDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
