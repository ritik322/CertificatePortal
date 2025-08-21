"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowUpDown, Clock } from "lucide-react";
import Link from "next/link";

const getStatusClasses = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
};

export const columns = [
  {
    accessorKey: "companyName",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="w-full justify-center px-0 hover:bg-transparent">
        Company Name <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium text-center">{row.getValue("companyName")}</div>
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status");
        return (
            <div className="text-left">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(status)}`}>
                    {status}
                </span>
            </div>
        )
    }
  },
  {
    accessorKey: "remarks",
    header: "Admin Remarks",
    cell: ({ row, column }) => {
        const remarks = row.getValue("remarks");
        const { onView } = column.columnDef.meta || {};

        if (!remarks) {
            return <div className="text-gray-400">-</div>;
        }

        return <Button variant="link" size="sm" onClick={() => onView(remarks)}>View</Button>;
    }
  },
  {
    accessorKey: "approvedDate",
    header: "Approved Date",
    cell: ({ row }) => {
      const approvedDate = row.getValue("approvedDate");
        if (!approvedDate) {
            return <div className="text-gray-400">-</div>;
        }
        return <div>{new Date(approvedDate).toLocaleDateString()}</div>;
    }
  },
  {
    id: "actions",
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => {
      const request = row.original;
      if (request.status === 'Approved') {
        return (
            <div className="text-center">
                <Link
                    href={`/api/generate-certificate/${request._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Button variant="outline" size="sm" className={" hover:cursor-pointer hover:bg-indigo-600 hover:text-white"}>Download</Button>
                </Link>
            </div>
        );
      }
      if (request.status === 'Pending') {
        return (
            <div className="text-center">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="flex justify-end">
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
  },
]