import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

export default function RequestTable() {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvingId, setApprovingId] = useState(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await apiService.getCustomerRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
        'Unable to load service requests.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (requestId) => {
    try {
      setApprovingId(requestId);

      await apiService.approveRequest(requestId);

      await loadRequests();
    } catch (err) {
      alert(
        err.response?.data?.detail ||
        'Unable to approve request.'
      );
    } finally {
      setApprovingId(null);
    }
  };

  const filteredRequests = requests.filter((request) => {
    const statusMatch =
      statusFilter === 'ALL' ||
      request.status === statusFilter;

    const priorityMatch =
      priorityFilter === 'ALL' ||
      request.priority === priorityFilter;

    return statusMatch && priorityMatch;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

      <div className="p-6 border-b border-slate-200 flex flex-wrap justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Service Requests Pipeline
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage and monitor equipment service requests.
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="ALL">All Statuses</option>
            <option value="CREATED">Created</option>
            <option value="VALIDATING">Validating</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="TRAVELLING">Travelling</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="m-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-slate-500">
          Loading service requests...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          No service requests found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">
                  Request
                </th>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">
                  Machine
                </th>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">
                  Priority
                </th>
                <th className="text-left px-6 py-4 font-semibold text-slate-600">
                  Status
                </th>
                <th className="text-right px-6 py-4 font-semibold text-slate-600">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50">

                  <td className="px-6 py-4">
                    <Link
                      to={`/requests/${request.id}`}
                      className="font-semibold text-blue-600 hover:text-blue-800"
                    >
                      {request.request_code}
                    </Link>

                    <div className="text-slate-500 mt-1">
                      {request.title}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-slate-700">
                    #{request.machine_id}
                  </td>

                  <td className="px-6 py-4">
                    <span className="font-semibold">
                      {request.priority}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      {request.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">

                      <Link
                        to={`/requests/${request.id}`}
                        className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                      >
                        View
                      </Link>

                      {request.status === 'PENDING_APPROVAL' && (
                        <button
                          onClick={() => handleApprove(request.id)}
                          disabled={approvingId === request.id}
                          className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {approvingId === request.id
                            ? 'Approving...'
                            : 'Approve'}
                        </button>
                      )}

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}