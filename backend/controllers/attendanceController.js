const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private
const getAttendance = async (req, res) => {
  try {
    const { page = 1, limit = 10, date, studentId, center, status } = req.query;
    
    let query = {};
    
    // Filter by center based on user role
    if (req.user.role === 'tutor') {
      query.center = req.user.center;
    } else if (center) {
      query.center = center;
    }
    
    // Filter by date
    if (date) {
      const searchDate = new Date(date);
      query.date = {
        $gte: new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate()),
        $lt: new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate() + 1)
      };
    }
    
    // Filter by student
    if (studentId) {
      query.studentId = studentId;
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }

    const attendance = await Attendance.find(query)
      .populate('studentId', 'name educationLevel')
      .populate('markedBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1, createdAt: -1 });

    const total = await Attendance.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        attendance,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching attendance'
    });
  }
};

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private (Tutor can mark for their center)
const markAttendance = async (req, res) => {
  try {
    const { studentId, date, status, notes } = req.body;

    // Validation
    if (!studentId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and status are required'
      });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if tutor can mark attendance for this student
    if (req.user.role === 'tutor' && student.center !== req.user.center) {
      return res.status(403).json({
        success: false,
        message: 'You can only mark attendance for students in your center'
      });
    }

    // Set date to today if not provided
    const attendanceDate = date ? new Date(date) : new Date();
    
    // Check if attendance already exists for this student on this date
    const existingAttendance = await Attendance.findOne({
      studentId,
      date: {
        $gte: new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate()),
        $lt: new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate() + 1)
      }
    });

    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.status = status;
      existingAttendance.notes = notes;
      existingAttendance.markedBy = req.user._id;
      await existingAttendance.save();

      await existingAttendance.populate([
        { path: 'studentId', select: 'name educationLevel' },
        { path: 'markedBy', select: 'name email' }
      ]);

      return res.status(200).json({
        success: true,
        message: 'Attendance updated successfully',
        data: {
          attendance: existingAttendance
        }
      });
    }

    // Create new attendance record
    const attendance = await Attendance.create({
      studentId,
      date: attendanceDate,
      status,
      notes,
      markedBy: req.user._id,
      center: student.center
    });

    await attendance.populate([
      { path: 'studentId', select: 'name educationLevel' },
      { path: 'markedBy', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: {
        attendance
      }
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while marking attendance'
    });
  }
};

// @desc    Mark bulk attendance
// @route   POST /api/attendance/bulk
// @access  Private (Tutor can mark for their center)
const markBulkAttendance = async (req, res) => {
  try {
    const { attendanceRecords, date } = req.body;

    // Validation
    if (!attendanceRecords || !Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Attendance records array is required'
      });
    }

    const attendanceDate = date ? new Date(date) : new Date();
    const results = [];
    const errors = [];

    for (const record of attendanceRecords) {
      try {
        const { studentId, status, notes } = record;

        if (!studentId || !status) {
          errors.push({ studentId, error: 'Student ID and status are required' });
          continue;
        }

        // Check if student exists
        const student = await Student.findById(studentId);
        if (!student) {
          errors.push({ studentId, error: 'Student not found' });
          continue;
        }

        // Check if tutor can mark attendance for this student
        if (req.user.role === 'tutor' && student.center !== req.user.center) {
          errors.push({ studentId, error: 'Access denied for this student' });
          continue;
        }

        // Check if attendance already exists
        const existingAttendance = await Attendance.findOne({
          studentId,
          date: {
            $gte: new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate()),
            $lt: new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate() + 1)
          }
        });

        if (existingAttendance) {
          // Update existing
          existingAttendance.status = status;
          existingAttendance.notes = notes;
          existingAttendance.markedBy = req.user._id;
          await existingAttendance.save();
          results.push({ studentId, action: 'updated', attendanceId: existingAttendance._id });
        } else {
          // Create new
          const attendance = await Attendance.create({
            studentId,
            date: attendanceDate,
            status,
            notes,
            markedBy: req.user._id,
            center: student.center
          });
          results.push({ studentId, action: 'created', attendanceId: attendance._id });
        }
      } catch (error) {
        errors.push({ studentId: record.studentId, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Bulk attendance processing completed',
      data: {
        results,
        errors,
        summary: {
          total: attendanceRecords.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });
  } catch (error) {
    console.error('Mark bulk attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking bulk attendance'
    });
  }
};

// @desc    Get attendance summary
// @route   GET /api/attendance/summary
// @access  Private
const getAttendanceSummary = async (req, res) => {
  try {
    const { startDate, endDate, center } = req.query;
    
    let query = {};
    
    // Filter by center based on user role
    if (req.user.role === 'tutor') {
      query.center = req.user.center;
    } else if (center) {
      query.center = center;
    }
    
    // Date range filter
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.date = { $gte: thirtyDaysAgo };
    }

    const summary = await Attendance.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRecords = summary.reduce((total, item) => total + item.count, 0);
    const presentCount = summary.find(item => item._id === 'Present')?.count || 0;
    const absentCount = summary.find(item => item._id === 'Absent')?.count || 0;
    const attendancePercentage = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRecords,
          presentCount,
          absentCount,
          attendancePercentage
        },
        breakdown: summary
      }
    });
  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching attendance summary'
    });
  }
};

module.exports = {
  getAttendance,
  markAttendance,
  markBulkAttendance,
  getAttendanceSummary
};
