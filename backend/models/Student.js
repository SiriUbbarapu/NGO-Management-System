const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    maxlength: [100, 'Student name cannot exceed 100 characters']
  },
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: [true, 'Family ID is required']
  },
  center: {
    type: String,
    required: [true, 'Center is required'],
    trim: true
  },
  educationLevel: {
    type: String,
    required: [true, 'Education level is required'],
    enum: ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 
           'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [3, 'Age must be at least 3'],
    max: [25, 'Age cannot exceed 25']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Other']
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
studentSchema.index({ center: 1 });
studentSchema.index({ familyId: 1 });
studentSchema.index({ educationLevel: 1 });

// Virtual for attendance percentage
studentSchema.virtual('attendancePercentage', {
  ref: 'Attendance',
  localField: '_id',
  foreignField: 'studentId',
  justOne: false
});

module.exports = mongoose.model('Student', studentSchema);
