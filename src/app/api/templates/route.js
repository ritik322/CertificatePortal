// src/app/api/templates/route.js

import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Template from "@/models/Template";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// GET: Fetch templates, filtering by department if provided
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const department = searchParams.get('department');

  await dbConnect();
  try {
    let query = {};
    // If a department is specified, find templates for that department OR for "All"
    if (department) {
      query = { departments: { $in: [department, "All"] } };
    }
    // If the user is an admin but no department is specified, only show their department's templates
    else if (session.user.role === 'admin') {
      query = { departments: { $in: [session.user.department, "All"] } };
    }


    const templates = await Template.find(query).sort({ name: 1 });
    return NextResponse.json(templates, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
// POST: Create a new template, automatically assigned to the admin's department
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  try {
    const { name, templateId } = await request.json();
    if (!name || !templateId) {
      return NextResponse.json({ message: "Name and Template ID are required" }, { status: 400 });
    }

    const newTemplate = new Template({ 
        name, 
        templateId, 
        departments: [session.user.department] 
    });
    await newTemplate.save();
    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    console.error("Error creating Template",error)
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  
    await dbConnect();
    try {
      const { id, name, templateId } = await request.json(); // Departments field is no longer needed from client
      if (!id || !name || !templateId) {
        return NextResponse.json({ message: "All fields are required" }, { status: 400 });
      }

      // Security Check: Find the template first to ensure it belongs to the admin's department
      const templateToUpdate = await Template.findById(id);
      if (!templateToUpdate) {
        return NextResponse.json({ message: "Template not found" }, { status: 404 });
      }
      if (!templateToUpdate.departments.includes(session.user.department)) {
        return NextResponse.json({ message: "Forbidden: You can only edit templates for your own department." }, { status: 403 });
      }
  
      // Proceed with the update
      templateToUpdate.name = name;
      templateToUpdate.templateId = templateId;
      // The department is not changed
      await templateToUpdate.save();
  
      return NextResponse.json(templateToUpdate, { status: 200 });
    } catch (error) {
      return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}