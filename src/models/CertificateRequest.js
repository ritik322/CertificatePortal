
import mongoose from 'mongoose';

const CertificateRequestSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
}, { timestamps: true });

export default mongoose.models.CertificateRequest || mongoose.model('CertificateRequest', CertificateRequestSchema);