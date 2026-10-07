import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function RequestTable() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState({ status: '', priority: '' });

  useEffect(() => {
    axios.get('http://localhost:8000/api/requests')
      .then(res => setRequests(res.data))
      .catch(err => console.error(err));
  }, []);

  const filteredRequests = requests.filter(req => {
    return (filter.status === '' || req.status === filter.status) &&
           (filter.priority === '' || req.priority === filter.priority);
  });

  const getStatusBadge = (status) => {
    const styles = {
      'PENDING_APPROVAL': 'bg-amber-100 text-amber-800 border-amber-200',
      'ASSIGNED': 'bg-blue-100 text-blue-800 border-blue-200',
      'IN_PROGRESS': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'COMPLETED': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    };
    return `px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-slate-100 text-slate-800 border-slate-200'}`;
  };

  return (
    <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-900">Service Requests Pipeline</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <select 
            className="w-full sm:w-48 bg-white border border-slate-300 text-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            onChange={(e) => setFilter({...filter, status: e.target.value})}
          >
            <option value="">All Statuses</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
          </select>
          <select 
            className="w-full sm:w-48 bg-white border border-slate-300 text-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            onChange={(e) => setFilter({...filter, priority: e.target.value})}
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-semibold tracking-wider">
            <tr>
              <th className="p-4 pl-6">ID</th>
              <th className="p-4">Machine & Site</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right pr-6">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRequests.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-slate-500">No requests found.</td></tr>
            ) : (
              filteredRequests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4 pl-6 font-semibold text-slate-900">#{req.id}</td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-900">{req.machine_name}</div>
                    <div className="text-sm text-slate-500">{req.site_name}</div>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-bold ${req.priority === 'High' ? 'text-rose-600' : 'text-slate-700'}`}>
                      {req.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={getStatusBadge(req.status)}>{req.status.replace('_', ' ')}</span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <Link to={`/requests/${req.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity">
                      View Details &rarr;
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
