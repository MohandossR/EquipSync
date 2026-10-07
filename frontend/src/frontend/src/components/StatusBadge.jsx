import React from 'react';

const statusColors = {
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  ASSIGNED: 'bg-purple-100 text-purple-800',
  ACCEPTED: 'bg-indigo-100 text-indigo-800',
  TRAVELLING: 'bg-cyan-100 text-cyan-800',
  IN_PROGRESS: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-teal-100 text-teal-800',
  VERIFICATION_PENDING: 'bg-amber-100 text-amber-800',
  VERIFIED: 'bg-green-100 text-green-800',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status ? status.replace('_', ' ') : 'UNKNOWN'}
    </span>
  );
}
