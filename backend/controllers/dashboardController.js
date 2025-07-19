const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const TestScore = require('../models/TestScore');
const Family = require('../models/Family');
const Woman = require('../models/Woman');

// @desc    Get tutor dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private (Tutor/Admin)
const getDashboardStats = async (req, res) => {
  try {
    // Filter by center based on user role
    let centerFilter = {};
    if (req.user.role === 'tutor') {
      centerFilter = { center: req.user.center };
    }

    // Date ranges
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Basic counts
    const totalStudents = await Student.countDocuments(centerFilter);
    const activeStudents = await Student.countDocuments({ ...centerFilter, isActive: true });
    const totalFamilies = await Family.countDocuments(centerFilter);
    
    // Previous month counts for comparison
    const prevMonthStudents = await Student.countDocuments({
      ...centerFilter,
      createdAt: { $lt: lastMonth }
    });
    const prevMonthFamilies = await Family.countDocuments({
      ...centerFilter,
      createdAt: { $lt: lastMonth }
    });

    // Calculate growth percentages
    const studentGrowth = prevMonthStudents > 0 
      ? Math.round(((totalStudents - prevMonthStudents) / prevMonthStudents) * 100)
      : 0;
    const familyGrowth = prevMonthFamilies > 0
      ? Math.round(((totalFamilies - prevMonthFamilies) / prevMonthFamilies) * 100)
      : 0;

    // Attendance statistics (last 30 days)
    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          ...centerFilter,
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

    const totalAttendanceRecords = attendanceStats.reduce((total, item) => total + item.count, 0);
    const presentCount = attendanceStats.find(item => item._id === 'Present')?.count || 0;
    const attendancePercentage = totalAttendanceRecords > 0 
      ? Math.round((presentCount / totalAttendanceRecords) * 100) 
      : 0;

    // Test score statistics
    const testScoreStats = await TestScore.aggregate([
      {
        $match: {
          ...centerFilter,
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$score' },
          totalTests: { $sum: 1 }
        }
      }
    ]);

    const averageTestScore = testScoreStats.length > 0 
      ? Math.round(testScoreStats[0].averageScore) 
      : 0;

    // Recent activities
    const recentActivities = await getRecentActivities(centerFilter);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalStudents,
          activeStudents,
          totalFamilies,
          studentGrowth: `+${studentGrowth}%`,
          familyGrowth: `+${familyGrowth}%`,
          attendancePercentage,
          averageTestScore
        },
        attendance: {
          totalRecords: totalAttendanceRecords,
          presentCount,
          attendancePercentage,
          breakdown: attendanceStats
        },
        recentActivities
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics'
    });
  }
};

// @desc    Get student management data for dashboard
// @route   GET /api/dashboard/students
// @access  Private (Tutor/Admin)
const getStudentManagement = async (req, res) => {
  try {
    // Filter by center based on user role
    let centerFilter = {};
    if (req.user.role === 'tutor') {
      centerFilter = { center: req.user.center };
    }

    // Get students with their latest attendance and test scores
    const students = await Student.aggregate([
      { $match: centerFilter },
      {
        $lookup: {
          from: 'attendances',
          let: { studentId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$studentId', '$$studentId'] }
              }
            },
            { $sort: { date: -1 } },
            { $limit: 10 }
          ],
          as: 'attendanceRecords'
        }
      },
      {
        $lookup: {
          from: 'testscores',
          let: { studentId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$studentId', '$$studentId'] }
              }
            },
            { $sort: { date: -1 } },
            { $limit: 1 }
          ],
          as: 'latestTestScore'
        }
      },
      {
        $addFields: {
          attendancePercentage: {
            $cond: {
              if: { $gt: [{ $size: '$attendanceRecords' }, 0] },
              then: {
                $multiply: [
                  {
                    $divide: [
                      {
                        $size: {
                          $filter: {
                            input: '$attendanceRecords',
                            cond: { $eq: ['$$this.status', 'Present'] }
                          }
                        }
                      },
                      { $size: '$attendanceRecords' }
                    ]
                  },
                  100
                ]
              },
              else: 0
            }
          },
          lastTestScore: {
            $cond: {
              if: { $gt: [{ $size: '$latestTestScore' }, 0] },
              then: { $arrayElemAt: ['$latestTestScore.score', 0] },
              else: null
            }
          },
          lastTestMaxScore: {
            $cond: {
              if: { $gt: [{ $size: '$latestTestScore' }, 0] },
              then: { $arrayElemAt: ['$latestTestScore.maxScore', 0] },
              else: null
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          educationLevel: 1,
          center: 1,
          family: 1,
          attendancePercentage: { $round: ['$attendancePercentage', 0] },
          lastTestScore: 1,
          lastTestMaxScore: 1,
          isActive: 1
        }
      },
      { $sort: { name: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        students,
        totalStudents: students.length,
        averageAttendance: students.length > 0 
          ? Math.round(students.reduce((sum, s) => sum + s.attendancePercentage, 0) / students.length)
          : 0,
        averageTestScore: students.filter(s => s.lastTestScore).length > 0
          ? Math.round(students.filter(s => s.lastTestScore).reduce((sum, s) => sum + s.lastTestScore, 0) / students.filter(s => s.lastTestScore).length)
          : 0
      }
    });
  } catch (error) {
    console.error('Get student management error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student management data'
    });
  }
};

