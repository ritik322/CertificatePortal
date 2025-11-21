import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import CertificateRequest from "@/models/CertificateRequest";
import { Readable } from 'stream';

async function streamToBuffer(readableStream) {
  const chunks = [];
  for await (const chunk of readableStream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), 
  },
  scopes: ['https://www.googleapis.com/auth/drive.file','https://www.googleapis.com/auth/drive'],
  
});

const drive = google.drive({ version: 'v3', auth });

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'student') {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const requestId = formData.get('requestId');

    if (!file || !requestId) {
      return NextResponse.json({ message: "Missing file or request ID" }, { status: 400 });
    }

    await dbConnect();

    const requestDoc = await CertificateRequest.findById(requestId);
    if (!requestDoc || requestDoc.studentId.toString() !== session.user.id) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }


    const fileBuffer = await streamToBuffer(file.stream());
    const fileResponse = await drive.files.create({
      requestBody: {
        name: `${requestDoc.companyName}-${file.name}`,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      },
      media: {
        mimeType: file.type,
        body: Readable.from(fileBuffer),
      },
      fields: 'id,webViewLink',
      supportsAllDrives: true 
    });

    const fileId = fileResponse.data.id;
    const webViewLink = fileResponse.data.webViewLink;

    console.log(fileId)

    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
      supportsAllDrives: true,
      supportsTeamDrives: true,
    });

    requestDoc.offerLetterUrl = webViewLink;
    await requestDoc.save();

    return NextResponse.json({ message: "File uploaded successfully", url: webViewLink });

  } catch (error) {
    console.error("Google Drive Upload Error:", error);
    return NextResponse.json({ message: "File upload failed" }, { status: 500 });
  }
}