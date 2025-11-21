import mongoose from 'mongoose';

const CertificateRequestSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trainingType: { type: String, required: true },
  companyName: { type: String, required: true },
  companyAddress: { type: String, required: true },
  offerLetterUrl: { type: String },
  companyEmail: { type: String, required: true },
  companyContact: { type: String, required: true },
  mentorName: { type: String, required: true },
  mentorEmail: { type: String, required: true },
  mentorContact: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  approvedDate: { type: Date }, 
  remarks: { type: String },
  refNo: { type: String }
}, { timestamps: true });

export default mongoose.models.CertificateRequest || mongoose.model('CertificateRequest', CertificateRequestSchema);
