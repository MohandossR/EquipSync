import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

export default function CreateRequest() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ machine_id: '', site_name: '', description: '', priority: 'MEDIUM' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await apiService.createRequest(formData);
    navigate('/customer/requests');
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white border rounded-lg shadow-sm mt-6">
      <h2 className="text-xl font-bold mb-4">Submit Equipment Service Request</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Machine ID</label>
          <input required type="text" placeholder="e.g. M-104" className="w-full border p-2 rounded" onChange={(e) => setFormData({...formData, machine_id: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Site Location</label>
          <input required type="text" placeholder="e.g. Site A - Chennai" className="w-full border p-2 rounded" onChange={(e) => setFormData({...formData, site_name: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select className="w-full border p-2 rounded" onChange={(e) => setFormData({...formData, priority: e.target.value})}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Issue Description</label>
          <textarea required rows={4} placeholder="Describe the machine defect or symptom..." className="w-full border p-2 rounded" onChange={(e) => setFormData({...formData, description: e.target.value})} />
        </div>
        <button type="submit" className="w-full py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700">
          Submit Service Request
        </button>
      </form>
    </div>
  );
}
