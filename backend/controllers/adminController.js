const Family = require('../models/Family');
const Student = require('../models/Student');
const Woman = require('../models/Woman');
const Attendance = require('../models/Attendance');
const TestScore = require('../models/TestScore');
const User = require('../models/User');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getAdminStats = async (req, res) => {
  try {
    const { center, startDate, endDate } = req.query;
    
    let query = {};
    if (center) {
      query.center = center;
    }

    // Date range for time-based queries
    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    // Basic counts
    const totalFamilies = await Family.countDocuments({ ...query, isActive: true });
    const totalStudents = await Student.countDocuments({ ...query, isActive: true });
    const totalWomen = await Woman.countDocuments({ ...query, isActive: true });
    const totalUsers = await User.countDocuments({ isActive: true });

    // Center-wise breakdown
    const centerStats = await Family.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$center',
          families: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'students',
          let: { center: '$_id' },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ['$center', '$$center'] }, { $eq: ['$isActive', true] }] } } }
          ],
          as: 'students'
        }
      },
      {
        $lookup: {
          from: 'women',
          let: { center: '$_id' },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ['$center', '$$center'] }, { $eq: ['$isActive', true] }] } } }
          ],
          as: 'women'
        }
      },
      {
        $project: {
          center: '$_id',
          families: 1,
          students: { $size: '$students' },
          women: { $size: '$women' },
          totalMembers: { $add: [{ $size: '$students' }, { $size: '$women' }] }
        }
      },
      { $sort: { families: -1 } }
    ]);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentFamilies = await Family.countDocuments({
      ...query,
      createdAt: { $gte: thirtyDaysAgo }
    });

    const recentStudents = await Student.countDocuments({
      ...query,
      createdAt: { $gte: thirtyDaysAgo }
    });

    const recentWomen = await Woman.countDocuments({
      ...query,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Attendance statistics
    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          ...(center && { center }),
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalAttendance = attendanceStats.reduce((sum, stat) => sum + stat.count, 0);
    const presentCount = attendanceStats.find(stat => stat._id === 'Present')?.count || 0;
    const attendancePercentage = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    // Women employment statistics
    const womenEmploymentStats = await Woman.aggregate([
      { $match: { ...query, isActive: true } },
      {
        $group: {
          _id: '$jobStatus',
          count: { $sum: 1 },
          avgIncome: { $avg: '$monthlyIncome' }
        }
      }
    ]);

    const employedWomen = await Woman.countDocuments({
      ...query,
      isActive: true,
      jobStatus: { $in: ['Self Employed', 'Employed'] }
    });

    const employmentRate = totalWomen > 0 ? Math.round((employedWomen / totalWomen) * 100) : 0;

    // Training completion statistics
    const trainingStats = await Woman.aggregate([
      { $match: { ...query, isActive: true } },
      {
        $group: {
          _id: '$trainingStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const completedTraining = await Woman.countDocuments({
      ...query,
      isActive: true,
      trainingStatus: 'Completed'
    });

    const trainingCompletionRate = totalWomen > 0 ? Math.round((completedTraining / totalWomen) * 100) : 0;

    // Education level distribution
    const educationStats = await Student.aggregate([
      { $match: { ...query, isActive: true } },
      {
        $group: {
          _id: '$educationLevel',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Monthly growth trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyGrowth = await Family.aggregate([
      {
        $match: {
          ...query,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          families: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalFamilies,
          totalStudents,
          totalWomen,
          totalUsers,
          totalMembers: totalStudents + totalWomen
        },
        recentActivity: {
          newFamilies: recentFamilies,
          newStudents: recentStudents,
          newWomen: recentWomen
        },
        centerStats,
        attendance: {
          totalRecords: totalAttendance,
          presentCount,
          attendancePercentage,
          breakdown: attendanceStats
        },
        womenEmpowerment: {
          totalWomen,
          employedWomen,
          employmentRate,
          trainingCompletionRate,
          employmentBreakdown: womenEmploymentStats,
          trainingBreakdown: trainingStats
        },
        education: {
          totalStudents,
          levelDistribution: educationStats
        },
        trends: {
          monthlyGrowth
        }
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching admin statistics'
    });
  }
};

// @desc    Export data to CSV
// @route   GET /api/admin/export
// @access  Private (Admin only)
const exportData = async (req, res) => {
  try {
    const { type, center, startDate, endDate } = req.query;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Export type is required (families, students, women, attendance, testscores)'
      });
    }

    let query = {};
    if (center) {
      query.center = center;
    }

    // Date range filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let data = [];
    let filename = '';

    switch (type) {
      case 'families':
        data = await Family.find({ ...query, isActive: true })
          .populate('createdBy', 'name email')
          .lean();
        filename = 'families_export.csv';
        break;

      case 'students':
        data = await Student.find({ ...query, isActive: true })
          .populate('familyId', 'name contact')
          .populate('createdBy', 'name email')
          .lean();
        filename = 'students_export.csv';
        break;

      case 'women':
        data = await Woman.find({ ...query, isActive: true })
          .populate('familyId', 'name contact')
          .populate('createdBy', 'name email')
          .lean();
        filename = 'women_export.csv';
        break;

      case 'attendance':
        const attendanceQuery = { ...query };
        delete attendanceQuery.createdAt; // Use date field for attendance
        if (startDate && endDate) {
          attendanceQuery.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          };
        }
        data = await Attendance.find(attendanceQuery)
          .populate('studentId', 'name educationLevel')
          .populate('markedBy', 'name email')
          .lean();
        filename = 'attendance_export.csv';
        break;

      case 'testscores':
        const testScoreQuery = { ...query };
        delete testScoreQuery.createdAt; // Use date field for test scores
        if (startDate && endDate) {
          testScoreQuery.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          };
        }
        data = await TestScore.find(testScoreQuery)
          .populate('studentId', 'name educationLevel')
          .populate('markedBy', 'name email')
          .lean();
        filename = 'testscores_export.csv';
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    // Convert to CSV format
    const csvData = convertToCSV(data, type);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvData);

  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting data'
    });
  }
};

