import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RequestTable from '../components/RequestTable';
import { apiService } from '../services/api';

export default function OperationsDashboard() {
  const navigate = useNavigate();

  const [kpis, setKpis] = useState({
    total_requests: 0,
    pending_approval: 0,
    active_jobs: 0,
    sla_breached: 0,
  });

  const [sla, setSla] = useState({
    total_with_sla: 0,
    breached: 0,
    within_sla: 0,
  });

  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [summary, slaData] = await Promise.all([
          apiService.getDashboardSummary(),
          apiService.getDashboardSla(),
        ]);

        setKpis(summary);
        setSla(slaData);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.detail ||
          'Unable to load dashboard data.'
        );
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="animate-fade-in">

      {/* Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Operations Overview
          </h1>

          <p className="text-slate-500 mt-1">
            Monitor real-time equipment servicing and field activity.
          </p>
        </div>

        <button
          onClick={() => navigate('/customer/create')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-semibold transition-all"
        >
          + New Request
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

        <div className="bg-white rounded-xl shadow-sm border-b-4 border-blue-500 p-6">
          <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider">
            Total Requests
          </h3>

          <p className="text-4xl font-black mt-2 text-blue-700">
            {kpis.total_requests}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border-b-4 border-amber-500 p-6">
          <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider">
            Pending Approval
          </h3>

          <p className="text-4xl font-black mt-2 text-amber-700">
            {kpis.pending_approval}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border-b-4 border-emerald-500 p-6">
          <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider">
            Active Jobs
          </h3>

          <p className="text-4xl font-black mt-2 text-emerald-700">
            {kpis.active_jobs}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border-b-4 border-rose-500 p-6">
          <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider">
            SLA Breached
          </h3>

          <p className="text-4xl font-black mt-2 text-rose-700">
            {kpis.sla_breached}
          </p>
        </div>

      </div>

      {/* SLA Overview */}
      <div className="mb-10 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          SLA Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-500">
              Requests with SLA
            </p>

            <p className="text-2xl font-bold text-slate-900">
              {sla.total_with_sla}
            </p>
          </div>

          <div className="bg-emerald-50 rounded-lg p-4">
            <p className="text-sm text-emerald-700">
              Within SLA
            </p>

            <p className="text-2xl font-bold text-emerald-700">
              {sla.within_sla}
            </p>
          </div>

          <div className="bg-rose-50 rounded-lg p-4">
            <p className="text-sm text-rose-700">
              Breached
            </p>

            <p className="text-2xl font-bold text-rose-700">
              {sla.breached}
            </p>
          </div>

        </div>
      </div>

      {/* Requests */}
      <RequestTable />

    </div>
  );
}