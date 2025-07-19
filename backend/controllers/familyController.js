const Family = require('../models/Family');
const Student = require('../models/Student');
const Woman = require('../models/Woman');

// @desc    Get all families
// @route   GET /api/families
// @access  Private (Admin can see all, Tutor can see only their center)
const getFamilies = async (req, res) => {
  try {
    const { page = 1, limit = 10, center, search } = req.query;
    
    let query = { ...req.centerFilter };
    
    // Filter by center (if admin wants to filter)
    if (center && req.user.role === 'admin') {
      query.center = center;
    }
    
    // Search by name or contact
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } }
      ];
    }

    const families = await Family.find(query)
      .populate('createdBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Family.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        families,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get families error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching families'
    });
  }
};

// @desc    Get family by ID with members
// @route   GET /api/families/:id
// @access  Private
const getFamilyById = async (req, res) => {
  try {
    const family = await Family.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!family) {
      return res.status(404).json({
        success: false,
        message: 'Family not found'
      });
    }

    // Check if tutor can access this family
    if (req.user.role === 'tutor' && family.center !== req.user.center) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access families from your center.'
      });
    }

    // Get family members (students and women)
    const students = await Student.find({ familyId: family._id, isActive: true });
    const women = await Woman.find({ familyId: family._id, isActive: true });

    res.status(200).json({
      success: true,
      data: {
        family,
        members: {
          students,
          women
        }
      }
    });
  } catch (error) {
    console.error('Get family by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching family'
    });
  }
};

// @desc    Create new family
// @route   POST /api/families
// @access  Private
const createFamily = async (req, res) => {
  try {
    const { name, contact, center, address } = req.body;

    // Validation
    if (!name || !contact || !center || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if tutor is creating family for their center
    if (req.user.role === 'tutor' && center !== req.user.center) {
      return res.status(403).json({
        success: false,
        message: 'You can only create families for your assigned center'
      });
    }

    // Create family
    const family = await Family.create({
      name,
      contact,
      center,
      address,
      createdBy: req.user._id
    });

    await family.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Family created successfully',
      data: {
        family
      }
    });
  } catch (error) {
    console.error('Create family error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating family'
    });
  }
};

// @desc    Update family
// @route   PUT /api/families/:id
// @access  Private
const updateFamily = async (req, res) => {
  try {
    const family = await Family.findById(req.params.id);
    
    if (!family) {
      return res.status(404).json({
        success: false,
        message: 'Family not found'
      });
    }

    // Check if tutor can update this family
    if (req.user.role === 'tutor' && family.center !== req.user.center) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update families from your center.'
      });
    }

    const { name, contact, center, address, isActive } = req.body;

    // Update fields
    if (name) family.name = name;
    if (contact) family.contact = contact;
    if (center) {
      // Check if tutor is trying to change center
      if (req.user.role === 'tutor' && center !== req.user.center) {
        return res.status(403).json({
          success: false,
          message: 'You cannot change family center to a different center'
        });
      }
      family.center = center;
    }
    if (address) family.address = address;
    if (isActive !== undefined) family.isActive = isActive;

    await family.save();
    await family.populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Family updated successfully',
      data: {
        family
      }
    });
  } catch (error) {
    console.error('Update family error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating family'
    });
  }
};

// @desc    Delete family
// @route   DELETE /api/families/:id
// @access  Private
const deleteFamily = async (req, res) => {
  try {
    const family = await Family.findById(req.params.id);
    
    if (!family) {
      return res.status(404).json({
        success: false,
        message: 'Family not found'
      });
    }

    // Check if tutor can delete this family
    if (req.user.role === 'tutor' && family.center !== req.user.center) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete families from your center.'
      });
    }

    // Check if family has active members
    const activeStudents = await Student.countDocuments({ familyId: family._id, isActive: true });
    const activeWomen = await Woman.countDocuments({ familyId: family._id, isActive: true });

    if (activeStudents > 0 || activeWomen > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete family with active members. Please deactivate all members first.'
      });
    }

    await Family.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Family deleted successfully'
    });
  } catch (error) {
    console.error('Delete family error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting family'
    });
  }
};

module.exports = {
  getFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily
};
