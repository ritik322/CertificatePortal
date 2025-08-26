"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";

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

export default function RequestDetailsDialog({
  isOpen,
  setIsOpen,
  request,
  onUpdate,
}) {
  const { data: session } = useSession();
  const [remarks, setRemarks] = useState("");
  const [currentRemarks, setCurrentRemarks] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (request) {
      setRemarks(request.remarks || "");
      setCurrentRemarks(request.remarks || "");
      setIsEditing(false);
    }
  }, [request]);

  if (!request) return null;

  const isAdmin = session?.user?.role === "admin";
  const isPending = request.status === "Pending";

  const handleSaveRemarks = async () => {
    if (!isAdmin || !isPending) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: request._id,
          status: request.status,
          remarks,
        }),
      });

      if (!res.ok) throw new Error("Failed to update remarks");

      setCurrentRemarks(remarks);
      setIsEditing(false);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error updating remarks:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setRemarks(currentRemarks);
    setIsEditing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto text-black">
        <DialogHeader>
          <DialogTitle>Request Details</DialogTitle>
          <DialogDescription>
            Complete information about this certificate request.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Student Information */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-base mb-2 text-gray-800">
                Student Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Name:</span>{" "}
                  {request.studentId?.name || "N/A"}
                </div>
                <div>
                  <span className="font-medium text-gray-600">Roll No:</span>{" "}
                  {request.studentId?.universityRollNo || "N/A"}
                </div>
                <div>
                  <span className="font-medium text-gray-600">Department:</span>{" "}
                  {request.studentId?.department || "N/A"}
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-base mb-2 text-gray-800">
                Company Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Company Name:</span>{" "}
                  {request.companyName}
                </div>
                <div>
                  <span className="font-medium text-gray-600">Contact:</span>{" "}
                  {request.companyContact}
                </div>
                <div>
                  <span className="font-medium text-gray-600">Address:</span>{" "}
                  {request.companyAddress}
                </div>
                {request.companyEmail && (
                  <div>
                    <span className="font-medium text-gray-600">Email:</span>{" "}
                    {request.companyEmail}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Request Information */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-base mb-2 text-gray-800">
                Request Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Status:</span>
                  <span
                    className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(request.status)}`}
                  >
                    {request.status}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Request Date:</span>{" "}
                  {new Date(request.createdAt).toLocaleDateString()}
                </div>
                {request.approvedDate && (
                  <div>
                    <span className="font-medium text-gray-600">Approved Date:</span>{" "}
                    {new Date(request.approvedDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {/* Remarks Section */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-base text-gray-800">
                  Admin Remarks
                </h3>
                {isAdmin && isPending && (
                  <div className="space-x-2">
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          onClick={handleSaveRemarks}
                          disabled={isSubmitting}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isSubmitting ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                      >
                        {currentRemarks ? "Edit" : "Add"}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {isEditing ? (
                <Textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter remarks..."
                  className="min-h-[80px]"
                />
              ) : (
                <div className="text-sm">
                  {currentRemarks ? (
                    <p className="text-gray-700 bg-white p-2 rounded border">
                      {currentRemarks}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic">
                      No remarks added yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}