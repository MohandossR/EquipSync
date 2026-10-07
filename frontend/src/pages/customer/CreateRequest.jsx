import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

export default function CreateRequest() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    machine_id: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
    required_skill: '',
    sla_deadline: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        machine_id: Number(formData.machine_id),
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        required_skill: formData.required_skill || null,
        sla_deadline: formData.sla_deadline
          ? new Date(formData.sla_deadline).toISOString()
          : null,
      };

      await apiService.createRequest(payload);

      navigate('/customer/requests');
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        'Failed to create service request. Please try again.';

      setError(
        Array.isArray(message)
          ? message.map((item) => item.msg).join(', ')
          : message
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white border rounded-lg shadow-sm mt-6">
      <h2 className="text-xl font-bold mb-4">
        Submit Equipment Service Request
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Machine ID
          </label>

          <input
            required
            type="number"
            min="1"
            name="machine_id"
            value={formData.machine_id}
            placeholder="e.g. 1"
            className="w-full border p-2 rounded"
            onChange={handleChange}
          />

          <p className="text-xs text-gray-500 mt-1">
            Enter the database ID of the machine.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Request Title
          </label>

          <input
            required
            type="text"
            name="title"
            value={formData.title}
            placeholder="e.g. Hydraulic pressure issue"
            minLength={3}
            maxLength={200}
            className="w-full border p-2 rounded"
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Required Skill
          </label>

          <input
            type="text"
            name="required_skill"
            value={formData.required_skill}
            placeholder="e.g. HYDRAULICS"
            maxLength={100}
            className="w-full border p-2 rounded"
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Priority
          </label>

          <select
            name="priority"
            value={formData.priority}
            className="w-full border p-2 rounded"
            onChange={handleChange}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            SLA Deadline
          </label>

          <input
            type="datetime-local"
            name="sla_deadline"
            value={formData.sla_deadline}
            className="w-full border p-2 rounded"
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Issue Description
          </label>

          <textarea
            required
            rows={4}
            name="description"
            value={formData.description}
            placeholder="Describe the machine defect or symptom..."
            minLength={5}
            maxLength={5000}
            className="w-full border p-2 rounded"
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Service Request'}
        </button>
      </form>
    </div>
  );
}