"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loader from "./Loader";
import BigButton from "./ui/big-button";
import { PlusIcon } from "@heroicons/react/24/solid";
import trainingOptions from "@/constants/TrainingOptions";


export default function RequestModal({ user, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    trainingType: "", 
    companyName: "",
    companyAddress: "",
    companyEmail: "",
    companyContact: "",
    mentorName: "",
    mentorEmail: "",
    mentorContact: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, trainingType: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.trainingType) {
        setError("Please select a training type.");
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
        trainingType: "",
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
            <Label htmlFor="trainingType">Training Type</Label>
            <Select onValueChange={handleSelectChange} value={formData.trainingType}>
                <SelectTrigger id="trainingType">
                    <SelectValue placeholder="Select a training type..." />
                </SelectTrigger>
                <SelectContent>
                    {trainingOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
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
            <Label htmlFor="companyEmail">Company Email</Label>
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
              <Label htmlFor="mentorName">Mentor Name</Label>
              <Input
                id="mentorName"
                name="mentorName"
                value={formData.mentorName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mentorContact">Mentor Contact</Label>
              <Input
                required
                id="mentorContact"
                name="mentorContact"
                type="tel"
                value={formData.mentorContact}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mentorEmail">Mentor Email </Label>
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