import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export default function TechnicianDashboard() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    apiService.getAssignedJobs('TECH-01').then(setJobs);
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Technician Workspace - Assigned Jobs</h1>
      <div className="grid gap-4">
        {jobs.length === 0 ? (
          <p className="text-gray-500">No jobs assigned yet.</p>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="p-4 border rounded-lg shadow-sm bg-white flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-lg">{job.id}</span>
                  <StatusBadge status={job.status} />
                  <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 font-bold rounded">{job.priority}</span>
                </div>
                <p className="text-sm font-semibold text-gray-700">{job.site_name} — Machine: {job.machine_id}</p>
                <p className="text-sm text-gray-600 mt-1">{job.description}</p>
              </div>
              <Link to={`/technician/job/${job.id}`} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                View & Manage Job
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
