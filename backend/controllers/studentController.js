const Student = require('../models/Student');
const Family = require('../models/Family');
const Attendance = require('../models/Attendance');
const TestScore = require('../models/TestScore');

// @desc    Get all students
// @route   GET /api/students
// @access  Private
const getStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, center, educationLevel, search, familyId } = req.query;

    let query = { ...req.centerFilter, isActive: true };

    // Filter by family ID (for family-specific queries)
    if (familyId) {
      query.familyId = familyId;
    }

    // Filter by center (if admin wants to filter)
    if (center && req.user.role === 'admin') {
      query.center = center;
    }

    // Filter by education level
    if (educationLevel) {
      query.educationLevel = educationLevel;
    }

    // Search by name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const students = await Student.find(query)
      .populate('familyId', 'name contact')
      .populate('createdBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Student.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        students,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching students'
    });
  }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('familyId', 'name contact address')
      .populate('createdBy', 'name email');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if tutor can access this student
    if (req.user.role === 'tutor' && student.center !== req.user.center) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access students from your center.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        student
      }
    });
  } catch (error) {
    console.error('Get student by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student'
    });
  }
};

// @desc    Get student progress (attendance % + latest scores)
// @route   GET /api/students/:id/progress
// @access  Private
const getStudentProgress = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if tutor can access this student
    if (req.user.role === 'tutor' && student.center !== req.user.center) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access students from your center.'
      });
    }

    // Calculate attendance percentage for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalAttendance = await Attendance.countDocuments({
      studentId: student._id,
      date: { $gte: thirtyDaysAgo }
    });

    const presentDays = await Attendance.countDocuments({
      studentId: student._id,
      date: { $gte: thirtyDaysAgo },
      status: 'Present'
    });

    const attendancePercentage = totalAttendance > 0 ? Math.round((presentDays / totalAttendance) * 100) : 0;

    // Get latest test scores by subject
    const latestScores = await TestScore.aggregate([
      { $match: { studentId: student._id } },
      { $sort: { date: -1 } },
      {
        $group: {
          _id: '$subject',
          latestScore: { $first: '$score' },
          maxScore: { $first: '$maxScore' },
          date: { $first: '$date' },
          testType: { $first: '$testType' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        student: {
          _id: student._id,
          name: student.name,
          educationLevel: student.educationLevel,
          center: student.center
        },
        progress: {
          attendancePercentage,
          totalAttendanceDays: totalAttendance,
          presentDays,
          latestScores
        }
      }
    });
  } catch (error) {
    console.error('Get student progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student progress'
    });
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private
const createStudent = async (req, res) => {
  try {
    const { name, familyId, center, educationLevel, age, gender } = req.body;

    // Validation
    if (!name || !familyId || !center || !educationLevel || !age || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if family exists
    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({
        success: false,
        message: 'Family not found'
      });
    }

    // Check if tutor is creating student for their center
    if (req.user.role === 'tutor' && center !== req.user.center) {
      return res.status(403).json({
        success: false,
        message: 'You can only create students for your assigned center'
      });
    }

    // Check if family belongs to the same center
    if (family.center !== center) {
      return res.status(400).json({
        success: false,
        message: 'Student center must match family center'
      });
    }

    // Create student
    const student = await Student.create({
      name,
      familyId,
      center,
      educationLevel,
      age,
      gender,
      createdBy: req.user._id
    });

    await student.populate([
      { path: 'familyId', select: 'name contact' },
      { path: 'createdBy', select: 'name email' }
    ]);

    // Update family total members count
    await Family.findByIdAndUpdate(familyId, {
      $inc: { totalMembers: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: {
        student
      }
    });
  } catch (error) {
    console.error('Create student error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating student'
    });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if tutor can update this student
    if (req.user.role === 'tutor' && student.center !== req.user.center) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update students from your center.'
      });
    }

    const { name, educationLevel, age, gender, isActive } = req.body;

    // Update fields
    if (name) student.name = name;
    if (educationLevel) student.educationLevel = educationLevel;
    if (age) student.age = age;
    if (gender) student.gender = gender;
    if (isActive !== undefined) student.isActive = isActive;

    await student.save();
    await student.populate([
      { path: 'familyId', select: 'name contact' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: {
        student
      }
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating student'
    });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if tutor can delete this student
    if (req.user.role === 'tutor' && student.center !== req.user.center) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete students from your center.'
      });
    }

    await Student.findByIdAndDelete(req.params.id);

    // Update family total members count
    await Family.findByIdAndUpdate(student.familyId, {
      $inc: { totalMembers: -1 }
    });

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting student'
    });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  getStudentProgress,
  createStudent,
  updateStudent,
  deleteStudent
};
