const mongoose = require('mongoose');

const testScoreSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    enum: ['Mathematics', 'English', 'Science', 'Social Studies', 'Hindi', 'Computer', 'Art', 'Physical Education']
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be negative'],
    max: [100, 'Score cannot exceed 100']
  },
  maxScore: {
    type: Number,
    default: 100,
    min: [1, 'Maximum score must be at least 1']
  },
  testType: {
    type: String,
    required: [true, 'Test type is required'],
    enum: ['Quiz', 'Unit Test', 'Mid Term', 'Final Exam', 'Assignment', 'Project'],
    default: 'Quiz'
  },
  date: {
    type: Date,
    required: [true, 'Test date is required'],
    default: Date.now
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
  remarks: {
    type: String,
    trim: true,
    maxlength: [300, 'Remarks cannot exceed 300 characters']
  }
}, {
  timestamps: true
});

// Index for better query performance
testScoreSchema.index({ studentId: 1, date: -1 });
testScoreSchema.index({ center: 1, date: -1 });
testScoreSchema.index({ subject: 1 });
testScoreSchema.index({ markedBy: 1 });

// Virtual for percentage
testScoreSchema.virtual('percentage').get(function() {
  return Math.round((this.score / this.maxScore) * 100);
});

// Virtual for grade
testScoreSchema.virtual('grade').get(function() {
  const percentage = this.percentage;
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
});

// Ensure virtuals are included in JSON output
testScoreSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('TestScore', testScoreSchema);