// @desc    Get attendance reports for dashboard
// @route   GET /api/dashboard/attendance-reports
// @access  Private (Tutor/Admin)
const getAttendanceReports = async (req, res) => {
  try {
    // Filter by center based on user role
    let centerFilter = {};
    if (req.user.role === 'tutor') {
      centerFilter = { center: req.user.center };
    }

    const { startDate, endDate } = req.query;
    
    // Date range filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter = { date: { $gte: thirtyDaysAgo } };
    }

    // Get attendance summary
    const attendanceSummary = await Attendance.aggregate([
      { $match: { ...centerFilter, ...dateFilter } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalSessions = attendanceSummary.reduce((total, item) => total + item.count, 0);
    const presentCount = attendanceSummary.find(item => item._id === 'Present')?.count || 0;
    const averageAttendance = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

    // Get recent attendance records grouped by date
    const recentAttendance = await Attendance.aggregate([
      { $match: { ...centerFilter, ...dateFilter } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
          },
          absent: {
            $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
          },
          total: { $sum: 1 }
        }
      },
      {
        $addFields: {
          rate: {
            $round: [
              { $multiply: [{ $divide: ['$present', '$total'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 10 }
    ]);

    // Count unique students tracked
    const studentsTracked = await Attendance.distinct('studentId', { ...centerFilter, ...dateFilter });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalSessions,
          averageAttendance,
          studentsTracked: studentsTracked.length
        },
        recentRecords: recentAttendance
      }
    });
  } catch (error) {
    console.error('Get attendance reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching attendance reports'
    });
  }
};

// Helper function to get recent activities
const getRecentActivities = async (centerFilter) => {
  try {
    const activities = [];
    
    // Recent student enrollments
    const recentStudents = await Student.find(centerFilter)
      .sort({ createdAt: -1 })
      .limit(3)
      .select('name createdAt');
    
    recentStudents.forEach(student => {
      activities.push({
        type: 'student',
        message: `New student ${student.name} enrolled in Math program`,
        time: getTimeAgo(student.createdAt),
        status: 'success',
        createdAt: student.createdAt
      });
    });

    // Recent test completions
    const recentTests = await TestScore.find(centerFilter)
      .populate('studentId', 'name')
      .sort({ createdAt: -1 })
      .limit(2)
      .select('studentId score subject createdAt');
    
    recentTests.forEach(test => {
      activities.push({
        type: 'test',
        message: `${test.studentId.name} completed ${test.subject} test`,
        time: getTimeAgo(test.createdAt),
        status: 'success',
        createdAt: test.createdAt
      });
    });

    // Recent family registrations
    const recentFamilies = await Family.find(centerFilter)
      .sort({ createdAt: -1 })
      .limit(2)
      .select('name createdAt');
    
    recentFamilies.forEach(family => {
      activities.push({
        type: 'family',
        message: `New family registered: ${family.name}`,
        time: getTimeAgo(family.createdAt),
        status: 'info',
        createdAt: family.createdAt
      });
    });

    // Sort all activities by time and return top 5
    return activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  } catch (error) {
    console.error('Get recent activities error:', error);
    return [];
  }
};

// Helper function to format time ago
const getTimeAgo = (date) => {
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return '1 day ago';
  return `${diffInDays} days ago`;
};

module.exports = {
  getDashboardStats,
  getStudentManagement,
  getAttendanceReports
};
