"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import AdminRequestManager from "@/components/AdminRequestManager";
import TemplateManagerModal from "@/components/TemplateManagerModal"; // Import the new modal
import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.replace("/");
    },
  });

  useEffect(() => {
    if (status === 'authenticated' && session && session.user.role !== 'admin') {
      router.replace('/');
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader text="Loading Dashboard..." />
        </div>
    );
  }

  if (session && session.user.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-bold text-gray-800">Welcome, {session.user.name}</h1>
              <div className="flex items-center space-x-4">
                <TemplateManagerModal /> {/* Add the modal button here */}
                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="px-4 py-2 text-sm font-medium rounded-md shadow-sm bg-indigo-500 text-white hover:cursor-pointer hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>
 
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Manage Certificate Requests</h2>
            <AdminRequestManager />
        </main>
      </div>
    );
  }

  return null; 
}