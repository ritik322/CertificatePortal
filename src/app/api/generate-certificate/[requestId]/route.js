import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import CertificateRequest from "@/models/CertificateRequest";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) { 
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { requestId } = params; 

  try {
    const certRequest = await CertificateRequest.findById(requestId)
      .populate("studentId"); 

    if (!certRequest) {
      return NextResponse.json({ message: "Certificate request not found" }, { status: 404 });
    }

    if (session.user.role === "student" && certRequest.studentId._id.toString() !== session.user.id) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    if (certRequest.status !== "Approved") {
      return NextResponse.json({ message: "This request has not been approved" }, { status: 403 });
    }

    const student = certRequest.studentId; 

    const payload = {
      fields: {
        refno: certRequest.refNo || "",
        name: student.name,
        email: student.email || "",
        contact: student.contact || "",
        universityrollno: student.universityRollNo || "",
        collegerollno: student.collegeRollNo || "",
        branch: student.department.toUpperCase() || "",
        mentorname: certRequest.mentorName || "",
        companyname: certRequest.companyName || "",
        companyaddress: certRequest.companyAddress || "",
        companyemail: certRequest.companyEmail || "",
        trainingtype: certRequest.trainingType || "",
        companycontact: certRequest.companyContact || "",
        approveddate: certRequest.approvedDate
          ? new Date(certRequest.approvedDate).toLocaleDateString('en-GB')
          : "",
      },
    };

    const response = await fetch(process.env.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }

    const pdfBuffer = Buffer.from(result.pdfBase64, "base64");

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${student.universityRollNo}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to generate certificate", error: error.message },
      { status: 500 },
    );
  }
}