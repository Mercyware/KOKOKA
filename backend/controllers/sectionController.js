const Section = require('../models/Section');
const Student = require('../models/Student');
const asyncHandler = require('express-async-handler');

// @desc    Get all sections
// @route   GET /api/sections
// @access  Private
exports.getSections = asyncHandler(async (req, res) => {
  // Create filter based on whether school is available
  const filter = req.school ? { school: req.school._id } : {};

  const sections = await Section.find(filter)
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: sections.length,
    data: sections
  });
});

// @desc    Get single section
// @route   GET /api/sections/:id
// @access  Private
exports.getSection = asyncHandler(async (req, res) => {
  // Create query based on whether school is available
  const query = { _id: req.params.id };
  if (req.school) {
    query.school = req.school._id;
  }

  const section = await Section.findOne(query);

  if (!section) {
    res.status(404);
    throw new Error('Section not found');
  }

  // Get students in this section
  const studentQuery = { section: section._id };
  if (req.school) {
    studentQuery.school = req.school._id;
  }
  
  const students = await Student.find(studentQuery)
    .select('firstName lastName admissionNumber class');

  res.status(200).json({
    success: true,
    data: {
      ...section.toObject(),
      students
    }
  });
});

// @desc    Create new section
// @route   POST /api/sections
// @access  Private
exports.createSection = asyncHandler(async (req, res) => {
  // Set createdBy from user
  req.body.createdBy = req.user._id;
  
  // Set school if available
  if (req.school) {
    req.body.school = req.school._id;
    
    // Check if section with same name already exists in this school
    const existingSection = await Section.findOne({
      name: req.body.name,
      school: req.school._id
    });
    
    if (existingSection) {
      res.status(400);
      throw new Error('A section with this name already exists');
    }
  }

  const section = await Section.create(req.body);

  res.status(201).json({
    success: true,
    data: section
  });
});

// @desc    Update section
// @route   PUT /api/sections/:id
// @access  Private
exports.updateSection = asyncHandler(async (req, res) => {
  // Create query based on whether school is available
  const query = { _id: req.params.id };
  if (req.school) {
    query.school = req.school._id;
  }

  let section = await Section.findOne(query);

  if (!section) {
    res.status(404);
    throw new Error('Section not found');
  }

  // Check if another section with the same name exists (excluding this one)
  if (req.body.name && req.body.name !== section.name && req.school) {
    const existingSection = await Section.findOne({
      name: req.body.name,
      school: req.school._id,
      _id: { $ne: req.params.id }
    });

    if (existingSection) {
      res.status(400);
      throw new Error('A section with this name already exists');
    }
  }

  section = await Section.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: section
  });
});

// @desc    Delete section
// @route   DELETE /api/sections/:id
// @access  Private
exports.deleteSection = asyncHandler(async (req, res) => {
  // Create query based on whether school is available
  const query = { _id: req.params.id };
  if (req.school) {
    query.school = req.school._id;
  }

  const section = await Section.findOne(query);

  if (!section) {
    res.status(404);
    throw new Error('Section not found');
  }

  // Check if there are students in this section
  const studentCount = await Student.countDocuments({ section: section._id });
  if (studentCount > 0) {
    res.status(400);
    throw new Error('Cannot delete section with students. Please reassign students first.');
  }

  await section.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});
