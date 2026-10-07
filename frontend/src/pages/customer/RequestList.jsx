import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export default function RequestList() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    apiService.getCustomerRequests().then(setRequests);
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Service Requests</h1>
        <Link to="/customer/create" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          + New Service Request
        </Link>
      </div>
      <div className="space-y-4">
        {requests.map((req) => (
          <div key={req.id} className="p-4 bg-white border rounded-lg shadow-sm flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold">{req.id}</span>
                <StatusBadge status={req.status} />
              </div>
              <p className="text-sm font-medium text-gray-700">Machine: {req.machine_id} | {req.site_name}</p>
              <p className="text-xs text-gray-500 mt-1">Submitted: {req.created_at}</p>
            </div>
            <Link to={`/customer/request/${req.id}`} className="px-3 py-1.5 border border-gray-300 text-sm font-medium rounded hover:bg-gray-50">
              Track Status
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
