// src/app/components/CertificateManager.jsx

"use client";

import { useState, useEffect } from "react";

export default function CertificateManager() {
  const [companyName, setCompanyName] = useState("");
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchRequests = async () => {
    const res = await fetch("/api/requests");
    if (res.ok) {
      const data = await res.json();
      setRequests(data);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.message || "Failed to submit request.");
    } else {
      setMessage("Request submitted successfully!");
      setCompanyName("");
      fetchRequests();
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Approved') return 'text-green-400';
    if (status === 'Rejected') return 'text-red-400';
    return 'text-yellow-400';
  };

  return (
    <div>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-2xl font-bold mb-4">Apply for a New Certificate</h3>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter Company Name"
              className="flex-grow px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-indigo-500"
              required
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded transition duration-300">
              Submit Request
            </button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          {message && <p className="text-green-500 mt-2">{message}</p>}
        </form>
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-4">Your Requests</h3>
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Company Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {requests.length > 0 ? (
                requests.map((req) => (
                  <tr key={req._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{req.companyName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-semibold ${getStatusColor(req.status)}`}>{req.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {req.status === 'Approved' ? (
                        <a 
                          href={`/api/generate-certificate/${req._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-600 hover:bg-green-700 text-white text-center font-bold py-1 px-3 rounded text-sm transition duration-300"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="text-gray-500 text-sm">Not Available</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-8">You have no certificate requests.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}