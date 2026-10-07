import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function RequestDetail() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:8000/api/requests/${id}`)
      .then(res => setRequest(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!request) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <Link to="/" className="text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 inline-block transition-colors">
        &larr; Back to Dashboard
      </Link>
      
      <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">REQ-{request.id}</span>
              <h1 className="text-2xl font-bold text-slate-900">{request.machine_name} Maintenance</h1>
            </div>
            <p className="text-slate-500 font-medium">{request.site_name} • Priority: <span className={request.priority === 'High' ? 'text-rose-600 font-bold' : ''}>{request.priority}</span></p>
          </div>
          <button className="border border-slate-300 bg-white text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            Manage Options
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            {/* SLA Panel */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Status & SLA</h3>
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-600 font-medium">Current Phase</span>
                <span className="font-bold text-slate-900">{request.status.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="text-slate-600 font-medium">SLA Monitor</span>
                <span className={`px-3 py-1 rounded-md text-sm font-bold border 
                  ${request.sla_status === 'BREACHED' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                    request.sla_status === 'AT_RISK' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                    'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  {request.sla_status}
                </span>
              </div>
            </div>

            {/* Technician Panel */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Field Resource</h3>
              {request.technician_name ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg">
                    {request.technician_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{request.technician_name}</p>
                    <p className="text-sm text-slate-500">{request.technician_contact}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  <p className="text-slate-500 text-sm font-medium">Awaiting Resource Allocation</p>
                </div>
              )}
            </div>
          </div>

          {/* Audit Timeline */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Execution Timeline</h3>
            <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pb-4">
              {request.audit_logs?.map((log, index) => (
                <div key={index} className="relative pl-6">
                  <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-blue-500 ring-4 ring-white"></span>
                  <div className="mb-1">
                    <span className="text-xs font-bold text-slate-400">{new Date(log.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                  <h4 className="text-md font-bold text-slate-800">{log.action}</h4>
                  <p className="text-sm text-slate-500 mt-1">Initiated by {log.user}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
