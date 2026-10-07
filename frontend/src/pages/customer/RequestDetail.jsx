import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export default function RequestDetail() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiService.getJobDetail(id)
      .then(setRequest)
      .catch(() => setError('Unable to load service request.'));
  }, [id]);

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  if (!request) {
    return <div className="p-6">Loading request...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Link
        to="/customer/requests"
        className="text-sm text-blue-600"
      >
        &larr; Back to My Requests
      </Link>

      <div className="p-6 bg-white border rounded-lg shadow-sm">
        <div className="flex justify-between items-start border-b pb-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold">
              {request.request_code}
            </h1>
            <p className="text-gray-600 mt-1">{request.title}</p>
          </div>

          <StatusBadge status={request.status} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Machine ID
            </p>
            <p>{request.machine_id}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Priority
            </p>
            <p>{request.priority}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Required Skill
            </p>
            <p>{request.required_skill || 'Not specified'}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">
              SLA Deadline
            </p>
            <p>{request.sla_deadline || 'Not specified'}</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
            Description
          </p>
          <p className="text-gray-700">
            {request.description}
          </p>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
            Created
          </p>
          <p className="text-gray-700">
            {request.created_at}
          </p>
        </div>
      </div>
    </div>
  );
}
