import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  templateId: { type: String, required: true },
  departments: { type: [String], required: true},
}, { timestamps: true });

export default mongoose.models.Template || mongoose.model('Template', TemplateSchema);