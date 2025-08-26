"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Loader from "./Loader";

export default function AdminActionModal({ isOpen, setIsOpen, request, onUpdate }) {
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (request) {
      setRemarks(request.remarks || "");
    }
  }, [request]);

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      await onUpdate(request._id, request.status, remarks);
      setIsOpen(false);
    } catch (err) {
      setError("Failed to save remarks.");
    } finally {
      setLoading(false);
    }
  };

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={"text-black"}>Add/Edit Remarks</DialogTitle>
          <DialogDescription>
            Add remarks for the request from {request.studentId.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
            <div className="grid w-full gap-1.5">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea 
                    placeholder="Type your remarks here..." 
                    id="remarks" 
                    className="text-black"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                /> 
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
        <DialogFooter>
            <Button onClick={handleSave} disabled={loading} className={"bg-indigo-600 hover:cursor-pointer"}>
                {loading ? <Loader /> : 'Save Remarks'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
