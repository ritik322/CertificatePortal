"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { DataTable } from "./ui/data-table";
import { DataTableColumnHeader } from "./ui/data-table/data-table-column-header";
import RequestDetailsDialog from "./RequestDetailsDialog";
import { Button } from "@/components/ui/button";
import trainingOptions from "@/constants/TrainingOptions";
import { Loader2 } from "lucide-react"; 

const getStatusClasses = (status) => {
  switch (status) {
    case "Approved":
      return "bg-green-100 text-green-800";
    case "Rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
};


export default function AdminRequestManager() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedDetailsRequest, setSelectedDetailsRequest] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
 
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

  const handleUpdateStatus = useCallback(
    async (requestId, status, remarks) => {
      try {
        const res = await fetch("/api/requests", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId, status, remarks }),
        });
        if (!res.ok) throw new Error("Failed to update status.");
        fetchRequests();
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [fetchRequests],
  );

  const handleRowClick = (request) => {
    setSelectedDetailsRequest(request);
    setIsDetailsDialogOpen(true);
  };

  const handleDownloadClick = async (request) => {
    setDownloadingId(request._id);
    try {
      const response = await fetch(`/api/generate-certificate/${request._id}`);

      if (!response.ok) {
        throw new Error("Failed to generate certificate.");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${request.studentId.universityRollNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setTimeout(() => setDownloadingId(null), 3000);
    }
  };


  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.studentId?.name || "N/A",
        id: "studentName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Student Name" />
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("studentName")}</div>
        ),
      },
      {
        accessorFn: (row) => row.studentId?.universityRollNo || "N/A",
        id: "rollNo",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Roll No" />
        ),
        cell: ({ row }) => (
          <div className="font-mono">{row.getValue("rollNo")}</div>
        ),
      },
      {
        accessorKey: "trainingType",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Training Type" />
        ),
        cell: ({ row }) => (
          <div>{row.getValue("trainingType")}</div>
        ),
      },
      {
        accessorKey: "refNo",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Ref No." />
        ),
        cell: ({ row }) => {
          const refNo = row.getValue("refNo");
          return <div>{refNo || "-"}</div>;
        },
      },
      {
        accessorFn: (row) => row.studentId?.department.toLocaleUpperCase() || "N/A",
        id: "department",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Department" />
        ),
        cell: ({ row }) => <div>{row.getValue("department")}</div>,
      },
      {
        accessorKey: "companyName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Company Name" />
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("companyName")}</div>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const status = row.getValue("status");
          return (
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(status)}`}
            >
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Request Date" />
        ),
        cell: ({ row }) => {
          const createdAt = row.getValue("createdAt");
          return <div>{new Date(createdAt).toLocaleDateString('en-GB')}</div>;
        },
      },
      {
        accessorKey: "approvedDate",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Approved Date" />
        ),
        cell: ({ row }) => {
          const approvedDate = row.getValue("approvedDate");
          if (!approvedDate) {
            return <div className="text-gray-400">-</div>;
          }
          return <div>{new Date(approvedDate).toLocaleDateString('en-GB')}</div>;
        },
      },
      {
        id: "actions",
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => {
          const request = row.original;
          const isDownloading = downloadingId === request._id;

          if (request.status === "Approved") {
            return (
              <div className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-indigo-600 hover:cursor-pointer hover:text-white"
                  disabled={isDownloading}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadClick(request);
                  }}
                >
                  {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Download"}
                </Button>
              </div>
            );
          }

          if (request.status === "Rejected") {
            return (
              <div className="text-center text-sm text-gray-500">Resolved</div>
            );
          }

          return (
            <div className="text-center space-x-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus(request._id, "Approved");
                }}
                variant="outline"
                size="sm"
                className="text-green-600 border-green-300 hover:bg-green-100 hover:text-green-700"
              >
                Approve
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus(request._id, "Rejected");
                }}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-100 hover:text-red-700"
              >
                Reject
              </Button>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [handleUpdateStatus, downloadingId],
  );

  const filterColumns = [
    {
      key: "studentName",
      title: "Student Name",
      type: "string",
    },
    {
      key: "rollNo",
      title: "Roll No",
      type: "string",
    },
    {
      key: "refNo",
      title: "Ref No.",
      type: "string",
    },
    {
      key: "department",
      title: "Department",
      type: "string",
    },
    {
      key: "trainingType",
      title: "Training Type",
      type: "enum",
      values: trainingOptions,
    },
    {
      key: "companyName",
      title: "Company Name",
      type: "string",
    },
    {
      key: "status",
      title: "Status",
      type: "enum",
      values: ["Pending", "Approved", "Rejected"],
    },
    {
      key: "createdAt",
      title: "Request Date",
      type: "date",
    },
    {
      key: "approvedDate",
      title: "Approved Date",
      type: "date",
    },
  ];

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Certificate Requests
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage and review all student certificate requests.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={requests}
        filterColumns={filterColumns}
        enableSelection={false}
        exportFileName="admin-certificate-requests"
        onRowClick={handleRowClick}
        onRefresh={fetchRequests}
        initialColumnVisibility={{
          companyAddress: false,
          approvedDate: false,
          companyContact: false,
          department: false,
          mentorName: false,
          mentorEmail: false,
          mentorContact: false,
        }}
      />

      <RequestDetailsDialog
        isOpen={isDetailsDialogOpen}
        setIsOpen={setIsDetailsDialogOpen}
        request={selectedDetailsRequest}
        onUpdate={fetchRequests}
      />
    </div>
  );
}