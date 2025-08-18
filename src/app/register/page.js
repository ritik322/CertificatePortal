// src/app/register/page.jsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  
  const departments = ["CSE", "ECE", "Mechanical", "Civil", "Electrical"];

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
    <div className="flex items-center justify-center min-h-screen p-4">
      <form
        onSubmit={handleSubmit}
        className="p-8 bg-gray-800 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-white">
          Student Registration
        </h2>

        {error && <p className="bg-red-500 text-white text-sm p-3 rounded mb-4">{error}</p>}
        {success && <p className="bg-green-500 text-white text-sm p-3 rounded mb-4">{success}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="name" placeholder="Full Name" onChange={handleChange} required className="px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-indigo-500" />
          <input name="universityRollNo" placeholder="University Roll No" onChange={handleChange} required className="px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-indigo-500" />
          <input name="email" type="email" placeholder="Email Address" onChange={handleChange} required className="md:col-span-2 px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-indigo-500" />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} required className="md:col-span-2 px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-indigo-500" />
          <select name="department" value={formData.department} onChange={handleChange} required className="px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-indigo-500">
            <option value="" disabled>Select Department</option>
            {departments.map(dep => <option key={dep} value={dep.toLocaleLowerCase()}>{dep}</option>)}
          </select>
          <input name="collegeRollNo" placeholder="College Roll No" onChange={handleChange} required className="px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-indigo-500" />
        </div>

        <button type="submit" className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-300">
          Register
        </button>

        <p className="text-center text-sm text-gray-400 mt-4">
          Already have an account?{" "}
          <Link href="/" className="text-indigo-400 hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}