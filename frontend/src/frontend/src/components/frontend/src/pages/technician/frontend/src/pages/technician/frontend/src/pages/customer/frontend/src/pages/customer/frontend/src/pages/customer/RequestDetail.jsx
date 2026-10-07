import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export default function RequestDetail() {
  const { id } = useParams();
  const [req, setReq] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    apiService.getJobDetail(id).then(setReq);
  }, [id]);

  if (!req) return <div className="p-6">Loading status...</div>;

  const handleVerify = async (e) => {
    e.preventDefault();
    const updated = await apiService.verifyService(req.id, rating, feedback);
    setReq({ ...updated });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white border rounded-lg shadow-sm space-y-6">
      <div className="flex justify-between items-start border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">{req.id}</h1>
          <p className="text-gray-600">Machine: {req.machine_id}</p>
        </div>
        <StatusBadge status={req.status} />
      </div>

      <div>
        <h3 className="font-bold text-sm text-gray-700 uppercase mb-1">Issue Description</h3>
        <p className="text-gray-800 bg-gray-50 p-3 rounded">{req.description}</p>
      </div>

      {req.evidence && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
          <h3 className="font-bold text-teal-800 text-sm mb-1">Completion Evidence Uploaded</h3>
          <p className="text-sm text-teal-700">{req.evidence}</p>
        </div>
      )}

      {req.status === 'COMPLETED' && (
        <div className="p-4 border-2 border-blue-500 rounded-lg bg-blue-50">
          <h3 className="text-lg font-bold text-blue-900 mb-2">Verify Completed Service</h3>
          <form onSubmit={handleVerify} className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Rating (1 to 5 Stars):</label>
              <select value={rating} onChange={(e) => setRating(e.target.value)} className="border p-2 rounded w-full">
                <option value={5}>5 Stars - Excellent Work</option>
                <option value={4}>4 Stars - Good</option>
                <option value={3}>3 Stars - Satisfactory</option>
                <option value={2}>2 Stars - Poor</option>
                <option value={1}>1 Star - Unsatisfactory</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Feedback / Remarks:</label>
              <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Enter feedback for technician..." className="w-full border p-2 rounded text-sm" />
            </div>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded font-medium">
              Verify & Approve Completion
            </button>
          </form>
        </div>
      )}

      {req.verification && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-bold text-green-800 text-sm">Verified by Customer</h3>
          <p className="text-sm text-green-700">Rating: {req.verification.rating} / 5 Stars</p>
          <p className="text-sm text-green-700">Feedback: {req.verification.feedback}</p>
        </div>
      )}

      <div>
        <h3 className="font-bold text-sm text-gray-700 uppercase mb-2">Service Lifecycle Timeline</h3>
        <ul className="space-y-2 border-l-2 border-gray-200 pl-4">
          {req.logs?.map((log, idx) => (
            <li key={idx} className="text-sm">
              <span className="text-xs text-gray-400 block">{log.timestamp}</span>
              <span className="text-gray-700">{log.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
