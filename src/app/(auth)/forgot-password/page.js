"use client";

import { useState } from "react";

import Image from "next/image";
import Loader from "@/components/Loader";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).then((res) => res.json());

      if (!res.ok) {
        setError(res.message);
      } else {
        setMessage(res.message);
        setEmail("")
      }
      
    } catch (error) {
      setError("An error occurred while sending.");
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md flex flex-col">
      <div className="my-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Forgot Password?
        </h1>
        <p className="text-gray-500">
          No worries, we'll send you reset instructions
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <p className="bg-red-100 text-red-700 text-sm p-3 rounded-lg mb-4">
            {error}
          </p>
        )}
        {message && (
          <p className="bg-green-100 text-green-700 text-sm p-3 rounded-lg mb-4">
            {message}
          </p>
        )}
        <div>
          <Input
            placeholder="Enter your email"
            value={email}
            type={"email"}
            onChange={(e) => setEmail(e.target.value)}
            className={"text-black"}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full my-6 bg-indigo-600 hover:cursor-pointer hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-lg transition duration-300"
        >
          {loading ? <Loader text="Sending Mail..." /> : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
