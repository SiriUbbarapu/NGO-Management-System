// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

// Check if user is tutor
const isTutor = (req, res, next) => {
  if (req.user && req.user.role === 'tutor') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Tutor privileges required.'
    });
  }
};

// Check if user is admin or tutor
const isAdminOrTutor = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'tutor')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Tutor privileges required.'
    });
  }
};

// Check if user can access center data (admin can access all, tutor only their center)
const canAccessCenter = (centerParam = 'center') => {
  return (req, res, next) => {
    const requestedCenter = req.params[centerParam] || req.body.center || req.query.center;
    
    if (req.user.role === 'admin') {
      // Admin can access all centers
      next();
    } else if (req.user.role === 'tutor') {
      // Tutor can only access their own center
      if (!requestedCenter || requestedCenter === req.user.center) {
        next();
      } else {
        res.status(403).json({
          success: false,
          message: 'Access denied. You can only access data from your assigned center.'
        });
      }
    } else {
      res.status(403).json({
        success: false,
        message: 'Access denied. Invalid role.'
      });
    }
  };
};

// Filter data based on user role and center access
const filterByUserAccess = (req, res, next) => {
  if (req.user.role === 'tutor') {
    // Add center filter for tutors
    req.centerFilter = { center: req.user.center };
  } else {
    // Admin can see all data
    req.centerFilter = {};
  }
  next();
};

module.exports = {
  isAdmin,
  isTutor,
  isAdminOrTutor,
  canAccessCenter,
  filterByUserAccess
};
