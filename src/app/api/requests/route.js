
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import CertificateRequest from "@/models/CertificateRequest";
import User from "@/models/User";
import { NextResponse } from "next/server";


export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const userRole = session.user.role;
  const userId = session.user.id;

  try {
    if (userRole === 'student') {
      const requests = await CertificateRequest.find({ studentId: userId })
        .populate({
          path: 'studentId',
          select: 'name universityRollNo department'
        })
        .sort({ createdAt: -1 });
      
      return NextResponse.json(requests, { status: 200 });
    } 
    
    else if (userRole === 'admin') {
      const adminDepartment = session.user.department;
      const requests = await CertificateRequest.find({})
        .populate({
          path: 'studentId',
          model: User,
          match: { department: adminDepartment },
          select: 'name universityRollNo department'
        })
        .sort({ createdAt: -1 });
      
      const filteredRequests = requests.filter(req => req.studentId !== null);
      return NextResponse.json(filteredRequests, { status: 200 });
    }

  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}


export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'student') {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  
  try {
    const {  companyName, companyAddress, companyEmail, companyContact, mentorName, mentorEmail, mentorContact } = await request.json();
    if ( !companyName || !companyAddress ||  !companyContact) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const newRequest = new CertificateRequest({
      studentId: session.user.id,
      companyName,
      companyAddress,
      companyEmail,
      companyContact,
      mentorName,
      mentorEmail,
      mentorContact,
    });

    await newRequest.save();
    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  await dbConnect();

  try {
    const { requestId, status, remarks } = await request.json(); // Destructure remarks
    if (!requestId || !status) {
      return NextResponse.json({ message: "Request ID and status are required" }, { status: 400 });
    }

    const updateData = { status, remarks }; 
    if (status === 'Approved') {
      updateData.approvedDate = new Date();
    }

    const updatedRequest = await CertificateRequest.findByIdAndUpdate(
      requestId,
      updateData,
      { new: true }
    );

    if (!updatedRequest) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }

    return NextResponse.json(updatedRequest, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}