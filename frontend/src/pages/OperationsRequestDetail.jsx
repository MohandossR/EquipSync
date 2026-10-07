import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';

export default function OperationsRequestDetail() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiService.getJobDetail(id)
      .then(data => setRequest(data))
      .catch(err => {
        console.error(err);
        setError('Failed to load service request.');
      });
  }, [id]);

  if (error) {
    return (
      <div className="max-w-5xl mx-auto py-10">
        <Link
          to="/"
          className="text-sm font-semibold text-slate-500 hover:text-blue-600"
        >
          &larr; Back to Dashboard
        </Link>

        <div className="mt-6 bg-white border border-rose-200 rounded-xl p-6">
          <p className="text-rose-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <Link
        to="/"
        className="text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 inline-block"
      >
        &larr; Back to Dashboard
      </Link>

      <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">

        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                REQ-{request.id}
              </span>

              <h1 className="text-2xl font-bold text-slate-900">
                {request.title || 'Service Request'}
              </h1>
            </div>

            <p className="text-slate-500 font-medium">
              Priority:{' '}
              <span className="text-rose-600 font-bold">
                {request.priority}
              </span>
            </p>
          </div>

          <span className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold">
            {request.status?.replaceAll('_', ' ')}
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Left */}
          <div className="space-y-8">

            {/* Request Information */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Request Information
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Description</p>
                  <p className="font-medium text-slate-800">
                    {request.description || 'No description provided'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Required Skill</p>
                  <p className="font-medium text-slate-800">
                    {request.required_skill || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Status
              </h3>

              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">
                  Current Phase
                </span>

                <span className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  {request.status?.replaceAll('_', ' ')}
                </span>
              </div>
            </div>

          </div>

          {/* Right */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
              Service Details
            </h3>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">

              <div>
                <p className="text-sm text-slate-500">Request ID</p>
                <p className="font-bold text-slate-800">
                  SR-{request.id}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Machine</p>
                <p className="font-medium text-slate-800">
                  {request.machine_id || 'Not available'}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Priority</p>
                <p className="font-bold text-slate-800">
                  {request.priority}
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}