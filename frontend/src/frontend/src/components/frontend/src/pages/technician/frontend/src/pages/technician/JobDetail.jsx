import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [logNote, setLogNote] = useState('');
  const [evidence, setEvidence] = useState('');

  useEffect(() => {
    apiService.getJobDetail(id).then(setJob);
  }, [id]);

  if (!job) return <div className="p-6">Loading job details...</div>;

  const handleStatusChange = async (nextStatus, logText) => {
    const updated = await apiService.updateJobStatus(job.id, nextStatus, { log: logText, evidence });
    setJob({ ...updated });
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!logNote) return;
    const updated = await apiService.addServiceLog(job.id, logNote);
    setJob({ ...updated });
    setLogNote('');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="text-sm text-blue-600 mb-2">&larr; Back to Dashboard</button>
      
      <div className="p-6 bg-white border rounded-lg shadow-sm">
        <div className="flex justify-between items-start border-b pb-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold">{job.id} - {job.machine_id}</h1>
            <p className="text-gray-600">{job.site_name}</p>
          </div>
          <StatusBadge status={job.status} />
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Required Parts & Resources</h3>
          <div className="flex gap-2">
            {job.required_parts?.map((part, idx) => (
              <span key={idx} className="px-3 py-1 bg-gray-100 text-sm border rounded text-gray-700">{part}</span>
            ))}
          </div>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg flex flex-wrap gap-3">
          {job.status === 'ASSIGNED' && (
            <button onClick={() => handleStatusChange('ACCEPTED', 'Job accepted by technician')} className="px-4 py-2 bg-indigo-600 text-white rounded">Accept Job</button>
          )}
          {job.status === 'ACCEPTED' && (
            <button onClick={() => handleStatusChange('TRAVELLING', 'Technician is en route')} className="px-4 py-2 bg-cyan-600 text-white rounded">Start Travel</button>
          )}
          {job.status === 'TRAVELLING' && (
            <button onClick={() => handleStatusChange('IN_PROGRESS', 'Technician arrived and started work')} className="px-4 py-2 bg-orange-600 text-white rounded font-medium">Mark Arrived & Start Work</button>
          )}
          {job.status === 'IN_PROGRESS' && (
            <div className="w-full space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Upload Completion Evidence (URL or Note):</label>
                <input 
                  type="text" 
                  value={evidence} 
                  onChange={(e) => setEvidence(e.target.value)} 
                  placeholder="https://image-link.com/photo.jpg or Completed work note" 
                  className="w-full border p-2 rounded text-sm mb-2"
                />
              </div>
              <button onClick={() => handleStatusChange('COMPLETED', 'Service completed. Pending customer verification.')} className="px-4 py-2 bg-green-600 text-white rounded">
                Complete Service
              </button>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-md font-bold mb-2">Service Activity Logs</h3>
          <ul className="space-y-2 mb-4 border-l-2 border-gray-200 pl-4">
            {job.logs?.map((log, idx) => (
              <li key={idx} className="text-sm">
                <span className="text-xs text-gray-400 block">{log.timestamp}</span>
                <span className="text-gray-700">{log.note}</span>
              </li>
            ))}
          </ul>

          <form onSubmit={handleAddLog} className="flex gap-2">
            <input 
              type="text" 
              value={logNote} 
              onChange={(e) => setLogNote(e.target.value)} 
              placeholder="Add work progress note..." 
              className="flex-grow border p-2 rounded text-sm"
            />
            <button type="submit" className="px-4 py-2 bg-gray-800 text-white text-sm rounded">Add Log</button>
          </form>
        </div>
      </div>
    </div>
  );
}
