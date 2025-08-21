"use client";

import { Loader2 } from "lucide-react";

export default function Loader({ text = "Loading..." }) {
  return (
    <div className="flex items-center justify-center">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      <span>{text}</span>
    </div>
  );
}
``