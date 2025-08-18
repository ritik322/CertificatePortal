// src/components/RequestManager.jsx

"use client";

import { useState, useEffect } from "react";

export default function RequestManager() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/requests"); // Updated API endpoint
      const data = await res.json();
      if (res.ok) {
        setRequests(data);
      } else {
        setError(data.message || "Failed to fetch requests.");
      }
    } catch (err) {
      setError("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (requestId, status) => {
    try {
      const res = await fetch('/api/requests', { // Updated API endpoint
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status }),
      });

      if (res.ok) {
        fetchRequests();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to update status.');
      }
    } catch (err) {
      setError('An error occurred while updating.');
    }
  };

  if (loading) return <p>Loading requests...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Student Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Roll No</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Company</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {requests.length > 0 ? (
            requests.map((req) => (
              <tr key={req._id}>
                <td className="px-6 py-4 whitespace-nowrap">{req.studentId.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{req.studentId.universityRollNo}</td>
                <td className="px-6 py-4 whitespace-nowrap">{req.companyName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{req.status}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {req.status === 'Pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdateStatus(req._id, 'Approved')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm">Approve</button>
                      <button onClick={() => handleUpdateStatus(req._id, 'Rejected')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-8">No pending requests for your department.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}