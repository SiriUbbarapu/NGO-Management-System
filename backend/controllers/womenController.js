const Woman = require('../models/Woman');
const Family = require('../models/Family');

// @desc    Get all women
// @route   GET /api/women
// @access  Private
const getWomen = async (req, res) => {
  try {
    const { page = 1, limit = 10, center, skill, trainingStatus, jobStatus, search, familyId } = req.query;

    let query = { ...req.centerFilter, isActive: true };

    // Filter by family ID (for family-specific queries)
    if (familyId) {
      query.familyId = familyId;
    }

    // Filter by center (if admin wants to filter)
    if (center && req.user.role === 'admin') {
      query.center = center;
    }
    
    // Filter by skill
    if (skill) {
      query.skill = skill;
    }
    
    // Filter by training status
    if (trainingStatus) {
      query.trainingStatus = trainingStatus;
    }
    
    // Filter by job status
    if (jobStatus) {
      query.jobStatus = jobStatus;
    }
    
    // Search by name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const women = await Woman.find(query)
      .populate('familyId', 'name contact')
      .populate('createdBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Woman.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        women,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get women error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching women'
    });
  }
};

// @desc    Get woman by ID
// @route   GET /api/women/:id
// @access  Private
const getWomanById = async (req, res) => {
  try {
    const woman = await Woman.findById(req.params.id)
      .populate('familyId', 'name contact address')
      .populate('createdBy', 'name email');
    
    if (!woman) {
      return res.status(404).json({
        success: false,
        message: 'Woman not found'
      });
    }

    // Check if tutor can access this woman
    if (req.user.role === 'tutor' && woman.center !== req.user.center) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access women from your center.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        woman
      }
    });
  } catch (error) {
    console.error('Get woman by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching woman'
    });
  }
};

// @desc    Create new woman
// @route   POST /api/women
// @access  Private
const createWoman = async (req, res) => {
  try {
    const { 
      name, 
      familyId, 
      age, 
      skill, 
      trainingStatus, 
      trainingStartDate, 
      trainingEndDate, 
      jobStatus, 
      monthlyIncome, 
      center, 
      contactNumber 
    } = req.body;

    // Validation
    if (!name || !familyId || !age || !skill || !trainingStatus || !jobStatus || !center) {
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

    // Check if tutor is creating woman for their center
    if (req.user.role === 'tutor' && center !== req.user.center) {
      return res.status(403).json({
        success: false,
        message: 'You can only create women for your assigned center'
      });
    }

    // Check if family belongs to the same center
    if (family.center !== center) {
      return res.status(400).json({
        success: false,
        message: 'Woman center must match family center'
      });
    }

    // Create woman
    const woman = await Woman.create({
      name,
      familyId,
      age,
      skill,
      trainingStatus,
      trainingStartDate,
      trainingEndDate,
      jobStatus,
      monthlyIncome: monthlyIncome || 0,
      center,
      contactNumber,
      createdBy: req.user._id
    });

    await woman.populate([
      { path: 'familyId', select: 'name contact' },
      { path: 'createdBy', select: 'name email' }
    ]);

    // Update family total members count
    await Family.findByIdAndUpdate(familyId, {
      $inc: { totalMembers: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Woman created successfully',
      data: {
        woman
      }
    });
  } catch (error) {
    console.error('Create woman error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating woman'
    });
  }
};

// @desc    Update woman
// @route   PUT /api/women/:id
// @access  Private
const updateWoman = async (req, res) => {
  try {
    const woman = await Woman.findById(req.params.id);
    
    if (!woman) {
      return res.status(404).json({
        success: false,
        message: 'Woman not found'
      });
    }

    // Check if tutor can update this woman
    if (req.user.role === 'tutor' && woman.center !== req.user.center) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update women from your center.'
      });
    }

    const { 
      name, 
      age, 
      skill, 
      trainingStatus, 
      trainingStartDate, 
      trainingEndDate, 
      jobStatus, 
      monthlyIncome, 
      contactNumber, 
      isActive 
    } = req.body;

    // Update fields
    if (name) woman.name = name;
    if (age) woman.age = age;
    if (skill) woman.skill = skill;
    if (trainingStatus) woman.trainingStatus = trainingStatus;
    if (trainingStartDate !== undefined) woman.trainingStartDate = trainingStartDate;
    if (trainingEndDate !== undefined) woman.trainingEndDate = trainingEndDate;
    if (jobStatus) woman.jobStatus = jobStatus;
    if (monthlyIncome !== undefined) woman.monthlyIncome = monthlyIncome;
    if (contactNumber !== undefined) woman.contactNumber = contactNumber;
    if (isActive !== undefined) woman.isActive = isActive;

    await woman.save();
    await woman.populate([
      { path: 'familyId', select: 'name contact' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Woman updated successfully',
      data: {
        woman
      }
    });
  } catch (error) {
    console.error('Update woman error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating woman'
    });
  }
};

// @desc    Delete woman
// @route   DELETE /api/women/:id
// @access  Private
const deleteWoman = async (req, res) => {
  try {
    const woman = await Woman.findById(req.params.id);
    
    if (!woman) {
      return res.status(404).json({
        success: false,
        message: 'Woman not found'
      });
    }

    // Check if tutor can delete this woman
    if (req.user.role === 'tutor' && woman.center !== req.user.center) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete women from your center.'
      });
    }

    await Woman.findByIdAndDelete(req.params.id);

    // Update family total members count
    await Family.findByIdAndUpdate(woman.familyId, {
      $inc: { totalMembers: -1 }
    });

    res.status(200).json({
      success: true,
      message: 'Woman deleted successfully'
    });
  } catch (error) {
    console.error('Delete woman error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting woman'
    });
  }
};

// @desc    Get women statistics
// @route   GET /api/women/stats
// @access  Private
const getWomenStats = async (req, res) => {
  try {
    const { center } = req.query;
    
    let query = { ...req.centerFilter, isActive: true };
    
    // Filter by center (if admin wants to filter)
    if (center && req.user.role === 'admin') {
      query.center = center;
    }

    // Get statistics
    const totalWomen = await Woman.countDocuments(query);
    
    const skillStats = await Woman.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$skill',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const trainingStats = await Woman.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$trainingStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const jobStats = await Woman.aggregate([
      { $match: query },
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
      jobStatus: { $in: ['Self Employed', 'Employed'] }
    });

    const employmentRate = totalWomen > 0 ? Math.round((employedWomen / totalWomen) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalWomen,
        employedWomen,
        employmentRate,
        skillStats,
        trainingStats,
        jobStats
      }
    });
  } catch (error) {
    console.error('Get women stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching women statistics'
    });
  }
};

module.exports = {
  getWomen,
  getWomanById,
  createWoman,
  updateWoman,
  deleteWoman,
  getWomenStats
};
