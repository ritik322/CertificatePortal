"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { DataTable } from "./data-table";
import { columns as adminColumnsDefinition } from "./admin-columns";
import { Input } from "./ui/input";
import AdminActionModal from "./AdminActionModal";

export default function AdminRequestManager() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [filter,setFilter] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/requests");
      if (!res.ok) throw new Error("Failed to fetch requests.");
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleUpdateStatus = useCallback(async (requestId, status, remarks) => {
    try {
      const res = await fetch('/api/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status, remarks }),
      });
      if (!res.ok) throw new Error("Failed to update status.");
      fetchRequests(); 
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchRequests]);
  
  const handleRemarkClick = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const columns = useMemo(() => adminColumnsDefinition.map(col => {
      if (col.id === 'actions') {
        return { ...col, meta: { updateStatus: handleUpdateStatus } };
      }
      if (col.accessorKey === 'remarks') {
        return { ...col, meta: { onRemark: handleRemarkClick } };
      }
      return col;
  }), [handleUpdateStatus]);

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-6">
      <Input
          placeholder="Filter by Roll no., student, company...."
          value={filter}
          onChange={(e)=>setFilter(e.target.value)}
          className="max-w-sm bg-white"
        />
      <DataTable columns={columns} data={requests} filter={filter} meta={{ updateStatus: handleUpdateStatus }} />
      <AdminActionModal 
        isOpen={isModalOpen} 
        setIsOpen={setIsModalOpen} 
        request={selectedRequest} 
        onUpdate={handleUpdateStatus} 
      />
    </div>
  );
}
