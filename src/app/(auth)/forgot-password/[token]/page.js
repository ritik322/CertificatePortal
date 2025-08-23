"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import Image from "next/image";
import { Input } from "@/components/ui/input";

export default function ResetPasswordTokenPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`/api/reset-password/${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password.");
      }
      setSuccess("Password has been reset successfully! Redirecting to login...");
      setTimeout(() => router.push("/"), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    
        <div className="w-full max-w-md">
          <div className="my-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Reset Your Password
            </h1>
            <p className="text-gray-500">
              Please enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <p className="bg-red-100 text-red-700 text-sm p-3 rounded-lg mb-4">{error}</p>}
            {success && <p className="bg-green-100 text-green-700 text-sm p-3 rounded-lg mb-4">{success}</p>}
            
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-700">New Password</label>
              <Input
                type="password"
                value={password}
                className={'text-black'}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block mb-1 font-medium text-gray-700">Confirm New Password</label>
              <Input
                type="password"
                value={confirmPassword}
                className={'text-black'}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading || success} className="w-full bg-indigo-600 text-white font-bold py-2 px-3 rounded-lg transition duration-300 disabled:bg-indigo-300">
              {loading ? <Loader text="Resetting..." /> : "Reset Password"}
            </button>
          </form>
        </div>
      
  );
}