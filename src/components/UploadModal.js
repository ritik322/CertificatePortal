"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loader from "./Loader";

export default function UploadModal({ request, onSuccess, ...props }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file.");
      return;
    }
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append('file', file);
    formData.append('requestId', request._id);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed.');
      }
      onSuccess();
      setOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        onClick={(e)=>{
          e.stopPropagation();
          setOpen(true)
        }}
        data-ignore-row-click="true"
      >
        Upload
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent 
            onClick={(e)=>e.stopPropagation()} 
            className="sm:max-w-md text-black"
            onInteractOutside={(e) => e.preventDefault()} 
        >
          <DialogHeader>
            <DialogTitle>Upload Offer Letter</DialogTitle>
            <DialogDescription>
              Upload your confirmation letter for "{request.trainingType}".
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Offer Letter (PDF or Image)</Label>
              <Input 
                id="file" 
                type="file" 
                onChange={(e) => setFile(e.target.files[0])}
                accept="application/pdf,image/*"
              />
            </div>
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader text="Uploading..." /> : "Upload"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}