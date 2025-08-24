import mongoose from 'mongoose';

const CertificateRequestSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
  companyName: { type: String, required: true },
  companyAddress: { type: String, required: true },
  companyEmail: { type: String, required: false },
  companyContact: { type: String, required: false },
  mentorName: { type: String, required: false },
  mentorEmail: { type: String, required: false },
  mentorContact: { type: String, required: false },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  approvedDate: { type: Date }, 
  remarks: { type: String },
}, { timestamps: true });

export default mongoose.models.CertificateRequest || mongoose.model('CertificateRequest', CertificateRequestSchema);
