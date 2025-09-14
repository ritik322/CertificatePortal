import mongoose from 'mongoose';

const CertificateRequestSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trainingType: { type: String, required: true },
  companyName: { type: String, required: true },
  companyAddress: { type: String, required: true },
  companyEmail: { type: String, required: false },
  companyContact: { type: String, required: false },
  mentorName: { type: String, required: true },
  mentorEmail: { type: String, required: false },
  mentorContact: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  approvedDate: { type: Date }, 
  remarks: { type: String },
  refNo: { type: String }
}, { timestamps: true });

export default mongoose.models.CertificateRequest || mongoose.model('CertificateRequest', CertificateRequestSchema);
