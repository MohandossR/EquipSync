import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RequestTable from '../components/RequestTable';

export default function OperationsDashboard() {
  const [kpis, setKpis] = useState({ total: 0, pending: 0, active: 0, breached_sla: 0 });
  const [exceptions, setExceptions] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/dashboard/summary')
      .then(res => setKpis(res.data))
      .catch(err => console.error(err));
      
    axios.get('http://localhost:8000/api/dashboard/sla')
      .then(res => setExceptions(res.data.exceptions || []))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Operations Overview</h1>
          <p className="text-slate-500 mt-1">Monitor real-time equipment servicing and field activity.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-semibold transition-all">
          + New Request
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Requests', value: kpis.total, color: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
          { label: 'Pending Approval', value: kpis.pending, color: 'border-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
          { label: 'Active Jobs', value: kpis.active, color: 'border-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
          { label: 'SLA Breached', value: kpis.breached_sla, color: 'border-rose-500', bg: 'bg-rose-50', text: 'text-rose-700' }
        ].map((kpi, idx) => (
          <div key={idx} className={`bg-white rounded-xl shadow-sm border-b-4 ${kpi.color} p-6 flex flex-col justify-between hover:shadow-md transition-shadow`}>
            <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider">{kpi.label}</h3>
            <p className={`text-4xl font-black mt-2 ${kpi.text}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {exceptions.length > 0 && (
        <div className="mb-10 bg-rose-50 border border-rose-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></div>
            <h3 className="text-xl font-bold text-rose-900">Active Operational Exceptions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exceptions.map((exc, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border border-rose-100 flex justify-between items-center">
                <span className="font-medium text-rose-800">{exc.message}</span>
                <span className="text-sm font-bold bg-rose-100 text-rose-700 px-3 py-1 rounded-full">Req #{exc.request_id}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <RequestTable />
    </div>
  );
}
