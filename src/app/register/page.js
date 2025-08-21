"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Loader from "@/components/Loader";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    universityRollNo: "",
    collegeRollNo: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const departments = ["CSE","IT", "ECE", "Mechanical", "Civil", "Electrical"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.department) {
      setError("Please select a department.");
      return;
    }
    setError("");
    setSuccess("");

    setLoading(true)

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong.");
        return;
      }

      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      setError("An error occurred during registration.");
    }
  };

  return (
    <main className="flex h-screen w-full">
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 bg-white">
        <div className="w-full max-w-md flex flex-col justify-evenly h-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Student Registration
          </h1>

          <form onSubmit={handleSubmit}>
            {error && (
              <p className="bg-red-100 text-red-700 text-sm p-3 rounded-lg mb-4">
                {error}
              </p>
            )}
            {success && (
              <p className="bg-green-100 text-green-700 text-sm p-3 rounded-lg mb-4">
                {success}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5 text-black">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  name="name"
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">University Roll No</label>
                <input
                  name="universityRollNo"
                  onChange={handleChange}
                  placeholder="xxxx"
                  required
                  className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="doe@gmail.com"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="1234"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="" disabled>
                    Select Department
                  </option>
                  {departments.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">College Roll No</label>
                <input
                  name="collegeRollNo"
                  onChange={handleChange}
                  placeholder="xxxx"
                  required
                  className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
            >
              {loading ? <Loader text="Registering..." /> : "Register"}
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <Link
                href="/"
                className="text-indigo-600 hover:underline font-medium"
              >
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className="hidden md:block w-1/2 bg-indigo-600">
        <Image
          src={"/illustration.svg"}
          width={500}
          height={500}
          alt="illustration"
          className="w-full h-full "
        />
      </div>
    </main>
  );
}
