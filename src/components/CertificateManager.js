"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { DataTable } from "./ui/data-table";
import { DataTableColumnHeader } from "./ui/data-table/data-table-column-header";
import RequestModal from "./RequestModal";
import RequestDetailsDialog from "./RequestDetailsDialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Clock } from "lucide-react";
import Link from "next/link";
import trainingOptions from "@/constants/TrainingOptions";

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

export default function CertificateManager() {
  const [requests, setRequests] = useState([]);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedDetailsRequest, setSelectedDetailsRequest] = useState(null);
  const { data: session } = useSession();
  const [downloadingId, setDownloadingId] = useState(null);

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

  const handleRowClick = (request) => {
    setSelectedDetailsRequest(request);
    setIsDetailsDialogOpen(true);
  };
  const handleDownloadClick = (requestId) => {
    setDownloadingId(requestId);
    setTimeout(() => setDownloadingId(null), 6000);
  };

  const columns = [
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
      id: "actions",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => {
        const request = row.original;
        const isDownloading = downloadingId === request._id;

        if (request.status === "Approved") {
          return (
            <div className="text-center">
              <Link
                href={`/api/generate-certificate/${request._id}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (isDownloading) {
                    e.preventDefault();
                  } else {
                    handleDownloadClick(request._id);
                  }
                  e.stopPropagation();
                }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-indigo-600 hover:text-white"
                  disabled={isDownloading}
                >
                  {isDownloading ? "Downloading..." : "Download"}
                </Button>
              </Link>
            </div>
          );
        }

        if (request.status === "Pending") {
          return (
            <div className="text-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex justify-center">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Awaiting Approval</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        }

        return <div className="text-center text-sm text-gray-500">-</div>;
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const filterColumns = [
    {
      key: "companyName",
      title: "Company Name",
      type: "string",
    },
    {
      key: "companyAddress",
      title: "Company Address",
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
    {
        key: "trainingType",
        title: "Training Type",
        type: "enum",
        values: trainingOptions,
    },
  ];

  return (
    <div className="rounded-lg p-6">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900">Your Requests</h2>
        <p className="mt-1 text-sm text-gray-600">
          A list of all your certificate requests.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={requests}
        filterColumns={filterColumns}
        enableSelection={false}
        exportFileName="certificate-requests"
        onRowClick={handleRowClick}
        onRefresh={fetchRequests}
        toolbarItems={[
          session && (
            <RequestModal
              key="add-request"
              user={session.user}
              onSuccess={fetchRequests}
            />
          ),
        ]}
        initialColumnVisibility={{
          companyAddress: false,
          companyContact: false,
          mentorName: false,
          mentorEmail: false,
          mentorContact: false,
        }}
      />

      <RequestDetailsDialog
        isOpen={isDetailsDialogOpen}
        setIsOpen={setIsDetailsDialogOpen}
        request={selectedDetailsRequest}
      />
    </div>
  );
}
