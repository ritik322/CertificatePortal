"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import TemplateManager from "./TemplateManager";

export default function TemplateManagerModal() {
  const { data: session } = useSession(); // Get session here

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className={"bg-gray-100 cursor-pointer"}>Manage Templates</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg text-black">
        <DialogHeader>
          <DialogTitle>Template Management</DialogTitle>
          <DialogDescription>
            Add new templates or view existing ones for your department.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {session && <TemplateManager session={session} />} {/* Pass session down */}
        </div>
      </DialogContent>
    </Dialog>
  );
}