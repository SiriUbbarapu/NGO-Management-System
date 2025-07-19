const mongoose = require('mongoose');

const womanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Woman name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: [true, 'Family ID is required']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [18, 'Age must be at least 18'],
    max: [65, 'Age cannot exceed 65']
  },
  skill: {
    type: String,
    required: [true, 'Skill is required'],
    trim: true,
    enum: ['Tailoring', 'Cooking', 'Handicrafts', 'Computer Skills', 'Beauty & Wellness', 
           'Embroidery', 'Knitting', 'Jewelry Making', 'Painting', 'Other']
  },
  trainingStatus: {
    type: String,
    required: [true, 'Training status is required'],
    enum: ['Not Started', 'Started', 'In Progress', 'Completed', 'Discontinued'],
    default: 'Not Started'
  },
  trainingStartDate: {
    type: Date
  },
  trainingEndDate: {
    type: Date
  },
  jobStatus: {
    type: String,
    required: [true, 'Job status is required'],
    enum: ['Unemployed', 'Self Employed', 'Employed', 'Seeking Employment'],
    default: 'Unemployed'
  },
  monthlyIncome: {
    type: Number,
    min: [0, 'Income cannot be negative'],
    default: 0
  },
  center: {
    type: String,
    required: [true, 'Center is required'],
    trim: true
  },
  contactNumber: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit contact number']
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
womanSchema.index({ center: 1 });
womanSchema.index({ familyId: 1 });
womanSchema.index({ skill: 1 });
womanSchema.index({ trainingStatus: 1 });
womanSchema.index({ jobStatus: 1 });

// Virtual for training duration in days
womanSchema.virtual('trainingDuration').get(function() {
  if (this.trainingStartDate && this.trainingEndDate) {
    const diffTime = Math.abs(this.trainingEndDate - this.trainingStartDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Ensure virtuals are included in JSON output
womanSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Woman', womanSchema);