// Helper function to convert data to CSV
const convertToCSV = (data, type) => {
  if (!data || data.length === 0) {
    return 'No data available';
  }

  let headers = [];
  let rows = [];

  switch (type) {
    case 'families':
      headers = ['Name', 'Contact', 'Center', 'Address', 'Total Members', 'Created By', 'Created At'];
      rows = data.map(item => [
        item.name,
        item.contact,
        item.center,
        item.address,
        item.totalMembers,
        item.createdBy?.name || '',
        new Date(item.createdAt).toLocaleDateString()
      ]);
      break;

    case 'students':
      headers = ['Name', 'Family', 'Center', 'Education Level', 'Age', 'Gender', 'Created By', 'Created At'];
      rows = data.map(item => [
        item.name,
        item.familyId?.name || '',
        item.center,
        item.educationLevel,
        item.age,
        item.gender,
        item.createdBy?.name || '',
        new Date(item.createdAt).toLocaleDateString()
      ]);
      break;

    case 'women':
      headers = ['Name', 'Family', 'Age', 'Skill', 'Training Status', 'Job Status', 'Monthly Income', 'Center', 'Created At'];
      rows = data.map(item => [
        item.name,
        item.familyId?.name || '',
        item.age,
        item.skill,
        item.trainingStatus,
        item.jobStatus,
        item.monthlyIncome,
        item.center,
        new Date(item.createdAt).toLocaleDateString()
      ]);
      break;

    case 'attendance':
      headers = ['Student', 'Education Level', 'Date', 'Status', 'Center', 'Marked By', 'Notes'];
      rows = data.map(item => [
        item.studentId?.name || '',
        item.studentId?.educationLevel || '',
        new Date(item.date).toLocaleDateString(),
        item.status,
        item.center,
        item.markedBy?.name || '',
        item.notes || ''
      ]);
      break;

    case 'testscores':
      headers = ['Student', 'Education Level', 'Subject', 'Score', 'Max Score', 'Percentage', 'Test Type', 'Date', 'Center', 'Marked By'];
      rows = data.map(item => [
        item.studentId?.name || '',
        item.studentId?.educationLevel || '',
        item.subject,
        item.score,
        item.maxScore,
        Math.round((item.score / item.maxScore) * 100) + '%',
        item.testType,
        new Date(item.date).toLocaleDateString(),
        item.center,
        item.markedBy?.name || ''
      ]);
      break;
  }

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(field => `"${field}"`).join(','))
  ].join('\n');

  return csvContent;
};

module.exports = {
  getAdminStats,
  exportData
};
