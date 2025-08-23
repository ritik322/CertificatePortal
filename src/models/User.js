
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String, required: true },
  universityRollNo: { type: String, required: true, unique: true },
  collegeRollNo: { type: String, required: true, unique: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  forgotPasswordToken: String,
  forgotPasswordTokenExpiry: Date,
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);