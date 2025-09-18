"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Loader from "@/components/Loader";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      const userRole = session.user.role;
      if (userRole !== "student") {
        router.replace("/admin");
      } else if (userRole === "student") {
        router.replace("/student");
      }
    }
  }, [status, session, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });
      if (res.error) {
        setError("Invalid credentials. Please try again.");
      }
    } catch (error) {
      setError("An error occurred during login.");
    }
    setLoading(false);
  };

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader text="Authenticating..." />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md flex flex-col justify-evenly h-full">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Login</h1>
        <p className="text-gray-500">Please enter your details to sign in.</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <p className="bg-red-100 text-red-700 text-sm p-3 rounded-lg mb-4">
            {error}
          </p>
        )}

        <div className="mb-4">
          <label className="block text-gray-600 mb-2 font-medium">
            University Roll No / Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 text-black rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-600 mb-2 font-medium">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 text-black rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div className="mb-6">
          <Link
            href="/forgot-password"
            className="text-indigo-600 hover:underline font-medium text-sm"
          >
            Forgot Password?
          </Link>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:cursor-pointer hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
        >
          {loading ? <Loader text="Signing In..." /> : "Sign In"}
        </button>
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-indigo-600 hover:underline font-medium"
          >
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
}
