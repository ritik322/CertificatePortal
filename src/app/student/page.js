
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import CertificateManager from "@/components/CertificateManager"; // Import the component

export default function StudentDashboard() {
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

  if (session.user.role !== 'student') {
    return (
        <div className="text-center mt-10">
            <p>Access Denied. You are not a student.</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-md">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Student Dashboard</h1>
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
        <CertificateManager /> {/* Add the component here */}
      </main>
    </div>
  );
}