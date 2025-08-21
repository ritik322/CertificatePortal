"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { DataTable } from "./data-table";
import { columns as studentColumnsDefinition } from "./columns";
import RequestModal from "./RequestModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "./ui/input";

export default function CertificateManager() {
  const [requests, setRequests] = useState([]);
  const [selectedRemark, setSelectedRemark] = useState("");
  const [isRemarkDialogOpen, setIsRemarkDialogOpen] = useState(false);
  const { data: session } = useSession();
  const [filter, setFilter] = useState("");


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


  const handleViewRemark = (remark) => {
    setSelectedRemark(remark);
    setIsRemarkDialogOpen(true);
  };

  const columns = studentColumnsDefinition.map((col) => {
    if (col.accessorKey === "remarks") {
      return { ...col, meta: { onView: handleViewRemark } };
    }
    return col;
  });

  return (
    <div className=" rounded-lg  p-6">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900">Your Requests</h2>
        <p className="mt-1 text-sm text-gray-600">
          A list of all your certificate requests.
        </p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div>
          <Input
            placeholder="Search...."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm bg-white"
          />
        </div>
        {session && (
          <RequestModal user={session.user} onSuccess={fetchRequests} />
        )}
      </div>

      <DataTable columns={columns} data={requests} />

      <AlertDialog
        open={isRemarkDialogOpen}
        onOpenChange={setIsRemarkDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={"text-black"}>
              Admin Remarks
            </AlertDialogTitle>
            <AlertDialogDescription>{selectedRemark}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction>Close</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
