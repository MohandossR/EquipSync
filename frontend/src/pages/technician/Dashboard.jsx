import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export default function TechnicianDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingJobId, setUpdatingJobId] = useState(null);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await apiService.getAssignedJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load technician jobs:', err);

      setError(
        err.response?.data?.detail ||
        'Unable to load assigned jobs.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const updateStatus = async (jobId, status) => {
    try {
      setUpdatingJobId(jobId);
      setError('');

      await apiService.updateJobStatus(
        jobId,
        status,
        `Technician updated job to ${status}`
      );

      await loadJobs();
    } catch (err) {
      console.error('Failed to update job status:', err);

      setError(
        err.response?.data?.detail ||
        'Unable to update job status.'
      );
    } finally {
      setUpdatingJobId(null);
    }
  };

  const getActionButton = (job) => {
    const isUpdating = updatingJobId === job.id;

    if (job.status === 'ASSIGNED') {
      return (
        <button
          onClick={() => updateStatus(job.id, 'ACCEPTED')}
          disabled={isUpdating}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium"
        >
          {isUpdating ? 'Updating...' : 'Accept Job'}
        </button>
      );
    }

    if (job.status === 'ACCEPTED') {
      return (
        <button
          onClick={() => updateStatus(job.id, 'TRAVELLING')}
          disabled={isUpdating}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium"
        >
          {isUpdating ? 'Updating...' : 'Start Travel'}
        </button>
      );
    }

    if (job.status === 'TRAVELLING') {
      return (
        <button
          onClick={() => updateStatus(job.id, 'IN_PROGRESS')}
          disabled={isUpdating}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium"
        >
          {isUpdating ? 'Updating...' : 'Start Work'}
        </button>
      );
    }

    if (job.status === 'IN_PROGRESS') {
      return (
        <button
          onClick={() => updateStatus(job.id, 'COMPLETED')}
          disabled={isUpdating}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium"
        >
          {isUpdating ? 'Updating...' : 'Complete Job'}
        </button>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Technician Workspace
            </h1>

            <p className="text-slate-500 mt-1">
              Your assigned service jobs
            </p>
          </div>

          <button
            onClick={loadJobs}
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && jobs.length === 0 && (
          <div className="bg-white border rounded-xl p-10 text-center">
            <p className="text-slate-500">
              Loading assigned jobs...
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && jobs.length === 0 && (
          <div className="bg-white border rounded-xl p-10 text-center">
            <h2 className="text-xl font-semibold text-slate-800">
              No jobs assigned yet
            </h2>

            <p className="text-slate-500 mt-2">
              Assigned service requests will appear here.
            </p>
          </div>
        )}

        {/* Jobs */}
        {jobs.length > 0 && (
          <div className="space-y-5">

            {jobs.map((job) => (
              <div
                key={job.assignment_id}
                className="bg-white border border-slate-200 rounded-xl shadow-sm p-6"
              >

                {/* Job Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">

                  <div>
                    <div className="flex flex-wrap items-center gap-3">

                      <h2 className="text-xl font-bold text-slate-900">
                        {job.request_code}
                      </h2>

                      <StatusBadge status={job.status} />

                    </div>

                    <h3 className="text-lg font-semibold text-slate-800 mt-3">
                      {job.title}
                    </h3>
                  </div>

                  <Link
                    to={`/technician/job/${job.id}`}
                    className="inline-block px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                  >
                    View Details
                  </Link>

                </div>

                {/* Job Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Machine
                    </p>

                    <p className="font-semibold text-slate-800 mt-1">
                      #{job.machine_id}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Priority
                    </p>

                    <p className="font-semibold text-slate-800 mt-1">
                      {job.priority}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Required Skill
                    </p>

                    <p className="font-semibold text-slate-800 mt-1">
                      {job.required_skill || 'Not specified'}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Assignment
                    </p>

                    <p className="font-semibold text-slate-800 mt-1">
                      {job.assignment_status}
                    </p>
                  </div>

                </div>

                {/* Description */}
                <div className="mt-5">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                    Description
                  </p>

                  <p className="text-slate-700">
                    {job.description}
                  </p>
                </div>

                {/* Action */}
                <div className="mt-6 pt-5 border-t border-slate-200 flex flex-wrap gap-3">

                  {getActionButton(job)}

                  {job.status === 'COMPLETED' && (
                    <span className="px-4 py-2 bg-green-50 text-green-700 rounded-lg font-medium">
                      Job Completed
                    </span>
                  )}

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}