import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import CertificateRequest from "@/models/CertificateRequest";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'student') {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { requestId } = params;

  try {
    const certRequest = await CertificateRequest.findById(requestId).populate('templateId');
    if (!certRequest || certRequest.studentId.toString() !== session.user.id) {
      return NextResponse.json({ message: "Certificate request not found or access denied" }, { status: 404 });
    }

    if (certRequest.status !== 'Approved') {
      return NextResponse.json({ message: "This request has not been approved" }, { status: 403 });
    }

    const student = await User.findById(session.user.id);
    const templateId = certRequest.templateId.templateId;

    const payload = {
      templateId: templateId,
      fields: {
        name: student.name,
        universityrollno: student.universityRollNo,
        collegerollno: student.collegeRollNo,
        department: student.department,
        companyname: certRequest.companyName,
        companyaddress: certRequest.companyAddress,
        companyemail: certRequest.companyEmail || '',
        companycontact: certRequest.companyContact,
        approveddate: certRequest.approvedDate ? new Date(certRequest.approvedDate).toLocaleDateString() : '',
      }
    };

    const response = await fetch(process.env.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (result.error) { throw new Error(result.error); }
    
    const pdfBuffer = Buffer.from(result.pdfBase64, 'base64');
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${student.name}-certificate.pdf"`,
      },
    });

  } catch (error) {
    return NextResponse.json({ message: "Failed to generate certificate", error: error.message }, { status: 500 });
  }
}