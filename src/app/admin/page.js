// src/app/admin/page.jsx

"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import RequestManager from "@/components/RequestManager"; // Updated import name

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.replace("/");
    },
  });

  if (status === "loading") {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (session.user.role !== 'admin') {
    
      router.replace('/')
    
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-md">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Dashboard ({session.user.department})</h1>
          <div>
            <span className="mr-4">Welcome, {session.user.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Sign Out
            </button>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-8">
        <h2 className="text-3xl font-semibold mb-6">Certificate Requests</h2>
        <RequestManager /> {/* Updated component name */}
      </main>
    </div>
  );
}