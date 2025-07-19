const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  status: {
    type: String,
    required: [true, 'Attendance status is required'],
    enum: ['Present', 'Absent'],
    default: 'Present'
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Marked by user is required']
  },
  center: {
    type: String,
    required: [true, 'Center is required'],
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate attendance for same student on same date
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

// Index for better query performance
attendanceSchema.index({ center: 1, date: 1 });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ markedBy: 1 });

// Pre-save middleware to set date to start of day (remove time component)
attendanceSchema.pre('save', function(next) {
  if (this.date) {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
