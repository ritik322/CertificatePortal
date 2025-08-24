"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loader from "./Loader";
import BigButton from "./ui/big-button";
import { PlusIcon } from "@heroicons/react/24/solid";

export default function RequestModal({ user, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState({
    templateId: "",
    companyName: "",
    companyAddress: "",
    companyEmail: "",
    companyContact: "",
    mentorName: "",
    mentorEmail: "",
    mentorContact: "",
  });

  useEffect(() => {
    if (open && user?.department) {
      const fetchTemplates = async () => {
        try {
          // Fetch templates filtered by the student's department
          const res = await fetch(
            `/api/templates?department=${user.department}`,
          );
          const data = await res.json();
          if (res.ok) setTemplates(data);
          else throw new Error("Failed to load templates.");
        } catch (err) {
          setError(err.message);
        }
      };
      fetchTemplates();
    }
  }, [open, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.templateId) {
      setError("Please select a document type.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      onSuccess();
      setFormData({
        templateId: "",
        companyName: "",
        companyAddress: "",
        companyEmail: "",
        companyContact: "",
        mentorName: "",
        mentorEmail: "",
        mentorContact: "",
      });
      setOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <BigButton
          icon={PlusIcon}
          variant="primary"
          //className={"bg-indigo-500 hover:bg-indigo-600 hover:cursor-pointer text-foreground"}
        >
          New Request
        </BigButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl text-black">
        <DialogHeader>
          <DialogTitle>New Request</DialogTitle>
          <DialogDescription>
            Select a document and enter company info carefully.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm p-2 bg-gray-50 rounded-md">
            <div>
              <span className="font-semibold">Name:</span> {user.name}
            </div>
            <div>
              <span className="font-semibold">Roll No:</span> {user.username}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="templateId">Document Type</Label>
            <select
              id="templateId"
              name="templateId"
              value={formData.templateId}
              onChange={handleChange}
              required
              className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500"
            >
              <option value="" disabled>
                Select a document...
              </option>
              {templates.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyContact">Company Contact No.</Label>
              <Input
                id="companyContact"
                name="companyContact"
                type="tel"
                value={formData.companyContact}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyAddress">Company Address</Label>
            <Input
              id="companyAddress"
              name="companyAddress"
              value={formData.companyAddress}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyEmail">Company Email (Optional)</Label>
            <Input
              id="companyEmail"
              name="companyEmail"
              type="email"
              value={formData.companyEmail}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mentorName">Mentor Name (Optional)</Label>
              <Input
                id="mentorName"
                name="mentorName"
                value={formData.mentorName}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mentorContact">Mentor Contact (Optional)</Label>
              <Input
                id="mentorContact"
                name="mentorContact"
                type="tel"
                value={formData.mentorContact}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mentorEmail">Mentor Email (Optional)</Label>
            <Input
              id="mentorEmail"
              name="mentorEmail"
              type="email"
              value={formData.mentorEmail}
              onChange={handleChange}
            />
          </div>
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className={
                "bg-indigo-500 hover:cursor-pointer hover:bg-indigo-600"
              }
            >
              {loading ? <Loader text="Submitting..." /> : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
