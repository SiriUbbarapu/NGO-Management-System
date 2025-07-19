const TestScore = require('../models/TestScore');
const Student = require('../models/Student');

// @desc    Get test scores
// @route   GET /api/testscores
// @access  Private
const getTestScores = async (req, res) => {
  try {
    const { page = 1, limit = 10, studentId, subject, center, testType } = req.query;
    
    let query = {};
    
    // Filter by center based on user role
    if (req.user.role === 'tutor') {
      query.center = req.user.center;
    } else if (center) {
      query.center = center;
    }
    
    // Filter by student
    if (studentId) {
      query.studentId = studentId;
    }
    
    // Filter by subject
    if (subject) {
      query.subject = subject;
    }
    
    // Filter by test type
    if (testType) {
      query.testType = testType;
    }

    const testScores = await TestScore.find(query)
      .populate('studentId', 'name educationLevel')
      .populate('markedBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1, createdAt: -1 });

    const total = await TestScore.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        testScores,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get test scores error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching test scores'
    });
  }
};

// @desc    Add test score
// @route   POST /api/testscores
// @access  Private (Tutor can add for their center)
const addTestScore = async (req, res) => {
  try {
    const { studentId, subject, score, maxScore, testType, date, remarks } = req.body;

    // Validation
    if (!studentId || !subject || score === undefined || !testType) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, subject, score, and test type are required'
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

    // Check if tutor can add score for this student
    if (req.user.role === 'tutor' && student.center !== req.user.center) {
      return res.status(403).json({
        success: false,
        message: 'You can only add scores for students in your center'
      });
    }

    // Create test score
    const testScore = await TestScore.create({
      studentId,
      subject,
      score,
      maxScore: maxScore || 100,
      testType,
      date: date || new Date(),
      remarks,
      markedBy: req.user._id,
      center: student.center
    });

    await testScore.populate([
      { path: 'studentId', select: 'name educationLevel' },
      { path: 'markedBy', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Test score added successfully',
      data: {
        testScore
      }
    });
  } catch (error) {
    console.error('Add test score error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while adding test score'
    });
  }
};

// @desc    Add bulk test scores
// @route   POST /api/testscores/bulk
// @access  Private (Tutor can add for their center)
const addBulkTestScores = async (req, res) => {
  try {
    const { testScores, subject, testType, maxScore, date } = req.body;

    // Validation
    if (!testScores || !Array.isArray(testScores) || testScores.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Test scores array is required'
      });
    }

    if (!subject || !testType) {
      return res.status(400).json({
        success: false,
        message: 'Subject and test type are required for bulk upload'
      });
    }

    const testDate = date ? new Date(date) : new Date();
    const results = [];
    const errors = [];

    for (const scoreRecord of testScores) {
      try {
        const { studentId, score, remarks } = scoreRecord;

        if (!studentId || score === undefined) {
          errors.push({ studentId, error: 'Student ID and score are required' });
          continue;
        }

        // Check if student exists
        const student = await Student.findById(studentId);
        if (!student) {
          errors.push({ studentId, error: 'Student not found' });
          continue;
        }

        // Check if tutor can add score for this student
        if (req.user.role === 'tutor' && student.center !== req.user.center) {
          errors.push({ studentId, error: 'Access denied for this student' });
          continue;
        }

        // Create test score
        const testScore = await TestScore.create({
          studentId,
          subject,
          score,
          maxScore: maxScore || 100,
          testType,
          date: testDate,
          remarks,
          markedBy: req.user._id,
          center: student.center
        });

        results.push({ studentId, testScoreId: testScore._id, score });
      } catch (error) {
        errors.push({ studentId: scoreRecord.studentId, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Bulk test scores processing completed',
      data: {
        results,
        errors,
        summary: {
          total: testScores.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });
  } catch (error) {
    console.error('Add bulk test scores error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding bulk test scores'
    });
  }
};

// @desc    Update test score
// @route   PUT /api/testscores/:id
// @access  Private
const updateTestScore = async (req, res) => {
  try {
    const testScore = await TestScore.findById(req.params.id);
    
    if (!testScore) {
      return res.status(404).json({
        success: false,
        message: 'Test score not found'
      });
    }

    // Check if tutor can update this test score
    if (req.user.role === 'tutor' && testScore.center !== req.user.center) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update test scores from your center.'
      });
    }

    const { subject, score, maxScore, testType, date, remarks } = req.body;

    // Update fields
    if (subject) testScore.subject = subject;
    if (score !== undefined) testScore.score = score;
    if (maxScore !== undefined) testScore.maxScore = maxScore;
    if (testType) testScore.testType = testType;
    if (date) testScore.date = date;
    if (remarks !== undefined) testScore.remarks = remarks;

    await testScore.save();
    await testScore.populate([
      { path: 'studentId', select: 'name educationLevel' },
      { path: 'markedBy', select: 'name email' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Test score updated successfully',
      data: {
        testScore
      }
    });
  } catch (error) {
    console.error('Update test score error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating test score'
    });
  }
};

// @desc    Delete test score
// @route   DELETE /api/testscores/:id
// @access  Private
const deleteTestScore = async (req, res) => {
  try {
    const testScore = await TestScore.findById(req.params.id);
    
    if (!testScore) {
      return res.status(404).json({
        success: false,
        message: 'Test score not found'
      });
    }

    // Check if tutor can delete this test score
    if (req.user.role === 'tutor' && testScore.center !== req.user.center) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete test scores from your center.'
      });
    }

    await TestScore.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Test score deleted successfully'
    });
  } catch (error) {
    console.error('Delete test score error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting test score'
    });
  }
};

// @desc    Get test score analytics
// @route   GET /api/testscores/analytics
// @access  Private
const getTestScoreAnalytics = async (req, res) => {
  try {
    const { center, subject, educationLevel, startDate, endDate } = req.query;
    
    let query = {};
    
    // Filter by center based on user role
    if (req.user.role === 'tutor') {
      query.center = req.user.center;
    } else if (center) {
      query.center = center;
    }
    
    // Filter by subject
    if (subject) {
      query.subject = subject;
    }
    
    // Date range filter
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Build aggregation pipeline
    const pipeline = [
      { $match: query }
    ];

    // Add student lookup for education level filtering
    if (educationLevel) {
      pipeline.push(
        {
          $lookup: {
            from: 'students',
            localField: 'studentId',
            foreignField: '_id',
            as: 'student'
          }
        },
        {
          $match: {
            'student.educationLevel': educationLevel
          }
        }
      );
    }

    // Add analytics aggregation
    pipeline.push(
      {
        $addFields: {
          percentage: {
            $multiply: [
              { $divide: ['$score', '$maxScore'] },
              100
            ]
          }
        }
      },
      {
        $group: {
          _id: {
            subject: '$subject',
            testType: '$testType'
          },
          averageScore: { $avg: '$score' },
          averagePercentage: { $avg: '$percentage' },
          maxScore: { $max: '$score' },
          minScore: { $min: '$score' },
          totalTests: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.subject': 1, '_id.testType': 1 }
      }
    );

    const analytics = await TestScore.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data: {
        analytics
      }
    });
  } catch (error) {
    console.error('Get test score analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching test score analytics'
    });
  }
};

module.exports = {
  getTestScores,
  addTestScore,
  addBulkTestScores,
  updateTestScore,
  deleteTestScore,
  getTestScoreAnalytics
};
