"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { DataTable } from "./ui/data-table";
import { DataTableColumnHeader } from "./ui/data-table/data-table-column-header";
import RequestDetailsDialog from "./RequestDetailsDialog";
import { Button } from "@/components/ui/button";

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
  const [templates,setTemplates] = useState([])
 
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
  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/templates");
      if (!res.ok) throw new Error("Failed to fetch templates.");
      const data = await res.json();
      setTemplates(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchTemplates()
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

  // Define columns for the new data table
  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.templateId?.name || "N/A",
        id: "documentType",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Document Type" />
        ),
        cell: ({ row }) => <div>{row.getValue("documentType")}</div>,
      },
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
        accessorFn: (row) => row.studentId?.department || "N/A",
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
        accessorKey: "companyAddress",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Company Address" />
        ),
        cell: ({ row }) => (
          <div className="max-w-xs truncate">
            {row.getValue("companyAddress")}
          </div>
        ),
      },
      {
        accessorKey: "companyContact",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Contact" />
        ),
        cell: ({ row }) => <div>{row.getValue("companyContact")}</div>,
      },
      {
        accessorKey: "mentorName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Mentor Name" />
        ),
        cell: ({ row }) => {
          const mentorName = row.getValue("mentorName");
          return <div>{mentorName || "-"}</div>;
        },
      },
      {
        accessorKey: "mentorEmail",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Mentor Email" />
        ),
        cell: ({ row }) => {
          const mentorEmail = row.getValue("mentorEmail");
          return <div>{mentorEmail || "-"}</div>;
        },
      },
      {
        accessorKey: "mentorContact",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Mentor Contact" />
        ),
        cell: ({ row }) => {
          const mentorContact = row.getValue("mentorContact");
          return <div>{mentorContact || "-"}</div>;
        },
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
          return <div>{new Date(createdAt).toLocaleDateString()}</div>;
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
          return <div>{new Date(approvedDate).toLocaleDateString()}</div>;
        },
      },
      {
        id: "actions",
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => {
          const request = row.original;

          if (request.status === "Approved") {
            return (
              <div className="text-center space-x-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="hover:bg-indigo-600 hover:text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <a
                    href={`/api/generate-certificate/${request._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download
                  </a>
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
    [handleUpdateStatus],
  );

  // Define filter columns for the new data table
  const filterColumns = [
    {
      key: "documentType",
      title: "Document Type",
      type: "enum",
      values: templates.map(t => t.name),
    },
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
      key: "department",
      title: "Department",
      type: "string",
    },
    {
      key: "companyName",
      title: "Company Name",
      type: "string",
    },
    {
      key: "mentorName",
      title: "Mentor Name",
      type: "string",
    },
    {
      key: "mentorEmail",
      title: "Mentor Email",
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
