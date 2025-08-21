"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const getStatusClasses = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
};

export const columns = [
  {
    accessorFn: row => row.studentId.name,
    id: 'studentName',
    header: "Student Name",
  },
  {
    accessorFn: row => row.studentId.universityRollNo,
    id: 'rollNo',
    header: "Roll No",
  },
  {
    accessorKey: "companyName",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="w-full justify-start px-0 hover:bg-transparent">
        Company Name <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "approvedDate",
    header: "Approved Date",
    cell: ({row}) => {
      const approvedDate = row.getValue("approvedDate")
      if(!approvedDate) return  <div className="text-gray-400">-</div>;
      return (
        <div>{new Date(approvedDate).toLocaleDateString()}</div>
      )
    }

  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status");
        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(status)}`}>
                {status}
            </span>
        )
    }
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    cell: ({ row, column }) => {
        const remarks = row.getValue("remarks");
        const { onRemark } = column.columnDef.meta;

        if (!remarks) {
            return <Button variant="link" className={"hover:cursor-pointer"} size="sm" onClick={() => onRemark(row.original)}>Add</Button>;
        }

        return <Button variant="link" size="sm" className={"hover:cursor-pointer"} onClick={() => onRemark(row.original)}>View</Button>;
    }
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row, table }) => {
      const request = row.original;
      const { updateStatus } = table.options.meta;

      if (request.status !== 'Pending') {
        return <div className="text-center text-sm text-gray-500">Resolved</div>;
      }

      return (
        <div className="text-center space-x-2">
            <Button onClick={() => updateStatus(request._id, 'Approved')} variant="outline" size="sm" className="text-green-600 hover:cursor-pointer border-green-300 hover:bg-green-100 hover:text-green-700">Approve</Button>
            <Button onClick={() => updateStatus(request._id, 'Rejected')} variant="outline" size="sm" className="text-red-600 hover:cursor-pointer border-red-300 hover:bg-red-100 hover:text-red-700">Reject</Button>
        </div>
      )
    },
  },
]