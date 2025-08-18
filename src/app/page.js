
"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      const userRole = session.user.role;
      if (userRole === 'admin') {
        router.replace('/admin');
      } else if (userRole === 'student') {
        router.replace('/student');
      }
    }
  }, [status, session, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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
  };

  if (status === 'loading' || status === 'authenticated') {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="p-8 bg-gray-800 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">
          Portal Login
        </h2>

        {error && <p className="bg-red-500 text-white text-sm p-3 rounded mb-4">{error}</p>}

        <div className="mb-4">
          <label className="block text-gray-400 mb-2">University Roll No / Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-indigo-500"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-400 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-indigo-500"
            required
          />
        </div>
        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-300">
          Sign In
        </button>
        <p className="text-center text-sm text-gray-400 mt-4">
          No account?{" "}
          <Link href="/register" className="text-indigo-400 hover:underline">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
}